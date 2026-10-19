import { useEffect, useMemo, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";

import TransferDetailsCard from "../../../utils/TransferDetailsCard";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import TransferEditDialog from "./TransferEditDialog";
import TransfersCard from "./TransfersCard";

import {
  deleteTransfer,
  getTransferDetail,
  getTransfers,
} from "../../../../apiCalls/transfers/transfersApi";

import {
  filterAndSortTransfers,
  initialFilters,
  initialSort,
} from "./TransferFiltersUtils";

import { useNotification } from "../../../../hooks/useNotification";
import NotificationSnackbar from "../../../utils/NotificationSnackbar";

const rowsPerPage = 8;

export default function FollowUp() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  // TRASLADO SELECCIONADO

  const [selectedTransferId, setSelectedTransferId] = useState(null);
  const [selectedTransferDetail, setSelectedTransferDetail] = useState(null);
  const [detailError, setDetailError] = useState(null);

  // GESTIÓN DEL TRASLADO

  const [editTransferId, setEditTransferId] = useState(null);
  const [editTransferDetail, setEditTransferDetail] = useState(null);

  // PAGINACIÓN

  const [page, setPage] = useState(1);

  // REFERENCIA A LA SECCIÓN DE DETALLES

  const detailsRef = useRef(null);

  // BÚSQUEDA, FILTROS Y ORDENACIÓN

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ ...initialFilters });
  const [sort, setSort] = useState({ ...initialSort });

  // CANCELAR TRASLADO

  const [transferToCancel, setTransferToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // NOTIFICACIONES

  const { notification, showNotification, closeNotification } =
    useNotification();

  const handleCloseCancel = () => {
    if (!cancelling) {
      setTransferToCancel(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!transferToCancel || cancelling) return;

    const { id, version } = transferToCancel;

    setCancelling(true);

    try {
      await deleteTransfer(id, version);

      setTransfers((prev) => prev.filter((transfer) => transfer.id !== id));

      if (selectedTransferId === id) {
        setSelectedTransferId(null);
      }

      showNotification("Traslado anulado correctamente.", "success");
    } catch (error) {
      showNotification(error.message, "error");

      try {
        const updatedTransfers = await getTransfers();
        setTransfers(updatedTransfers);
      } catch {
        showNotification(
          "No se pudo actualizar el listado de traslados.",
          "warning",
        );
      }
    } finally {
      setCancelling(false);
      setTransferToCancel(null);
    }
  };

  // CARGAR LISTADO INICIAL

  useEffect(() => {
    let cancelled = false;

    async function loadTransfers() {
      try {
        const data = await getTransfers();

        if (cancelled) return;

        setTransfers(data);
        setSelectedTransferId(data[0]?.id ?? null);
      } catch (error) {
        if (!cancelled) {
          showNotification(error.message, "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTransfers();

    return () => {
      cancelled = true;
    };
  }, []);

  // FILTRADO Y ORDENACIÓN

  const filteredTransfers = useMemo(
    () => filterAndSortTransfers(transfers, search, filters, sort),
    [transfers, search, filters, sort],
  );

  // PAGINACIÓN

  const totalPages = Math.ceil(filteredTransfers.length / rowsPerPage);

  const currentPage = Math.min(page, Math.max(1, totalPages));

  const startIndex = (currentPage - 1) * rowsPerPage;

  const visibleTransfers = filteredTransfers.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  // SELECCIÓN

  const selectedIsVisible = visibleTransfers.some(
    (transfer) => transfer.id === selectedTransferId,
  );

  const effectiveSelectedTransferId = selectedIsVisible
    ? selectedTransferId
    : (visibleTransfers[0]?.id ?? null);

  const currentDetailError =
    detailError?.id === effectiveSelectedTransferId
      ? detailError.message
      : null;

  const detailIsCurrent =
    selectedTransferDetail?.id === effectiveSelectedTransferId;

  // CARGAR DETALLE SELECCIONADO

  useEffect(() => {
    if (!effectiveSelectedTransferId) return;

    let cancelled = false;

    getTransferDetail(effectiveSelectedTransferId)
      .then((detail) => {
        if (!cancelled) {
          setSelectedTransferDetail(detail);
          setDetailError(null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setDetailError({
            id: effectiveSelectedTransferId,
            message: error.message,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveSelectedTransferId]);

  // CARGAR DETALLE PARA GESTIONAR

  useEffect(() => {
    if (!editTransferId) return;

    let cancelled = false;

    getTransferDetail(editTransferId)
      .then((detail) => {
        if (!cancelled) {
          setEditTransferDetail(detail);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          showNotification(error.message, "error");
          setEditTransferId(null);
          setEditTransferDetail(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editTransferId]);

  // ABRIR GESTIÓN

  const handleManageTransfer = (id) => {
    setEditTransferDetail(null);
    setEditTransferId(id);
  };

  // VISUALIZAR TRASLADO

  const handleViewTransfer = (id) => {
    setSelectedTransferId(id);

    detailsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  // BÚSQUEDA

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  // FILTROS

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    setPage(1);
  };

  // ORDENACIÓN

  const handleSortChange = (key) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));

    setPage(1);
  };

  const hasActiveFilters =
    Boolean(search.trim()) ||
    Object.values(filters).some((value) => value !== "") ||
    Boolean(sort.key);

  const handleClearFilters = () => {
    setSearch("");
    setFilters({ ...initialFilters });
    setSort({ ...initialSort });
    setPage(1);
  };

  // CERRAR GESTIÓN

  const handleCloseEditDialog = () => {
    setEditTransferId(null);
    setEditTransferDetail(null);
  };

  // REFRESCAR DESPUÉS DE MODIFICAR

  const refreshTransfer = async (idTransfer, successMessage) => {
    handleCloseEditDialog();

    try {
      const updatedTransfers = await getTransfers();

      setTransfers(updatedTransfers);

      const selectedStillActive = updatedTransfers.some(
        (transfer) => transfer.id === selectedTransferId,
      );

      if (!selectedStillActive) {
        const nextTransfer = updatedTransfers[0] ?? null;

        setSelectedTransferId(nextTransfer?.id ?? null);

        if (!nextTransfer) {
          setSelectedTransferDetail(null);
        }
      } else if (effectiveSelectedTransferId === idTransfer) {
        const detail = await getTransferDetail(idTransfer);

        setSelectedTransferDetail(detail);
        setDetailError(null);
      }

      showNotification(successMessage, "success");
    } catch {
      showNotification(
        "El cambio se guardó, pero no se pudo actualizar la vista.",
        "warning",
      );
    }
  };

  const handleTransferAssigned = async (idTransfer) => {
    await refreshTransfer(idTransfer, "Asignación guardada correctamente.");
  };

  const handleStateUpdated = async (idTransfer) => {
    await refreshTransfer(idTransfer, "Estado actualizado correctamente.");
  };

  return (
    <>
      {/* TABLA */}

      {loading ? (
        <Stack
          sx={{
            alignItems: "center",
            justifyContent: "center",
            py: 8,
          }}
        >
          <CircularProgress />
        </Stack>
      ) : (
        <TransfersCard
          visibleTransfers={visibleTransfers}
          totalTransfers={transfers.length}
          filteredCount={filteredTransfers.length}
          selectedTransferId={effectiveSelectedTransferId}
          setEditTransferId={handleManageTransfer}
          onViewTransfer={handleViewTransfer}
          page={currentPage}
          setPage={setPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          search={search}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          sort={sort}
          onSortChange={handleSortChange}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          onCancelTransfer={setTransferToCancel}
        />
      )}

      {/* SECCIÓN DE DETALLES */}

      {!loading && effectiveSelectedTransferId && (
        <Box
          ref={detailsRef}
          sx={{
            scrollMarginBottom: "24px",
            pb: 3,
          }}
        >
          {currentDetailError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {currentDetailError}
            </Alert>
          )}

          {selectedTransferDetail ? (
            <Box sx={{ position: "relative" }}>
              <TransferDetailsCard transfer={selectedTransferDetail} />

              {!detailIsCurrent && !currentDetailError && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    mt: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(255, 255, 255, 0.65)",
                    borderRadius: 4,
                    zIndex: 1,
                  }}
                >
                  <CircularProgress size={30} />
                </Box>
              )}
            </Box>
          ) : (
            !currentDetailError && (
              <Stack
                sx={{
                  minHeight: 350,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress size={28} />
              </Stack>
            )
          )}
        </Box>
      )}

      {/* UN ÚNICO DIÁLOGO DE GESTIÓN */}

      {editTransferId !== null && (
        <TransferEditDialog
          key={editTransferId}
          open={true}
          transfer={
            editTransferDetail?.id === editTransferId
              ? editTransferDetail
              : null
          }
          transferId={editTransferId}
          onClose={handleCloseEditDialog}
          onAssigned={handleTransferAssigned}
          onStateUpdated={handleStateUpdated}
        />
      )}

      {/* CONFIRMAR ANULACIÓN */}

      <Dialog
        open={Boolean(transferToCancel)}
        onClose={handleCloseCancel}
        disableEscapeKeyDown={cancelling}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Anular solicitud</DialogTitle>

        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que querés anular el traslado{" "}
            <Box
              component="span"
              sx={{
                fontWeight: 800,
                color: "var(--text-main-color)",
              }}
            >
              {transferToCancel?.codigo}
            </Box>
            ?
          </DialogContentText>

          <DialogContentText
            sx={{
              mt: 1,
              fontSize: 13,
            }}
          >
            La solicitud dejará de aparecer en el listado de traslados activos.
          </DialogContentText>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            gap: 1,
          }}
        >
          <Button
            onClick={handleCloseCancel}
            disabled={cancelling}
            sx={{
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Volver
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmCancel}
            disabled={cancelling}
            startIcon={
              cancelling ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DeleteOutlineOutlinedIcon />
              )
            }
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            {cancelling ? "Anulando..." : "Anular traslado"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* NOTIFICACIONES */}

      <NotificationSnackbar
        notification={notification}
        onClose={closeNotification}
      />
    </>
  );
}
