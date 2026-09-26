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
import { useEffect, useState } from "react";
import {
acceptAccessRequest,
getPendingAccessRequests,
rejectAccessRequest,
} from "../../../apiCalls/access/accessApi";
import { useNotification } from "../../../hooks/useNotification";
import NotificationSnackbar from "../../utils/NotificationSnackbar";
import RejectAccessDialog from "../../modals/RejectAccessDialog";

export default function AccessRequestsCard({ variant }) {
const { notification, showNotification, closeNotification } =
    useNotification();

const isFull = variant === "full";
const rowsPerPage = isFull ? 15 : 5;
const [requests, setRequests] = useState([]);
const [loading, setLoading] = useState(true);
const [search, setSearch] = useState("");
const [page, setPage] = useState(1);
const [acceptingId, setAcceptingId] = useState(null);
const [requestToReject, setRequestToReject] = useState(null);
const [rejecting, setRejecting] = useState(false);

const fetchData = async () => {
    try {
    setLoading(true);

    const data = await getPendingAccessRequests();

    if (data.ok) {
        setRequests(data.solicitudes);
    }
    } catch (e) {
    console.error(e);
    showNotification("Error al obtener las solicitudes de acceso.", "error");
    } finally {
    setLoading(false);
    }
};

useEffect(() => {
    fetchData();
}, []);

const handleAccept = async (request) => {
    try {
    setAcceptingId(request.id_func);

    const response = await acceptAccessRequest(request.id_func);

    showNotification(
        response.mensaje || "Acceso concedido correctamente.",
        "success",
    );

    setRequests((prev) =>
        prev.filter((item) => item.id_func !== request.id_func),
    );
    } catch (error) {
    console.error(error);

    showNotification(
        error.message || "Error al aceptar la solicitud de acceso.",
        "error",
    );
    } finally {
    setAcceptingId(null);
    }
};

const handleReject = async () => {
    if (!requestToReject) return;

    try {
    setRejecting(true);

    const response = await rejectAccessRequest(requestToReject.id_func);

    showNotification(
        response.mensaje || "Solicitud de acceso rechazada.",
        "success",
    );

    setRequests((prev) =>
        prev.filter((item) => item.id_func !== requestToReject.id_func),
    );

    setRequestToReject(null);
    } catch (error) {
    console.error(error);

    showNotification(
        error.message || "Error al rechazar la solicitud de acceso.",
        "error",
    );
    } finally {
    setRejecting(false);
    }
};

const filteredRequests = requests.filter((request) => {
    const searchText = search.toLowerCase();

    return (
    request.nombre.toLowerCase().includes(searchText) ||
    request.correo.toLowerCase().includes(searchText)
    );
});

const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);

const startIndex = (page - 1) * rowsPerPage;
const endIndex = startIndex + rowsPerPage;

const visibleRequests = filteredRequests.slice(startIndex, endIndex);

const showPagination = filteredRequests.length > rowsPerPage;

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
            <Typography
            variant="h6"
            sx={{
                fontWeight: 700,
            }}
            >
            Solicitudes de acceso
            </Typography>

            <Typography
            variant="body2"
            sx={{
                color: "var(--text-muted-color)",
            }}
            >
            Usuarios que solicitaron acceso al sistema y aún no fueron
            habilitados
            </Typography>
        </Box>

        {requests.length > 0 && (
            <Chip
            icon={<HourglassEmptyIcon sx={{ fontSize: 16 }} />}
            label={`${requests.length} pendiente${
                requests.length === 1 ? "" : "s"
            }`}
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

        <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
            mb: 2,
            gap: 2,
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
        }}
        >
        <TextField
            size="small"
            placeholder="Buscar por nombre o correo"
            value={search}
            onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
            }}
            sx={{
            width: {
                xs: "100%",
                sm: "280px",
            },
            }}
        />
        </Stack>

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
            sx={{ fontSize: 36, color: "var(--text-muted-color)" }}
            />

            <Typography
            variant="body2"
            sx={{ color: "var(--text-muted-color)" }}
            >
            {requests.length === 0
                ? "No hay solicitudes de acceso pendientes."
                : "No se encontraron solicitudes que coincidan con la búsqueda."}
            </Typography>
        </Box>
        ) : (
        <TableContainer
            sx={{
            minWidth: "100%",
            overflowX: "auto",
            }}
        >
            <Table
            size="small"
            sx={{
                minWidth: { xs: "550px", md: "100%" },
                tableLayout: "fixed",
            }}
            >
            <TableHead>
                <TableRow>
                <TableCell sx={{ fontWeight: 700, width: "35%" }}>
                    Nombre
                </TableCell>

                <TableCell sx={{ fontWeight: 700, width: "40%" }}>
                    Correo
                </TableCell>

                <TableCell
                    sx={{
                    fontWeight: 700,
                    width: "25%",
                    whiteSpace: "nowrap",
                    }}
                    align="center"
                >
                    Acciones
                </TableCell>
                </TableRow>
            </TableHead>

            <TableBody>
                {visibleRequests.map((request) => (
                <TableRow key={request.id_func}>
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

                    <TableCell>
                    <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ justifyContent: "center" }}
                    >
                        <Tooltip title="Aceptar solicitud">
                        <span>
                            <IconButton
                            size="small"
                            disabled={acceptingId === request.id_func}
                            onClick={() => handleAccept(request)}
                            sx={{
                                color: "var(--green-chip)",
                            }}
                            >
                            {acceptingId === request.id_func ? (
                                <CircularProgress size={18} color="inherit" />
                            ) : (
                                <CheckCircleOutlineIcon fontSize="small" />
                            )}
                            </IconButton>
                        </span>
                        </Tooltip>

                        <Tooltip title="Rechazar solicitud">
                        <span>
                            <IconButton
                            size="small"
                            disabled={acceptingId === request.id_func}
                            onClick={() => setRequestToReject(request)}
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
            page={page}
            onChange={(event, value) => setPage(value)}
            size="small"
            shape="rounded"
            />
        </Stack>
        )}
    </Card>

    <RejectAccessDialog
        open={Boolean(requestToReject)}
        request={requestToReject}
        loading={rejecting}
        onClose={() => setRequestToReject(null)}
        onConfirm={handleReject}
    />

    <NotificationSnackbar
        notification={notification}
        onClose={closeNotification}
    />
    </>
);
}