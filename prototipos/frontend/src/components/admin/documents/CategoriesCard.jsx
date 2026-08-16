import {
  Box,
  Button,
  Card,
  Chip,
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
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useEffect, useMemo, useState } from "react";

import { createDummyCategories } from "../../../mockData/categories";
import { useOutletContext } from "react-router";
import { getAllCategories } from "../../../apiCalls/categories/categoriesApi";
import { formatDate } from "../../utils/formatDate";

export default function CategoriesCard({ variant }) {
  const { user } = useOutletContext();

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // setLoading(true);
        // setError("");

        const data = await getAllCategories();
        console.log(data.categorias);

        setCategories(data.categorias);
      } catch (error) {
        // setError(error.message);
      } finally {
        // setLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log(user);
  console.log(categories);

  const isFull = variant === "full";
  const rowsPerPage = isFull ? 15 : 4;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filteredCategories = categories.filter((category) => {
    const searchText = search.toLowerCase();

    return (
      category.nombre.toLowerCase().includes(searchText) ||
      category.descripcion.toLowerCase().includes(searchText) ||
      category.activo.toLowerCase().includes(searchText)
    );
  });

  const totalPages = Math.ceil(filteredCategories.length / rowsPerPage);

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const visibleCategories = filteredCategories.slice(startIndex, endIndex);

  const showPagination = filteredCategories.length > rowsPerPage;

  return (
    <Card
      sx={{
        borderRadius: 4,
        p: 3,
        boxShadow: "var(--card-shadow)",
        minWidth: 0,
        overflow: "hidden",
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
          onClick={() => setCategoryModalOpen(true)}
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
              <TableRow key={category.id}>
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
                  <Typography variant="body2">
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
                    <IconButton size="small">
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>

                    <IconButton size="small" color="error">
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && (
        <Stack
          direction="row"
          sx={{
            justifyContent: "center",
            mt: 2,
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
  );
}
