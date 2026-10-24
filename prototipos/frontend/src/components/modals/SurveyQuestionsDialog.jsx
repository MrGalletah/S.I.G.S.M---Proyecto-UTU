import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import SortableQuestionAccordion from "./SortableQuestionAccordion";

import { reorderSurveyQuestions } from "../../apiCalls/surveys/surveysApi";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";

import { useEffect, useState } from "react";

import {
  getSurveyDetail,
  createSurveyQuestion,
  updateSurveyQuestion,
} from "../../apiCalls/surveys/surveysApi";

const isTrue = (value) => value === true || Number(value) === 1;

// FORMULARIO DE PREGUNTA

function QuestionForm({ question, nextOrder, saving, onSubmit, onCancel }) {
  const isEditing = Boolean(question);

  const [texto, setTexto] = useState(question?.texto ?? "");
  const [tipo, setTipo] = useState(question?.tipo ?? "abierta");

  const [obligatoria, setObligatoria] = useState(
    question ? isTrue(question.obligatoria) : false,
  );

  const [activa, setActiva] = useState(
    question ? isTrue(question.activa) : true,
  );

  const [opciones, setOpciones] = useState(
    question?.opciones?.map((opcion) => ({
      texto: opcion.texto,
      valor: Number(opcion.valor),
    })) ?? [],
  );

  const [error, setError] = useState("");

  // CAMBIAR TIPO

  const handleTypeChange = (newType) => {
    if (newType === "abierta") {
      setOpciones([]);
    } else if (tipo === "abierta") {
      setOpciones([
        { texto: "", valor: 1 },
        { texto: "", valor: 2 },
      ]);
    }

    setTipo(newType);
  };

  // MODIFICAR OPCIÓN

  const updateOption = (index, textoOpcion) => {
    setOpciones((prev) =>
      prev.map((opcion, i) =>
        i === index ? { ...opcion, texto: textoOpcion } : opcion,
      ),
    );
  };

  // AGREGAR OPCIÓN

  const addOption = () => {
    const nextValue =
      Math.max(0, ...opciones.map((opcion) => opcion.valor)) + 1;

    setOpciones((prev) => [...prev, { texto: "", valor: nextValue }]);
  };

  // QUITAR OPCIÓN

  const removeOption = (index) => {
    setOpciones((prev) => prev.filter((_, i) => i !== index));
  };

  // GUARDAR

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const textoLimpio = texto.trim();

    if (!textoLimpio || textoLimpio.length > 1000) {
      setError("La pregunta debe tener entre 1 y 1000 caracteres.");
      return;
    }

    const opcionesLimpias =
      tipo === "abierta"
        ? []
        : opciones.map((opcion) => ({
            texto: opcion.texto.trim(),
            valor: opcion.valor,
          }));

    if (tipo !== "abierta") {
      if (opcionesLimpias.length < 2 || opcionesLimpias.length > 20) {
        setError("Debe haber entre 2 y 20 opciones.");
        return;
      }

      if (
        opcionesLimpias.some(
          (opcion) => !opcion.texto || opcion.texto.length > 255,
        )
      ) {
        setError("Todas las opciones deben tener texto.");
        return;
      }
    }

    const payload = {
      texto: textoLimpio,
      tipo,
      obligatoria,
    };

    if (isEditing) {
      payload.activa = activa;

      // Reemplazamos opciones únicamente si cambiaron.
      // Así evitamos generar ID nuevos innecesariamente.

      const originales = question.opciones.map((opcion) => ({
        texto: opcion.texto,
        valor: Number(opcion.valor),
      }));

      if (
        question.tipo !== tipo ||
        JSON.stringify(originales) !== JSON.stringify(opcionesLimpias)
      ) {
        payload.opciones = opcionesLimpias;
      }
    } else {
      payload.orden = nextOrder;
      payload.opciones = opcionesLimpias;
    }

    onSubmit(payload);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        p: { xs: 2.5, sm: 3.5 },
      }}
    >
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={onCancel} disabled={saving}>
            <ArrowBackIcon />
          </IconButton>

          <Typography variant="h6" fontWeight={700}>
            {isEditing ? "Editar pregunta" : "Nueva pregunta"}
          </Typography>
        </Stack>

        <TextField
          label="Pregunta"
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          multiline
          minRows={2}
          fullWidth
          required
          disabled={saving}
          slotProps={{
            htmlInput: { maxLength: 1000 },
          }}
        />

        <TextField
          select
          label="Tipo de pregunta"
          value={tipo}
          onChange={(event) => handleTypeChange(event.target.value)}
          fullWidth
          disabled={saving}
        >
          <MenuItem value="abierta">Abierta (respuesta escrita)</MenuItem>

          <MenuItem value="cerrada">Cerrada (opciones visibles)</MenuItem>

          <MenuItem value="seleccion">Selección (lista desplegable)</MenuItem>
        </TextField>

        {/* OPCIONES */}

        {tipo !== "abierta" && (
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Opciones de respuesta</Typography>

            {opciones.map((opcion, index) => (
              <Stack
                key={opcion.valor}
                direction="row"
                alignItems="center"
                spacing={1}
              >
                <TextField
                  size="small"
                  label={`Opción ${index + 1}`}
                  value={opcion.texto}
                  onChange={(event) => updateOption(index, event.target.value)}
                  disabled={saving}
                  fullWidth
                  required
                  slotProps={{
                    htmlInput: { maxLength: 255 },
                  }}
                />

                <IconButton
                  color="error"
                  onClick={() => removeOption(index)}
                  disabled={saving || opciones.length <= 2}
                  aria-label={`Quitar opción ${index + 1}`}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Stack>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={addOption}
              disabled={saving || opciones.length >= 20}
              sx={{
                alignSelf: "flex-start",
                textTransform: "none",
              }}
            >
              Agregar opción
            </Button>

            <Typography variant="caption" color="text.secondary">
              Cada paciente podrá elegir una única opción.
            </Typography>
          </Stack>
        )}

        <Divider />

        {/* CONFIGURACIÓN */}

        <FormControlLabel
          control={
            <Switch
              checked={obligatoria}
              onChange={(event) => setObligatoria(event.target.checked)}
              disabled={saving}
            />
          }
          label="Respuesta obligatoria"
        />

        {isEditing && (
          <FormControlLabel
            control={
              <Switch
                checked={activa}
                onChange={(event) => setActiva(event.target.checked)}
                disabled={saving}
              />
            }
            label={activa ? "Pregunta activa" : "Pregunta inactiva"}
          />
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {/* ACCIONES */}

        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button
            onClick={onCancel}
            disabled={saving}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{
              textTransform: "none",
              bgcolor: "var(--primary-color)",
              "&:hover": {
                bgcolor: "var(--primary-hover-color)",
              },
            }}
          >
            {saving ? "Guardando..." : "Guardar pregunta"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

// DIÁLOGO PRINCIPAL

export default function SurveyQuestionsDialog({ open, onClose, survey }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // undefined = listado
  // null = crear
  // objeto = editar

  const [editingQuestion, setEditingQuestion] = useState(undefined);

  const idEncuesta = survey.id_encuesta;

  // CARGAR FORMULARIO COMPLETO

  useEffect(() => {
    let cancelled = false;

    getSurveyDetail(idEncuesta)
      .then((data) => {
        if (cancelled) return;

        if (!data.ok || !data.encuesta) {
          throw new Error("No se pudo cargar la encuesta.");
        }

        setDetail(data.encuesta);
      })
      .catch((err) => {
        if (cancelled) return;

        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [idEncuesta]);

  const preguntas = detail?.preguntas ?? [];

  const locked =
    isTrue(detail?.activo ?? survey.activo) ||
    Number(survey.total_respuestas ?? 0) > 0;

  const nextOrder = Math.max(0, ...preguntas.map((p) => Number(p.orden))) + 1;

  // GUARDAR PREGUNTA

  const handleSaveQuestion = async (payload) => {
    try {
      setSaving(true);
      setError("");
      setNotice("");

      if (editingQuestion) {
        await updateSurveyQuestion(editingQuestion.id_pregunta, payload);
      } else {
        await createSurveyQuestion({
          id_encuesta: idEncuesta,
          ...payload,
        });
      }

      // RECUPERAR LAS PREGUNTAS ACTUALIZADAS

      const data = await getSurveyDetail(idEncuesta);

      if (!data.ok || !data.encuesta) {
        throw new Error("No se pudo actualizar el listado.");
      }

      setDetail(data.encuesta);
      setEditingQuestion(undefined);

      setNotice("Pregunta guardada correctamente.");
    } catch (err) {
      console.error(err);

      setError(err.message || "No se pudo guardar la pregunta.");
    } finally {
      setSaving(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),

    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id || locked || saving) {
      return;
    }

    // ENCONTRAR POSICIONES

    const oldIndex = preguntas.findIndex(
      (p) => Number(p.id_pregunta) === Number(active.id),
    );

    const newIndex = preguntas.findIndex(
      (p) => Number(p.id_pregunta) === Number(over.id),
    );

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // CALCULAR NUEVO ORDEN

    const reordered = arrayMove(preguntas, oldIndex, newIndex).map(
      (pregunta, index) => ({
        ...pregunta,
        orden: index + 1,
      }),
    );

    // CONSERVAR EL ESTADO ANTERIOR

    const previousDetail = detail;

    // ACTUALIZAR VISUALMENTE ANTES DE LA RESPUESTA

    setDetail({
      ...detail,
      preguntas: reordered,
    });

    setError("");
    setNotice("");
    setSaving(true);

    try {
      // GUARDAR EN MARIA DB

      await reorderSurveyQuestions(
        idEncuesta,
        reordered.map((pregunta) => Number(pregunta.id_pregunta)),
      );

      setNotice("Orden de preguntas guardado correctamente.");
    } catch (error) {
      console.error(error);

      // SI FALLA, RESTAURAR EL ORDEN ORIGINAL

      setDetail(previousDetail);

      setError(error.message || "No se pudo guardar el nuevo orden.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="survey-questions-title"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            maxHeight: "90vh",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          },
        },
      }}
    >
      {/* CABECERA */}

      <DialogTitle
        id="survey-questions-title"
        sx={{
          px: { xs: 2.5, sm: 4 },
          py: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              bgcolor: "action.hover",
              color: "var(--primary-color)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <QuizOutlinedIcon sx={{ fontSize: 27 }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Preguntas de la encuesta
            </Typography>

            <Typography variant="body2" color="text.secondary" noWrap>
              {survey.titulo}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      {/* CONTENIDO */}

      <DialogContent
        sx={{
          px: { xs: 2.5, sm: 4 },
          py: 3,
          bgcolor: "background.default",
          "&.MuiDialogContent-root": {
            pt: 3,
            pb: 3,
          },
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 5,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* MENSAJES */}

            {error && <Alert severity="error">{error}</Alert>}

            {notice && <Alert severity="success">{notice}</Alert>}

            {detail && (
              <>
                {locked && (
                  <Alert severity="info">
                    Esta encuesta está publicada o ya tiene respuestas. Sus
                    preguntas son de solo lectura.
                  </Alert>
                )}

                {editingQuestion !== undefined ? (
                  /* CREAR O EDITAR PREGUNTA */

                  <QuestionForm
                    key={editingQuestion?.id_pregunta ?? "new"}
                    question={editingQuestion}
                    nextOrder={nextOrder}
                    saving={saving}
                    onSubmit={handleSaveQuestion}
                    onCancel={() => {
                      setEditingQuestion(undefined);
                      setError("");
                    }}
                  />
                ) : (
                  /* LISTADO DE PREGUNTAS */

                  <Stack spacing={2.5}>
                    {/* TÍTULO Y ACCIONES */}

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "1fr auto",
                        },
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Preguntas
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {preguntas.length === 0
                            ? "Todavía no agregaste preguntas."
                            : `${preguntas.length} preguntas registradas`}
                        </Typography>
                      </Box>

                      {preguntas.length > 0 && (
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          disabled={locked}
                          onClick={() => {
                            setError("");
                            setNotice("");
                            setEditingQuestion(null);
                          }}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            bgcolor: "var(--primary-color)",
                            "&:hover": {
                              bgcolor: "var(--primary-hover-color)",
                            },
                          }}
                        >
                          Nueva pregunta
                        </Button>
                      )}
                    </Box>

                    {/* ESTADO VACÍO */}

                    {preguntas.length === 0 ? (
                      <Box
                        sx={{
                          border: "1px dashed",
                          borderColor: "divider",
                          borderRadius: 3,
                          bgcolor: "background.paper",
                          px: 3,
                          py: 5,
                        }}
                      >
                        <Stack
                          spacing={2}
                          alignItems="center"
                          textAlign="center"
                        >
                          <Box
                            sx={{
                              width: 64,
                              height: 64,
                              borderRadius: 3,
                              bgcolor: "action.hover",
                              color: "var(--primary-color)",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <QuizOutlinedIcon sx={{ fontSize: 34 }} />
                          </Box>

                          <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                              Tu encuesta todavía está vacía
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mt: 0.5,
                                maxWidth: 400,
                              }}
                            >
                              Comenzá agregando una pregunta. Podés utilizar
                              respuestas abiertas, opciones visibles o listas
                              desplegables.
                            </Typography>
                          </Box>

                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            disabled={locked}
                            onClick={() => {
                              setError("");
                              setNotice("");
                              setEditingQuestion(null);
                            }}
                            sx={{
                              mt: 1,
                              borderRadius: 2,
                              px: 3,
                              py: 1,
                              textTransform: "none",
                              bgcolor: "var(--primary-color)",
                              "&:hover": {
                                bgcolor: "var(--primary-hover-color)",
                              },
                            }}
                          >
                            Crear primera pregunta
                          </Button>
                        </Stack>
                      </Box>
                    ) : (
                      /* TARJETAS DE PREGUNTAS */

                      <Stack spacing={2}>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={preguntas.map((pregunta) =>
                              Number(pregunta.id_pregunta),
                            )}
                            strategy={verticalListSortingStrategy}
                          >
                            <Stack spacing={1.5}>
                              {preguntas.map((pregunta, index) => (
                                <SortableQuestionAccordion
                                  key={pregunta.id_pregunta}
                                  pregunta={pregunta}
                                  position={index}
                                  disabled={locked || saving}
                                  onEdit={(selectedQuestion) => {
                                    setError("");
                                    setNotice("");

                                    setEditingQuestion(selectedQuestion);
                                  }}
                                />
                              ))}
                            </Stack>
                          </SortableContext>
                        </DndContext>
                      </Stack>
                    )}
                  </Stack>
                )}
              </>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
