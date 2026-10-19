import { useEffect, useRef, useState } from "react";

import { Alert, Box, Card, CircularProgress, Stack } from "@mui/material";

import HistoryFilters from "./HistoryFilters";
import CompletedTransfersTable from "./CompletedTransfersTable";

import TransferDetailsCard from "../../../utils/TransferDetailsCard";
import NotificationSnackbar from "../../../utils/NotificationSnackbar";

import {
  getCompletedTransfers,
  getTransferCatalogs,
  getTransferDetail,
} from "../../../../apiCalls/transfers/transfersApi";

import { useNotification } from "../../../../hooks/useNotification";

const rowsPerPage = 10;

const initialFilters = {
  search: "",
  desde: "",
  hasta: "",
  idVehiculo: "",
  idConductor: "",
  idEnfermero: "",
};

export default function TransferHistory() {
  // HISTORIAL

  const [transfers, setTransfers] = useState([]);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(0);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  // CAMPOS DE FILTRO

  const [searchInput, setSearchInput] = useState("");

  const [desdeInput, setDesdeInput] = useState("");

  const [hastaInput, setHastaInput] = useState("");

  const [vehicleInput, setVehicleInput] = useState("");

  const [driverInput, setDriverInput] = useState("");

  const [nurseInput, setNurseInput] = useState("");

  // FILTROS APLICADOS

  const [filters, setFilters] = useState({
    ...initialFilters,
  });

  // CATÁLOGOS PARA FILTROS

  const [resources, setResources] = useState({
    vehiculos: [],
    conductores: [],
    enfermeros: [],
  });

  const [loadingResources, setLoadingResources] = useState(true);

  // DETALLE

  const [selectedDetail, setSelectedDetail] = useState(null);

  const [loadingDetail, setLoadingDetail] = useState(false);

  const [detailError, setDetailError] = useState("");

  const detailsRef = useRef(null);

  // NOTIFICACIONES

  const { notification, showNotification, closeNotification } =
    useNotification();

  // COMPROBAR SI HAY FILTROS APLICADOS

  const hasAppliedFilters = Object.values(filters).some(
    (value) => value !== "",
  );

  // CARGAR CATÁLOGOS

  useEffect(() => {
    let cancelled = false;

    getTransferCatalogs()
      .then((data) => {
        if (cancelled) {
          return;
        }

        setResources({
          vehiculos: data.vehiculos_historial ?? [],

          conductores: data.conductores_historial ?? [],

          enfermeros: data.enfermeros_historial ?? [],
        });
      })
      .catch((error) => {
        if (!cancelled) {
          showNotification(error.message, "error");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingResources(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // CARGAR HISTORIAL

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      try {
        const data = await getCompletedTransfers({
          page,
          limit: rowsPerPage,
          ...filters,
        });

        if (cancelled) {
          return;
        }

        setTransfers(data.transfers);

        setTotal(data.pagination.total);

        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        if (!cancelled) {
          showNotification(error.message, "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [page, filters]);

  // SCROLL AL DETALLE CUANDO CAMBIA

  useEffect(() => {
    if (!selectedDetail) {
      return;
    }

    detailsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [selectedDetail]);

  // CAMBIAR PÁGINA

  const handlePageChange = (value) => {
    if (value === page) {
      return;
    }

    setLoading(true);

    setPage(value);
  };

  // CAMBIAR TEXTO DE BÚSQUEDA

  const handleSearchInputChange = (value) => {
    setSearchInput(value);

    // Si había una búsqueda aplicada y el usuario
    // vacía completamente el campo, eliminamos
    // automáticamente únicamente ese filtro.

    if (value === "" && filters.search !== "") {
      setLoading(true);

      setPage(1);

      setFilters((prev) => ({
        ...prev,
        search: "",
      }));
    }
  };

  // APLICAR FILTROS

  const handleSearch = () => {
    if (desdeInput && hastaInput && desdeInput > hastaInput) {
      showNotification(
        "La fecha desde no puede ser posterior a la fecha hasta.",
        "error",
      );

      return;
    }

    setLoading(true);

    setPage(1);

    setFilters({
      search: searchInput.trim(),

      desde: desdeInput,

      hasta: hastaInput,

      idVehiculo: vehicleInput,

      idConductor: driverInput,

      idEnfermero: nurseInput,
    });
  };

  // LIMPIAR FILTROS

  const handleClear = () => {
    setSearchInput("");

    setDesdeInput("");

    setHastaInput("");

    setVehicleInput("");

    setDriverInput("");

    setNurseInput("");

    setLoading(true);

    setPage(1);

    setFilters({
      ...initialFilters,
    });
  };

  // VER DETALLE

  const handleView = async (id) => {
    if (loadingDetail) {
      return;
    }

    try {
      setLoadingDetail(true);

      setDetailError("");

      const detail = await getTransferDetail(id);

      setSelectedDetail(detail);
    } catch (error) {
      setDetailError(error.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: 4,

          p: {
            xs: 2,
            md: 3,
          },

          boxShadow: "var(--card-shadow)",

          mt: 2,

          minWidth: 0,

          overflow: "hidden",
        }}
      >
        <HistoryFilters
          search={searchInput}
          desde={desdeInput}
          hasta={hastaInput}
          idVehiculo={vehicleInput}
          idConductor={driverInput}
          idEnfermero={nurseInput}
          vehicles={resources.vehiculos}
          drivers={resources.conductores}
          nurses={resources.enfermeros}
          loadingResources={loadingResources}
          total={total}
          hasAppliedFilters={hasAppliedFilters}
          onSearchChange={handleSearchInputChange}
          onDesdeChange={setDesdeInput}
          onHastaChange={setHastaInput}
          onVehicleChange={setVehicleInput}
          onDriverChange={setDriverInput}
          onNurseChange={setNurseInput}
          onSearch={handleSearch}
          onClear={handleClear}
        />

        {/* TABLA SIEMPRE MONTADA */}

        <Box
          sx={{
            position: "relative",
            minHeight: 260,
          }}
        >
          <CompletedTransfersTable
            transfers={transfers}
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onView={handleView}
          />

          {/* CAPA DE CARGA */}

          {loading && (
            <Box
              sx={{
                position: "absolute",

                inset: 0,

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                bgcolor: "rgba(255,255,255,0.65)",

                borderRadius: 2,

                zIndex: 2,
              }}
            >
              <CircularProgress size={30} />
            </Box>
          )}
        </Box>
      </Card>

      {/* DETALLE DEL TRASLADO */}

      {(selectedDetail || loadingDetail || detailError) && (
        <Box
          ref={detailsRef}
          sx={{
            pb: 3,
            scrollMarginBottom: "24px",
          }}
        >
          {detailError && (
            <Alert
              severity="error"
              sx={{
                mt: 2,
              }}
            >
              {detailError}
            </Alert>
          )}

          {selectedDetail && (
            <Box
              sx={{
                position: "relative",
              }}
            >
              <TransferDetailsCard transfer={selectedDetail} />

              {loadingDetail && (
                <Box
                  sx={{
                    position: "absolute",

                    inset: 0,

                    mt: 2,

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center",

                    bgcolor: "rgba(255,255,255,0.65)",

                    borderRadius: 4,

                    zIndex: 2,
                  }}
                >
                  <CircularProgress size={30} />
                </Box>
              )}
            </Box>
          )}

          {!selectedDetail && loadingDetail && (
            <Stack
              sx={{
                py: 6,

                alignItems: "center",
              }}
            >
              <CircularProgress size={28} />
            </Stack>
          )}
        </Box>
      )}

      {/* NOTIFICACIONES */}

      <NotificationSnackbar
        notification={notification}
        onClose={closeNotification}
      />
    </>
  );
}
