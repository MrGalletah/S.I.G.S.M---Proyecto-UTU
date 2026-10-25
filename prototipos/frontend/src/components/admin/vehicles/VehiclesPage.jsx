import { useCallback, useEffect, useMemo, useState } from "react";
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
  Tooltip,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";

import StatCard from "../../utils/StatCard";
import NotificationSnackbar from "../../utils/NotificationSnackbar";
import { useNotification } from "../../../hooks/useNotification";
import VehicleDialog from "../../modals/VehicleDialog";

import {
  getVehicles,
  getVehicleTypes,
  saveVehicle,
} from "../../../apiCalls/vehicles/vehiclesApi";

const PAGE_SIZE = 10;

// COLORES DE LOS ESTADOS

const STATUS_CONFIG = {
  OPERATIVO: {
    background: "var(--state-completed-bg)",
    color: "var(--state-completed-text)",
  },
  MANTENIMIENTO: {
    background: "var(--state-returning-bg)",
    color: "var(--state-returning-text)",
  },
  FUERA_DE_SERVICIO: {
    background: "var(--priority-urgent-bg)",
    color: "var(--priority-urgent-text)",
  },
};

export default function VehiclesPage() {
  const { t } = useTranslation("vehicles");

  // VEHÍCULOS Y TIPOS

  const [vehicles, setVehicles] = useState([]);
  const [types, setTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // FILTROS Y PAGINACIÓN

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("TODOS");
  const [page, setPage] = useState(1);

  // DIÁLOGO

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // NOTIFICACIONES

  const { notification, showNotification, closeNotification } =
    useNotification();

  // TRADUCIR LOS TIPOS DE VEHÍCULO DE MARIA DB

  const translateType = (name) => {
    if (!name) return "—";

    return t(`types.${name}`, {
      defaultValue: name,
    });
  };

  // TRADUCIR ESTADOS SIN CAMBIAR SUS CÓDIGOS

  const translateStatus = (value) =>
    t(`statuses.${value}`, {
      defaultValue: value ?? "—",
    });

  // RECARGA MANUAL

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [vehicleData, vehicleTypes] = await Promise.all([
        getVehicles(),
        getVehicleTypes(),
      ]);

      setVehicles(vehicleData);
      setTypes(vehicleTypes);
    } catch (err) {
      console.error(err);

      setError(err.message || t("notifications.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // CARGA INICIAL

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const [vehicleData, vehicleTypes] = await Promise.all([
          getVehicles(),
          getVehicleTypes(),
        ]);

        if (cancelled) return;

        setVehicles(vehicleData);
        setTypes(vehicleTypes);
      } catch (err) {
        if (cancelled) return;

        console.error(err);

        setError(err.message || t("notifications.loadError"));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
    // La carga inicial solo ocurre al montar.
    // Cambiar el idioma no debe repetir consultas a la API.
  }, []);

  // CARDS DE ESTADÍSTICAS

  const stats = useMemo(() => {
    return [
      {
        label: t("stats.total"),
        value: vehicles.length,
        icon: <DirectionsCarOutlinedIcon />,
        colors: {
          background: "var(--primary-color-shadow)",
          text: "var(--primary-color)",
        },
      },
      {
        label: t("stats.operational"),
        value: vehicles.filter((vehicle) => vehicle.estado === "OPERATIVO")
          .length,
        icon: <CheckCircleIcon />,
        colors: {
          background: "var(--state-completed-bg)",
          text: "var(--state-completed-text)",
        },
      },
      {
        label: t("stats.maintenance"),
        value: vehicles.filter((vehicle) => vehicle.estado === "MANTENIMIENTO")
          .length,
        icon: <BuildOutlinedIcon />,
        colors: {
          background: "var(--state-returning-bg)",
          text: "var(--state-returning-text)",
        },
      },
      {
        label: t("stats.outOfService"),
        value: vehicles.filter(
          (vehicle) => vehicle.estado === "FUERA_DE_SERVICIO",
        ).length,
        icon: <BlockOutlinedIcon />,
        colors: {
          background: "var(--priority-urgent-bg)",
          text: "var(--priority-urgent-text)",
        },
      },
    ];
  }, [vehicles, t]);

  // FILTRAR VEHÍCULOS

  const filteredVehicles = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesStatus = status === "TODOS" || vehicle.estado === status;

      const matchesSearch =
        !searchText ||
        [
          vehicle.matricula,
          vehicle.modelo,
          vehicle.tipo?.nombre,
          vehicle.tipo?.nombre
            ? t(`types.${vehicle.tipo.nombre}`, {
                defaultValue: vehicle.tipo.nombre,
              })
            : "",
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(searchText),
        );

      return matchesStatus && matchesSearch;
    });
  }, [vehicles, search, status, t]);

  // PAGINACIÓN

  const totalPages = Math.max(
    1,
    Math.ceil(filteredVehicles.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const visibleVehicles = filteredVehicles.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // ABRIR MODAL DE CREACIÓN

  const handleCreate = () => {
    setSelectedVehicle(null);
    setDialogOpen(true);
  };

  // ABRIR MODAL DE EDICIÓN

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDialogOpen(true);
  };

  // CERRAR MODAL

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedVehicle(null);
  };

  // GUARDAR VEHÍCULO

  const handleSubmit = async (data) => {
    setSaving(true);

    try {
      const editing = Boolean(selectedVehicle);

      await saveVehicle(data, selectedVehicle?.id_vehiculo ?? null);

      handleClose();

      // Mostramos el mensaje traducido, no el del backend.

      showNotification(
        editing ? t("notifications.updated") : t("notifications.created"),
        "success",
      );

      await fetchData();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* CARDS DE ESTADÍSTICAS */}

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {stats.map((item) => (
            <StatCard key={item.label} item={item} colors={item.colors} />
          ))}
        </Box>

        {/* CARD PRINCIPAL */}

        <Card
          sx={{
            borderRadius: 4,
            p: { xs: 2, sm: 3 },
            boxShadow: "var(--card-shadow)",
            minWidth: 0,
            overflow: "hidden",
            minHeight: 500,
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
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "var(--text-main-color)",
                }}
              >
                {t("title")}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "var(--text-muted-color)",
                }}
              >
                {t("description")}
              </Typography>
            </Box>

            {/* REGISTRAR VEHÍCULO */}

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              disabled={loading || types.length === 0}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                bgcolor: "var(--primary-color)",
                fontWeight: 600,
                whiteSpace: "nowrap",
                alignSelf: {
                  xs: "flex-start",
                  sm: "auto",
                },
                "&:hover": {
                  bgcolor: "var(--primary-hover-color)",
                },
              }}
            >
              {t("add")}
            </Button>
          </Stack>

          {/* BÚSQUEDA Y FILTROS */}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{
              mb: 3,
              gap: 2,
              alignItems: {
                xs: "stretch",
                sm: "center",
              },
              justifyContent: "space-between",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              sx={{
                gap: 2,
                alignItems: {
                  xs: "stretch",
                  sm: "center",
                },
              }}
            >
              {/* BUSCAR VEHÍCULO */}

              <TextField
                size="small"
                placeholder={t("search")}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                sx={{
                  width: {
                    xs: "100%",
                    sm: 250,
                  },
                }}
              />

              {/* FILTRO DE ESTADO */}

              <TextField
                select
                size="small"
                label={t("status")}
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                sx={{
                  width: {
                    xs: "100%",
                    sm: 200,
                  },
                }}
              >
                <MenuItem value="TODOS">{t("all")}</MenuItem>

                {Object.keys(STATUS_CONFIG).map((value) => (
                  <MenuItem key={value} value={value}>
                    {translateStatus(value)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {/* RESULTADOS Y REFRESCAR */}

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent={{
                xs: "space-between",
                sm: "flex-end",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "var(--text-muted-color)",
                  whiteSpace: "nowrap",
                }}
              >
                {t("found", {
                  count: filteredVehicles.length,
                })}
              </Typography>

              <Tooltip title={t("refresh")}>
                <span>
                  <IconButton
                    onClick={fetchData}
                    disabled={loading}
                    size="small"
                    aria-label={t("refresh")}
                    sx={{
                      color: "var(--primary-color)",
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>

          {/* ERROR DE CARGA */}

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" onClick={fetchData}>
                  {t("retry")}
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {/* TABLA */}

          {loading ? (
            <Box
              sx={{
                minHeight: 250,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer
              sx={{
                width: "100%",
                overflowX: "auto",
              }}
            >
              <Table
                size="small"
                sx={{
                  minWidth: 650,
                  tableLayout: "fixed",
                }}
              >
                {/* CABECERA */}

                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        width: "18%",
                      }}
                    >
                      {t("table.license")}
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 700,
                        width: "32%",
                      }}
                    >
                      {t("table.model")}
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 700,
                        width: "20%",
                      }}
                    >
                      {t("table.type")}
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        width: "20%",
                      }}
                    >
                      {t("table.status")}
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        width: "10%",
                      }}
                    >
                      {t("table.actions")}
                    </TableCell>
                  </TableRow>
                </TableHead>

                {/* CUERPO */}

                <TableBody>
                  {visibleVehicles.map((vehicle) => {
                    const state = STATUS_CONFIG[vehicle.estado];

                    return (
                      <TableRow key={vehicle.id_vehiculo} hover>
                        {/* MATRÍCULA */}

                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {vehicle.matricula}
                          </Typography>
                        </TableCell>

                        {/* MODELO */}

                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {vehicle.modelo}
                          </Typography>
                        </TableCell>

                        {/* TIPO */}

                        <TableCell>
                          <Typography variant="body2">
                            {translateType(vehicle.tipo?.nombre)}
                          </Typography>
                        </TableCell>

                        {/* ESTADO */}

                        <TableCell align="center">
                          <Chip
                            label={translateStatus(vehicle.estado)}
                            size="small"
                            sx={{
                              bgcolor:
                                state?.background ?? "var(--inactive-chip)",
                              color: state?.color ?? "var(--text-main-color)",
                              fontWeight: 700,
                              borderRadius: 1.5,
                              minWidth: 95,
                            }}
                          />
                        </TableCell>

                        {/* EDITAR */}

                        <TableCell align="center">
                          <Tooltip title={t("edit")}>
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(vehicle)}
                              aria-label={t("editLicense", {
                                license: vehicle.matricula,
                              })}
                              sx={{
                                color: "var(--text-muted-color)",
                              }}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {/* TABLA VACÍA */}

                  {visibleVehicles.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        align="center"
                        sx={{
                          py: 7,
                          color: "var(--text-muted-color)",
                        }}
                      >
                        {t("empty")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* PAGINACIÓN */}

          {!loading && totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 3 }}>
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
      </Box>

      {/* MODAL */}

      {dialogOpen && (
        <VehicleDialog
          key={selectedVehicle?.id_vehiculo ?? "new"}
          open={dialogOpen}
          vehicle={selectedVehicle}
          types={types}
          saving={saving}
          onClose={handleClose}
          onSubmit={handleSubmit}
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
