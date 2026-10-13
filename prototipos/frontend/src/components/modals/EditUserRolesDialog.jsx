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
import { getRoles } from "../../apiCalls/users/usersApi";

export default function EditUserRolesDialog({
  open,
  user,
  loading = false,
  onClose,
  onConfirm,
}) {
  const [roles, setRoles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [rolesError, setRolesError] = useState("");

  useEffect(() => {
    if (!open || !user) return;

    setSelected(user.roles.map((role) => role.id_rol));
    setRolesError("");
    setLoadingRoles(true);

    getRoles()
      .then((data) => setRoles(data.roles))
      .catch((error) =>
        setRolesError(error.message || "Error al obtener los roles."),
      )
      .finally(() => setLoadingRoles(false));
  }, [open, user]);

  const toggleRole = (idRol) => {
    setSelected((prev) =>
      prev.includes(idRol)
        ? prev.filter((id) => id !== idRol)
        : [...prev, idRol],
    );
  };

  const currentRoles = user ? user.roles.map((role) => role.id_rol) : [];

  const unchanged =
    selected.length === currentRoles.length &&
    selected.every((id) => currentRoles.includes(id));

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
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "var(--text-main-color)",
          }}
        >
          Editar roles
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "var(--text-muted-color)",
            mt: 0.3,
          }}
        >
          Selecciona los roles que tendrá el usuario
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {user && (
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
            {rolesError}
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
                sx={{ alignItems: "flex-start", py: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 38, mt: 0.3 }}>
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
                  primary={role.nombre}
                  secondary={role.descripcion}
                  slotProps={{
                    primary: {
                      variant: "body2",
                      sx: { fontWeight: 600 },
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

        {!loadingRoles && !rolesError && selected.length === 0 && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1,
              color: "var(--warning)",
            }}
          >
            Debes seleccionar al menos un rol.
          </Typography>
        )}
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
          onClick={() => onConfirm(selected)}
          disabled={
            loading || loadingRoles || selected.length === 0 || unchanged
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
            bgcolor: "var(--primary-color)",
            px: 2,
            "&:hover": {
              bgcolor: "var(--primary-hover-color)",
            },
          }}
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}