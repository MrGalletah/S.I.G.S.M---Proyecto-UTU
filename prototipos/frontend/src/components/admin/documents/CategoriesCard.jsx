import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  IconButton,
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
import { useEffect, useState } from "react";
import {
  createOrUpdateCategory,
  getAllCategories,
} from "../../../apiCalls/categories/categoriesApi";
import { formatDate } from "../../utils/formatDate";
import CategoryModal from "../../modals/CategoryDialog";
import { useNotification } from "../../../hooks/useNotification";
import NotificationSnackbar from "../../utils/NotificationSnackbar";

export default function CategoriesCard({ variant }) {
  const { notification, showNotification, closeNotification } =
    useNotification();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const data = await getAllCategories();

      if (data.ok) {
        setCategories(data.categorias);
      }
    } catch (e) {
      console.error(e);
      showNotification("Error al obtener las categorías.", "error");
    } finally {
      setLoading(false);
    }
  };

  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleSubmitCategory = async (data) => {
    try {
      setSaving(true);

      if (selectedCategory) {
        // PATCH
        const response = await createOrUpdateCategory(
          data,
          selectedCategory.id_cat,
        );

        showNotification(
          response.mensaje || "Categoría creada correctamente.",
          "success",
        );
      } else {
        // POST
        const response = await createOrUpdateCategory(data);

        showNotification(
          response.mensaje || "Categoría creada correctamente.",
          "success",
        );
      }

      setOpenCategoryModal(false);
      setSelectedCategory(null);

      await fetchData();
    } catch (error) {
      console.error(error);

      showNotification(
        error.message || "Error al intentar guardar la categoría.",
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

  useEffect(() => {
    fetchData();
  }, []);

  const isFull = variant === "full";
  const rowsPerPage = isFull ? 15 : 5;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filteredCategories = categories.filter((category) => {
    const searchText = search.toLowerCase();

    return (
      category.nombre.toLowerCase().includes(searchText) ||
      category.descripcion.toLowerCase().includes(searchText)
    );
  });

  const totalPages = Math.ceil(filteredCategories.length / rowsPerPage);

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const visibleCategories = filteredCategories.slice(startIndex, endIndex);

  const showPagination = filteredCategories.length > rowsPerPage;

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
              Categorías
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "var(--text-muted-color)",
              }}
            >
              Gestiona las categorías
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleCreateCategory()}
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
            Agregar categoría
          </Button>
        </Stack>

        <TextField
          size="small"
          placeholder="Buscar categoría"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          sx={{
            mb: 2,
            width: {
              xs: "100%",
              sm: "250px",
            },
          }}
        />
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
                minWidth: { xs: "650px", md: "100%" },
                tableLayout: "fixed",
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: 700, width: isFull ? "20%" : "25%" }}
                  >
                    Categoría
                  </TableCell>

                  <TableCell
                    sx={{ fontWeight: 700, width: isFull ? "30%" : "35%" }}
                  >
                    Descripción
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      width: "12%",
                      whiteSpace: "nowrap",
                    }}
                    align="center"
                  >
                    Documentos
                  </TableCell>

                  {isFull && (
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        width: "14%",
                        whiteSpace: "nowrap",
                      }}
                      align="center"
                    >
                      Fecha de creación
                    </TableCell>
                  )}

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      width: isFull ? "12%" : "13%",
                      whiteSpace: "nowrap",
                    }}
                    align="center"
                  >
                    Estado
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      width: isFull ? "12%" : "15%",
                      whiteSpace: "nowrap",
                    }}
                    align="center"
                  >
                    Acciones
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

                    <TableCell align="center">{category.documentos}</TableCell>

                    {isFull && (
                      <TableCell align="center">
                        {formatDate(category.fecha_creacion)}
                      </TableCell>
                    )}

                    <TableCell align="center">
                      <Chip
                        label={category.activo === 1 ? "Activa" : "Inactiva"}
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
                          minWidth: category.activo === 0 ? 78 : 64,
                          justifyContent: "center",
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ justifyContent: "center" }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleEditCategory(category)}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>

                        {/* <IconButton size="small" color="error">
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </IconButton> */}
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
              page={page}
              onChange={(event, value) => setPage(value)}
              size="small"
              shape="rounded"
            />
          </Stack>
        )}
      </Card>
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
      <NotificationSnackbar
        notification={notification}
        onClose={closeNotification}
      />
    </>
  );
}
