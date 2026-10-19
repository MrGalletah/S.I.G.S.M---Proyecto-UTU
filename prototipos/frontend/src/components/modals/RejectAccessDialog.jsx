import {
Box,
Button,
CircularProgress,
Dialog,
DialogActions,
DialogContent,
DialogTitle,
Stack,
Typography,
} from "@mui/material";

import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";

export default function RejectAccessDialog({
open,
request,
loading = false,
onClose,
onConfirm,
}) {
return (
    <Dialog
    open={open}
    onClose={loading ? undefined : onClose}
    maxWidth="xs"
    fullWidth
    PaperProps={{
        sx: {
        borderRadius: 4,
        boxShadow: "var(--card-shadow)",
        overflow: "hidden",
        },
    }}
    >
    <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
        <Box>
            <Typography
            variant="h6"
            sx={{
                fontWeight: 700,
                color: "var(--text-main-color)",
            }}
            >
            Rechazar solicitud
            </Typography>

            <Typography
            variant="body2"
            sx={{
                color: "var(--text-muted-color)",
                mt: 0.3,
            }}
            >
            Esta acción no se puede deshacer
            </Typography>
        </Box>
        </Stack>
    </DialogTitle>

    <DialogContent sx={{ pt: 2 }}>
        <Typography
        variant="body2"
        sx={{
            color: "var(--text-main-color)",
            lineHeight: 1.6,
        }}
        >
        ¿Seguro que quieres rechazar esta solicitud de acceso?
        </Typography>

        {request && (
        <Box
            sx={{
            mt: 2,
            px: 2,
            py: 1.5,
            borderRadius: 2,
            bgcolor: "rgba(0, 0, 0, 0.035)",
            border: "var(--border-gray)",
            }}
        >
            <Typography
            variant="body2"
            sx={{
                fontWeight: 600,
                color: "var(--text-main-color)",
                wordBreak: "break-word",
            }}
            >
            {request.nombre}
            </Typography>

            <Typography
            variant="caption"
            sx={{
                color: "var(--text-muted-color)",
                wordBreak: "break-word",
            }}
            >
            {request.correo}
            </Typography>
        </Box>
        )}

        <Typography
        variant="caption"
        sx={{
            display: "block",
            mt: 2,
            color: "var(--text-muted-color)",
        }}
        >
        Se eliminará el usuario de la base de datos y deberá volver a
        solicitar acceso si quiere ingresar más adelante.
        </Typography>
    </DialogContent>

    <DialogActions
        sx={{
        px: 3,
        pb: 3,
        pt: 1,
        gap: 1,
        }}
    >
        <Button
        onClick={onClose}
        disabled={loading}
        sx={{
            borderRadius: 2,
            textTransform: "none",
            color: "var(--text-main-color)",
            px: 2,
        }}
        >
        Cancelar
        </Button>

        <Button
        variant="contained"
        onClick={onConfirm}
        disabled={loading}
        startIcon={
            loading ? (
            <CircularProgress size={16} color="inherit" />
            ) : (
            <PersonOffOutlinedIcon />
            )
        }
        sx={{
            borderRadius: 2,
            textTransform: "none",
            bgcolor: "var(--warning)",
            px: 2,
            "&:hover": {
            bgcolor: "#bd0000",
            },
        }}
        >
        {loading ? "Rechazando..." : "Rechazar solicitud"}
        </Button>
    </DialogActions>
</Dialog>
);
}