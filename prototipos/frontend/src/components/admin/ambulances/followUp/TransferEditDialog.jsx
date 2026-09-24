import { useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import RequestAccordion from "./RequestAccordion";
import AssignmentAccordion from "./AssignmentAccordion";
import TransferStateSection from "./TransferStateSection";

import {
  getInitialAssignmentForm,
  isTransferAssigned,
  stateTransitions,
} from "./transferEditUtils";

import {
  advanceTransferState,
  assignTransfer,
  getTransferResources,
} from "../../../../apiCalls/transfers/transfersApi";

import { useNotification } from "../../../../hooks/useNotification";

import NotificationSnackbar from "../../../utils/NotificationSnackbar";

export default function TransferEditDialog({
  open,
  transfer,
  onClose,
  onAssigned,
  onStateUpdated,
}) {
  const [form, setForm] = useState(() => getInitialAssignmentForm(transfer));

  const [resources, setResources] = useState(null);

  const [loadingResources, setLoadingResources] = useState(false);

  const [savingAssignment, setSavingAssignment] = useState(false);

  const [savingState, setSavingState] = useState(false);

  const { notification, showNotification, closeNotification } =
    useNotification();

  const assigned = isTransferAssigned(transfer);

  const nextState = stateTransitions[transfer?.estado]?.[0] ?? null;

  const saving = savingAssignment || savingState;

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "horaSalidaEstimada" || name === "horaLlegadaEstimada") {
      setResources(null);

      setForm((prev) => ({
        ...prev,

        [name]: value,

        idVehiculo: "",
        idConductor: "",
        idEnfermero: "",
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

      const data = await getTransferResources(
        transfer.id,
        form.horaSalidaEstimada,
        form.horaLlegadaEstimada,
      );

      setResources(data);

      setForm((prev) => ({
        ...prev,

        idVehiculo: "",
        idConductor: "",
        idEnfermero: "",
      }));
    } catch (error) {
      setResources(null);

      showNotification(error.message, "error");
    } finally {
      setLoadingResources(false);
    }
  };

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

    const version = resources.version ?? transfer.version;

    if (version === null || version === undefined) {
      showNotification(
        "No se pudo obtener la versión actual del traslado.",
        "error",
      );

      return;
    }

    try {
      setSavingAssignment(true);

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

      setForm((prev) => ({
        ...prev,

        idVehiculo: "",
        idConductor: "",
        idEnfermero: "",
      }));

      showNotification(error.message, "error");
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleStateUpdate = async () => {
    if (!nextState) {
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
    }
  };

  if (!transfer) {
    return null;
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={saving ? undefined : onClose}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
          }}
        >
          Gestionar traslado {transfer.codigo}
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              fontSize: 14,
              color: "text.secondary",
              mb: 2.5,
            }}
          >
            {assigned
              ? "Consulte los datos del traslado y actualice su estado."
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

          {!assigned
            ? resources && (
                <Button
                  variant="contained"
                  onClick={handleAssignment}
                  disabled={savingAssignment}
                  sx={{
                    textTransform: "none",

                    borderRadius: 2,
                    fontWeight: 700,

                    bgcolor: "var(--primary-color)",
                  }}
                >
                  {savingAssignment ? "Asignando..." : "Confirmar asignación"}
                </Button>
              )
            : nextState && (
                <Button
                  variant="contained"
                  onClick={handleStateUpdate}
                  disabled={savingState}
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
      </Dialog>

      <NotificationSnackbar
        notification={notification}
        onClose={closeNotification}
      />
    </>
  );
}
