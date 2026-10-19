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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("users");

  const { notification, showNotification, closeNotification } =
    useNotification();

  const isFull = variant === "full";
  const rowsPerPage = isFull ? 15 : 5;

  // USUARIOS
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

  // REFERENCIAS ESTABLES PARA LOS EFECTOS
  const notificationRef = useRef(showNotification);
  const tRef = useRef(t);

  useEffect(() => {
    notificationRef.current = showNotification;
  }, [showNotification]);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

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

        notificationRef.current(
          tRef.current("messages.loadUsersError"),
          "error",
        );

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

        notificationRef.current(
          tRef.current("messages.loadRolesError"),
          "error",
        );
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

      await updateUserRoles(userToEdit.id_func, roleIds);

      showNotification(t("messages.rolesUpdated"), "success");

      setUserToEdit(null);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);

      showNotification(
        error.message || t("messages.rolesUpdateError"),
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

      await setUserActive(userToDeactivate.id_func, false);

      showNotification(t("messages.deactivated"), "success");

      setUserToDeactivate(null);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);

      showNotification(error.message || t("messages.deactivateError"), "error");

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

      await setUserActive(userToActivate.id_func, true);

      showNotification(t("messages.activated"), "success");

      setUserToActivate(null);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);

      showNotification(error.message || t("messages.activateError"), "error");

      setUserToActivate(null);
    } finally {
      setActivating(false);
    }
  };

  // PAGINACIÓN
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
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
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

          {activeCount > 0 && (
            <Chip
              label={t("activeCount", {
                count: activeCount,
              })}
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

        {/* BÚSQUEDA Y FILTROS */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            mb: 2,
            gap: 2,
            alignItems: {
              xs: "stretch",
              sm: "center",
            },
          }}
        >
          {/* BUSCADOR */}
          <TextField
            size="small"
            placeholder={t("filters.search")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            slotProps={{
              htmlInput: {
                "aria-label": t("filters.search"),
              },
            }}
            sx={{
              width: {
                xs: "100%",
                sm: "280px",
              },
            }}
          />

          {/* FILTRO POR ESTADO */}
          <TextField
            select
            size="small"
            label={t("filters.status")}
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
            <MenuItem value="active">{t("filters.active")}</MenuItem>

            <MenuItem value="inactive">{t("filters.inactive")}</MenuItem>

            <MenuItem value="all">{t("filters.all")}</MenuItem>
          </TextField>

          {/* FILTRO POR ROL */}
          <TextField
            select
            size="small"
            label={t("filters.role")}
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
            <MenuItem value="all">{t("filters.all")}</MenuItem>

            {roles.map((role) => (
              <MenuItem key={role.id_rol} value={role.id_rol}>
                {t(`roleNames.${role.nombre}`, {
                  defaultValue: role.nombre,
                })}
              </MenuItem>
            ))}
          </TextField>
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
        ) : users.length === 0 ? (
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
            <PeopleOutlineOutlinedIcon
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
              {totalUsers === 0 &&
              statusFilter === "all" &&
              roleFilter === "all" &&
              !debouncedSearch
                ? t("empty.noUsers")
                : t("empty.noResults")}
            </Typography>
          </Box>
        ) : (
          /* TABLA DE USUARIOS */
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
                  xs: "800px",
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
                      width: "22%",
                    }}
                  >
                    {t("table.name")}
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      width: "26%",
                    }}
                  >
                    {t("table.email")}
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      width: "24%",
                    }}
                  >
                    {t("table.roles")}
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      width: "12%",
                    }}
                  >
                    {t("table.status")}
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      width: "16%",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("table.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id_func}>
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
                        {user.nombre}
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
                        {user.correo}
                      </Typography>
                    </TableCell>

                    {/* ROLES */}
                    <TableCell>
                      {user.roles.length === 0 ? (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "var(--text-muted-color)",
                          }}
                        >
                          {t("table.noRoles")}
                        </Typography>
                      ) : (
                        <Stack
                          direction="row"
                          sx={{
                            flexWrap: "wrap",
                            gap: 0.5,
                          }}
                        >
                          {user.roles.map((role) => (
                            <Chip
                              key={role.id_rol}
                              label={t(`roleNames.${role.nombre}`, {
                                defaultValue: role.nombre,
                              })}
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

                    {/* ESTADO */}
                    <TableCell>
                      <Chip
                        label={
                          user.activo ? t("table.active") : t("table.inactive")
                        }
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

                    {/* ACCIONES */}
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          justifyContent: "center",
                        }}
                      >
                        {/* EDITAR ROLES */}
                        <Tooltip title={t("actions.editRoles")}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => setUserToEdit(user)}
                              aria-label={t("actions.editRoles")}
                              sx={{
                                color: "var(--primary-color)",
                              }}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        {/* DESACTIVAR USUARIO */}
                        {user.activo ? (
                          <Tooltip title={t("actions.deactivate")}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => setUserToDeactivate(user)}
                                aria-label={t("actions.deactivate")}
                                sx={{
                                  color: "var(--warning)",
                                }}
                              >
                                <PersonOffOutlinedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : (
                          /* ACTIVAR USUARIO */
                          <Tooltip title={t("actions.activate")}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => setUserToActivate(user)}
                                aria-label={t("actions.activate")}
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

      {/* MODAL DE EDICIÓN DE ROLES */}
      {userToEdit && (
        <EditUserRolesDialog
          key={userToEdit.id_func}
          open={true}
          user={userToEdit}
          loading={saving}
          onClose={() => setUserToEdit(null)}
          onConfirm={handleSaveRoles}
        />
      )}

      {/* MODAL DE DESACTIVACIÓN */}
      <DeactivateUserDialog
        open={Boolean(userToDeactivate)}
        user={userToDeactivate}
        loading={deactivating}
        onClose={() => setUserToDeactivate(null)}
        onConfirm={handleDeactivate}
      />

      {/* MODAL DE ACTIVACIÓN */}
      <ActivateUserDialog
        open={Boolean(userToActivate)}
        user={userToActivate}
        loading={activating}
        onClose={() => setUserToActivate(null)}
        onConfirm={handleActivate}
      />

      {/* NOTIFICACIONES */}
      <NotificationSnackbar
        notification={notification}
        onClose={closeNotification}
      />
    </>
  );
}
