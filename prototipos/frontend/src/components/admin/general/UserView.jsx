import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";

import LanguageSwitcher from "../../utils/LanguageSwitcher";

import { getUserDocuments } from "../../../apiCalls/documents/documentsApi";
import { getPublicSurveys } from "../../../apiCalls/surveys/surveysApi";

import PublicSurveyForm from "./PublicSurveyForm";

const isTrue = (value) => value === true || Number(value) === 1;

// VISTA PÚBLICA

export default function UserView() {
  const { t } = useTranslation("public");

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [surveys, setSurveys] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadErrors, setLoadErrors] = useState([]);

  const [selectedSurvey, setSelectedSurvey] = useState(null);

  // CARGAR DOCUMENTOS Y ENCUESTAS PÚBLICAS

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([getUserDocuments(), getPublicSurveys()]).then(
      ([documentsResult, surveysResult]) => {
        if (cancelled) return;

        const errors = [];

        if (documentsResult.status === "fulfilled") {
          setCategories(documentsResult.value.categorias ?? []);
        } else {
          console.error(documentsResult.reason);
          errors.push("catalog.errors.documents");
        }

        if (surveysResult.status === "fulfilled") {
          setSurveys(surveysResult.value.encuestas ?? []);
        } else {
          console.error(surveysResult.reason);
          errors.push("catalog.errors.surveys");
        }

        setLoadErrors(errors);
        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  // AGRUPAR DOCUMENTOS Y ENCUESTAS POR CATEGORÍA

  const groupedCategories = useMemo(() => {
    const categoryMap = new Map();
    const uncategorizedSurveys = [];

    // CATEGORÍAS DE DOCUMENTOS

    for (const category of categories) {
      categoryMap.set(String(category.id_cat), {
        ...category,
        documentos: category.documentos ?? [],
        encuestas: [],
      });
    }

    // ENCUESTAS ACTIVAS

    for (const survey of surveys) {
      if (!isTrue(survey.activo)) continue;

      const categoryId =
        survey.id_cat == null || survey.id_cat === ""
          ? null
          : String(survey.id_cat);

      // ENCUESTAS SIN CATEGORÍA

      if (categoryId === null) {
        uncategorizedSurveys.push(survey);
        continue;
      }

      // CREAR CATEGORÍA SI SOLO CONTIENE ENCUESTAS

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          id_cat: survey.id_cat,
          nombre: survey.categoria || t("catalog.fallbackCategory"),
          descripcion: "",
          documentos: [],
          encuestas: [],
        });
      }

      categoryMap.get(categoryId).encuestas.push(survey);
    }

    // ELIMINAR CATEGORÍAS VACÍAS

    const groups = Array.from(categoryMap.values()).filter(
      (category) =>
        category.documentos.length > 0 || category.encuestas.length > 0,
    );

    // ENCUESTAS GENERALES

    if (uncategorizedSurveys.length > 0) {
      groups.push({
        id_cat: "uncategorized-surveys",
        nombre: t("catalog.surveysCategory"),
        descripcion: t("catalog.surveysCategoryDescription"),
        documentos: [],
        encuestas: uncategorizedSurveys,
      });
    }

    return groups;
  }, [categories, surveys, t]);

  // BÚSQUEDA DE DOCUMENTOS Y ENCUESTAS

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return groupedCategories;

    return groupedCategories
      .map((category) => {
        const categoryMatches = [category.nombre, category.descripcion].some(
          (value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(query),
        );

        if (categoryMatches) return category;

        const filteredDocuments = category.documentos.filter((document) =>
          [document.titulo, document.descripcion].some((value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(query),
          ),
        );

        const filteredSurveys = category.encuestas.filter((survey) =>
          [survey.titulo, survey.descripcion].some((value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(query),
          ),
        );

        return {
          ...category,
          documentos: filteredDocuments,
          encuestas: filteredSurveys,
        };
      })
      .filter(
        (category) =>
          category.documentos.length > 0 || category.encuestas.length > 0,
      );
  }, [search, groupedCategories]);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "var(--main-bg-color)",
        py: { xs: 0, md: 2 },
      }}
    >
      {/* BARRA SUPERIOR */}

      <Box
        sx={{
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, md: 1 },
        }}
      >
        {/* IZQUIERDA: ACCESO DE FUNCIONARIOS */}

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ minWidth: 0 }}
        >
          <Button
            component={RouterLink}
            to="/login"
            size="small"
            startIcon={<LoginOutlinedIcon />}
            sx={{
              textTransform: "none",
              color: "var(--primary-color)",
              fontSize: 13,
              fontWeight: 700,
              minWidth: "auto",
              whiteSpace: "nowrap",
              "&:hover": {
                bgcolor: "rgba(15,124,113,0.08)",
              },
            }}
          >
            {t("header.staffLogin")}
          </Button>
        </Stack>

        {/* DERECHA: SELECTOR DE IDIOMA */}

        <LanguageSwitcher />
      </Box>

      {/* CONTENIDO PRINCIPAL */}

      <Container
        maxWidth="xl"
        disableGutters
        sx={{
          px: { xs: 0, sm: 2 },
        }}
      >
        <Box
          sx={{
            maxWidth: 1280,
            mx: "auto",
            minHeight: "100dvh",
            px: { xs: 2.5, md: 4 },
            py: { xs: 2.5, md: 4 },
          }}
        >
          {selectedSurvey ? (
            // FORMULARIO DE ENCUESTA

            <PublicSurveyForm
              key={selectedSurvey.id_encuesta}
              survey={selectedSurvey}
              onBack={() => setSelectedSurvey(null)}
            />
          ) : (
            // DOCUMENTOS Y ENCUESTAS

            <>
              {/* CABECERA */}

              <Box
                sx={{
                  textAlign: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: 28, md: 38 },
                  }}
                >
                  {t("header.title")}
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "text.secondary",
                    fontSize: { xs: 14, md: 17 },
                    fontWeight: 600,
                    maxWidth: 760,
                    mx: "auto",
                  }}
                >
                  {t("header.description")}
                </Typography>
              </Box>

              {/* BUSCADOR */}

              <TextField
                fullWidth
                size="small"
                placeholder={t("catalog.search")}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                sx={{
                  mb: 2.5,
                  maxWidth: 760,
                  display: "block",
                  mx: "auto",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    bgcolor: "var(--white-color)",
                    fontWeight: 600,
                    minHeight: 50,
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                  htmlInput: {
                    "aria-label": t("catalog.search"),
                  },
                }}
              />

              {/* INFORMACIÓN */}

              <Alert
                icon={<InfoOutlinedIcon />}
                severity="info"
                sx={{
                  mb: 3,
                  maxWidth: 760,
                  mx: "auto",
                  borderRadius: 2.5,
                  bgcolor: "#DFF8F5",
                  color: "var(--primary-color)",
                  border: "1px solid rgba(15,124,113,0.16)",
                }}
              >
                {t("catalog.help")}
              </Alert>

              {/* ERRORES DE CARGA */}

              {loadErrors.length > 0 && (
                <Alert
                  severity="warning"
                  sx={{
                    mb: 3,
                    maxWidth: 760,
                    mx: "auto",
                  }}
                >
                  {loadErrors.map((key) => t(key)).join(" ")}
                </Alert>
              )}

              {/* CONTENIDO */}

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
              ) : (
                <>
                  {/* CATEGORÍAS */}

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "1fr 1fr",
                      },
                      gap: { xs: 2, md: 3 },
                      alignItems: "start",
                    }}
                  >
                    {filteredCategories.map((category) => (
                      <CategoryAccordion
                        key={category.id_cat}
                        category={category}
                        onSelectSurvey={setSelectedSurvey}
                      />
                    ))}
                  </Box>

                  {/* SIN RESULTADOS */}

                  {filteredCategories.length === 0 && (
                    <Typography
                      color="text.secondary"
                      textAlign="center"
                      fontWeight={600}
                      sx={{ mt: 4 }}
                    >
                      {t("catalog.empty")}
                    </Typography>
                  )}
                </>
              )}
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
}

// ACORDEÓN DE CATEGORÍA

function CategoryAccordion({ category, onSelectSurvey }) {
  const { t } = useTranslation("public");

  const documentCount = category.documentos.length;
  const surveyCount = category.encuestas.length;

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        borderRadius: "18px !important",
        overflow: "hidden",
        bgcolor: "var(--white-color)",
        boxShadow: "var(--card-shadow)",
        "&::before": {
          display: "none",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: { xs: 78, md: 92 },
          px: { xs: 2.5, md: 3 },
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            minWidth: 0,
          },
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: 17, md: 21 },
            fontWeight: 800,
            overflowWrap: "anywhere",
          }}
        >
          {category.nombre}
        </Typography>

        {/* CONTADORES */}

        <Stack
          direction="row"
          gap={0.75}
          flexWrap="wrap"
          justifyContent="flex-end"
        >
          {documentCount > 0 && (
            <Chip
              size="small"
              label={t("catalog.documents", {
                count: documentCount,
              })}
              sx={{
                bgcolor: "#DDF8F5",
                color: "var(--primary-color)",
                fontWeight: 700,
              }}
            />
          )}

          {surveyCount > 0 && (
            <Chip
              size="small"
              label={t("catalog.surveys", {
                count: surveyCount,
              })}
              variant="outlined"
              sx={{
                fontWeight: 700,
                ml: 1,
              }}
            />
          )}
        </Stack>
      </AccordionSummary>

      <AccordionDetails
        sx={{
          px: { xs: 2.5, md: 3 },
          pt: 0,
          pb: 2,
        }}
      >
        {category.descripcion && (
          <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
            {category.descripcion}
          </Typography>
        )}

        {/* DOCUMENTOS */}

        <Stack>
          {category.documentos.map((document) => (
            <DocumentAccordion key={document.id_doc} document={document} />
          ))}
        </Stack>

        {/* ENCUESTAS */}

        {surveyCount > 0 && (
          <Box
            sx={{
              mt: documentCount > 0 ? 2 : 1,
            }}
          >
            {documentCount > 0 && (
              <Divider textAlign="left" sx={{ mb: 1.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                >
                  {t("catalog.surveysSection")}
                </Typography>
              </Divider>
            )}

            <Stack>
              {category.encuestas.map((survey) => (
                <SurveyAccordion
                  key={survey.id_encuesta}
                  survey={survey}
                  onSelectSurvey={onSelectSurvey}
                />
              ))}
            </Stack>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

// ACORDEÓN DE DOCUMENTO

function DocumentAccordion({ document }) {
  const { t } = useTranslation("public");

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        bgcolor: "transparent",
        borderTop: "1px solid rgba(0,0,0,0.07)",
        "&::before": {
          display: "none",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: { xs: 58, md: 68 },
          px: { xs: 2.5, md: 3 },
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            gap: 1.5,
            minWidth: 0,
          },
        }}
      >
        <DescriptionOutlinedIcon
          sx={{
            color: "text.secondary",
            flexShrink: 0,
          }}
        />

        <Typography
          sx={{
            color: "var(--primary-color)",
            fontWeight: 700,
            fontSize: { xs: 14, md: 16 },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {document.titulo}
        </Typography>
      </AccordionSummary>

      <AccordionDetails
        sx={{
          px: { xs: 3, md: 4 },
          pt: 0,
          pb: 2,
        }}
      >
        <Stack spacing={1}>
          {/* DESCARGAR DOCUMENTO */}

          <Button
            size="small"
            startIcon={<DownloadOutlinedIcon />}
            href={`/api/documents/download.php?id=${document.id_doc}`}
            sx={{
              alignSelf: "flex-start",
              textTransform: "none",
              color: "var(--primary-color)",
              fontWeight: 700,
            }}
          >
            {t("catalog.download")}
          </Button>

          {/* VISUALIZAR DOCUMENTO */}

          <Button
            size="small"
            startIcon={<VisibilityOutlinedIcon />}
            href={`/api/documents/view.php?id=${document.id_doc}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              alignSelf: "flex-start",
              textTransform: "none",
              color: "var(--primary-color)",
              fontWeight: 700,
            }}
          >
            {t("catalog.view")}
          </Button>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

// ACORDEÓN DE ENCUESTA

function SurveyAccordion({ survey, onSelectSurvey }) {
  const { t } = useTranslation("public");

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        bgcolor: "transparent",
        borderTop: "1px solid rgba(0,0,0,0.07)",
        "&::before": {
          display: "none",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: { xs: 58, md: 68 },
          px: { xs: 2.5, md: 3 },
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            gap: 1.5,
            minWidth: 0,
          },
        }}
      >
        <AssignmentOutlinedIcon
          sx={{
            color: "text.secondary",
            flexShrink: 0,
          }}
        />

        <Typography
          sx={{
            color: "var(--primary-color)",
            fontWeight: 700,
            fontSize: { xs: 14, md: 16 },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {survey.titulo}
        </Typography>
      </AccordionSummary>

      <AccordionDetails
        sx={{
          px: { xs: 3, md: 4 },
          pt: 0,
          pb: 2,
        }}
      >
        <Stack spacing={1.5}>
          {survey.descripcion && (
            <Typography variant="body2" color="text.secondary">
              {survey.descripcion}
            </Typography>
          )}

          {isTrue(survey.anonima) && (
            <Typography variant="caption" color="text.secondary">
              {t("catalog.anonymous")}
            </Typography>
          )}

          <Button
            size="small"
            startIcon={<AssignmentOutlinedIcon />}
            onClick={() => onSelectSurvey(survey)}
            sx={{
              alignSelf: "flex-start",
              textTransform: "none",
              color: "var(--primary-color)",
              fontWeight: 700,
            }}
          >
            {t("catalog.answerSurvey")}
          </Button>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
