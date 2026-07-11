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
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useMemo, useState } from "react";
import { createDummyCategories } from "../../../mockData/categories";


export default function SurveysCard({ variant }) {
  const categories = useMemo(() => createDummyCategories(), []);

  const isFull = variant === "full";
  const rowsPerPage = isFull ? 15 : 5;

  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(categories.length / rowsPerPage);

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const visibleCategories = categories.slice(startIndex, endIndex);

  const showPagination = categories.length > rowsPerPage;

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
            Encuestas
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "var(--text-muted-color)",
            }}
          >
            Gestiona las encuestas
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
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
          Crear encuesta
        </Button>
      </Stack>

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
                Encuesta
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
                Respuestas
              </TableCell>

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
                    {category.cat}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {category.desc}
                  </Typography>
                </TableCell>

                <TableCell align="center">{category.docs}</TableCell>

                <TableCell align="center">
                  <Chip
                    label={category.state}
                    size="small"
                    sx={{
                      bgcolor:
                        category.state === "Activa"
                          ? "var(--primary-color)"
                          : "var(--inactive-chip)",
                      color:
                        category.state === "Activa"
                          ? "var(--white-color)"
                          : "var(--text-main-color)",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      minWidth: category.state === "Inactiva" ? 78 : 64,
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
