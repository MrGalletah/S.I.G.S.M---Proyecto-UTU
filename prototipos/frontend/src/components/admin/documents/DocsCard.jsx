import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Pagination,
  Stack,
  SvgIcon,
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

function createDummyDocuments() {
  const documentNames = [
    "Protocolo terapéutico de uso de vasopresina",
    "Indicaciones para tratamiento con warfarina",
    "Preparación para estudios imagenológicos",
    "Indicaciones ecocardiograma con dobutamina",
    "Indicaciones ecocardiograma transesofágico",
    "Ingreso a centro de nefrología y trasplante",
    "Plan de alta de enfermería",
    "Prevención de infecciones",
    "Pauta para pacientes ostomizados",
    "Prostatectomía radical",
    "Centellograma de perfusión miocárdica",
    "Indicaciones para usuarios trasplantados",
    "Estudios diagnósticos con pertecneciato",
    "Información general para pacientes",
    "Cuidados posteriores al alta",
    "Recomendaciones preoperatorias",
    "Guía de alimentación hospitalaria",
    "Información sobre medicamentos",
    "Cuidados paliativos para pacientes",
    "Indicaciones de laboratorio",
  ];

  const categories = [
    "Anestesiología",
    "Cardiología",
    "Nefrología",
    "Imagenología",
    "Oncología",
    "Trasplantes",
    "Enfermería",
    "Emergencia",
    "Cirugía",
    "Medicina general",
  ];

  return documentNames.map((name, index) => ({
    id: index + 1,
    document: name,
    category: categories[index % categories.length],
    uploadedAt: `${String((index % 28) + 1).padStart(2, "0")}/05/2026`,
    state: index % 6 === 0 ? "Inactivo" : "Activo",
    actions: ["qr", "edit", "delete"],
  }));
}

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
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <SvgIcon>
                      <svg
                        viewBox="0 0 400 400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="red"
                      >
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                          {" "}
                          <defs></defs> <title></title>{" "}
                          <g id="xxx-word">
                            {" "}
                            <path
                              class="cls-1"
                              d="M325,105H250a5,5,0,0,1-5-5V25a5,5,0,0,1,10,0V95h70a5,5,0,0,1,0,10Z"
                            ></path>{" "}
                            <path
                              class="cls-1"
                              d="M325,154.83a5,5,0,0,1-5-5V102.07L247.93,30H100A20,20,0,0,0,80,50v98.17a5,5,0,0,1-10,0V50a30,30,0,0,1,30-30H250a5,5,0,0,1,3.54,1.46l75,75A5,5,0,0,1,330,100v49.83A5,5,0,0,1,325,154.83Z"
                            ></path>{" "}
                            <path
                              class="cls-1"
                              d="M300,380H100a30,30,0,0,1-30-30V275a5,5,0,0,1,10,0v75a20,20,0,0,0,20,20H300a20,20,0,0,0,20-20V275a5,5,0,0,1,10,0v75A30,30,0,0,1,300,380Z"
                            ></path>{" "}
                            <path
                              class="cls-1"
                              d="M275,280H125a5,5,0,0,1,0-10H275a5,5,0,0,1,0,10Z"
                            ></path>{" "}
                            <path
                              class="cls-1"
                              d="M200,330H125a5,5,0,0,1,0-10h75a5,5,0,0,1,0,10Z"
                            ></path>{" "}
                            <path
                              class="cls-1"
                              d="M325,280H75a30,30,0,0,1-30-30V173.17a30,30,0,0,1,30-30h.2l250,1.66a30.09,30.09,0,0,1,29.81,30V250A30,30,0,0,1,325,280ZM75,153.17a20,20,0,0,0-20,20V250a20,20,0,0,0,20,20H325a20,20,0,0,0,20-20V174.83a20.06,20.06,0,0,0-19.88-20l-250-1.66Z"
                            ></path>{" "}
                            <path
                              class="cls-1"
                              d="M145,236h-9.61V182.68h21.84q9.34,0,13.85,4.71a16.37,16.37,0,0,1-.37,22.95,17.49,17.49,0,0,1-12.38,4.53H145Zm0-29.37h11.37q4.45,0,6.8-2.19a7.58,7.58,0,0,0,2.34-5.82,8,8,0,0,0-2.17-5.62q-2.17-2.34-7.83-2.34H145Z"
                            ></path>{" "}
                            <path
                              class="cls-1"
                              d="M183,236V182.68H202.7q10.9,0,17.5,7.71t6.6,19q0,11.33-6.8,18.95T200.55,236Zm9.88-7.85h8a14.36,14.36,0,0,0,10.94-4.84q4.49-4.84,4.49-14.41a21.91,21.91,0,0,0-3.93-13.22,12.22,12.22,0,0,0-10.37-5.41h-9.14Z"
                            ></path>{" "}
                            <path
                              class="cls-1"
                              d="M245.59,236H235.7V182.68h33.71v8.24H245.59v14.57h18.75v8H245.59Z"
                            ></path>{" "}
                          </g>{" "}
                        </g>
                      </svg>
                    </SvgIcon>
                    {documentItem.document}
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
