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

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import { useTranslation } from "react-i18next";

export default function DeleteConfirmDialog({
  open,
  documentTitle,
  loading = false,
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation("documents");

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="delete-document-title"
      aria-describedby="delete-document-description"
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: "var(--card-shadow)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle id="delete-document-title" sx={{ pb: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "var(--text-main-color)",
              }}
            >
              {t("files.deleteDialog.title")}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "var(--text-muted-color)",
                mt: 0.3,
              }}
            >
              {t("files.deleteDialog.warning")}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Typography
          id="delete-document-description"
          variant="body2"
          sx={{
            color: "var(--text-main-color)",
            lineHeight: 1.6,
          }}
        >
          {t("files.deleteDialog.question")}
        </Typography>

        {/* Título original del documento */}
        {documentTitle && (
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
              {documentTitle}
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
          {t("files.deleteDialog.description")}
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
          {t("files.deleteDialog.cancel")}
        </Button>

        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <DeleteOutlineRoundedIcon />
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
          {loading
            ? t("files.deleteDialog.deleting")
            : t("files.deleteDialog.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
