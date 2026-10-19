import { useCallback, useEffect, useMemo, useState } from "react";

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

const STATUS_CONFIG = {
  OPERATIVO: {
    label: "Operativo",
    background: "var(--state-completed-bg)",
    color: "var(--state-completed-text)",
  },
  MANTENIMIENTO: {
    label: "En mantenimiento",
    background: "var(--state-returning-bg)",
    color: "var(--state-returning-text)",
  },
  FUERA_DE_SERVICIO: {
    label: "Fuera de servicio",
    background: "var(--priority-urgent-bg)",
    color: "var(--priority-urgent-text)",
  },
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [types, setTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("TODOS");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const { notification, showNotification, closeNotification } =
    useNotification();

  // CARGAR DATOS

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
      setError(err.message || "No se pudo cargar la flota.");
    } finally {
      setLoading(false);
    }
  }, []);

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

        setError(err.message || "No se pudo cargar la flota.");
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
  }, []);

  // ESTADÍSTICAS

  const stats = useMemo(() => {
    return [
      {
        label: "Total vehículos",
        value: vehicles.length,
        icon: <DirectionsCarOutlinedIcon />,
        colors: {
          background: "var(--primary-color-shadow)",
          text: "var(--primary-color)",
        },
      },
      {
        label: "Operativos",
        value: vehicles.filter((vehicle) => vehicle.estado === "OPERATIVO")
          .length,
        icon: <CheckCircleIcon />,
        colors: {
          background: "var(--state-completed-bg)",
          text: "var(--state-completed-text)",
        },
      },
      {
        label: "En mantenimiento",
        value: vehicles.filter((vehicle) => vehicle.estado === "MANTENIMIENTO")
          .length,
        icon: <BuildOutlinedIcon />,
        colors: {
          background: "var(--state-returning-bg)",
          text: "var(--state-returning-text)",
        },
      },
      {
        label: "Fuera de servicio",
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
  }, [vehicles]);

  // FILTROS

  const filteredVehicles = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesStatus = status === "TODOS" || vehicle.estado === status;

      const matchesSearch =
        !searchText ||
        [vehicle.matricula, vehicle.modelo, vehicle.tipo?.nombre].some(
          (value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(searchText),
        );

      return matchesStatus && matchesSearch;
    });
  }, [vehicles, search, status]);

  // PAGINACIÓN

  const totalPages = Math.max(
    1,
    Math.ceil(filteredVehicles.length / PAGE_SIZE),
  );

  const visibleVehicles = filteredVehicles.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  // MODAL

  const handleCreate = () => {
    setSelectedVehicle(null);
    setDialogOpen(true);
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedVehicle(null);
  };

  // GUARDAR

  const handleSubmit = async (data) => {
    setSaving(true);

    try {
      const response = await saveVehicle(
        data,
        selectedVehicle?.id_vehiculo ?? null,
      );

      handleClose();

      showNotification(
        response.mensaje || "Vehículo guardado correctamente.",
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
            direction={{
              xs: "column",
              sm: "row",
            }}
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
                Vehículos
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "var(--text-muted-color)",
                }}
              >
                Gestiona los vehículos de la flota
              </Typography>
            </Box>

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
              Registrar vehículo
            </Button>
          </Stack>

          {/* FILTROS */}

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
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
              direction={{
                xs: "column",
                sm: "row",
              }}
              sx={{
                gap: 2,
                alignItems: {
                  xs: "stretch",
                  sm: "center",
                },
              }}
            >
              <TextField
                size="small"
                placeholder="Buscar vehículo"
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

              <TextField
                select
                size="small"
                label="Estado"
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
                <MenuItem value="TODOS">Todos</MenuItem>

                {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                  <MenuItem key={value} value={value}>
                    {config.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

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
                {filteredVehicles.length} vehículos encontrados
              </Typography>

              <Tooltip title="Actualizar lista">
                <span>
                  <IconButton
                    onClick={fetchData}
                    disabled={loading}
                    size="small"
                    aria-label="Actualizar vehículos"
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

          {/* ERROR */}

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" onClick={fetchData}>
                  Reintentar
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
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        width: "18%",
                      }}
                    >
                      Matrícula
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 700,
                        width: "32%",
                      }}
                    >
                      Modelo
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 700,
                        width: "20%",
                      }}
                    >
                      Tipo
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        width: "20%",
                      }}
                    >
                      Estado
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        width: "10%",
                      }}
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {visibleVehicles.map((vehicle) => {
                    const state = STATUS_CONFIG[vehicle.estado];

                    return (
                      <TableRow key={vehicle.id_vehiculo} hover>
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

                        <TableCell>
                          <Typography variant="body2">
                            {vehicle.tipo?.nombre ?? "—"}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            label={state?.label ?? vehicle.estado}
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

                        <TableCell align="center">
                          <Tooltip title="Editar vehículo">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(vehicle)}
                              aria-label={`Editar ${vehicle.matricula}`}
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
                        No se encontraron vehículos.
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
                page={Math.min(page, totalPages)}
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
