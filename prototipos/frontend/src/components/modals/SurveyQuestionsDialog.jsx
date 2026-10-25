import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";

import SortableQuestionAccordion from "./SortableQuestionAccordion";

import {
  getSurveyDetail,
  createSurveyQuestion,
  updateSurveyQuestion,
  reorderSurveyQuestions,
} from "../../apiCalls/surveys/surveysApi";

const isTrue = (value) => value === true || Number(value) === 1;

// FORMULARIO DE PREGUNTAS

function QuestionForm({ question, nextOrder, saving, onSubmit, onCancel }) {
  const { t } = useTranslation("documents");
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

  const updateOption = (index, text) => {
    setOpciones((prev) =>
      prev.map((option, i) =>
        i === index ? { ...option, texto: text } : option,
      ),
    );
  };

  const addOption = () => {
    const nextValue =
      Math.max(0, ...opciones.map((option) => option.valor)) + 1;

    setOpciones((prev) => [...prev, { texto: "", valor: nextValue }]);
  };

  const removeOption = (index) => {
    setOpciones((prev) => prev.filter((_, i) => i !== index));
  };

  // VALIDAR Y GUARDAR

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const textoLimpio = texto.trim();

    if (!textoLimpio || textoLimpio.length > 1000) {
      setError(t("surveys.questions.questionLengthError"));
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
        setError(t("surveys.questions.optionsCountError"));
        return;
      }

      if (
        opcionesLimpias.some(
          (opcion) => !opcion.texto || opcion.texto.length > 255,
        )
      ) {
        setError(t("surveys.questions.optionsTextError"));
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
        {/* TÍTULO */}

        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            onClick={onCancel}
            disabled={saving}
            aria-label={t("surveys.questions.back")}
          >
            <ArrowBackIcon />
          </IconButton>

          <Typography variant="h6" fontWeight={700}>
            {isEditing
              ? t("surveys.questions.editQuestion")
              : t("surveys.questions.newQuestion")}
          </Typography>
        </Stack>

        {/* TEXTO */}

        <TextField
          label={t("surveys.questions.question")}
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

        {/* TIPO */}

        <TextField
          select
          label={t("surveys.questions.type")}
          value={tipo}
          onChange={(event) => handleTypeChange(event.target.value)}
          fullWidth
          disabled={saving}
        >
          <MenuItem value="abierta">
            {t("surveys.questions.types.abierta")}
          </MenuItem>

          <MenuItem value="cerrada">
            {t("surveys.questions.types.cerrada")}
          </MenuItem>

          <MenuItem value="seleccion">
            {t("surveys.questions.types.seleccion")}
          </MenuItem>
        </TextField>

        {/* OPCIONES */}

        {tipo !== "abierta" && (
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">
              {t("surveys.questions.options")}
            </Typography>

            {opciones.map((opcion, index) => (
              <Stack
                key={opcion.valor}
                direction="row"
                alignItems="center"
                spacing={1}
              >
                <TextField
                  size="small"
                  label={t("surveys.questions.optionNumber", {
                    number: index + 1,
                  })}
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
                  aria-label={t("surveys.questions.removeOption", {
                    number: index + 1,
                  })}
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
              {t("surveys.questions.addOption")}
            </Button>

            <Typography variant="caption" color="text.secondary">
              {t("surveys.questions.singleChoice")}
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
          label={t("surveys.questions.required")}
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
            label={
              activa
                ? t("surveys.questions.active")
                : t("surveys.questions.inactive")
            }
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
            {t("surveys.questions.cancel")}
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
            {saving
              ? t("surveys.questions.saving")
              : t("surveys.questions.saveQuestion")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

// DIÁLOGO PRINCIPAL

export default function SurveyQuestionsDialog({ open, onClose, survey }) {
  const { t } = useTranslation("documents");

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

  // CONSULTAR ENCUESTA

  useEffect(() => {
    let cancelled = false;

    getSurveyDetail(idEncuesta)
      .then((data) => {
        if (cancelled) return;

        if (!data.ok || !data.encuesta) {
          throw new Error(t("surveys.questions.loadError"));
        }

        setDetail(data.encuesta);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError(err.message || t("surveys.questions.loadError"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [idEncuesta, t]);

  const preguntas = detail?.preguntas ?? [];

  const locked =
    isTrue(detail?.activo ?? survey.activo) ||
    Number(survey.total_respuestas ?? 0) > 0;

  const nextOrder = Math.max(0, ...preguntas.map((p) => Number(p.orden))) + 1;

  // SENSORES DEL DRAG & DROP

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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

      const data = await getSurveyDetail(idEncuesta);

      if (!data.ok || !data.encuesta) {
        throw new Error(t("surveys.questions.updateListError"));
      }

      setDetail(data.encuesta);
      setEditingQuestion(undefined);
      setNotice(t("surveys.questions.saveSuccess"));
    } catch (err) {
      console.error(err);
      setError(err.message || t("surveys.questions.saveError"));
    } finally {
      setSaving(false);
    }
  };

  // REORDENAR PREGUNTAS

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id || locked || saving) {
      return;
    }

    const oldIndex = preguntas.findIndex(
      (p) => Number(p.id_pregunta) === Number(active.id),
    );

    const newIndex = preguntas.findIndex(
      (p) => Number(p.id_pregunta) === Number(over.id),
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(preguntas, oldIndex, newIndex).map(
      (pregunta, index) => ({
        ...pregunta,
        orden: index + 1,
      }),
    );

    const previousDetail = detail;

    // ACTUALIZACIÓN OPTIMISTA

    setDetail({
      ...detail,
      preguntas: reordered,
    });

    setError("");
    setNotice("");
    setSaving(true);

    try {
      await reorderSurveyQuestions(
        idEncuesta,
        reordered.map((pregunta) => Number(pregunta.id_pregunta)),
      );

      setNotice(t("surveys.questions.orderSuccess"));
    } catch (err) {
      console.error(err);

      // RESTAURAR EL ORDEN ANTERIOR
      setDetail(previousDetail);

      setError(err.message || t("surveys.questions.orderError"));
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
              {t("surveys.questions.dialogTitle")}
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
            {error && <Alert severity="error">{error}</Alert>}

            {notice && <Alert severity="success">{notice}</Alert>}

            {detail && (
              <>
                {locked && (
                  <Alert severity="info">{t("surveys.questions.locked")}</Alert>
                )}

                {editingQuestion !== undefined ? (
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
                  <Stack spacing={2.5}>
                    {/* CABECERA DEL LISTADO */}

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
                          {t("surveys.questions.listTitle")}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {preguntas.length === 0
                            ? t("surveys.questions.noQuestions")
                            : t("surveys.questions.registered", {
                                count: preguntas.length,
                              })}
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
                          {t("surveys.questions.newQuestion")}
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
                              {t("surveys.questions.emptyTitle")}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mt: 0.5,
                                maxWidth: 400,
                              }}
                            >
                              {t("surveys.questions.emptyDescription")}
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
                            {t("surveys.questions.firstQuestion")}
                          </Button>
                        </Stack>
                      </Box>
                    ) : (
                      /* LISTADO CON DRAG & DROP */

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
