import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getRoles } from "../../apiCalls/access/accessApi";

export default function AcceptAccessDialog({
  open,
  request,
  loading = false,
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation("access");
  const { t: tUsers } = useTranslation("users");

  // ROLES
  const [roles, setRoles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [rolesError, setRolesError] = useState(false);

  // CARGAR ROLES DISPONIBLES
  useEffect(() => {
    let cancelled = false;

    getRoles()
      .then((data) => {
        if (cancelled) return;

        setRoles(data.roles);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error(error);
        setRolesError(true);
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingRoles(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // SELECCIONAR O QUITAR ROL
  const toggleRole = (idRol) => {
    setSelected((prev) =>
      prev.includes(idRol)
        ? prev.filter((id) => id !== idRol)
        : [...prev, idRol],
    );
  };

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
          {t("dialogs.accept.title")}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "var(--text-muted-color)",
            mt: 0.3,
          }}
        >
          {t("dialogs.accept.description")}
        </Typography>
      </DialogTitle>

      {/* CONTENIDO */}
      <DialogContent sx={{ pt: 2 }}>
        {/* INFORMACIÓN DEL SOLICITANTE */}
        {request && (
          <Box
            sx={{
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

        {/* LISTADO DE ROLES */}
        {loadingRoles ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 4,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        ) : rolesError ? (
          <Typography
            variant="body2"
            sx={{
              color: "var(--warning)",
              mt: 2,
            }}
          >
            {t("messages.rolesError")}
          </Typography>
        ) : (
          <List
            disablePadding
            sx={{
              mt: 2,
              maxHeight: 320,
              overflowY: "auto",
              border:
                selected.length === 0
                  ? "1px solid var(--warning)"
                  : "var(--border-gray)",
              borderRadius: 2,
            }}
          >
            {roles.map((role) => (
              <ListItemButton
                key={role.id_rol}
                dense
                disabled={loading}
                onClick={() => toggleRole(role.id_rol)}
                sx={{
                  alignItems: "flex-start",
                  py: 1,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 38,
                    mt: 0.3,
                  }}
                >
                  <Checkbox
                    edge="start"
                    size="small"
                    tabIndex={-1}
                    disableRipple
                    checked={selected.includes(role.id_rol)}
                    sx={{
                      p: 0.5,
                      color: "var(--primary-color)",
                      "&.Mui-checked": {
                        color: "var(--primary-color)",
                      },
                    }}
                  />
                </ListItemIcon>

                <ListItemText
                  primary={tUsers(`roleNames.${role.nombre}`, {
                    defaultValue: role.nombre,
                  })}
                  secondary={tUsers(`roleDescriptions.${role.nombre}`, {
                    defaultValue: role.descripcion || "",
                  })}
                  slotProps={{
                    primary: {
                      variant: "body2",
                      sx: {
                        fontWeight: 600,
                      },
                    },
                    secondary: {
                      variant: "caption",
                    },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        )}

        {/* VALIDACIÓN */}
        {!loadingRoles && !rolesError && selected.length === 0 && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1,
              color: "var(--warning)",
            }}
          >
            {t("dialogs.accept.required")}
          </Typography>
        )}
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
          onClick={() => onConfirm(selected)}
          disabled={
            loading || loadingRoles || rolesError || selected.length === 0
          }
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
              bgcolor: "#2d7671",
            },
          }}
        >
          {loading ? t("dialogs.accept.loading") : t("dialogs.accept.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
