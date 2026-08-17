import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import { useState } from "react";

export default function CategoryModal({
  open,
  onClose,
  category = null,
  onSubmit,
  loading = false,
}) {
  const isEditing = Boolean(category);

  const [name, setName] = useState(category?.nombre ?? "");
  const [description, setDescription] = useState(category?.descripcion ?? "");
  const [active, setActive] = useState(Boolean(category?.activo));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      nombre: name.trim(),
      descripcion: description.trim(),
    };

    if (isEditing) {
      data.activo = active;
    }

    await onSubmit(data);
  };

  const nameIsEmpty = !name.trim();

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {isEditing ? "Editar categoría" : "Nueva categoría"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              autoFocus
            />

            <TextField
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              fullWidth
            />

            {isEditing && (
              <FormControlLabel
                control={
                  <Switch
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                }
                label={active ? "Categoría activa" : "Categoría inactiva"}
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={loading || nameIsEmpty}
          >
            {loading
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear categoría"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
