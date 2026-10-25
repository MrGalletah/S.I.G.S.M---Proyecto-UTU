import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { getAllCategories } from "../../apiCalls/categories/categoriesApi";

export default function SurveyDialog({
  open,
  onClose,
  survey = null,
  onSubmit,
  loading = false,
}) {
  const { t } = useTranslation("documents");

  const isEditing = Boolean(survey);
  const hasResponses = Number(survey?.total_respuestas ?? 0) > 0;

  const [form, setForm] = useState({
    titulo: survey?.titulo ?? "",
    descripcion: survey?.descripcion ?? "",
    id_cat: survey?.id_cat == null ? "" : String(survey.id_cat),
    anonima: survey ? Boolean(Number(survey.anonima)) : true,
    activo: survey ? Boolean(Number(survey.activo)) : false,
  });

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  // CARGAR CATEGORÍAS

  useEffect(() => {
    let cancelled = false;

    getAllCategories()
      .then((data) => {
        if (cancelled) return;

        if (!data.ok || !Array.isArray(data.categorias)) {
          throw new Error(t("surveys.dialog.invalidCategories"));
        }

        setCategories(data.categorias);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(error);
        setCategoriesError(
          error.message || t("surveys.dialog.categoriesError"),
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingCategories(false);
      });

    return () => {
      cancelled = true;
    };
  }, [t]);

  const handleChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ENVIAR FORMULARIO

  const handleSubmit = async (event) => {
    event.preventDefault();

    const titulo = form.titulo.trim();
    const descripcion = form.descripcion.trim();

    if (!titulo || titulo.length > 150 || descripcion.length > 2000) {
      return;
    }

    const data = {
      titulo,
      descripcion: descripcion || null,
      id_cat: form.id_cat === "" ? null : Number(form.id_cat),
      anonima: form.anonima,
    };

    if (isEditing) {
      data.activo = form.activo;
    }

    await onSubmit(data);
  };

  const titleIsEmpty = !form.titulo.trim();

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="survey-dialog-title"
    >
      <form onSubmit={handleSubmit} style={{ padding: 10 }}>
        <DialogTitle id="survey-dialog-title" sx={{ fontWeight: 700, pb: 1 }}>
          {isEditing
            ? t("surveys.dialog.editTitle")
            : t("surveys.dialog.createTitle")}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {/* TÍTULO */}

            <TextField
              label={t("surveys.dialog.title")}
              value={form.titulo}
              onChange={(event) => handleChange("titulo", event.target.value)}
              required
              fullWidth
              autoFocus
              disabled={loading}
              slotProps={{
                htmlInput: { maxLength: 150 },
              }}
            />

            {/* DESCRIPCIÓN */}

            <TextField
              label={t("surveys.dialog.description")}
              value={form.descripcion}
              onChange={(event) =>
                handleChange("descripcion", event.target.value)
              }
              multiline
              minRows={3}
              fullWidth
              disabled={loading}
              slotProps={{
                htmlInput: { maxLength: 2000 },
              }}
            />

            {/* CATEGORÍA */}

            <TextField
              select
              label={t("surveys.dialog.category")}
              value={form.id_cat}
              onChange={(event) => handleChange("id_cat", event.target.value)}
              fullWidth
              disabled={
                loading || loadingCategories || Boolean(categoriesError)
              }
              helperText={t("surveys.dialog.categoryHelp")}
            >
              <MenuItem value="">{t("surveys.dialog.noCategory")}</MenuItem>

              {categories.map((category) => {
                const active =
                  category.activo === true || Number(category.activo) === 1;

                const selected = form.id_cat === String(category.id_cat);

                return (
                  <MenuItem
                    key={category.id_cat}
                    value={String(category.id_cat)}
                    disabled={!active && !selected}
                  >
                    {category.nombre}
                    {!active ? ` (${t("surveys.inactive")})` : ""}
                  </MenuItem>
                );
              })}
            </TextField>

            {categoriesError && (
              <Alert severity="error">{categoriesError}</Alert>
            )}

            {/* ANONIMATO */}

            <Stack spacing={0.5}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.anonima}
                    onChange={(event) =>
                      handleChange("anonima", event.target.checked)
                    }
                    disabled={loading || hasResponses}
                  />
                }
                label={t("surveys.dialog.anonymous")}
              />

              <Typography variant="caption" color="text.secondary">
                {hasResponses
                  ? t("surveys.dialog.anonymousLocked")
                  : form.anonima
                    ? t("surveys.dialog.anonymousHelp")
                    : t("surveys.dialog.identifiedHelp")}
              </Typography>
            </Stack>

            {/* PUBLICACIÓN */}

            {isEditing && (
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.activo}
                      onChange={(event) =>
                        handleChange("activo", event.target.checked)
                      }
                      disabled={loading}
                    />
                  }
                  label={
                    form.activo
                      ? t("surveys.dialog.published")
                      : t("surveys.dialog.unpublished")
                  }
                />

                <Typography variant="caption" color="text.secondary">
                  {t("surveys.dialog.publicationHelp")}
                </Typography>
              </Stack>
            )}

            {!isEditing && (
              <Alert severity="info">{t("surveys.dialog.draftHelp")}</Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 0, pt: 3, pb: 0 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{ textTransform: "none" }}
          >
            {t("surveys.dialog.cancel")}
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={
              loading ||
              loadingCategories ||
              Boolean(categoriesError) ||
              titleIsEmpty
            }
            startIcon={
              loading ? <CircularProgress size={16} color="inherit" /> : null
            }
            sx={{
              borderRadius: 2,
              textTransform: "none",
              bgcolor: "var(--primary-color)",
              "&:hover": {
                bgcolor: "var(--primary-hover-color)",
              },
            }}
          >
            {loading
              ? t("surveys.dialog.saving")
              : isEditing
                ? t("surveys.dialog.save")
                : t("surveys.dialog.createTitle")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
