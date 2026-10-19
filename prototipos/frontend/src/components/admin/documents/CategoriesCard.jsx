
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

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  createOrUpdateCategory,
  getAllCategories,
} from "../../../apiCalls/categories/categoriesApi";

import { formatDate } from "../../utils/formatDate";
import CategoryModal from "../../modals/CategoryDialog";
import { useNotification } from "../../../hooks/useNotification";
import NotificationSnackbar from "../../utils/NotificationSnackbar";

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
  const rowsPerPage = isFull ? 15 : 5;

  // REFERENCIA ESTABLE PARA NOTIFICACIONES
  const notificationRef = useRef(showNotification);

  useEffect(() => {
    notificationRef.current = showNotification;
  }, [showNotification]);

  // RECARGA MANUAL
  const fetchData = async () => {
    try {
      setLoading(true);

      const data = await getAllCategories();

      if (data.ok) {
        setCategories(data.categorias);
      }
    } catch (error) {
      console.error(error);
      showNotification(t("categories.loadError"), "error");
    } finally {
      setLoading(false);
    }
  };

  // CARGA INICIAL
  useEffect(() => {
    let cancelled = false;

    getAllCategories()
      .then((data) => {
        if (!cancelled && data.ok) {
          setCategories(data.categorias);
        }
      })
      .catch((error) => {
        if (cancelled) return;

        console.error(error);

        notificationRef.current(
          t("categories.loadError"),
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
        await createOrUpdateCategory(
          data,
          selectedCategory.id_cat,
        );

        showNotification(
          t("categories.updateSuccess"),
          "success",
        );
      } else {
        await createOrUpdateCategory(data);

        showNotification(
          t("categories.createSuccess"),
          "success",
        );
      }

      setOpenCategoryModal(false);
      setSelectedCategory(null);

      await fetchData();
    } catch (error) {
      console.error(error);

      showNotification(
        error.message || t("categories.saveError"),
        "error",
      );
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
    const searchText = search.toLowerCase();

    const matchesSearch =
      category.nombre.toLowerCase().includes(searchText) ||
      category.descripcion.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active"
        ? category.activo === 1
        : category.activo !== 1);

    return matchesSearch && matchesStatus;
  });

  // PAGINACIÓN
  const totalPages = Math.ceil(
    filteredCategories.length / rowsPerPage,
  );

  const currentPage = Math.min(page, Math.max(totalPages, 1));

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const visibleCategories = filteredCategories.slice(
    startIndex,
    endIndex,
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
              sx={{ fontWeight: 700 }}
            >
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
              "&:hover": {
                bgcolor: "var(--primary-hover-color)",
              },
            }}
          >
            {t("categories.add")}
          </Button>
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
              width: {
                xs: "100%",
                sm: "250px",
              },
            }}
          />

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
              width: {
                xs: "100%",
                sm: "160px",
              },
            }}
          >
            <MenuItem value="all">
              {t("categories.all")}
            </MenuItem>

            <MenuItem value="active">
              {t("categories.activePlural")}
            </MenuItem>

            <MenuItem value="inactive">
              {t("categories.inactivePlural")}
            </MenuItem>
          </TextField>
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
              minWidth: "100%",
              overflowX: "auto",
            }}
          >
            <Table
              size="small"
              sx={{
                minWidth: {
                  xs: "650px",
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
                      width: isFull ? "20%" : "25%",
                    }}
                  >
                    {t("categories.name")}
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      width: isFull ? "30%" : "35%",
                    }}
                  >
                    {t("categories.details")}
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      width: "12%",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("categories.documents")}
                  </TableCell>

                  {isFull && (
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        width: "14%",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t("categories.createdAt")}
                    </TableCell>
                  )}

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      width: isFull ? "12%" : "13%",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("categories.status")}
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      width: isFull ? "12%" : "15%",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("categories.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {visibleCategories.map((category) => (
                  <TableRow key={category.id_cat}>
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
                        {category.nombre}
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
                        {category.descripcion}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      {category.documentos}
                    </TableCell>

                    {isFull && (
                      <TableCell align="center">
                        {formatDate(category.fecha_creacion)}
                      </TableCell>
                    )}

                    <TableCell align="center">
                      <Chip
                        label={
                          category.activo === 1
                            ? t("categories.active")
                            : t("categories.inactive")
                        }
                        size="small"
                        sx={{
                          bgcolor:
                            category.activo === 1
                              ? "var(--primary-color)"
                              : "var(--inactive-chip)",
                          color:
                            category.activo === 1
                              ? "var(--white-color)"
                              : "var(--text-main-color)",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          minWidth:
                            category.activo === 0 ? 78 : 64,
                          justifyContent: "center",
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
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleEditCategory(category)
                          }
                          aria-label={t("categories.edit", {
                            name: category.nombre,
                          })}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
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
