import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

import {
  getPublicSurveyDetail,
  submitPublicSurvey,
} from "../../../apiCalls/surveys/surveysApi";

const isTrue = (value) => value === true || Number(value) === 1;

const primaryButtonStyles = {
  borderRadius: 2,
  textTransform: "none",
  bgcolor: "var(--primary-color)",

  "&:hover": {
    bgcolor: "var(--primary-hover-color)",
  },
};

export default function PublicSurveyForm({ survey, onBack }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [answers, setAnswers] = useState({});
  const [identity, setIdentity] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // LOAD SURVEY QUESTIONS

  useEffect(() => {
    let cancelled = false;

    getPublicSurveyDetail(survey.id_encuesta)
      .then((data) => {
        if (cancelled) return;

        if (!data.ok || !data.encuesta) {
          throw new Error("No se pudo cargar la encuesta.");
        }

        setDetail(data.encuesta);
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(error.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [survey.id_encuesta]);

  // ONLY ACTIVE QUESTIONS IN THEIR SAVED ORDER

  const questions = (detail?.preguntas ?? [])
    .filter((question) => isTrue(question.activa))
    .sort((first, second) => Number(first.orden) - Number(second.orden));

  // UPDATE ANSWER

  const setAnswer = (questionId, value) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [questionId]: "",
    }));
  };

  // SUBMIT SURVEY

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting || submitted || !detail) return;

    const errors = {};
    const responses = [];

    // VALIDATE IDENTITY FOR NON-ANONYMOUS SURVEYS

    if (!isTrue(detail.anonima) && !identity.trim()) {
      errors.cedula = "La cédula es obligatoria.";
    }

    // VALIDATE QUESTIONS

    for (const question of questions) {
      const questionId = Number(question.id_pregunta);

      const value = String(answers[questionId] ?? "").trim();

      if (!value) {
        if (isTrue(question.obligatoria)) {
          errors[questionId] = "Esta pregunta es obligatoria.";
        }

        continue;
      }

      // OPEN QUESTION

      if (question.tipo === "abierta") {
        responses.push({
          id_pregunta: questionId,
          respuesta: value,
        });
      } else {
        // CLOSED OR SELECT QUESTION

        const option = (question.opciones ?? []).find(
          (item) => Number(item.id_opcion) === Number(value),
        );

        if (!option) {
          errors[questionId] = "Seleccioná una opción válida.";
        } else {
          responses.push({
            id_pregunta: questionId,
            id_opcion: Number(option.id_opcion),
          });
        }
      }
    }

    setFieldErrors(errors);
    setSubmitError("");

    if (Object.keys(errors).length > 0) {
      setSubmitError("Revisá los campos marcados antes de enviar.");

      return;
    }

    // BUILD REQUEST

    const payload = {
      id_encuesta: Number(detail.id_encuesta),
      respuestas: responses,
    };

    if (!isTrue(detail.anonima)) {
      payload.cedula = identity.trim();
    }

    try {
      setSubmitting(true);

      await submitPublicSurvey(payload);

      setSubmitted(true);
    } catch (error) {
      console.error(error);

      setSubmitError(error.message || "No se pudieron enviar las respuestas.");
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS MESSAGE

  if (submitted) {
    return (
      <Box
        sx={{
          textAlign: "center",
          bgcolor: "background.paper",
          borderRadius: 3,
          p: { xs: 3, sm: 6 },
          maxWidth: 680,
          mx: "auto",
        }}
      >
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64, mb: 2 }} />

        <Typography variant="h5" fontWeight={700} gutterBottom>
          ¡Gracias por responder!
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Tus respuestas se guardaron correctamente.
        </Typography>

        <Button variant="contained" onClick={onBack} sx={primaryButtonStyles}>
          Volver al listado
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      {/* BACK BUTTON */}

      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        disabled={submitting}
        sx={{
          mb: 2,
          textTransform: "none",
        }}
      >
        Volver al listado
      </Button>

      {/* LOADING AND ERROR STATES */}

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 6,
          }}
        >
          <CircularProgress />
        </Box>
      ) : loadError ? (
        <Alert severity="error">{loadError}</Alert>
      ) : !detail ? (
        <Alert severity="error">No se pudo cargar la encuesta.</Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            {/* SURVEY HEADER */}

            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                p: { xs: 2.5, sm: 3.5 },
              }}
            >
              <Typography variant="h5" fontWeight={800} gutterBottom>
                {detail.titulo}
              </Typography>

              {detail.descripcion && (
                <Typography color="text.secondary">
                  {detail.descripcion}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary">
                Las preguntas marcadas con * son obligatorias.
              </Typography>

              {isTrue(detail.anonima) && (
                <Alert
                  severity="info"
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                  }}
                >
                  Esta encuesta es anónima. No se solicitará tu cédula.
                </Alert>
              )}
            </Card>

            {/* IDENTITY */}

            {!isTrue(detail.anonima) && (
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  p: { xs: 2.5, sm: 3 },
                }}
              >
                <TextField
                  fullWidth
                  required
                  label="Cédula"
                  value={identity}
                  onChange={(event) => {
                    setIdentity(event.target.value);

                    setFieldErrors((previous) => ({
                      ...previous,
                      cedula: "",
                    }));
                  }}
                  disabled={submitting}
                  error={Boolean(fieldErrors.cedula)}
                  helperText={
                    fieldErrors.cedula ||
                    "Ingresá tu cédula para identificar tu respuesta."
                  }
                  slotProps={{
                    htmlInput: {
                      maxLength: 20,
                    },
                  }}
                />
              </Card>
            )}

            {/* QUESTIONS */}

            {questions.map((question, index) => {
              const questionId = Number(question.id_pregunta);
              const value = answers[questionId] ?? "";

              const required = isTrue(question.obligatoria);
              const error = fieldErrors[questionId];

              return (
                <Card
                  key={questionId}
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    p: { xs: 2.5, sm: 3 },
                  }}
                >
                  <Stack spacing={2}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {index + 1}. {question.texto}
                      {required ? " *" : ""}
                    </Typography>

                    {/* OPEN QUESTION */}

                    {question.tipo === "abierta" ? (
                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        placeholder="Escribí tu respuesta"
                        value={value}
                        onChange={(event) =>
                          setAnswer(questionId, event.target.value)
                        }
                        disabled={submitting}
                        error={Boolean(error)}
                        helperText={error || " "}
                      />
                    ) : question.tipo === "cerrada" ? (
                      /* CLOSED QUESTION */

                      <FormControl error={Boolean(error)} component="fieldset">
                        <FormLabel
                          component="legend"
                          sx={{
                            fontSize: 13,
                            mb: 1,
                          }}
                        >
                          Elegí una opción
                        </FormLabel>

                        <RadioGroup
                          value={value}
                          onChange={(event) =>
                            setAnswer(questionId, event.target.value)
                          }
                        >
                          {(question.opciones ?? []).map((option) => (
                            <FormControlLabel
                              key={option.id_opcion}
                              value={String(option.id_opcion)}
                              control={<Radio disabled={submitting} />}
                              label={option.texto}
                            />
                          ))}
                        </RadioGroup>

                        {error && <FormHelperText>{error}</FormHelperText>}
                      </FormControl>
                    ) : (
                      /* SELECT QUESTION */

                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Seleccioná una opción"
                        value={value}
                        onChange={(event) =>
                          setAnswer(questionId, event.target.value)
                        }
                        disabled={submitting}
                        error={Boolean(error)}
                        helperText={error || " "}
                      >
                        <MenuItem value="">
                          <em>Sin seleccionar</em>
                        </MenuItem>

                        {(question.opciones ?? []).map((option) => (
                          <MenuItem
                            key={option.id_opcion}
                            value={String(option.id_opcion)}
                          >
                            {option.texto}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  </Stack>
                </Card>
              );
            })}

            {/* EMPTY SURVEY */}

            {questions.length === 0 && (
              <Alert severity="warning">
                Esta encuesta no tiene preguntas disponibles.
              </Alert>
            )}

            {/* SUBMIT ERROR */}

            {submitError && <Alert severity="error">{submitError}</Alert>}

            {/* ACTIONS */}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="flex-end"
              spacing={1.5}
            >
              <Button
                onClick={onBack}
                disabled={submitting}
                sx={{ textTransform: "none" }}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={submitting || questions.length === 0}
                startIcon={
                  submitting ? (
                    <CircularProgress color="inherit" size={18} />
                  ) : (
                    <SendOutlinedIcon />
                  )
                }
                sx={{
                  ...primaryButtonStyles,
                  px: 3,
                }}
              >
                {submitting ? "Enviando..." : "Enviar respuestas"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
