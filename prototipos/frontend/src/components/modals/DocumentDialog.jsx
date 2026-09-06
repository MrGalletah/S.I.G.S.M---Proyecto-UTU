import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { useEffect, useState } from "react";
import { getAllCategories } from "../../apiCalls/categories/categoriesApi";

export default function DocumentModal({
  open,
  onClose,
  document = null,
  onSubmit,
  loading = false,
}) {
  const isEditing = Boolean(document);

  const [title, setTitle] = useState(document?.document ?? "");
  const [description, setDescription] = useState(document?.description ?? "");
  const [categoryId, setCategoryId] = useState(document?.idCat ?? "");
  const [active, setActive] = useState(document?.state === "Activo");
  const [file, setFile] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);

        const data = await getAllCategories();
        setCategories(data.categorias);
      } catch (error) {
        console.error("Error cargando categorías:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      titulo: title.trim(),
      descripcion: description.trim(),
      id_cat: Number(categoryId),
    };

    if (isEditing) {
      data.activo = active;
    }

    if (file) {
      data.archivo = file;
    }

    await onSubmit(data);
  };

  const titleIsEmpty = !title.trim();
  const descriptionIsEmpty = !description.trim();
  const categoryIsEmpty = !categoryId;
  const fileIsMissing = !isEditing && !file;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {isEditing ? "Editar documento" : "Nuevo documento"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
              autoFocus
            />

            <FormControl fullWidth required>
              <InputLabel id="category-label">Categoría</InputLabel>

              <Select
                labelId="category-label"
                value={categoryId}
                label="Categoría"
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loadingCategories}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id_cat} value={category.id_cat}>
                    {category.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              fullWidth
              required
            />

            <Stack spacing={1}>
              <Button variant="outlined" component="label" disabled={loading}>
                {file
                  ? "Cambiar archivo"
                  : isEditing
                    ? "Reemplazar archivo"
                    : "Seleccionar archivo"}

                <input
                  type="file"
                  hidden
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </Button>

              {file && (
                <Typography variant="body2" color="text.secondary">
                  Archivo seleccionado: {file.name}
                </Typography>
              )}

              {isEditing && !file && document?.path && (
                <Typography variant="body2" color="text.secondary">
                  Archivo actual: {document.path.split("/").pop()}
                </Typography>
              )}
            </Stack>

            {isEditing && (
              <FormControlLabel
                control={
                  <Switch
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                }
                label={active ? "Documento activo" : "Documento inactivo"}
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
            disabled={
              loading ||
              loadingCategories ||
              titleIsEmpty ||
              categoryIsEmpty ||
              fileIsMissing ||
              descriptionIsEmpty
            }
          >
            {loading
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Subir documento"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
