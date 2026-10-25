import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";

// VALORES ORIGINALES PARA EL BACKEND

const EMPTY_FORM = {
  matricula: "",
  modelo: "",
  id_tipo_vehiculo: "",
  estado: "OPERATIVO",
};

const VEHICLE_STATES = ["OPERATIVO", "MANTENIMIENTO", "FUERA_DE_SERVICIO"];

export default function VehicleDialog({
  open,
  vehicle,
  types,
  saving,
  onClose,
  onSubmit,
}) {
  const { t } = useTranslation("vehicles");

  const isEditing = Boolean(vehicle);

  // DATOS INICIALES DEL FORMULARIO

  const [form, setForm] = useState(() =>
    vehicle
      ? {
          matricula: vehicle.matricula,
          modelo: vehicle.modelo,
          id_tipo_vehiculo: vehicle.tipo?.id_tipo_vehiculo ?? "",
          estado: vehicle.estado,
        }
      : { ...EMPTY_FORM },
  );

  const [error, setError] = useState("");

  // ACTUALIZAR CAMPO

  const setField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ENVIAR FORMULARIO

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const matricula = form.matricula.trim().toUpperCase();

    const modelo = form.modelo.trim();

    // VALIDAR CAMPOS OBLIGATORIOS

    if (!matricula || !modelo || !form.id_tipo_vehiculo) {
      setError(t("dialog.required"));
      return;
    }

    try {
      // ENVIAR DATOS SIN TRADUCIR AL BACKEND

      await onSubmit({
        matricula,
        modelo,
        id_tipo_vehiculo: Number(form.id_tipo_vehiculo),
        estado: form.estado,
      });
    } catch (err) {
      console.error(err);

      setError(err.message || t("dialog.saveError"));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            maxWidth: 480,
          },
        },
      }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        {/* TÍTULO */}

        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "var(--text-main-color)",
            pb: 1,
          }}
        >
          {isEditing ? t("dialog.editTitle") : t("dialog.createTitle")}
        </DialogTitle>

        {/* FORMULARIO */}

        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            {/* MATRÍCULA */}

            <TextField
              label={t("dialog.license")}
              value={form.matricula}
              onChange={(event) =>
                setField("matricula", event.target.value.toUpperCase())
              }
              required
              fullWidth
              autoFocus
              size="small"
              disabled={saving}
              slotProps={{
                htmlInput: {
                  maxLength: 20,
                },
              }}
            />

            {/* MODELO */}

            <TextField
              label={t("dialog.model")}
              value={form.modelo}
              onChange={(event) => setField("modelo", event.target.value)}
              required
              fullWidth
              size="small"
              disabled={saving}
              slotProps={{
                htmlInput: {
                  maxLength: 100,
                },
              }}
            />

            {/* TIPO DE VEHÍCULO */}

            <FormControl fullWidth required size="small" disabled={saving}>
              <InputLabel id="vehicle-type-label">
                {t("dialog.type")}
              </InputLabel>

              <Select
                labelId="vehicle-type-label"
                label={t("dialog.type")}
                value={form.id_tipo_vehiculo}
                onChange={(event) =>
                  setField("id_tipo_vehiculo", event.target.value)
                }
              >
                {types.map((type) => (
                  <MenuItem
                    key={type.id_tipo_vehiculo}
                    value={Number(type.id_tipo_vehiculo)}
                  >
                    {t(`types.${type.nombre}`, {
                      defaultValue: type.nombre,
                    })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* ESTADO */}

            <FormControl fullWidth size="small" disabled={saving}>
              <InputLabel id="vehicle-status-label">
                {t("dialog.status")}
              </InputLabel>

              <Select
                labelId="vehicle-status-label"
                label={t("dialog.status")}
                value={form.estado}
                onChange={(event) => setField("estado", event.target.value)}
              >
                {VEHICLE_STATES.map((value) => (
                  <MenuItem key={value} value={value}>
                    {t(`statuses.${value}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        {/* ACCIONES */}

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
            pt: 2,
            gap: 1,
          }}
        >
          <Button
            onClick={onClose}
            disabled={saving}
            sx={{
              textTransform: "none",
              color: "var(--text-muted-color)",
            }}
          >
            {t("dialog.cancel")}
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={saving || types.length === 0}
            sx={{
              textTransform: "none",
              bgcolor: "var(--primary-color)",
              borderRadius: 2,
              minWidth: 130,
              "&:hover": {
                bgcolor: "var(--primary-hover-color)",
              },
            }}
          >
            {saving ? (
              <CircularProgress size={20} color="inherit" />
            ) : isEditing ? (
              t("dialog.save")
            ) : (
              t("dialog.create")
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
