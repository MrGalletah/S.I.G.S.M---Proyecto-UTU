import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import RequestAccordion from "./RequestAccordion";
import AssignmentAccordion from "./AssignmentAccordion";
import TransferStateSection from "./TransferStateSection";

import { isTransferAssigned, stateTransitions } from "./transferEditUtils";

import {
  advanceTransferState,
  assignTransfer,
  getTransferResources,
} from "../../../../apiCalls/transfers/transfersApi";

import { useNotification } from "../../../../hooks/useNotification";
import NotificationSnackbar from "../../../utils/NotificationSnackbar";

// FECHAS PARA INPUTS DATETIME-LOCAL

function toDateTimeLocal(value) {
  if (!value) return "";

  return String(value).replace(" ", "T").slice(0, 16);
}

// FORMULARIO INICIAL

function getInitialForm(transfer) {
  return {
    idVehiculo: transfer.idVehiculo ?? "",
    idConductor: transfer.idConductor ?? "",
    idEnfermero: transfer.idEnfermero ?? "",

    horaSalidaEstimada: toDateTimeLocal(transfer.horaSalidaEstimada),

    horaLlegadaEstimada: toDateTimeLocal(transfer.horaLlegadaEstimada),

    observacionEstado: "",
  };
}

// CONSERVAR RECURSOS QUE SIGUEN DISPONIBLES

function keepAvailable(currentId, list, key) {
  if (currentId === "" || currentId === null || currentId === undefined) {
    return "";
  }

  const exists = list.some((item) => Number(item[key]) === Number(currentId));

  return exists ? Number(currentId) : "";
}

// CONTENIDO DEL DIÁLOGO

function TransferEditContent({
  transfer,
  onAssigned,
  onStateUpdated,
  onClose,
  setBusy,
}) {
  const { t } = useTranslation("transfers");

  const [form, setForm] = useState(() => getInitialForm(transfer));

  const [resources, setResources] = useState(null);
  const [loadingResources, setLoadingResources] = useState(false);

  const [savingAssignment, setSavingAssignment] = useState(false);

  const [savingState, setSavingState] = useState(false);
  const [assignmentDirty, setAssignmentDirty] = useState(false);

  const { notification, showNotification, closeNotification } =
    useNotification();

  const assigned = isTransferAssigned(transfer);

  const canEditAssignment = transfer.estado === "Registrado";

  const nextState = stateTransitions[transfer.estado]?.[0] ?? null;

  const saving = savingAssignment || savingState;

  // CAMBIAR DATOS DEL FORMULARIO

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "horaSalidaEstimada" || name === "horaLlegadaEstimada") {
      setResources(null);
      setAssignmentDirty(true);

      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));

      return;
    }

    if (
      name === "idVehiculo" ||
      name === "idConductor" ||
      name === "idEnfermero"
    ) {
      setAssignmentDirty(true);
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // CONSULTAR DISPONIBILIDAD

  const handleLoadResources = async () => {
    if (!form.horaSalidaEstimada || !form.horaLlegadaEstimada) {
      showNotification(t("followUp.management.errors.requiredTimes"), "error");
      return;
    }

    if (
      new Date(form.horaLlegadaEstimada) <= new Date(form.horaSalidaEstimada)
    ) {
      showNotification(t("followUp.management.errors.invalidTimes"), "error");
      return;
    }

    try {
      setLoadingResources(true);
      setResources(null);

      const data = await getTransferResources(
        transfer.id,
        form.horaSalidaEstimada,
        form.horaLlegadaEstimada,
      );

      setResources(data);

      setForm((prev) => ({
        ...prev,

        idVehiculo: keepAvailable(
          prev.idVehiculo,
          data.vehiculos,
          "id_vehiculo",
        ),

        idConductor: keepAvailable(
          prev.idConductor,
          data.conductores,
          "id_func",
        ),

        idEnfermero: keepAvailable(
          prev.idEnfermero,
          data.enfermeros,
          "id_func",
        ),
      }));
    } catch (error) {
      console.error(error);
      setResources(null);

      showNotification(
        error.message || t("followUp.management.errors.availability"),
        "error",
      );
    } finally {
      setLoadingResources(false);
    }
  };

  // ASIGNAR O REASIGNAR

  const handleAssignment = async () => {
    if (!resources) {
      showNotification(t("followUp.management.errors.checkResources"), "error");
      return;
    }

    if (
      !form.idVehiculo ||
      !form.idConductor ||
      !form.horaSalidaEstimada ||
      !form.horaLlegadaEstimada
    ) {
      showNotification(t("followUp.management.errors.requiredFields"), "error");
      return;
    }

    // PARA PACIENTES, EL ENFERMERO ES OBLIGATORIO

    if (transfer.tipoElemento === "Paciente" && !form.idEnfermero) {
      showNotification(t("followUp.management.errors.nurseRequired"), "error");
      return;
    }

    // CONDUCTOR Y ENFERMERO DEBEN SER DIFERENTES

    if (
      form.idEnfermero &&
      Number(form.idConductor) === Number(form.idEnfermero)
    ) {
      showNotification(t("followUp.management.errors.differentStaff"), "error");
      return;
    }

    // CONTROL DE VERSIÓN

    const version = resources.traslado?.version ?? transfer.version;

    if (version === null || version === undefined) {
      showNotification(t("followUp.management.errors.version"), "error");
      return;
    }

    try {
      setSavingAssignment(true);
      setBusy(true);

      await assignTransfer(transfer.id, {
        version: Number(version),

        id_vehiculo: Number(form.idVehiculo),

        id_conductor: Number(form.idConductor),

        id_enfermero: form.idEnfermero ? Number(form.idEnfermero) : null,

        hora_salida_estimada: form.horaSalidaEstimada,

        hora_llegada_estimada: form.horaLlegadaEstimada,
      });

      await onAssigned(transfer.id);
    } catch (error) {
      console.error(error);
      setResources(null);

      showNotification(
        error.message || t("followUp.management.errors.assignment"),
        "error",
      );
    } finally {
      setSavingAssignment(false);
      setBusy(false);
    }
  };

  // ACTUALIZAR ESTADO

  const handleStateUpdate = async () => {
    if (!nextState) return;

    if (canEditAssignment && assignmentDirty) {
      showNotification(t("followUp.management.errors.pendingChanges"), "error");
      return;
    }

    if (transfer.version === null || transfer.version === undefined) {
      showNotification(t("followUp.management.errors.version"), "error");
      return;
    }

    try {
      setSavingState(true);
      setBusy(true);

      await advanceTransferState(
        transfer.id,
        Number(transfer.version),
        form.observacionEstado.trim() || null,
      );

      await onStateUpdated(transfer.id);
    } catch (error) {
      console.error(error);

      showNotification(
        error.message || t("followUp.management.errors.state"),
        "error",
      );
    } finally {
      setSavingState(false);
      setBusy(false);
    }
  };

  return (
    <>
      <DialogContent>
        {/* DESCRIPCIÓN SEGÚN EL ESTADO */}

        <Typography
          sx={{
            fontSize: 14,
            color: "text.secondary",
            mb: 2.5,
          }}
        >
          {!canEditAssignment
            ? t("followUp.management.readOnlyDescription")
            : assigned
              ? t("followUp.management.assignedDescription")
              : t("followUp.management.newDescription")}
        </Typography>

        {/* DATOS DE LA SOLICITUD */}

        <RequestAccordion transfer={transfer} />

        {/* ASIGNACIÓN DE RECURSOS */}

        <AssignmentAccordion
          transfer={transfer}
          assigned={assigned}
          form={form}
          onChange={handleChange}
          resources={resources}
          loadingResources={loadingResources}
          onLoadResources={handleLoadResources}
        />

        {/* CAMBIO DE ESTADO */}

        {assigned && (
          <TransferStateSection
            transfer={transfer}
            form={form}
            onChange={handleChange}
          />
        )}
      </DialogContent>

      {/* ACCIONES */}

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={saving}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            fontWeight: 700,
          }}
        >
          {t("followUp.management.cancel")}
        </Button>

        {/* ASIGNACIÓN / REASIGNACIÓN */}

        {canEditAssignment && resources && (
          <Button
            variant="contained"
            onClick={handleAssignment}
            disabled={saving || loadingResources}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 700,
              bgcolor: "var(--primary-color)",
            }}
          >
            {savingAssignment
              ? t("followUp.management.saving")
              : assigned
                ? t("followUp.management.saveAssignment")
                : t("followUp.management.confirmAssignment")}
          </Button>
        )}

        {/* CAMBIO DE ESTADO */}

        {assigned && nextState && (
          <Button
            variant="contained"
            onClick={handleStateUpdate}
            disabled={saving || (canEditAssignment && assignmentDirty)}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 700,
              bgcolor: "var(--primary-color)",
            }}
          >
            {savingState
              ? t("followUp.management.updating")
              : t("followUp.management.updateState")}
          </Button>
        )}
      </DialogActions>

      <NotificationSnackbar
        notification={notification}
        onClose={closeNotification}
      />
    </>
  );
}

// DIÁLOGO PRINCIPAL

export default function TransferEditDialog({
  open,
  transfer,
  transferId,
  onClose,
  onAssigned,
  onStateUpdated,
}) {
  const { t } = useTranslation("transfers");
  const [busy, setBusy] = useState(false);

  const loading = !transfer;

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            minHeight: 420,
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800 }}>
        {loading
          ? t("followUp.management.title")
          : t("followUp.management.titleWithCode", {
              code: transfer.codigo,
            })}
      </DialogTitle>

      {loading ? (
        <DialogContent
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 320,
          }}
        >
          <CircularProgress
            size={38}
            sx={{
              color: "var(--primary-color)",
            }}
          />
        </DialogContent>
      ) : (
        <TransferEditContent
          key={transferId}
          transfer={transfer}
          onClose={onClose}
          onAssigned={onAssigned}
          onStateUpdated={onStateUpdated}
          setBusy={setBusy}
        />
      )}
    </Dialog>
  );
}
