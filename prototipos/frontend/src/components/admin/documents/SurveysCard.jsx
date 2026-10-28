import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import BarChartIcon from "@mui/icons-material/BarChart";

import SurveyResultsDialog from "../../modals/SurveyResultsDialog";
import SurveyQuestionsDialog from "../../modals/SurveyQuestionsDialog";
import SurveyDialog from "../../modals/SurveyDialog";
import RefreshButton from "../../utils/RefreshButton";

import {
  getAllSurveys,
  createSurvey,
  updateSurvey,
} from "../../../apiCalls/surveys/surveysApi";

import { useNotification } from "../../../hooks/useNotification";
import NotificationSnackbar from "../../utils/NotificationSnackbar";

const isActive = (value) => value === true || Number(value) === 1;

export default function SurveysCard({ variant, onSurveysLoaded }) {
  const { t } = useTranslation("documents");

  // ENCUESTAS

  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // FILTROS Y PAGINACIÓN

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // CREACIÓN Y EDICIÓN

  const [openSurveyDialog, setOpenSurveyDialog] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [saving, setSaving] = useState(false);

  // PREGUNTAS Y RESULTADOS

  const [selectedSurveyForQuestions, setSelectedSurveyForQuestions] =
    useState(null);

  const [selectedSurveyForResults, setSelectedSurveyForResults] =
    useState(null);

  // NOTIFICACIONES

  const { notification, showNotification, closeNotification } =
    useNotification();

  const isFull = variant === "full";
  const rowsPerPage = isFull ? 15 : 5;

  // OBTENER ENCUESTAS

  const loadSurveys = async () => {
    const data = await getAllSurveys();

    if (!data?.ok || !Array.isArray(data.encuestas)) {
      throw new Error(t("surveys.invalidResponse"));
    }

    return data.encuestas;
  };

  // CARGAR ENCUESTAS INICIALMENTE
  // Y DESPUÉS DE CREAR O EDITAR

  useEffect(() => {
    let cancelled = false;

    getAllSurveys()
      .then((data) => {
        if (cancelled) return;

        if (!data?.ok || !Array.isArray(data.encuestas)) {
          throw new Error(t("surveys.invalidResponse"));
        }

        setSurveys(data.encuestas);
        setError(null);

        onSurveysLoaded?.(data.encuestas);
      })
      .catch((err) => {
        if (cancelled) return;

        console.error(err);

        setSurveys([]);
        setError(err.message || t("surveys.loadError"));
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey, onSurveysLoaded, t]);

  // FILTROS

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

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active"
        ? isActive(survey.activo)
        : !isActive(survey.activo));

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

  // CREAR / EDITAR

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

  // REFRESCAR DESPUÉS DE GUARDAR

  const refreshSurveys = () => {
    setLoading(true);
    setError(null);
    setReloadKey((prev) => prev + 1);
  };

  // CREAR O ACTUALIZAR ENCUESTA

  const handleSubmitSurvey = async (data) => {
    try {
      setSaving(true);

      if (selectedSurvey) {
        await updateSurvey(selectedSurvey.id_encuesta, data);

        showNotification(t("surveys.updateSuccess"), "success");
      } else {
        await createSurvey(data);

        showNotification(t("surveys.createSuccess"), "success");
      }

      setOpenSurveyDialog(false);
      setSelectedSurvey(null);

      refreshSurveys();
    } catch (err) {
      console.error(err);

      showNotification(err.message || t("surveys.saveError"), "error");
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
          direction={{ xs: "column", sm: "row" }}
          sx={{
            justifyContent: "space-between",
            alignItems: {
              xs: "stretch",
              sm: "flex-start",
            },
            mb: 2,
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t("surveys.title")}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "var(--text-muted-color)",
              }}
            >
              {t("surveys.description")}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateSurvey}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              bgcolor: "var(--primary-color)",
              whiteSpace: "nowrap",
              alignSelf: "flex-start",
            }}
          >
            {t("surveys.add")}
          </Button>
        </Stack>

        {/* BÚSQUEDA, FILTROS Y REFRESH */}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            width: "100%",
            mb: 2,
            gap: 1.5,
            alignItems: {
              xs: "stretch",
              sm: "center",
            },
          }}
        >
          {/* BUSCADOR */}

          <TextField
            size="small"
            placeholder={t("surveys.search")}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            sx={{
              minWidth: 0,
              width: {
                xs: "100%",
                sm: 260,
              },
            }}
          />

          {/* ESTADO Y REFRESH */}

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
              minWidth: 0,
            }}
          >
            <TextField
              select
              size="small"
              label={t("surveys.status")}
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              sx={{
                flex: 1,
                minWidth: 0,
                width: {
                  sm: 160,
                },
              }}
            >
              <MenuItem value="all">{t("surveys.all")}</MenuItem>

              <MenuItem value="active">{t("surveys.activePlural")}</MenuItem>

              <MenuItem value="inactive">
                {t("surveys.inactivePlural")}
              </MenuItem>
            </TextField>

            <RefreshButton
              fetchData={loadSurveys}
              setData={(data) => {
                setSurveys(data);
                setError(null);

                // Actualizar el contador del dashboard
                onSurveysLoaded?.(data);
              }}
              onSuccess={() => {
                showNotification(t("common:refresh.success"), "success");
              }}
              onError={(err) => {
                console.error(err);

                const message = err.message || t("common:refresh.error");

                setError(message);

                showNotification(message, "error");
              }}
            />
          </Stack>
        </Stack>

        {/* CONTENIDO */}

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
                ? t("surveys.empty")
                : t("surveys.noMatches")}
            </Typography>
          </Box>
        ) : (
          <TableContainer
            sx={{
              width: "100%",
              maxWidth: "100%",
              minWidth: 0,
              overflowX: "auto",
            }}
          >
            <Table
              size="small"
              sx={{
                minWidth: isFull ? 900 : 750,
              }}
            >
              <TableHead>
                <TableRow>
                  {/* TÍTULO */}

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      minWidth: 175,
                    }}
                  >
                    {t("surveys.survey")}
                  </TableCell>

                  {/* CATEGORÍA */}

                  {isFull && (
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        minWidth: 145,
                      }}
                    >
                      {t("surveys.category")}
                    </TableCell>
                  )}

                  {/* DESCRIPCIÓN */}

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      minWidth: 220,
                    }}
                  >
                    {t("surveys.details")}
                  </TableCell>

                  {/* RESPUESTAS */}

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      minWidth: 115,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("surveys.responses")}
                  </TableCell>

                  {/* ESTADO */}

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      minWidth: 115,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("surveys.status")}
                  </TableCell>

                  {/* ACCIONES */}

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      minWidth: 130,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("surveys.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {visibleSurveys.map((survey) => {
                  const active = isActive(survey.activo);

                  return (
                    <TableRow key={survey.id_encuesta} hover>
                      {/* TÍTULO */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          title={survey.titulo}
                          sx={{
                            fontWeight: 500,
                            maxWidth: 220,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {survey.titulo}
                        </Typography>
                      </TableCell>

                      {/* CATEGORÍA */}

                      {isFull && (
                        <TableCell>
                          {survey.categoria ?? t("surveys.general")}
                        </TableCell>
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
                          {survey.descripcion || t("surveys.noDescription")}
                        </Typography>
                      </TableCell>

                      {/* RESPUESTAS */}

                      <TableCell align="center">
                        {Number(survey.total_respuestas) || 0}
                      </TableCell>

                      {/* ESTADO */}

                      <TableCell align="center">
                        <Chip
                          label={
                            active ? t("surveys.active") : t("surveys.inactive")
                          }
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
                        <Stack
                          direction="row"
                          sx={{
                            justifyContent: "center",
                          }}
                        >
                          {/* GESTIONAR PREGUNTAS */}

                          <IconButton
                            size="small"
                            onClick={() =>
                              setSelectedSurveyForQuestions(survey)
                            }
                            aria-label={t("surveys.manageQuestions", {
                              name: survey.titulo,
                            })}
                            title={t("surveys.manageQuestions", {
                              name: survey.titulo,
                            })}
                          >
                            <QuizOutlinedIcon fontSize="small" />
                          </IconButton>

                          {/* EDITAR */}

                          <IconButton
                            size="small"
                            onClick={() => handleEditSurvey(survey)}
                            aria-label={t("surveys.edit", {
                              name: survey.titulo,
                            })}
                            title={t("surveys.edit", {
                              name: survey.titulo,
                            })}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>

                          {/* VER RESULTADOS */}

                          <IconButton
                            size="small"
                            onClick={() => setSelectedSurveyForResults(survey)}
                            aria-label={t("surveys.viewResults", {
                              name: survey.titulo,
                            })}
                            title={t("surveys.viewResults", {
                              name: survey.titulo,
                            })}
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              "&:hover": {
                                bgcolor: "action.selected",
                              },
                            }}
                          >
                            <BarChartIcon fontSize="small" />
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
              onChange={(_, value) => setPage(value)}
              size="small"
              shape="rounded"
            />
          </Stack>
        )}
      </Card>

      {/* DIÁLOGOS */}

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
          onClose={() => setSelectedSurveyForQuestions(null)}
          survey={selectedSurveyForQuestions}
        />
      )}

      {selectedSurveyForResults && (
        <SurveyResultsDialog
          key={selectedSurveyForResults.id_encuesta}
          open
          survey={selectedSurveyForResults}
          onClose={() => setSelectedSurveyForResults(null)}
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
