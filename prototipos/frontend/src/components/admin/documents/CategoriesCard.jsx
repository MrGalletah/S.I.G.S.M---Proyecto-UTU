import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Box,
  Button,
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
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import {
  createOrUpdateCategory,
  getAllCategories,
} from "../../../apiCalls/categories/categoriesApi";

import { formatDate } from "../../utils/formatDate";
import CategoryModal from "../../modals/CategoryDialog";
import RefreshButton from "../../utils/RefreshButton";
import { useNotification } from "../../../hooks/useNotification";
import NotificationSnackbar from "../../utils/NotificationSnackbar";

// ESTADO DE CATEGORÍA

const isActive = (value) => value === true || Number(value) === 1;

export default function CategoriesCard({ variant }) {
  const { t } = useTranslation("documents");

  const { notification, showNotification, closeNotification } =
    useNotification();

  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // FILTROS Y PAGINACIÓN

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const isFull = variant === "full";
  const rowsPerPage = isFull ? 15 : 7;

  // REFERENCIA ESTABLE PARA NOTIFICACIONES

  const notificationRef = useRef(showNotification);

  useEffect(() => {
    notificationRef.current = showNotification;
  }, [showNotification]);

  // OBTENER CATEGORÍAS

  const loadCategories = async () => {
    const data = await getAllCategories();

    if (!data?.ok || !Array.isArray(data.categorias)) {
      throw new Error(t("categories.loadError"));
    }

    return data.categorias;
  };

  // RECARGA DESPUÉS DE GUARDAR

  const fetchData = async () => {
    try {
      setLoading(true);

      const data = await loadCategories();

      setCategories(data);
    } catch (error) {
      console.error(error);

      showNotification(error.message || t("categories.loadError"), "error");
    } finally {
      setLoading(false);
    }
  };

  // CARGA INICIAL

  useEffect(() => {
    let cancelled = false;

    getAllCategories()
      .then((data) => {
        if (cancelled) return;

        if (!data?.ok || !Array.isArray(data.categorias)) {
          throw new Error(t("categories.loadError"));
        }

        setCategories(data.categorias);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error(error);

        notificationRef.current(
          error.message || t("categories.loadError"),
          "error",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [t]);

  // CREAR O ACTUALIZAR CATEGORÍA

  const handleSubmitCategory = async (data) => {
    try {
      setSaving(true);

      if (selectedCategory) {
        await createOrUpdateCategory(data, selectedCategory.id_cat);

        showNotification(t("categories.updateSuccess"), "success");
      } else {
        await createOrUpdateCategory(data);

        showNotification(t("categories.createSuccess"), "success");
      }

      setOpenCategoryModal(false);
      setSelectedCategory(null);

      await fetchData();
    } catch (error) {
      console.error(error);

      showNotification(error.message || t("categories.saveError"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setOpenCategoryModal(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setOpenCategoryModal(true);
  };

  // FILTRADO

  const filteredCategories = categories.filter((category) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      String(category.nombre ?? "")
        .toLowerCase()
        .includes(searchText) ||
      String(category.descripcion ?? "")
        .toLowerCase()
        .includes(searchText);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active"
        ? isActive(category.activo)
        : !isActive(category.activo));

    return matchesSearch && matchesStatus;
  });

  // PAGINACIÓN

  const totalPages = Math.ceil(filteredCategories.length / rowsPerPage);

  const currentPage = Math.min(page, Math.max(totalPages, 1));

  const startIndex = (currentPage - 1) * rowsPerPage;

  const visibleCategories = filteredCategories.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

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
          direction={{ xs: "column", sm: "row" }}
          sx={{
            justifyContent: "space-between",
            alignItems: {
              xs: "stretch",
              sm: "flex-start",
            },
            mb: 2,
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t("categories.title")}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "var(--text-muted-color)",
              }}
            >
              {t("categories.description")}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateCategory}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              bgcolor: "var(--primary-color)",
              whiteSpace: "nowrap",
              alignSelf: "flex-start",
              "&:hover": {
                bgcolor: "var(--primary-hover-color)",
              },
            }}
          >
            {t("categories.add")}
          </Button>
        </Stack>

        {/* BÚSQUEDA, FILTROS Y RECARGA */}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            width: "100%",
            mb: 2,
            gap: 1.5,
            alignItems: {
              xs: "stretch",
              sm: "center",
            },
          }}
        >
          {/* BUSCADOR */}

          <TextField
            size="small"
            placeholder={t("categories.search")}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            slotProps={{
              htmlInput: {
                "aria-label": t("categories.search"),
              },
            }}
            sx={{
              minWidth: 0,
              width: {
                xs: "100%",
                sm: 250,
              },
            }}
          />

          {/* ESTADO Y REFRESH */}

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
              minWidth: 0,
            }}
          >
            <TextField
              select
              size="small"
              label={t("categories.status")}
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              sx={{
                flex: 1,
                minWidth: 0,
                width: {
                  sm: 160,
                },
              }}
            >
              <MenuItem value="all">{t("categories.all")}</MenuItem>

              <MenuItem value="active">{t("categories.activePlural")}</MenuItem>

              <MenuItem value="inactive">
                {t("categories.inactivePlural")}
              </MenuItem>
            </TextField>

            <RefreshButton
              fetchData={loadCategories}
              setData={setCategories}
              onSuccess={() => {
                showNotification(t("common:refresh.success"), "success");
              }}
              onError={(error) => {
                showNotification(
                  error.message || t("common:refresh.error"),
                  "error",
                );
              }}
            />
          </Stack>
        </Stack>

        {/* TABLA */}

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
        ) : (
          <TableContainer
            sx={{
              width: "100%",
              overflowX: "auto",
            }}
          >
            <Table
              size="small"
              sx={{
                minWidth: isFull ? 970 : 800,
                tableLayout: "fixed",
              }}
            >
              <TableHead>
                <TableRow>
                  {/* CATEGORÍA */}

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      width: 175,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("categories.name")}
                  </TableCell>

                  {/* DESCRIPCIÓN */}

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      width: isFull ? 290 : 270,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("categories.details")}
                  </TableCell>

                  {/* DOCUMENTOS */}

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      width: 125,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("categories.documents")}
                  </TableCell>

                  {/* FECHA DE CREACIÓN */}

                  {isFull && (
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        width: 145,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t("categories.createdAt")}
                    </TableCell>
                  )}

                  {/* ESTADO */}

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      width: 125,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("categories.status")}
                  </TableCell>

                  {/* ACCIONES */}

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      width: 95,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("categories.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {visibleCategories.map((category) => (
                  <TableRow key={category.id_cat} hover>
                    {/* NOMBRE */}

                    <TableCell>
                      <Typography
                        variant="body2"
                        title={category.nombre}
                        sx={{
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {category.nombre}
                      </Typography>
                    </TableCell>

                    {/* DESCRIPCIÓN */}

                    <TableCell>
                      <Typography
                        variant="body2"
                        title={category.descripcion ?? ""}
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {category.descripcion}
                      </Typography>
                    </TableCell>

                    {/* DOCUMENTOS */}

                    <TableCell align="center">{category.documentos}</TableCell>

                    {/* FECHA */}

                    {isFull && (
                      <TableCell align="center">
                        {formatDate(category.fecha_creacion)}
                      </TableCell>
                    )}

                    {/* ESTADO */}

                    <TableCell align="center">
                      <Chip
                        label={
                          isActive(category.activo)
                            ? t("categories.active")
                            : t("categories.inactive")
                        }
                        size="small"
                        sx={{
                          bgcolor: isActive(category.activo)
                            ? "var(--primary-color)"
                            : "var(--inactive-chip)",
                          color: isActive(category.activo)
                            ? "var(--white-color)"
                            : "var(--text-main-color)",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          minWidth: isActive(category.activo) ? 64 : 78,
                          justifyContent: "center",
                        }}
                      />
                    </TableCell>

                    {/* ACCIONES */}

                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEditCategory(category)}
                        aria-label={t("categories.edit", {
                          name: category.nombre,
                        })}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
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
              onChange={(_, value) => setPage(value)}
              size="small"
              shape="rounded"
            />
          </Stack>
        )}
      </Card>

      {/* MODAL DE CATEGORÍAS */}

      {openCategoryModal && (
        <CategoryModal
          open={openCategoryModal}
          onClose={() => {
            setOpenCategoryModal(false);
            setSelectedCategory(null);
          }}
          category={selectedCategory}
          onSubmit={handleSubmitCategory}
          loading={saving}
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
