import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import BarChartIcon from "@mui/icons-material/BarChart";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";

import { getSurveyResults } from "../../apiCalls/surveys/surveysApi";

const isTrue = (value) => value === true || Number(value) === 1;

function formatPercentage(value, language) {
  const percentage = Number(value);

  if (!Number.isFinite(percentage)) {
    return "0%";
  }

  const locale = language === "en" ? "en-US" : "es-UY";

  return `${percentage.toLocaleString(locale, {
    maximumFractionDigits: 1,
  })}%`;
}

// TARJETA DE ESTADÍSTICA

function SummaryCard({ label, value }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        p: 2.5,
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        bgcolor: "background.paper",
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontWeight: 600 }}
      >
        {label}
      </Typography>

      <Typography
        variant="h3"
        sx={{
          fontWeight: 800,
          lineHeight: 1,
          color: "var(--primary-color)",
        }}
      >
        {value}
      </Typography>
    </Card>
  );
}

// RESULTADO DE UNA OPCIÓN

function OptionResult({ option }) {
  const { t, i18n } = useTranslation("documents");

  const count = Number(option.cantidad) || 0;
  const percentage = Number(option.porcentaje) || 0;

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: "action.hover",
      }}
    >
      <Stack spacing={1}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              minWidth: 0,
              overflowWrap: "anywhere",
            }}
          >
            {option.texto}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: "var(--primary-color)",
              flexShrink: 0,
            }}
          >
            {formatPercentage(
              percentage,
              i18n.resolvedLanguage || i18n.language,
            )}
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={Math.max(0, Math.min(100, percentage))}
          sx={{
            height: 10,
            borderRadius: 999,
            bgcolor: "rgba(0,0,0,0.07)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 999,
              bgcolor: "var(--primary-color)",
            },
          }}
        />

        <Typography variant="caption" color="text.secondary">
          {t("surveys.results.responses", { count })}
        </Typography>
      </Stack>
    </Box>
  );
}

// ACORDEÓN DE RESULTADOS POR PREGUNTA

function QuestionResultAccordion({
  question,
  position,
  commentsLimit,
  defaultExpanded = false,
}) {
  const { t } = useTranslation("documents");

  const answered = Number(question.respondidas) || 0;
  const skipped = Number(question.sin_responder) || 0;
  const comments = question.comentarios ?? [];
  const options = question.opciones ?? [];

  const isOpenQuestion = question.tipo === "abierta";

  return (
    <Accordion
      disableGutters
      elevation={0}
      defaultExpanded={defaultExpanded}
      sx={{
        borderRadius: "20px !important",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "none",
        "&::before": { display: "none" },
        "&.Mui-expanded": { my: 0 },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.25,
          minHeight: 96,
          "&.Mui-expanded": { minHeight: 96 },
          "& .MuiAccordionSummary-content": { my: 0 },
          "& .MuiAccordionSummary-content.Mui-expanded": { my: 0 },
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="flex-start"
          sx={{ width: "100%", minWidth: 0 }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: "action.hover",
              color: "var(--primary-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              flexShrink: 0,
              mt: 0.25,
            }}
          >
            {position + 1}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 1.25,
                overflowWrap: "anywhere",
                pr: 1,
              }}
            >
              {question.texto}
            </Typography>

            {/* ETIQUETAS */}

            <Stack
              direction="row"
              spacing={0.75}
              useFlexGap
              flexWrap="wrap"
              sx={{ mb: 1.25 }}
            >
              <Chip
                size="small"
                variant="outlined"
                label={t(`surveys.accordion.types.${question.tipo}`, {
                  defaultValue: question.tipo,
                })}
              />

              {isTrue(question.obligatoria) && (
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  label={t("surveys.accordion.required")}
                />
              )}

              {!isTrue(question.activa) && (
                <Chip size="small" label={t("surveys.accordion.inactive")} />
              )}
            </Stack>

            {/* ESTADÍSTICAS DE PREGUNTA */}

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip
                size="small"
                label={t("surveys.results.answered", {
                  count: answered,
                })}
                sx={{ fontWeight: 600 }}
              />

              <Chip
                size="small"
                label={t("surveys.results.skipped", {
                  count: skipped,
                })}
                sx={{ fontWeight: 600 }}
              />

              {isOpenQuestion ? (
                <Chip
                  size="small"
                  icon={<ChatBubbleOutlineIcon />}
                  label={t("surveys.results.comments", {
                    count: comments.length,
                  })}
                  sx={{ fontWeight: 600 }}
                />
              ) : (
                <Chip
                  size="small"
                  label={t("surveys.results.options", {
                    count: options.length,
                  })}
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Stack>
          </Box>
        </Stack>
      </AccordionSummary>

      <AccordionDetails
        sx={{
          px: { xs: 2.5, sm: 3 },
          pb: 3,
          pt: 0,
          bgcolor: "rgba(0,0,0,0.01)",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        {isOpenQuestion ? (
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {t("surveys.results.writtenResponses")}
            </Typography>

            {comments.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                {t("surveys.results.noWrittenResponses")}
              </Alert>
            ) : (
              <Stack spacing={1}>
                {comments.map((comment, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1.75,
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {comment}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}

            {answered > comments.length && (
              <Typography variant="caption" color="text.secondary">
                {t("surveys.results.commentsLimit", {
                  count: commentsLimit,
                })}
              </Typography>
            )}
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {t("surveys.results.distribution")}
            </Typography>

            {options.length === 0 ? (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                {t("surveys.results.noOptions")}
              </Alert>
            ) : (
              <Stack spacing={1.25}>
                {options.map((option) => (
                  <OptionResult key={option.id_opcion} option={option} />
                ))}
              </Stack>
            )}

            <Typography variant="caption" color="text.secondary">
              {t("surveys.results.percentageHelp")}
            </Typography>
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

// DIÁLOGO PRINCIPAL

export default function SurveyResultsDialog({ open, onClose, survey }) {
  const { t } = useTranslation("documents");

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // CARGAR RESULTADOS

  useEffect(() => {
    let cancelled = false;

    getSurveyResults(survey.id_encuesta)
      .then((data) => {
        if (cancelled) return;

        if (!data.ok || !data.resultados) {
          throw new Error(t("surveys.results.loadError"));
        }

        setResults(data.resultados);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError(err.message || t("surveys.results.loadError"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [survey.id_encuesta, t]);

  const sortedQuestions = useMemo(() => {
    const questions = results?.preguntas ?? [];

    return [...questions].sort((a, b) => Number(a.orden) - Number(b.orden));
  }, [results]);

  const totalResponses = Number(results?.total_respuestas) || 0;
  const totalQuestions = sortedQuestions.length;

  const activeQuestions = sortedQuestions.filter((question) =>
    isTrue(question.activa),
  ).length;

  const commentsLimit = Number(results?.limite_comentarios) || 100;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      aria-labelledby="survey-results-title"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            maxHeight: "92vh",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          },
        },
      }}
    >
      {/* CABECERA */}

      <DialogTitle
        id="survey-results-title"
        sx={{
          px: { xs: 2.5, sm: 3.5 },
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
            <BarChartIcon sx={{ fontSize: 27 }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {t("surveys.results.title")}
            </Typography>

            <Typography variant="body1" color="text.secondary" noWrap>
              {results?.titulo ?? survey.titulo}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      {/* CONTENIDO */}

      <DialogContent
        sx={{
          px: { xs: 2.5, sm: 3.5 },
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
              py: 8,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        ) : !results ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {t("surveys.results.noResults")}
          </Alert>
        ) : (
          <Stack spacing={3}>
            {/* ESTADÍSTICAS GENERALES */}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, 1fr)",
                },
                gap: 2,
              }}
            >
              <SummaryCard
                label={t("surveys.results.totalResponses")}
                value={totalResponses}
              />

              <SummaryCard
                label={t("surveys.results.activeQuestions")}
                value={activeQuestions}
              />

              <SummaryCard
                label={t("surveys.results.totalQuestions")}
                value={totalQuestions}
              />
            </Box>

            {/* CABECERA DE RESULTADOS */}

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {t("surveys.results.byQuestion")}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {t("surveys.results.expandHelp")}
              </Typography>
            </Box>

            {totalResponses === 0 && (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                {t("surveys.results.noResponses")}
              </Alert>
            )}

            {/* ACORDEONES */}

            {sortedQuestions.length === 0 ? (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                {t("surveys.results.noQuestions")}
              </Alert>
            ) : (
              <Stack spacing={1.5}>
                {sortedQuestions.map((question, index) => (
                  <QuestionResultAccordion
                    key={question.id_pregunta}
                    question={question}
                    position={index}
                    commentsLimit={commentsLimit}
                    defaultExpanded={index === 0}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
