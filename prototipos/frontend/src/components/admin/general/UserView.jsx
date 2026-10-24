import { useEffect, useMemo, useState } from "react";

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

import { getUserDocuments } from "../../../apiCalls/documents/documentsApi";
import { getPublicSurveys } from "../../../apiCalls/surveys/surveysApi";

import PublicSurveyForm from "./PublicSurveyForm";

const isTrue = (value) => value === true || Number(value) === 1;

// PUBLIC VIEW

export default function UserView() {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [surveys, setSurveys] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSurvey, setSelectedSurvey] = useState(null);

  // LOAD PUBLIC DOCUMENTS AND SURVEYS

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
          errors.push("No se pudieron cargar los documentos.");
        }

        if (surveysResult.status === "fulfilled") {
          setSurveys(surveysResult.value.encuestas ?? []);
        } else {
          console.error(surveysResult.reason);
          errors.push("No se pudieron cargar las encuestas.");
        }

        setError(errors.join(" "));
        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  // GROUP DOCUMENTS AND SURVEYS BY CATEGORY

  const groupedCategories = useMemo(() => {
    const categoryMap = new Map();
    const uncategorizedSurveys = [];

    // DOCUMENT CATEGORIES

    for (const category of categories) {
      categoryMap.set(String(category.id_cat), {
        ...category,
        documentos: category.documentos ?? [],
        encuestas: [],
      });
    }

    // SURVEYS

    for (const survey of surveys) {
      if (!isTrue(survey.activo)) continue;

      const categoryId =
        survey.id_cat == null || survey.id_cat === ""
          ? null
          : String(survey.id_cat);

      // SURVEYS WITHOUT CATEGORY

      if (categoryId === null) {
        uncategorizedSurveys.push(survey);
        continue;
      }

      // CREATE CATEGORY IF IT ONLY HAS SURVEYS

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          id_cat: survey.id_cat,
          nombre: survey.categoria || "Categoría",
          descripcion: "",
          documentos: [],
          encuestas: [],
        });
      }

      categoryMap.get(categoryId).encuestas.push(survey);
    }

    // REMOVE EMPTY CATEGORIES

    const groups = Array.from(categoryMap.values()).filter(
      (category) =>
        category.documentos.length > 0 || category.encuestas.length > 0,
    );

    // GENERAL SURVEYS CATEGORY

    if (uncategorizedSurveys.length > 0) {
      groups.push({
        id_cat: "uncategorized-surveys",
        nombre: "Encuestas",
        descripcion: "Encuestas disponibles para responder.",
        documentos: [],
        encuestas: uncategorizedSurveys,
      });
    }

    return groups;
  }, [categories, surveys]);

  // SEARCH DOCUMENTS, SURVEYS AND CATEGORIES

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
        py: { xs: 0, md: 4 },
      }}
    >
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 0, sm: 2 } }}>
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
            // SURVEY FORM

            <PublicSurveyForm
              key={selectedSurvey.id_encuesta}
              survey={selectedSurvey}
              onBack={() => setSelectedSurvey(null)}
            />
          ) : (
            // DOCUMENTS AND SURVEYS LIST

            <>
              {/* PAGE HEADER */}

              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: 28, md: 38 },
                  }}
                >
                  Guías, Protocolos y Encuestas
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
                  Consultá los documentos del hospital y respondé las encuestas
                  disponibles para pacientes y usuarios.
                </Typography>
              </Box>

              {/* SEARCH */}

              <TextField
                fullWidth
                size="small"
                placeholder="Buscar documentos, categorías o encuestas"
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
                }}
              />

              {/* INFORMATION */}

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
                Abrí una categoría para consultar sus documentos y las encuestas
                disponibles.
              </Alert>

              {error && (
                <Alert
                  severity="warning"
                  sx={{ mb: 3, maxWidth: 760, mx: "auto" }}
                >
                  {error}
                </Alert>
              )}

              {/* LOADING */}

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
                  {/* CATEGORIES */}

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

                  {/* EMPTY STATE */}

                  {filteredCategories.length === 0 && (
                    <Typography
                      color="text.secondary"
                      textAlign="center"
                      fontWeight={600}
                      sx={{ mt: 4 }}
                    >
                      No se encontraron documentos ni encuestas.
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

// CATEGORY ACCORDION

function CategoryAccordion({ category, onSelectSurvey }) {
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

        <Stack
          direction="row"
          gap={0.75}
          flexWrap="wrap"
          justifyContent="flex-end"
        >
          {documentCount > 0 && (
            <Chip
              size="small"
              label={`${documentCount} ${
                documentCount === 1 ? "Documento" : "Documentos"
              }`}
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
              label={`${surveyCount} ${
                surveyCount === 1 ? "Encuesta" : "Encuestas"
              }`}
              variant="outlined"
              sx={{ fontWeight: 700, ml: 1 }}
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

        {/* DOCUMENTS FIRST */}

        <Stack>
          {category.documentos.map((document) => (
            <DocumentAccordion key={document.id_doc} document={document} />
          ))}
        </Stack>

        {/* SURVEYS BELOW DOCUMENTS */}

        {surveyCount > 0 && (
          <Box sx={{ mt: documentCount > 0 ? 2 : 1 }}>
            {documentCount > 0 && (
              <Divider textAlign="left" sx={{ mb: 1.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                >
                  Encuestas
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

// DOCUMENT ACCORDION

function DocumentAccordion({ document }) {
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
            Descargar documento
          </Button>

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
            Visualizar documento
          </Button>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

// SURVEY ACCORDION

function SurveyAccordion({ survey, onSelectSurvey }) {
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
              Encuesta anónima
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
            Responder encuesta
          </Button>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
