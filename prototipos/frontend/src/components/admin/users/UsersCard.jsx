import {
  Box,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
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
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import { useEffect, useState, useRef } from "react";
import {
  getRoles,
  getUsers,
  setUserActive,
  updateUserRoles,
} from "../../../apiCalls/users/usersApi";
import { useNotification } from "../../../hooks/useNotification";
import NotificationSnackbar from "../../utils/NotificationSnackbar";
import DeactivateUserDialog from "../../modals/DeactivateUserDialog";
import ActivateUserDialog from "../../modals/ActivateUserDialog";
import EditUserRolesDialog from "../../modals/EditUserRolesDialog";

export default function UsersCard({ variant }) {
  const { notification, showNotification, closeNotification } =
    useNotification();

  const isFull = variant === "full";
  const rowsPerPage = isFull ? 15 : 5;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // PAGINACIÓN
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  // FILTROS
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [roleFilter, setRoleFilter] = useState("all");
  const [roles, setRoles] = useState([]);

  // RECARGA DESPUÉS DE MODIFICACIONES
  const [refreshKey, setRefreshKey] = useState(0);

  // MODALES
  const [userToEdit, setUserToEdit] = useState(null);
  const [saving, setSaving] = useState(false);

  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const [userToActivate, setUserToActivate] = useState(null);
  const [activating, setActivating] = useState(false);

  // REFERENCIA ESTABLE PARA NOTIFICACIONES
  const notificationRef = useRef(showNotification);

  useEffect(() => {
    notificationRef.current = showNotification;
  }, [showNotification]);

  // DEBOUNCE DEL BUSCADOR
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  // OBTENER FUNCIONARIOS
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const fetchUsers = async () => {
      try {
        setLoading(true);

        const data = await getUsers({
          page,
          limit: rowsPerPage,
          search: debouncedSearch,
          estado: statusFilter,
          id_rol: roleFilter === "all" ? null : roleFilter,
          signal: controller.signal,
        });

        if (cancelled) return;

        setUsers(data.usuarios);
        setTotalPages(data.paginacion.total_paginas);
        setTotalUsers(data.paginacion.total);
        setActiveCount(data.total_activos);

        // Si la página dejó de existir, volver a la última.
        const lastPage = Math.max(1, data.paginacion.total_paginas);

        if (page > lastPage) {
          setPage(lastPage);
        }
      } catch (error) {
        if (cancelled || error.name === "AbortError") return;

        console.error(error);

        notificationRef.current("Error al obtener los usuarios.", "error");

        setUsers([]);
        setTotalPages(0);
        setTotalUsers(0);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    page,
    rowsPerPage,
    debouncedSearch,
    statusFilter,
    roleFilter,
    refreshKey,
  ]);

  // OBTENER ROLES
  useEffect(() => {
    let cancelled = false;

    const fetchRoles = async () => {
      try {
        const data = await getRoles();

        if (!cancelled && data.ok) {
          setRoles(data.roles);
        }
      } catch (error) {
        if (cancelled) return;

        console.error(error);

        notificationRef.current("Error al obtener los roles.", "error");
      }
    };

    fetchRoles();

    return () => {
      cancelled = true;
    };
  }, []);

  // ACTUALIZAR ROLES
  const handleSaveRoles = async (roleIds) => {
    if (!userToEdit) return;

    try {
      setSaving(true);

      const response = await updateUserRoles(userToEdit.id_func, roleIds);

      showNotification(
        response.mensaje || "Roles actualizados correctamente.",
        "success",
      );

      setUserToEdit(null);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);

      showNotification(
        error.message || "Error al actualizar los roles del usuario.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  // DESACTIVAR USUARIO
  const handleDeactivate = async () => {
    if (!userToDeactivate) return;

    try {
      setDeactivating(true);

      const response = await setUserActive(userToDeactivate.id_func, false);

      showNotification(
        response.mensaje || "Usuario desactivado correctamente.",
        "success",
      );

      setUserToDeactivate(null);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);

      showNotification(
        error.message || "Error al desactivar el usuario.",
        "error",
      );

      setUserToDeactivate(null);
    } finally {
      setDeactivating(false);
    }
  };

  // ACTIVAR USUARIO
  const handleActivate = async () => {
    if (!userToActivate) return;

    try {
      setActivating(true);

      const response = await setUserActive(userToActivate.id_func, true);

      showNotification(
        response.mensaje || "Usuario activado correctamente.",
        "success",
      );

      setUserToActivate(null);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);

      showNotification(
        error.message || "Error al activar el usuario.",
        "error",
      );

      setUserToActivate(null);
    } finally {
      setActivating(false);
    }
  };

  const currentPage = Math.min(page, Math.max(totalPages, 1));
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
              Usuarios
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "var(--text-muted-color)",
              }}
            >
              Funcionarios del sistema y su estado de acceso
            </Typography>
          </Box>

          {activeCount > 0 && (
            <Chip
              label={`${activeCount} activo${activeCount === 1 ? "" : "s"}`}
              size="small"
              sx={{
                bgcolor: "var(--green-chip)",
                color: "var(--white-color)",
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
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          <TextField
            size="small"
            placeholder="Buscar por nombre, correo o rol"
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

          <TextField
            select
            size="small"
            label="Estado"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            sx={{
              width: {
                xs: "100%",
                sm: "160px",
              },
            }}
          >
            <MenuItem value="active">Activos</MenuItem>
            <MenuItem value="inactive">Inactivos</MenuItem>
            <MenuItem value="all">Todos</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label="Rol"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            sx={{
              width: {
                xs: "100%",
                sm: "180px",
              },
            }}
          >
            <MenuItem value="all">Todos</MenuItem>
            {roles.map((role) => (
              <MenuItem key={role.id_rol} value={role.id_rol}>
                {role.nombre}
              </MenuItem>
            ))}
          </TextField>
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
        ) : users.length === 0 ? (
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
            <PeopleOutlineOutlinedIcon
              sx={{ fontSize: 36, color: "var(--text-muted-color)" }}
            />

            <Typography
              variant="body2"
              sx={{ color: "var(--text-muted-color)" }}
            >
              {totalUsers === 0 &&
              statusFilter === "all" &&
              roleFilter === "all" &&
              !debouncedSearch
                ? "No hay usuarios registrados."
                : "No se encontraron usuarios que coincidan con la búsqueda."}
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
                minWidth: { xs: "800px", md: "100%" },
                tableLayout: "fixed",
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: "22%" }}>
                    Nombre
                  </TableCell>

                  <TableCell sx={{ fontWeight: 700, width: "26%" }}>
                    Correo
                  </TableCell>

                  <TableCell sx={{ fontWeight: 700, width: "24%" }}>
                    Roles
                  </TableCell>

                  <TableCell sx={{ fontWeight: 700, width: "12%" }}>
                    Estado
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      width: "16%",
                      whiteSpace: "nowrap",
                    }}
                    align="center"
                  >
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id_func}>
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
                        {user.nombre}
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
                        {user.correo}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {user.roles.length === 0 ? (
                        <Typography
                          variant="body2"
                          sx={{ color: "var(--text-muted-color)" }}
                        >
                          Sin roles
                        </Typography>
                      ) : (
                        <Stack
                          direction="row"
                          sx={{ flexWrap: "wrap", gap: 0.5 }}
                        >
                          {user.roles.map((role) => (
                            <Chip
                              key={role.id_rol}
                              label={role.nombre}
                              size="small"
                              sx={{
                                bgcolor: "var(--violet-chip)",
                                color: "var(--text-main-color)",
                                fontWeight: 500,
                              }}
                            />
                          ))}
                        </Stack>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={user.activo ? "Activo" : "Inactivo"}
                        size="small"
                        sx={{
                          bgcolor: user.activo
                            ? "var(--green-chip)"
                            : "var(--inactive-chip)",
                          color: user.activo
                            ? "var(--white-color)"
                            : "var(--text-main-color)",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ justifyContent: "center" }}
                      >
                        <Tooltip title="Editar roles">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => setUserToEdit(user)}
                              sx={{
                                color: "var(--primary-color)",
                              }}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        {user.activo ? (
                          <Tooltip title="Desactivar usuario">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => setUserToDeactivate(user)}
                                sx={{
                                  color: "var(--warning)",
                                }}
                              >
                                <PersonOffOutlinedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Activar usuario">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => setUserToActivate(user)}
                                sx={{
                                  color: "var(--green-chip)",
                                }}
                              >
                                <CheckCircleOutlineIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
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
              page={currentPage}
              onChange={(event, value) => setPage(value)}
              size="small"
              shape="rounded"
            />
          </Stack>
        )}
      </Card>

      <EditUserRolesDialog
        open={Boolean(userToEdit)}
        user={userToEdit}
        loading={saving}
        onClose={() => setUserToEdit(null)}
        onConfirm={handleSaveRoles}
      />

      <DeactivateUserDialog
        open={Boolean(userToDeactivate)}
        user={userToDeactivate}
        loading={deactivating}
        onClose={() => setUserToDeactivate(null)}
        onConfirm={handleDeactivate}
      />

      <ActivateUserDialog
        open={Boolean(userToActivate)}
        user={userToActivate}
        loading={activating}
        onClose={() => setUserToActivate(null)}
        onConfirm={handleActivate}
      />

      <NotificationSnackbar
        notification={notification}
        onClose={closeNotification}
      />
    </>
  );
}
