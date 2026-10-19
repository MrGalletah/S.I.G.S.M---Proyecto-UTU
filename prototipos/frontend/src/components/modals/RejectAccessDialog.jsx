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

import { useTranslation } from "react-i18next";

export default function RejectAccessDialog({
  open,
  request,
  loading = false,
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation("access");

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            boxShadow: "var(--card-shadow)",
            overflow: "hidden",
          },
        },
      }}
    >
      {/* ENCABEZADO */}
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
              {t("dialogs.reject.title")}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "var(--text-muted-color)",
                mt: 0.3,
              }}
            >
              {t("dialogs.reject.description")}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      {/* CONTENIDO */}
      <DialogContent sx={{ pt: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: "var(--text-main-color)",
            lineHeight: 1.6,
          }}
        >
          {t("dialogs.reject.question")}
        </Typography>

        {/* INFORMACIÓN DEL SOLICITANTE */}
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

        {/* ADVERTENCIA */}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 2,
            color: "var(--text-muted-color)",
          }}
        >
          {t("dialogs.reject.hint")}
        </Typography>
      </DialogContent>

      {/* BOTONES */}
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
          {t("dialogs.cancel")}
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
          {loading ? t("dialogs.reject.loading") : t("dialogs.reject.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
