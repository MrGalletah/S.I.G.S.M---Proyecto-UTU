import { useState } from "react";

import {
  Box,
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
// Se monta únicamente cuando llegaron los datos.

function TransferEditContent({
  transfer,
  onAssigned,
  onStateUpdated,
  onClose,
  setBusy,
}) {
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
      showNotification(
        "Ingrese la hora de salida y llegada estimadas.",
        "error",
      );
      return;
    }

    if (
      new Date(form.horaLlegadaEstimada) <= new Date(form.horaSalidaEstimada)
    ) {
      showNotification(
        "La llegada estimada debe ser posterior a la salida.",
        "error",
      );
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
      setResources(null);
      showNotification(error.message, "error");
    } finally {
      setLoadingResources(false);
    }
  };

  // ASIGNAR O REASIGNAR

  const handleAssignment = async () => {
    if (!resources) {
      showNotification(
        "Consulte primero la disponibilidad de recursos.",
        "error",
      );
      return;
    }

    if (
      !form.idVehiculo ||
      !form.idConductor ||
      !form.horaSalidaEstimada ||
      !form.horaLlegadaEstimada
    ) {
      showNotification("Complete todos los datos obligatorios.", "error");
      return;
    }

    if (transfer.tipoElemento === "Paciente" && !form.idEnfermero) {
      showNotification(
        "Los traslados de pacientes requieren un enfermero.",
        "error",
      );
      return;
    }

    if (
      form.idEnfermero &&
      Number(form.idConductor) === Number(form.idEnfermero)
    ) {
      showNotification(
        "El conductor y el enfermero deben ser funcionarios diferentes.",
        "error",
      );
      return;
    }

    const version = resources.traslado?.version ?? transfer.version;

    if (version === null || version === undefined) {
      showNotification(
        "No se pudo obtener la versión actual del traslado.",
        "error",
      );
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
      setResources(null);
      showNotification(error.message, "error");
    } finally {
      setSavingAssignment(false);
      setBusy(false);
    }
  };

  // ACTUALIZAR ESTADO

  const handleStateUpdate = async () => {
    if (!nextState) return;

    if (canEditAssignment && assignmentDirty) {
      showNotification(
        "Tiene cambios de asignación pendientes. Guárdelos antes de actualizar el estado.",
        "error",
      );
      return;
    }

    if (transfer.version === null || transfer.version === undefined) {
      showNotification(
        "No se pudo obtener la versión actual del traslado.",
        "error",
      );
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
      showNotification(error.message, "error");
    } finally {
      setSavingState(false);
      setBusy(false);
    }
  };

  return (
    <>
      <DialogContent>
        <Typography
          sx={{
            fontSize: 14,
            color: "text.secondary",
            mb: 2.5,
          }}
        >
          {!canEditAssignment
            ? "Consulte los datos del traslado y actualice su estado."
            : assigned
              ? "Puede modificar los recursos antes de iniciar el traslado."
              : "Revise la solicitud, defina el horario y consulte los recursos disponibles."}
        </Typography>

        <RequestAccordion transfer={transfer} />

        <AssignmentAccordion
          transfer={transfer}
          assigned={assigned}
          form={form}
          onChange={handleChange}
          resources={resources}
          loadingResources={loadingResources}
          onLoadResources={handleLoadResources}
        />

        {assigned && (
          <TransferStateSection
            transfer={transfer}
            form={form}
            onChange={handleChange}
          />
        )}
      </DialogContent>

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
          Cancelar
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
              ? "Guardando..."
              : assigned
                ? "Guardar asignación"
                : "Confirmar asignación"}
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
            {savingState ? "Actualizando..." : "Actualizar estado"}
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

// ÚNICO DIÁLOGO

export default function TransferEditDialog({
  open,
  transfer,
  transferId,
  onClose,
  onAssigned,
  onStateUpdated,
}) {
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
      <DialogTitle
        sx={{
          fontWeight: 800,
        }}
      >
        {loading
          ? "Gestionar traslado"
          : `Gestionar traslado ${transfer.codigo}`}
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
