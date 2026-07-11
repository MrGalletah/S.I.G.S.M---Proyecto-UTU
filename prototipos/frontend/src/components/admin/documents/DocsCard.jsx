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
import { useMemo, useState } from "react";

import { createDummyDocuments } from "../../../mockData/documents";
import PdfSvg from "../../utils/PdfSvg";


export default function DocsCard({ variant }) {
  const documents = useMemo(() => createDummyDocuments(), []);

  const isFull = variant === "full";
  const rowsPerPage = isFull ? 15 : 4;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filteredDocuments = documents.filter((documentItem) => {
    const searchText = search.toLowerCase();

    return (
      documentItem.document.toLowerCase().includes(searchText) ||
      documentItem.category.toLowerCase().includes(searchText) ||
      documentItem.uploadedAt.toLowerCase().includes(searchText) ||
      documentItem.state.toLowerCase().includes(searchText)
    );
  });

  const totalPages = Math.ceil(filteredDocuments.length / rowsPerPage);

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const visibleDocuments = filteredDocuments.slice(startIndex, endIndex);

  const showPagination = filteredDocuments.length > rowsPerPage;
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
            Documentos
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "var(--text-muted-color)",
            }}
          >
            Añade nuevos documentos y gestiona los existentes
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
          Añadir documento
        </Button>
      </Stack>

      <TextField
        size="small"
        placeholder="Buscar documento"
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
                sx={{ fontWeight: 700, width: isFull ? "30%" : "35%" }}
              >
                Documento
              </TableCell>

              <TableCell
                sx={{ fontWeight: 700, width: isFull ? "20%" : "20%" }}
              >
                Categoría
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,
                  width: "15%",
                  whiteSpace: "nowrap",
                }}
                align="center"
              >
                Fecha de subida
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
            {visibleDocuments.map((documentItem) => (
              <TableRow key={documentItem.id}>
                <TableCell>
                  <Box sx={{ display: "flex",alignItems: "center", gap: 2 }}>
                    <PdfSvg />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {documentItem.document}
                  </Typography>
                  </Box>
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
                    {documentItem.category}
                  </Typography>
                </TableCell>

                <TableCell align="center">{documentItem.uploadedAt}</TableCell>

                <TableCell align="center">
                  <Chip
                    label={documentItem.state}
                    size="small"
                    sx={{
                      bgcolor:
                        documentItem.state === "Activo"
                          ? "var(--primary-color)"
                          : "var(--inactive-chip)",
                      color:
                        documentItem.state === "Activo"
                          ? "var(--white-color)"
                          : "var(--text-main-color)",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      minWidth: documentItem.state === "Inactiva" ? 78 : 64,
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
