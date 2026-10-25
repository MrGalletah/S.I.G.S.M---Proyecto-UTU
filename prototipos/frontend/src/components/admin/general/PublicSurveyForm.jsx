import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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

// FORMULARIO DE ENCUESTA PÚBLICA

export default function PublicSurveyForm({ survey, onBack }) {
  const { t } = useTranslation("public");

  // ENCUESTA

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // RESPUESTAS

  const [answers, setAnswers] = useState({});
  const [identity, setIdentity] = useState("");

  // VALIDACIONES

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  // ENVÍO

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // TRADUCIR ERRORES GUARDADOS COMO CLAVES

  const errorMessage = (key) => (key ? t(key, { defaultValue: key }) : "");

  // CARGAR PREGUNTAS DE LA ENCUESTA

  useEffect(() => {
    let cancelled = false;

    getPublicSurveyDetail(survey.id_encuesta)
      .then((data) => {
        if (cancelled) return;

        if (!data.ok || !data.encuesta) {
          throw new Error("survey.errors.load");
        }

        setDetail(data.encuesta);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error(error);

        setLoadError(error.message || "survey.errors.load");
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

  // SOLO PREGUNTAS ACTIVAS Y EN ORDEN

  const questions = (detail?.preguntas ?? [])
    .filter((question) => isTrue(question.activa))
    .sort((first, second) => Number(first.orden) - Number(second.orden));

  // ACTUALIZAR RESPUESTA

  const setAnswer = (questionId, value) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }));

    // LIMPIAR ERROR DEL CAMPO MODIFICADO

    setFieldErrors((previous) => ({
      ...previous,
      [questionId]: "",
    }));
  };

  // ENVIAR ENCUESTA

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting || submitted || !detail) {
      return;
    }

    const errors = {};
    const responses = [];

    // VALIDAR IDENTIFICACIÓN

    if (!isTrue(detail.anonima) && !identity.trim()) {
      errors.cedula = "survey.errors.identityRequired";
    }

    // VALIDAR CADA PREGUNTA

    for (const question of questions) {
      const questionId = Number(question.id_pregunta);

      const value = String(answers[questionId] ?? "").trim();

      // PREGUNTA SIN RESPUESTA

      if (!value) {
        if (isTrue(question.obligatoria)) {
          errors[questionId] = "survey.errors.questionRequired";
        }

        continue;
      }

      // PREGUNTA ABIERTA

      if (question.tipo === "abierta") {
        responses.push({
          id_pregunta: questionId,
          respuesta: value,
        });
      } else {
        // PREGUNTA CERRADA O DE SELECCIÓN

        const option = (question.opciones ?? []).find(
          (item) => Number(item.id_opcion) === Number(value),
        );

        if (!option) {
          errors[questionId] = "survey.errors.invalidOption";
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

    // DETENER SI HAY ERRORES

    if (Object.keys(errors).length > 0) {
      setSubmitError("survey.errors.review");

      return;
    }

    // PREPARAR DATOS PARA PHP

    const payload = {
      id_encuesta: Number(detail.id_encuesta),

      respuestas: responses,
    };

    if (!isTrue(detail.anonima)) {
      payload.cedula = identity.trim();
    }

    // ENVIAR RESPUESTAS

    try {
      setSubmitting(true);

      await submitPublicSurvey(payload);

      setSubmitted(true);
    } catch (error) {
      console.error(error);

      setSubmitError(error.message || "survey.errors.submit");
    } finally {
      setSubmitting(false);
    }
  };

  // CONFIRMACIÓN DE ENVÍO

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
        <CheckCircleOutlineIcon
          color="success"
          sx={{
            fontSize: 64,
            mb: 2,
          }}
        />

        <Typography variant="h5" fontWeight={700} gutterBottom>
          {t("survey.thanks")}
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {t("survey.success")}
        </Typography>

        <Button variant="contained" onClick={onBack} sx={primaryButtonStyles}>
          {t("survey.back")}
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: "auto",
      }}
    >
      {/* VOLVER AL LISTADO */}

      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        disabled={submitting}
        sx={{
          mb: 2,
          textTransform: "none",
        }}
      >
        {t("survey.back")}
      </Button>

      {/* ESTADOS DE CARGA */}

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
        <Alert severity="error">{errorMessage(loadError)}</Alert>
      ) : !detail ? (
        <Alert severity="error">{t("survey.errors.load")}</Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            {/* CABECERA DE LA ENCUESTA */}

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
                {t("survey.requiredInfo")}
              </Typography>

              {/* AVISO DE ANONIMATO */}

              {isTrue(detail.anonima) && (
                <Alert
                  severity="info"
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                  }}
                >
                  {t("survey.anonymousInfo")}
                </Alert>
              )}
            </Card>

            {/* IDENTIFICACIÓN PARA ENCUESTAS NO ANÓNIMAS */}

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
                  label={t("survey.patientId")}
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
                    fieldErrors.cedula
                      ? errorMessage(fieldErrors.cedula)
                      : t("survey.patientIdHelp")
                  }
                  slotProps={{
                    htmlInput: {
                      maxLength: 20,
                    },
                  }}
                />
              </Card>
            )}

            {/* PREGUNTAS */}

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
                    p: {
                      xs: 2.5,
                      sm: 3,
                    },
                  }}
                >
                  <Stack spacing={2}>
                    {/* ENUNCIADO */}

                    <Typography variant="subtitle1" fontWeight={700}>
                      {index + 1}. {question.texto}
                      {required ? " *" : ""}
                    </Typography>

                    {question.tipo === "abierta" ? (
                      // PREGUNTA ABIERTA

                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        placeholder={t("survey.writeAnswer")}
                        value={value}
                        onChange={(event) =>
                          setAnswer(questionId, event.target.value)
                        }
                        disabled={submitting}
                        error={Boolean(error)}
                        helperText={error ? errorMessage(error) : " "}
                      />
                    ) : question.tipo === "cerrada" ? (
                      // PREGUNTA CERRADA

                      <FormControl error={Boolean(error)} component="fieldset">
                        <FormLabel
                          component="legend"
                          sx={{
                            fontSize: 13,
                            mb: 1,
                          }}
                        >
                          {t("survey.chooseOption")}
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

                        {error && (
                          <FormHelperText>{errorMessage(error)}</FormHelperText>
                        )}
                      </FormControl>
                    ) : (
                      // PREGUNTA DE SELECCIÓN

                      <TextField
                        select
                        fullWidth
                        size="small"
                        label={t("survey.selectOption")}
                        value={value}
                        onChange={(event) =>
                          setAnswer(questionId, event.target.value)
                        }
                        disabled={submitting}
                        error={Boolean(error)}
                        helperText={error ? errorMessage(error) : " "}
                      >
                        <MenuItem value="">
                          <em>{t("survey.unselected")}</em>
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

            {/* SIN PREGUNTAS */}

            {questions.length === 0 && (
              <Alert severity="warning">{t("survey.empty")}</Alert>
            )}

            {/* ERROR DE ENVÍO */}

            {submitError && (
              <Alert severity="error">{errorMessage(submitError)}</Alert>
            )}

            {/* ACCIONES */}

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              justifyContent="flex-end"
              spacing={1.5}
            >
              <Button
                onClick={onBack}
                disabled={submitting}
                sx={{
                  textTransform: "none",
                }}
              >
                {t("survey.cancel")}
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
                {submitting ? t("survey.submitting") : t("survey.submit")}
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
