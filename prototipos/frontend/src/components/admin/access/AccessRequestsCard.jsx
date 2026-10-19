import {
  Box,
  Card,
  Chip,
  CircularProgress,
  IconButton,
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

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  acceptAccessRequest,
  getPendingAccessRequests,
  rejectAccessRequest,
} from "../../../apiCalls/access/accessApi";

import { useNotification } from "../../../hooks/useNotification";
import NotificationSnackbar from "../../utils/NotificationSnackbar";
import AcceptAccessDialog from "../../modals/AcceptAccessDialog";
import RejectAccessDialog from "../../modals/RejectAccessDialog";

export default function AccessRequestsCard({ variant }) {
  const { t } = useTranslation("access");

  const { notification, showNotification, closeNotification } =
    useNotification();

  const isFull = variant === "full";
  const rowsPerPage = isFull ? 15 : 5;

  // SOLICITUDES
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // BÚSQUEDA Y PAGINACIÓN
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // ACEPTAR SOLICITUD
  const [requestToAccept, setRequestToAccept] = useState(null);
  const [accepting, setAccepting] = useState(false);

  // RECHAZAR SOLICITUD
  const [requestToReject, setRequestToReject] = useState(null);
  const [rejecting, setRejecting] = useState(false);

  // REFERENCIAS ESTABLES PARA NOTIFICACIONES
  const notificationRef = useRef(showNotification);
  const tRef = useRef(t);

  useEffect(() => {
    notificationRef.current = showNotification;
  }, [showNotification]);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  // CARGA INICIAL
  useEffect(() => {
    let cancelled = false;

    getPendingAccessRequests()
      .then((data) => {
        if (!cancelled && data.ok) {
          setRequests(data.solicitudes);
        }
      })
      .catch((error) => {
        if (cancelled) return;

        console.error(error);

        notificationRef.current(tRef.current("messages.loadError"), "error");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ACEPTAR SOLICITUD
  const handleAccept = async (roles) => {
    if (!requestToAccept) return;

    try {
      setAccepting(true);

      await acceptAccessRequest(requestToAccept.id_func, roles);

      showNotification(t("messages.acceptSuccess"), "success");

      // QUITAR SOLICITUD DEL LISTADO
      setRequests((prev) =>
        prev.filter((item) => item.id_func !== requestToAccept.id_func),
      );

      setRequestToAccept(null);
    } catch (error) {
      console.error(error);

      showNotification(error.message || t("messages.acceptError"), "error");
    } finally {
      setAccepting(false);
    }
  };

  // RECHAZAR SOLICITUD
  const handleReject = async () => {
    if (!requestToReject) return;

    try {
      setRejecting(true);

      await rejectAccessRequest(requestToReject.id_func);

      showNotification(t("messages.rejectSuccess"), "success");

      // QUITAR SOLICITUD DEL LISTADO
      setRequests((prev) =>
        prev.filter((item) => item.id_func !== requestToReject.id_func),
      );

      setRequestToReject(null);
    } catch (error) {
      console.error(error);

      showNotification(error.message || t("messages.rejectError"), "error");
    } finally {
      setRejecting(false);
    }
  };

  // FILTRADO
  const filteredRequests = requests.filter((request) => {
    const searchText = search.trim().toLowerCase();

    return (
      request.nombre.toLowerCase().includes(searchText) ||
      request.correo.toLowerCase().includes(searchText)
    );
  });

  // PAGINACIÓN
  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);

  const currentPage = Math.min(page, Math.max(totalPages, 1));

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const visibleRequests = filteredRequests.slice(startIndex, endIndex);

  const showPagination = totalPages > 1;

  return (
    <>
      <Card
        sx={{
          borderRadius: 4,
          p: 3,
          boxShadow: "var(--card-shadow)",
          minWidth: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: isFull ? 850 : 450,
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

          {/* CONTADOR DE SOLICITUDES */}
          {requests.length > 0 && (
            <Chip
              icon={<HourglassEmptyIcon sx={{ fontSize: 16 }} />}
              label={t("pendingCount", {
                count: requests.length,
              })}
              size="small"
              sx={{
                bgcolor: "var(--organe-chip)",
                color: "var(--text-main-color)",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            />
          )}
        </Stack>

        {/* BÚSQUEDA */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            mb: 2,
            gap: 2,
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            justifyContent: "space-between",
          }}
        >
          <TextField
            size="small"
            placeholder={t("search")}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            slotProps={{
              htmlInput: {
                "aria-label": t("search"),
              },
            }}
            sx={{
              width: {
                xs: "100%",
                sm: "280px",
              },
            }}
          />
        </Stack>

        {/* CONTENIDO */}
        {loading ? (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <CircularProgress />
          </Box>
        ) : filteredRequests.length === 0 ? (
          /* ESTADO VACÍO */
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
              gap: 1,
            }}
          >
            <CheckCircleOutlineIcon
              sx={{
                fontSize: 36,
                color: "var(--text-muted-color)",
              }}
            />

            <Typography
              variant="body2"
              sx={{
                color: "var(--text-muted-color)",
              }}
            >
              {requests.length === 0
                ? t("empty.noRequests")
                : t("empty.noResults")}
            </Typography>
          </Box>
        ) : (
          /* TABLA DE SOLICITUDES */
          <TableContainer
            sx={{
              minWidth: "100%",
              overflowX: "auto",
            }}
          >
            <Table
              size="small"
              sx={{
                minWidth: {
                  xs: "550px",
                  md: "100%",
                },
                tableLayout: "fixed",
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      width: "35%",
                    }}
                  >
                    {t("table.name")}
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      width: "40%",
                    }}
                  >
                    {t("table.email")}
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      width: "25%",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("table.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {visibleRequests.map((request) => (
                  <TableRow key={request.id_func}>
                    {/* NOMBRE */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {request.nombre}
                      </Typography>
                    </TableCell>

                    {/* CORREO */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {request.correo}
                      </Typography>
                    </TableCell>

                    {/* ACCIONES */}
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          justifyContent: "center",
                        }}
                      >
                        {/* ACEPTAR */}
                        <Tooltip title={t("actions.accept")}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => setRequestToAccept(request)}
                              aria-label={t("actions.accept")}
                              sx={{
                                color: "var(--green-chip)",
                              }}
                            >
                              <CheckCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        {/* RECHAZAR */}
                        <Tooltip title={t("actions.reject")}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => setRequestToReject(request)}
                              aria-label={t("actions.reject")}
                              sx={{
                                color: "var(--warning)",
                              }}
                            >
                              <HighlightOffIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* PAGINACIÓN */}
        {!loading && showPagination && (
          <Stack
            direction="row"
            sx={{
              justifyContent: "center",
              mt: "auto",
              pt: 2,
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

      {/* MODAL DE APROBACIÓN */}
      {requestToAccept && (
        <AcceptAccessDialog
          key={requestToAccept.id_func}
          open={true}
          request={requestToAccept}
          loading={accepting}
          onClose={() => setRequestToAccept(null)}
          onConfirm={handleAccept}
        />
      )}

      {/* MODAL DE RECHAZO */}
      {requestToReject && (
        <RejectAccessDialog
          open={true}
          request={requestToReject}
          loading={rejecting}
          onClose={() => setRequestToReject(null)}
          onConfirm={handleReject}
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
