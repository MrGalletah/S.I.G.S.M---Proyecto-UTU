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

import { useNotification } from "../../../../hooks/useNotification";
import NotificationSnackbar from "../../../utils/NotificationSnackbar";

export default function TransferEditDialog({
  open,
  transfer,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(() => getInitialAssignmentForm(transfer));

  const { notification, showNotification, closeNotification } =
    useNotification();

  const assigned = isTransferAssigned(transfer);

  const availableStates = stateTransitions[transfer?.estado] ?? [];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAssignment = () => {
    if (
      !form.vehiculo ||
      !form.conductor ||
      !form.horaSalidaEstimada ||
      !form.horaLlegadaEstimada
    ) {
      showNotification("Complete todos los datos obligatorios.", "error");
      return;
    }

    if (transfer.tipoElemento === "Paciente" && !form.enfermero) {
      showNotification(
        "Los traslados de pacientes requieren un enfermero.",
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

    onSave({
      ...transfer,
      vehiculo: form.vehiculo,
      conductor: form.conductor,
      enfermero: form.enfermero || null,
      horaSalidaEstimada: form.horaSalidaEstimada,
      horaLlegadaEstimada: form.horaLlegadaEstimada,
    });

    onClose();
  };

  const handleStateUpdate = () => {
    if (!form.nuevoEstado) {
      showNotification("Seleccione el nuevo estado.", "error");
      return;
    }

    onSave({
      ...transfer,
      estado: form.nuevoEstado,
      ultimaObservacionEstado: form.observacionEstado.trim() || null,
    });

    onClose();
  };

  if (!transfer) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
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
        <DialogTitle sx={{ fontWeight: 800 }}>
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
              : "Revise la solicitud y complete la asignación de recursos."}
          </Typography>

          <RequestAccordion transfer={transfer} />

          <AssignmentAccordion
            transfer={transfer}
            assigned={assigned}
            form={form}
            onChange={handleChange}
          />

          {assigned && (
            <TransferStateSection
              transfer={transfer}
              form={form}
              onChange={handleChange}
            />
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            Cancelar
          </Button>

          {!assigned ? (
            <Button
              variant="contained"
              onClick={handleAssignment}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                fontWeight: 700,
                bgcolor: "var(--primary-color)",
              }}
            >
              Confirmar asignación
            </Button>
          ) : (
            availableStates.length > 0 && (
              <Button
                variant="contained"
                onClick={handleStateUpdate}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 700,
                  bgcolor: "var(--primary-color)",
                }}
              >
                Actualizar estado
              </Button>
            )
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
