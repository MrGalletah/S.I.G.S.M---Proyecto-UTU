import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

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

// FILTROS INICIALES

const initialFilters = {
  search: "",
  desde: "",
  hasta: "",
  idVehiculo: "",
  idConductor: "",
  idEnfermero: "",
  estado: "todos",
};

export default function TransferHistory() {
  const { t } = useTranslation("transfers");

  // HISTORIAL

  const [transfers, setTransfers] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  // CAMPOS DEL FORMULARIO

  const [searchInput, setSearchInput] = useState("");
  const [desdeInput, setDesdeInput] = useState("");
  const [hastaInput, setHastaInput] = useState("");

  const [vehicleInput, setVehicleInput] = useState("");
  const [driverInput, setDriverInput] = useState("");
  const [nurseInput, setNurseInput] = useState("");

  const [statusInput, setStatusInput] = useState("todos");

  // FILTROS APLICADOS

  const [filters, setFilters] = useState({
    ...initialFilters,
  });

  // CATÁLOGOS

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

  // REFERENCIAS ESTABLES

  const notificationRef = useRef(showNotification);
  const translationRef = useRef(t);

  useEffect(() => {
    notificationRef.current = showNotification;
    translationRef.current = t;
  }, [showNotification, t]);

  // COMPROBAR SI HAY FILTROS APLICADOS

  const hasAppliedFilters = Object.entries(filters).some(([key, value]) =>
    key === "estado" ? value !== "todos" : value !== "",
  );

  // ACTUALIZAR ESTADO DE RESULTADOS

  const applyHistoryResult = (data) => {
    setTransfers(data.transfers);
    setTotal(data.pagination.total);
    setTotalPages(data.pagination.totalPages);
  };

  // ACTUALIZAR CATÁLOGOS

  const applyCatalogs = (data) => {
    setResources({
      vehiculos: data.vehiculos_historial ?? [],
      conductores: data.conductores_historial ?? [],
      enfermeros: data.enfermeros_historial ?? [],
    });
  };

  // CARGA INICIAL DE CATÁLOGOS

  useEffect(() => {
    let cancelled = false;

    getTransferCatalogs()
      .then((data) => {
        if (cancelled) return;
        applyCatalogs(data);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error(error);

        notificationRef.current(
          error.message || translationRef.current("history.errors.catalogs"),
          "error",
        );
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

  // CARGAR HISTORIAL AL CAMBIAR PÁGINA O FILTROS

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      setLoading(true);

      try {
        const data = await getCompletedTransfers({
          page,
          limit: rowsPerPage,
          ...filters,
        });

        if (cancelled) return;

        applyHistoryResult(data);
      } catch (error) {
        if (cancelled) return;

        console.error(error);

        notificationRef.current(
          error.message || translationRef.current("history.errors.load"),
          "error",
        );
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

  // REFRESH MANUAL
  // ACTUALIZA TABLA Y CATÁLOGOS

  const handleRefreshFetch = async () => {
    const [historyData, catalogData] = await Promise.all([
      getCompletedTransfers({
        page,
        limit: rowsPerPage,
        ...filters,
      }),

      getTransferCatalogs(),
    ]);

    return {
      historyData,
      catalogData,
    };
  };

  const handleRefreshSetData = ({ historyData, catalogData }) => {
    applyHistoryResult(historyData);
    applyCatalogs(catalogData);
  };

  // SCROLL AL DETALLE

  useEffect(() => {
    if (!selectedDetail) return;

    detailsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [selectedDetail]);

  // CAMBIAR PÁGINA

  const handlePageChange = (value) => {
    if (value === page) return;

    setLoading(true);
    setPage(value);
  };

  // CAMBIAR BUSCADOR

  const handleSearchInputChange = (value) => {
    setSearchInput(value);

    // SI SE BORRA EL TEXTO, LIMPIAR
    // AUTOMÁTICAMENTE LA BÚSQUEDA APLICADA

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
      showNotification(t("history.errors.dateRange"), "error");

      return;
    }

    setLoading(true);
    setPage(1);

    setSelectedDetail(null);
    setDetailError("");

    setFilters({
      search: searchInput.trim(),
      desde: desdeInput,
      hasta: hastaInput,
      idVehiculo: vehicleInput,
      idConductor: driverInput,
      idEnfermero: nurseInput,
      estado: statusInput,
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

    setStatusInput("todos");

    setLoading(true);
    setPage(1);

    setSelectedDetail(null);
    setDetailError("");

    setFilters({
      ...initialFilters,
    });
  };

  // CONSULTAR DETALLE

  const handleView = async (id) => {
    if (loadingDetail) return;

    try {
      setLoadingDetail(true);
      setDetailError("");

      const detail = await getTransferDetail(id);

      setSelectedDetail(detail);
    } catch (error) {
      console.error(error);

      setDetailError(error.message || t("history.errors.detail"));
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: 4,
          p: { xs: 2, md: 3 },
          boxShadow: "var(--card-shadow)",
          mt: 2,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {/* FILTROS */}

        <HistoryFilters
          search={searchInput}
          desde={desdeInput}
          hasta={hastaInput}
          idVehiculo={vehicleInput}
          idConductor={driverInput}
          idEnfermero={nurseInput}
          estado={statusInput}
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
          onEstadoChange={setStatusInput}
          onSearch={handleSearch}
          onClear={handleClear}
          refreshFetchData={handleRefreshFetch}
          refreshSetData={handleRefreshSetData}
          onRefreshSuccess={() =>
            showNotification(t("common:refresh.success"), "success")
          }
          onRefreshError={(error) =>
            showNotification(
              error.message || t("common:refresh.error"),
              "error",
            )
          }
        />

        {/* TABLA */}

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

      {/* DETALLE SELECCIONADO */}

      {(selectedDetail || loadingDetail || detailError) && (
        <Box
          ref={detailsRef}
          sx={{
            pb: 3,
            scrollMarginBottom: "24px",
          }}
        >
          {detailError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {detailError}
            </Alert>
          )}

          {selectedDetail && (
            <Box sx={{ position: "relative" }}>
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
