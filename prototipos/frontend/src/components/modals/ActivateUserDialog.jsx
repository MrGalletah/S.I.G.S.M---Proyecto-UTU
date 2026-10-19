import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

import { useTranslation } from "react-i18next";

export default function ActivateUserDialog({
  open,
  user,
  loading = false,
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation("users");

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
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "var(--text-main-color)",
          }}
        >
          {t("dialogs.activate.title")}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "var(--text-muted-color)",
            mt: 0.3,
          }}
        >
          {t("dialogs.activate.description")}
        </Typography>
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
          {t("dialogs.activate.question")}
        </Typography>

        {/* INFORMACIÓN DEL USUARIO */}
        {user && (
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
              {user.nombre}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: "var(--text-muted-color)",
                wordBreak: "break-word",
              }}
            >
              {user.correo}
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
          {t("dialogs.activate.hint")}
        </Typography>
      </DialogContent>

      {/* ACCIONES */}
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
              <CheckCircleOutlineIcon />
            )
          }
          sx={{
            borderRadius: 2,
            textTransform: "none",
            bgcolor: "var(--green-chip)",
            px: 2,
            "&:hover": {
              bgcolor: "var(--green-chip)",
              filter: "brightness(0.9)",
            },
          }}
        >
          {loading
            ? t("dialogs.activate.loading")
            : t("dialogs.activate.title")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
