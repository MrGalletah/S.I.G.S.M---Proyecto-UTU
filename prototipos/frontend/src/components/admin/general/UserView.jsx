import { useMemo, useState, useEffect } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Container,
  InputAdornment,
  Snackbar,
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

import { getUserCategories } from "../../../apiCalls/categories/categoriesApi";

export default function UserView() {
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState(null);

  const [categories, setCategories] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState("");

  const filteredCategories = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) return categories;

    return categories.filter((category) =>
      category.nombre.toLowerCase().includes(text),
    );
  }, [search, categories]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // setLoading(true);
        // setError("");

        const data = await getUserCategories();
        console.log(data.categorias);

        setCategories(data.categorias);
      } catch (error) {
        // setError(error.message);
      } finally {
        // setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleView = (document) => {
    setAlert(`Visualizar documento: ${document.title}`);
  };

  const handleDownload = (document) => {
    setAlert(`Descargar documento: ${document.title}`);
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "var(--main-bg-color)",
        py: { xs: 0, md: 4 },
      }}
    >
      <Container
        maxWidth="xl"
        disableGutters
        sx={{
          px: { xs: 0, sm: 2 },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: {
              xs: "100%",
              md: 1180,
              lg: 1280,
            },
            mx: "auto",
            bgcolor: "var(--main-bg-color)",
            minHeight: "100dvh",
          }}
        >
          <Box
            sx={{
              px: { xs: 2.5, md: 4 },
              py: { xs: 2.5, md: 4 },
            }}
          >
            <Box sx={{ textAlign: "center", mb: 2.5 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: 28, md: 38 },
                  lineHeight: 1.1,
                }}
              >
                Guías y Protocolos
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: { xs: 14, md: 17 },
                  fontWeight: 600,
                  maxWidth: 760,
                  mx: "auto",
                  lineHeight: 1.45,
                }}
              >
                Consulta y accede a los protocolos y guías que el hospital pone
                a disposición de los pacientes.
              </Typography>
            </Box>

            <TextField
              fullWidth
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar documento o categoría"
              size="small"
              sx={{
                mb: 2.5,
                maxWidth: 760,
                display: "block",
                mx: "auto",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: "var(--white-color)",
                  fontWeight: 700,
                  fontSize: { xs: 14, md: 16 },
                  minHeight: { xs: 46, md: 54 },
                },
                "& input": {
                  py: { xs: 1.2, md: 1.5 },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={{
                          color: "text.secondary",
                          fontSize: { xs: 22, md: 26 },
                        }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Alert
              icon={
                <InfoOutlinedIcon
                  sx={{
                    fontSize: { xs: 22, md: 26 },
                  }}
                />
              }
              severity="info"
              sx={{
                mb: 3,
                borderRadius: 2.5,
                bgcolor: "#DFF8F5",
                color: "var(--primary-color)",
                border: "1px solid rgba(15, 124, 113, 0.16)",
                maxWidth: 760,
                mx: "auto",
                fontSize: { xs: 13, md: 15 },
                fontWeight: 500,
                alignItems: "center",
                justifyContent: "center",
                py: { xs: 1.2, md: 1.6 },
              }}
            >
              Toca un documento para visualizarlo o descargarlo.
            </Alert>

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
                  onView={handleView}
                  onDownload={handleDownload}
                />
              ))}
            </Box>

            {filteredCategories.length === 0 && (
              <Typography
                sx={{
                  mt: 4,
                  textAlign: "center",
                  color: "text.secondary",
                  fontSize: { xs: 15, md: 17 },
                  fontWeight: 700,
                }}
              >
                No se encontraron documentos.
              </Typography>
            )}
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={Boolean(alert)}
        autoHideDuration={2500}
        onClose={() => setAlert(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert severity="info" variant="filled" onClose={() => setAlert(null)}>
          {alert}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function CategoryAccordion({ category, onView, onDownload }) {
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
        expandIcon={
          <ExpandMoreIcon
            sx={{
              color: "text.secondary",
              fontSize: { xs: 28, md: 32 },
            }}
          />
        }
        sx={{
          minHeight: { xs: 78, md: 92 },
          px: { xs: 2.5, md: 3 },
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            my: 0,
            minWidth: 0,
          },
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: 17, md: 21 },
            fontWeight: 900,
            lineHeight: 1.2,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {category.nombre}
        </Typography>

        <Chip
          label={`${category.documentos} ${
            Number(category.documentos) === 1 ? "Documento" : "Documentos"
          }`}
          size="small"
          sx={{
            height: { xs: 26, md: 30 },
            px: 0.6,
            bgcolor: "#DDF8F5",
            color: "var(--primary-color)",
            fontWeight: 800,
            fontSize: { xs: 11, md: 13 },
            borderRadius: 999,
            flexShrink: 0,
          }}
        />
      </AccordionSummary>

      <AccordionDetails
        sx={{
          px: { xs: 2.5, md: 3 },
          pt: 0,
          pb: 1.2,
        }}
      >
        <Typography
          sx={{
            mb: 1.5,
            color: "text.secondary",
            fontSize: { xs: 13, md: 15 },
            lineHeight: 1.5,
          }}
        >
          {category.descripcion}
        </Typography>

        {/* <Stack>
          {category.documents.map((document) => (
            <DocumentAccordion
              key={document.id}
              document={document}
              onView={onView}
              onDownload={onDownload}
            />
          ))}
        </Stack> */}
      </AccordionDetails>
    </Accordion>
  );
}

function DocumentAccordion({ document, onView, onDownload }) {
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
        expandIcon={
          <ExpandMoreIcon
            sx={{
              color: "text.secondary",
              fontSize: { xs: 24, md: 28 },
            }}
          />
        }
        sx={{
          minHeight: { xs: 58, md: 68 },
          px: { xs: 2.5, md: 3 },
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            gap: 1.4,
            minWidth: 0,
            my: 0,
          },
        }}
      >
        <DescriptionOutlinedIcon
          sx={{
            fontSize: { xs: 24, md: 28 },
            color: "text.secondary",
            flexShrink: 0,
          }}
        />

        <Typography
          sx={{
            fontSize: { xs: 14, md: 16 },
            color: "var(--primary-color)",
            fontWeight: 700,
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minWidth: 0,
          }}
        >
          {document.title}
        </Typography>
      </AccordionSummary>

      <AccordionDetails
        sx={{
          pt: 0,
          px: { xs: 3, md: 4 },
          pb: { xs: 1.5, md: 2 },
        }}
      >
        <Stack spacing={0.8}>
          <Button
            size="small"
            startIcon={<DownloadOutlinedIcon />}
            onClick={() => onDownload(document)}
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              fontSize: { xs: 13, md: 15 },
              fontWeight: 800,
              color: "var(--primary-color)",
              px: 0,
            }}
          >
            [ Descargar documento ]
          </Button>

          <Button
            size="small"
            startIcon={<VisibilityOutlinedIcon />}
            onClick={() => onView(document)}
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              fontSize: { xs: 13, md: 15 },
              fontWeight: 800,
              color: "var(--primary-color)",
              px: 0,
            }}
          >
            [ Visualizar documento ]
          </Button>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
