import { useState } from "react";

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

const EMPTY_FORM = {
  matricula: "",
  modelo: "",
  id_tipo_vehiculo: "",
  estado: "OPERATIVO",
};

export default function VehicleDialog({
  open,
  vehicle,
  types,
  saving,
  onClose,
  onSubmit,
}) {
  const isEditing = Boolean(vehicle);

  const [form, setForm] = useState(() =>
    vehicle
      ? {
          matricula: vehicle.matricula,
          modelo: vehicle.modelo,
          id_tipo_vehiculo: vehicle.tipo.id_tipo_vehiculo,
          estado: vehicle.estado,
        }
      : { ...EMPTY_FORM },
  );

  const [error, setError] = useState("");

  const setField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const matricula = form.matricula.trim().toUpperCase();

    const modelo = form.modelo.trim();

    if (!matricula || !modelo || !form.id_tipo_vehiculo) {
      setError("Completá todos los campos obligatorios.");
      return;
    }

    try {
      await onSubmit({
        matricula,
        modelo,
        id_tipo_vehiculo: Number(form.id_tipo_vehiculo),
        estado: form.estado,
      });
    } catch (err) {
      setError(err.message || "No se pudo guardar el vehículo.");
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
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "var(--text-main-color)",
            pb: 1,
          }}
        >
          {isEditing ? "Editar vehículo" : "Registrar vehículo"}
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2.5}
            sx={{
              mt: 1,
            }}
          >
            {error && <Alert severity="error">{error}</Alert>}

            {/* MATRÍCULA */}

            <TextField
              label="Matrícula"
              value={form.matricula}
              onChange={(event) =>
                setField("matricula", event.target.value.toUpperCase())
              }
              required
              fullWidth
              autoFocus
              size="small"
              slotProps={{
                htmlInput: {
                  maxLength: 20,
                },
              }}
            />

            {/* MODELO */}

            <TextField
              label="Modelo"
              value={form.modelo}
              onChange={(event) => setField("modelo", event.target.value)}
              required
              fullWidth
              size="small"
              slotProps={{
                htmlInput: {
                  maxLength: 100,
                },
              }}
            />

            {/* TIPO */}

            <FormControl fullWidth required size="small">
              <InputLabel id="vehicle-type-label">Tipo de vehículo</InputLabel>

              <Select
                labelId="vehicle-type-label"
                label="Tipo de vehículo"
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
                    {type.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* ESTADO */}

            <FormControl fullWidth size="small">
              <InputLabel id="vehicle-status-label">Estado</InputLabel>

              <Select
                labelId="vehicle-status-label"
                label="Estado"
                value={form.estado}
                onChange={(event) => setField("estado", event.target.value)}
              >
                <MenuItem value="OPERATIVO">Operativo</MenuItem>

                <MenuItem value="MANTENIMIENTO">En mantenimiento</MenuItem>

                <MenuItem value="FUERA_DE_SERVICIO">Fuera de servicio</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

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
            Cancelar
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
              "Guardar cambios"
            ) : (
              "Registrar"
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
