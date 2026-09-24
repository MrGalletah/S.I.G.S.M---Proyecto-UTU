import { useEffect, useState } from "react";

import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  Stack,
} from "@mui/material";

import TransferDetailsCard from "../../../utils/TransferDetailsCard";
import TransferEditDialog from "./TransferEditDialog";
import StatCard from "../../../utils/StatCard";
import TransfersCard from "./TransfersCard";

import { cardsData } from "../../../../mockData/transfers";

import { getTransferDetail, getTransfers } from "../../../../apiCalls/transfers/transfersApi";

import { useNotification } from "../../../../hooks/useNotification";

import NotificationSnackbar from "../../../utils/NotificationSnackbar";

export default function FollowUp() {
  const rowsPerPage = 8;

  const [transfers, setTransfers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedTransferDetail, setSelectedTransferDetail] = useState(null);

  const [page, setPage] = useState(1);

  const [selectedTransferId, setSelectedTransferId] = useState(null);

  const [editTransferId, setEditTransferId] = useState(null);

  const [editTransferDetail, setEditTransferDetail] = useState(null);

  const { notification, showNotification, closeNotification } =
    useNotification();

  // CARGAR LISTADO INICIAL

  useEffect(() => {
    const loadTransfers = async () => {
      try {
        const data = await getTransfers();

        setTransfers(data);

        if (data.length > 0) {
          setSelectedTransferId(data[0].id);
        }
      } catch (error) {
        showNotification(error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    loadTransfers();
  }, []);

  // DETALLE SELECCIONADO

  useEffect(() => {
    if (!selectedTransferId) {
      return;
    }

    let cancelled = false;

    getTransferDetail(selectedTransferId)
      .then((detail) => {
        if (!cancelled) {
          setSelectedTransferDetail(detail);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          showNotification(error.message, "error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedTransferId]);

  // DETALLE PARA GESTIONAR

  useEffect(() => {
    if (!editTransferId) {
      return;
    }

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
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editTransferId]);

  const loadingInitialDetail =
    selectedTransferId !== null && selectedTransferDetail === null;

  const updatingDetail =
    selectedTransferDetail !== null &&
    selectedTransferId !== null &&
    selectedTransferDetail.id !== selectedTransferId;

  const loadingEditTransfer =
    editTransferId !== null && editTransferDetail?.id !== editTransferId;

  // PAGINACIÓN

  const totalPages = Math.ceil(transfers.length / rowsPerPage);

  const startIndex = (page - 1) * rowsPerPage;

  const endIndex = startIndex + rowsPerPage;

  const visibleTransfers = transfers.slice(startIndex, endIndex);

  const showPagination = transfers.length > rowsPerPage;

  const handleCloseEditDialog = () => {
    setEditTransferId(null);

    setEditTransferDetail(null);
  };

  // REFRESCAR DESPUÉS DE
  // UNA MODIFICACIÓN REAL

  const refreshTransfer = async (idTransfer, successMessage) => {
    handleCloseEditDialog();

    try {
      const updatedTransfers = await getTransfers();

      setTransfers(updatedTransfers);

      const transferStillActive = updatedTransfers.some(
        (transfer) => transfer.id === idTransfer,
      );

      // SIGUE EN LA LISTA ACTIVA

      if (transferStillActive) {
        if (selectedTransferId === idTransfer) {
          const updatedDetail = await getTransferDetail(idTransfer);

          setSelectedTransferDetail(updatedDetail);
        }
      } else if (selectedTransferId === idTransfer) {
        // PROBABLEMENTE PASÓ A COMPLETADO

        const nextTransfer = updatedTransfers[0] ?? null;

        if (nextTransfer) {
          setSelectedTransferId(nextTransfer.id);
        } else {
          setSelectedTransferId(null);

          setSelectedTransferDetail(null);
        }
      }

      showNotification(successMessage, "success");
    } catch (error) {
      showNotification(
        "El cambio se guardó, pero no se pudo actualizar la vista.",
        "warning",
      );
    }
  };

  const handleTransferAssigned = async (idTransfer) => {
    await refreshTransfer(idTransfer, "Traslado asignado correctamente.");
  };

  const handleStateUpdated = async (idTransfer) => {
    await refreshTransfer(idTransfer, "Estado actualizado correctamente.");
  };

  return (
    <>
      {/* CARDS SUPERIORES */}

      <Stack
        direction="row"
        spacing={2}
        sx={{
          flexWrap: "wrap",
          mt: 2,

          display: {
            md: "flex",
            xs: "none",
          },
        }}
      >
        {cardsData.map((item) => (
          <StatCard key={item.label} item={item} colors={item.colors} />
        ))}
      </Stack>

      {/* LISTADO */}

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
          selectedTransferId={selectedTransferId}
          setSelectedTransferId={setSelectedTransferId}
          setEditTransferId={setEditTransferId}
          showPagination={showPagination}
          totalPages={totalPages}
          page={page}
          setPage={setPage}
        />
      )}

      {/* DETALLE */}

      {!loading && selectedTransferId && (
        <>
          {loadingInitialDetail ? (
            <Stack
              sx={{
                alignItems: "center",

                justifyContent: "center",

                py: 5,
              }}
            >
              <CircularProgress size={28} />
            </Stack>
          ) : (
            selectedTransferDetail && (
              <Box
                sx={{
                  position: "relative",
                }}
              >
                <TransferDetailsCard transfer={selectedTransferDetail} />

                {updatingDetail && (
                  <Box
                    sx={{
                      position: "absolute",

                      inset: 0,

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
            )
          )}
        </>
      )}

      {/* CARGANDO DIÁLOGO */}

      <Dialog
        open={loadingEditTransfer}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogContent>
          <Stack
            sx={{
              minHeight: 120,

              alignItems: "center",

              justifyContent: "center",
            }}
          >
            <CircularProgress size={32} />
          </Stack>
        </DialogContent>
      </Dialog>

      {/* GESTIONAR */}

      {editTransferId && editTransferDetail?.id === editTransferId && (
        <TransferEditDialog
          key={editTransferDetail.id}
          open={true}
          transfer={editTransferDetail}
          onClose={handleCloseEditDialog}
          onAssigned={handleTransferAssigned}
          onStateUpdated={handleStateUpdated}
        />
      )}

      <NotificationSnackbar
        notification={notification}
        onClose={closeNotification}
      />
    </>
  );
}
