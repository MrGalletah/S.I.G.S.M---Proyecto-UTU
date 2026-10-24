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

import { useEffect, useState } from "react";

import { getAllCategories } from "../../apiCalls/categories/categoriesApi";

export default function SurveyDialog({
  open,
  onClose,
  survey = null,
  onSubmit,
  loading = false,
}) {
  const isEditing = Boolean(survey);

  const hasResponses = Number(survey?.total_respuestas ?? 0) > 0;

  // DATOS DEL FORMULARIO

  const [form, setForm] = useState({
    titulo: survey?.titulo ?? "",
    descripcion: survey?.descripcion ?? "",
    id_cat: survey?.id_cat == null ? "" : String(survey.id_cat),
    anonima: survey ? Boolean(Number(survey.anonima)) : true,
    activo: survey ? Boolean(Number(survey.activo)) : false,
  });

  // CATEGORÍAS

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  // CARGAR CATEGORÍAS AL MONTAR EL DIÁLOGO

  useEffect(() => {
    let cancelled = false;

    getAllCategories()
      .then((data) => {
        if (cancelled) return;

        if (!data.ok || !Array.isArray(data.categorias)) {
          throw new Error("Respuesta de categorías no válida.");
        }

        setCategories(data.categorias);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error(error);

        setCategoriesError(error.message || "Error al cargar las categorías.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ACTUALIZAR CAMPOS

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

    // SOLO LAS ENCUESTAS EXISTENTES PUEDEN PUBLICARSE

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
      <form onSubmit={handleSubmit} style={{padding: 10}}>
        {/* TÍTULO */}

        <DialogTitle id="survey-dialog-title" sx={{ fontWeight: 700, pb: 1 }}>
          {isEditing ? "Editar encuesta" : "Crear encuesta"}
        </DialogTitle>

        {/* CONTENIDO */}

        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {/* TÍTULO */}

            <TextField
              label="Título"
              value={form.titulo}
              onChange={(event) => handleChange("titulo", event.target.value)}
              required
              fullWidth
              autoFocus
              disabled={loading}
              slotProps={{
                htmlInput: {
                  maxLength: 150,
                },
              }}
            />

            {/* DESCRIPCIÓN */}

            <TextField
              label="Descripción"
              value={form.descripcion}
              onChange={(event) =>
                handleChange("descripcion", event.target.value)
              }
              multiline
              minRows={3}
              fullWidth
              disabled={loading}
              slotProps={{
                htmlInput: {
                  maxLength: 2000,
                },
              }}
            />

            {/* CATEGORÍA */}

            <TextField
              select
              label="Categoría"
              value={form.id_cat}
              onChange={(event) => handleChange("id_cat", event.target.value)}
              fullWidth
              disabled={
                loading || loadingCategories || Boolean(categoriesError)
              }
              helperText="Opcional. Sin categoría, la encuesta será general."
            >
              <MenuItem value="">Sin categoría</MenuItem>

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
                    {!active ? " (Inactiva)" : ""}
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
                label="Encuesta anónima"
              />

              <Typography variant="caption" color="text.secondary">
                {hasResponses
                  ? "No se puede cambiar el anonimato de una encuesta que ya tiene respuestas."
                  : form.anonima
                    ? "No se solicitará la cédula del paciente."
                    : "El paciente deberá indicar su cédula al responder."}
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
                    form.activo ? "Encuesta publicada" : "Encuesta inactiva"
                  }
                />

                <Typography variant="caption" color="text.secondary">
                  Para publicar, la encuesta debe tener preguntas activas
                  correctamente configuradas.
                </Typography>
              </Stack>
            )}

            {!isEditing && (
              <Alert severity="info">
                La encuesta se creará como borrador. Después podrás agregar sus
                preguntas.
              </Alert>
            )}
          </Stack>
        </DialogContent>

        {/* ACCIONES */}

        <DialogActions sx={{ px: 0, pt: 3, pb: 0 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{ textTransform: "none" }}
          >
            Cancelar
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
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear encuesta"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
