import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";

import SurveyQuestionsDialog from "../../modals/SurveyQuestionsDialog";
import SurveyDialog from "../../modals/SurveyDialog";

import {
  createSurvey,
  updateSurvey,
} from "../../../apiCalls/surveys/surveysApi";

import { useNotification } from "../../../hooks/useNotification";
import NotificationSnackbar from "../../utils/NotificationSnackbar";

import { useEffect, useState } from "react";

import { getAllSurveys } from "../../../apiCalls/surveys/surveysApi";

export default function SurveysCard({ variant }) {
  // CREACIÓN Y EDICIÓN

  const [openSurveyDialog, setOpenSurveyDialog] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [saving, setSaving] = useState(false);
  

  // NOTIFICACIONES

  const { notification, showNotification, closeNotification } =
    useNotification();

  // ESTADO

  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSurveyForQuestions, setSelectedSurveyForQuestions] =
    useState(null);

  const handleOpenQuestions = (survey) => {
    setSelectedSurveyForQuestions(survey);
  };

  const handleCloseQuestions = () => {
    setSelectedSurveyForQuestions(null);
  };

  // FILTROS Y PAGINACIÓN

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // CAMBIAR ESTE VALOR FUERZA UNA RECARGA

  const [reloadKey, setReloadKey] = useState(0);

  const isFull = variant === "full";
  const rowsPerPage = isFull ? 15 : 5;

  // CARGAR ENCUESTAS

  useEffect(() => {
    let cancelled = false;

    getAllSurveys()
      .then((data) => {
        if (cancelled) return;

        if (!data.ok || !Array.isArray(data.encuestas)) {
          throw new Error("Respuesta de encuestas no válida.");
        }

        setSurveys(data.encuestas);
      })
      .catch((err) => {
        if (cancelled) return;

        console.error(err);
        setSurveys([]);
        setError(err.message || "Error al cargar las encuestas.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // FILTRAR ENCUESTAS

  const filteredSurveys = surveys.filter((survey) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch = [
      survey.titulo,
      survey.descripcion,
      survey.categoria,
    ].some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(searchText),
    );

    const active = survey.activo === true || Number(survey.activo) === 1;

    const matchesStatus =
      statusFilter === "all" || (statusFilter === "active" ? active : !active);

    return matchesSearch && matchesStatus;
  });

  // PAGINACIÓN

  const totalPages = Math.ceil(filteredSurveys.length / rowsPerPage);

  const currentPage = Math.min(page, Math.max(totalPages, 1));

  const startIndex = (currentPage - 1) * rowsPerPage;

  const visibleSurveys = filteredSurveys.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  const handleCreateSurvey = () => {
    setSelectedSurvey(null);
    setOpenSurveyDialog(true);
  };

  const handleEditSurvey = (survey) => {
    setSelectedSurvey(survey);
    setOpenSurveyDialog(true);
  };

  const handleCloseSurveyDialog = () => {
    if (saving) return;

    setOpenSurveyDialog(false);
    setSelectedSurvey(null);
  };

  // GUARDAR ENCUESTA

  const handleSubmitSurvey = async (data) => {
    try {
      setSaving(true);

      if (selectedSurvey) {
        await updateSurvey(selectedSurvey.id_encuesta, data);

        showNotification("Encuesta actualizada correctamente.", "success");
      } else {
        await createSurvey(data);

        showNotification("Encuesta creada correctamente.", "success");
      }

      // CERRAR DIÁLOGO

      setOpenSurveyDialog(false);
      setSelectedSurvey(null);

      // RECARGAR LISTADO

      setLoading(true);
      setError(null);
      setReloadKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);

      showNotification(
        error.message || "No se pudo guardar la encuesta.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: 4,
          p: 3,
          boxShadow: "var(--card-shadow)",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {/* ENCABEZADO */}

        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Encuestas
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: "var(--text-muted-color)" }}
            >
              Gestiona las encuestas de satisfacción
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={() => {
                setLoading(true);
                setError(null);
                setReloadKey((prev) => prev + 1);
              }}
              disabled={loading}
              aria-label="Recargar encuestas"
              title="Actualizar listado"
            >
              <RefreshIcon />
            </IconButton>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateSurvey}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                bgcolor: "var(--primary-color)",
                whiteSpace: "nowrap",
              }}
            >
              Crear encuesta
            </Button>
          </Stack>
        </Stack>

        {/* FILTROS */}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            mb: 2,
            gap: 2,
            alignItems: {
              xs: "stretch",
              sm: "center",
            },
          }}
        >
          <TextField
            size="small"
            placeholder="Buscar encuestas..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            sx={{
              width: {
                xs: "100%",
                sm: "260px",
              },
            }}
          />

          <TextField
            select
            size="small"
            label="Estado"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            sx={{
              width: {
                xs: "100%",
                sm: "160px",
              },
            }}
          >
            <MenuItem value="all">Todas</MenuItem>
            <MenuItem value="active">Activas</MenuItem>
            <MenuItem value="inactive">Inactivas</MenuItem>
          </TextField>
        </Stack>

        {/* ESTADO DE CARGA */}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : filteredSurveys.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 180,
            }}
          >
            <Typography color="text.secondary">
              {surveys.length === 0
                ? "Todavía no hay encuestas registradas."
                : "No se encontraron encuestas con esos filtros."}
            </Typography>
          </Box>
        ) : (
          /* TABLA */

          <TableContainer sx={{ overflowX: "auto" }}>
            <Table
              size="small"
              sx={{
                minWidth: isFull ? 800 : 650,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Encuesta</TableCell>

                  {isFull && (
                    <TableCell sx={{ fontWeight: 700 }}>Categoría</TableCell>
                  )}

                  <TableCell sx={{ fontWeight: 700 }}>Descripción</TableCell>

                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Respuestas
                  </TableCell>

                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Estado
                  </TableCell>

                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {visibleSurveys.map((survey) => {
                  const active =
                    survey.activo === true || Number(survey.activo) === 1;

                  return (
                    <TableRow key={survey.id_encuesta} hover>
                      {/* TÍTULO */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            maxWidth: 220,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={survey.titulo}
                        >
                          {survey.titulo}
                        </Typography>
                      </TableCell>

                      {/* CATEGORÍA */}

                      {isFull && (
                        <TableCell>{survey.categoria ?? "General"}</TableCell>
                      )}

                      {/* DESCRIPCIÓN */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 280,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {survey.descripcion || "Sin descripción"}
                        </Typography>
                      </TableCell>

                      {/* RESPUESTAS */}

                      <TableCell align="center">
                        {Number(survey.total_respuestas) || 0}
                      </TableCell>

                      {/* ESTADO */}

                      <TableCell align="center">
                        <Chip
                          label={active ? "Activa" : "Inactiva"}
                          size="small"
                          sx={{
                            bgcolor: active
                              ? "var(--primary-color)"
                              : "var(--inactive-chip)",

                            color: active
                              ? "var(--white-color)"
                              : "var(--text-main-color)",

                            fontWeight: 600,
                            minWidth: 78,
                          }}
                        />
                      </TableCell>

                      {/* ACCIONES */}
                      <TableCell align="center">
                        <Stack direction={"row"}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenQuestions(survey)}
                            aria-label={`Administrar preguntas de ${survey.titulo}`}
                            title="Administrar preguntas"
                          >
                            <QuizOutlinedIcon fontSize="small" />
                          </IconButton>

                          <IconButton
                            size="small"
                            onClick={() => handleEditSurvey(survey)}
                            aria-label={`Editar ${survey.titulo}`}
                            title="Edición disponible próximamente"
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* PAGINACIÓN */}

        {!loading && !error && totalPages > 1 && (
          <Stack
            direction="row"
            sx={{
              justifyContent: "center",
              mt: 2,
            }}
          >
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, value) => setPage(value)}
              size="small"
              shape="rounded"
            />
          </Stack>
        )}
      </Card>

      {openSurveyDialog && (
        <SurveyDialog
          key={selectedSurvey?.id_encuesta ?? "new"}
          open={openSurveyDialog}
          onClose={handleCloseSurveyDialog}
          survey={selectedSurvey}
          onSubmit={handleSubmitSurvey}
          loading={saving}
        />
      )}

      {selectedSurveyForQuestions && (
        <SurveyQuestionsDialog
          key={selectedSurveyForQuestions.id_encuesta}
          open
          onClose={handleCloseQuestions}
          survey={selectedSurveyForQuestions}
        />
      )}

      {/* NOTIFICACIONES */}

      <NotificationSnackbar
        notification={notification}
        onClose={closeNotification}
      />
    </>
  );
}
