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
import { useTranslation } from "react-i18next";

import { getAllCategories } from "../../apiCalls/categories/categoriesApi";

export default function DocumentModal({
  open,
  onClose,
  document = null,
  onSubmit,
  loading = false,
}) {
  const { t } = useTranslation("documents");

  const isEditing = Boolean(document);

  const [title, setTitle] = useState(document?.document ?? "");

  const [description, setDescription] = useState(document?.description ?? "");

  const [categoryId, setCategoryId] = useState(document?.idCat ?? "");

  const [active, setActive] = useState(Boolean(document?.active));

  const [file, setFile] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);

  // Las categorías se cargan al abrir el modal.
  // No traducimos los nombres recibidos del backend.
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    getAllCategories()
      .then((data) => {
        if (!cancelled && data.ok) {
          setCategories(data.categorias);
        }
      })
      .catch((error) => {
        if (cancelled) return;

        console.error("Error cargando categorías:", error);
        setCategoriesError(true);
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleSubmit = async (event) => {
    event.preventDefault();

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
          {isEditing
            ? t("files.dialog.editTitle")
            : t("files.dialog.createTitle")}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Título */}
            <TextField
              label={t("files.dialog.name")}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              fullWidth
              autoFocus
            />

            {/* Categoría */}
            <FormControl fullWidth required>
              <InputLabel id="document-category-label">
                {t("files.dialog.category")}
              </InputLabel>

              <Select
                labelId="document-category-label"
                value={categoryId}
                label={t("files.dialog.category")}
                onChange={(event) => setCategoryId(event.target.value)}
                disabled={loadingCategories || categoriesError}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id_cat} value={category.id_cat}>
                    {category.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {categoriesError && (
              <Typography variant="body2" color="error" role="alert">
                {t("files.dialog.categoryLoadError")}
              </Typography>
            )}

            {/* Descripción */}
            <TextField
              label={t("files.dialog.description")}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              multiline
              rows={4}
              fullWidth
              required
            />

            {/* Archivo PDF */}
            <Stack spacing={1}>
              <Button variant="outlined" component="label" disabled={loading}>
                {file
                  ? t("files.dialog.changeFile")
                  : isEditing
                    ? t("files.dialog.replaceFile")
                    : t("files.dialog.selectFile")}

                <input
                  type="file"
                  hidden
                  accept="application/pdf"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
              </Button>

              {file && (
                <Typography variant="body2" color="text.secondary">
                  {t("files.dialog.selectedFile", {
                    name: file.name,
                  })}
                </Typography>
              )}

              {isEditing && !file && document?.path && (
                <Typography variant="body2" color="text.secondary">
                  {t("files.dialog.currentFile", {
                    name: document.path.split("/").pop(),
                  })}
                </Typography>
              )}
            </Stack>

            {/* Estado: solo durante edición */}
            {isEditing && (
              <FormControlLabel
                control={
                  <Switch
                    checked={active}
                    onChange={(event) => setActive(event.target.checked)}
                  />
                }
                label={
                  active ? t("files.dialog.active") : t("files.dialog.inactive")
                }
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            {t("files.dialog.cancel")}
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
              ? t("files.dialog.saving")
              : isEditing
                ? t("files.dialog.save")
                : t("files.dialog.upload")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
