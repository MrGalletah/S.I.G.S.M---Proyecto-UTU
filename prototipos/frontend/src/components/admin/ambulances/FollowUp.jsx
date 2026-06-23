import {
  Box,
  Card,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
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
  Tooltip,
} from "@mui/material";

import StatCard from "../../utils/StatCard";
import TransferDetailsCard from "../../utils/TransferDetailsCard";

import TaskAltIcon from "@mui/icons-material/TaskAlt";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import SearchIcon from "@mui/icons-material/Search";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { useMemo, useState } from "react";




const cardsData = [
  {
    label: "Traslados activos",
    icon: (
      <SvgIcon>
        <svg
          viewBox="0 0 17 17"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          fill="#0F7C71"
          stroke="#0F7C71"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <path
              d="M14.33 8l-1.876-4.377-3.438 9.783-4.015-13.11-2.37 7.704h-2.631v1h3.369l1.63-5.296 3.95 12.903 3.597-10.23 1.124 2.623h3.33v-1z"
              fill="#000000"
            ></path>{" "}
          </g>
        </svg>
      </SvgIcon>
    ),
    value: 12,
    subtitle: "En proceso actualmente",
    colors: {
      background: "#E3F5F3",
      text: "#0F7C71",
    },
  },

  {
    label: "Completados hoy",
    icon: <TaskAltIcon />,
    value: 5,
    subtitle: undefined,
    colors: {
      background: "#E3F5F3",
      text: "#0F7C71",
    },
  },
  {
    label: "Urgentes",
    icon: <NotificationImportantIcon />,
    value: 2,
    subtitle: undefined,
    colors: {
      background: "#FDE2E2",
      text: "#DE040A",
    },
  },
];

function createDummyTransfers() {
  const currentYear = new Date().getFullYear();

  const elements = [
    "María Gómez",
    "Juan Pérez",
    "Camilla con paciente",
    "Muestra de laboratorio",
    "Equipo médico",
    "Paciente pediátrico",
    "Silla de ruedas",
    "Paciente UCI",
    "Insumos quirúrgicos",
    "Paciente ambulatorio",
    "Bolsa de sangre",
    "Medicamento urgente",
    "Historia clínica",
    "Paciente postoperatorio",
    "Oxígeno portátil",
  ];

  const origins = [
    "Hospital de Clínicas",
    "Emergencia",
    "UCI",
    "Pediatría",
    "Laboratorio",
    "Quirófano",
    "Imagenología",
    "Cardiología",
    "Oncología",
    "Farmacia",
  ];

  const destinations = [
    "Islas Canarias 1234",
    "Sanatorio Central",
    "Clínica del Sol",
    "Hospital Pasteur",
    "Laboratorio externo",
    "Centro de Imagenología",
    "Domicilio del paciente",
    "Banco de Sangre",
    "Hospital Maciel",
    "Mutualista Norte",
  ];

  const states = [
    "Registrado",
    "En camino",
    "Llegó al destino",
    "Retornando",
    "Completado",
  ];

  const drivers = [
    "Laura Martínez",
    "Carlos Rodríguez",
    "Pedro Silva",
    "Ana Fernández",
    "Luis Pereira",
    "Sofía Castro",
    "Miguel Torres",
    "Valentina Núñez",
  ];

  const companions = [
    "Ambulancia A-01",
    "Enfermero Javier",
    "Dra. Patricia López",
    "Aux. Camila Díaz",
    "Téc. Marcos Ruiz",
    "Paramédico Andrés",
    "Sin acompañante",
  ];

  const ambulances = [
    "Ambulancia A-01",
    "Ambulancia A-02",
    "Ambulancia A-03",
    "Ambulancia B-01",
    "Ambulancia B-02",
    "Ambulancia C-01",
  ];

  const getRandomItem = (array) =>
    array[Math.floor(Math.random() * array.length)];

  const getTime = (index, baseHour = 8) => {
    const hour = baseHour + Math.floor(index / 2);
    const minutes = index % 2 === 0 ? "00" : "30";

    return `${String(hour).padStart(2, "0")}:${minutes}`;
  };

  return Array.from({ length: 25 }, (_, index) => {
    const id = index + 1;
    const horaSalida = getTime(index, 8);

    return {
      id,
      codigo: `TR-${currentYear}-${String(id).padStart(3, "0")}`,
      elemento: getRandomItem(elements),
      origen: getRandomItem(origins),
      destino: getRandomItem(destinations),
      horaSalida,
      estado: getRandomItem(states),
      prioridad: index % 7 === 0 ? "Urgente" : "Normal",
      conductor: getRandomItem(drivers),
      acompanante: getRandomItem(companions),
      ambulancia: getRandomItem(ambulances),
      horaEstimadaSalida: getTime(index + 1, 8),
      actions: ["view", "edit", "delete"],
    };
  });
}

export default function FollowUp() {
  const transfers = useMemo(() => createDummyTransfers(), []);
  const rowsPerPage = 5;

  const [page, setPage] = useState(1);
  const [selectedTransferId, setSelectedTransferId] = useState(1);

  const selectedTransfer =
    transfers.find((transfer) => transfer.id === selectedTransferId) ??
    transfers[0];

  const totalPages = Math.ceil(transfers.length / rowsPerPage);

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const visibleTransfers = transfers.slice(startIndex, endIndex);

  const showPagination = transfers.length > rowsPerPage;

  return (
    <>
      <Stack
        direction={"row"}
        spacing={2}
        sx={{
          flexWrap: "wrap",
          mt: 2,
          display: {
            md: "flex",
            xs: "none",
          },
          // justifyContent: "space-evenly"
        }}
      >
        {cardsData.map((item) => {
          return <StatCard key={item.label} item={item} colors={item.colors} />;
        })}
      </Stack>
      <Card
        sx={{
          borderRadius: 4,
          p: 3,
          boxShadow: "var(--card-shadow)",
          minWidth: 0,
          overflow: "hidden",
          mt: 2,
        }}
      >
        <Stack
          direction={"row"}
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Traslados en curso
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 3,
            }}
          >
            <TextField
              placeholder="Buscar traslado, paciente o código"
              size="small"
              sx={{
                width: { lg: 350, md: 250 },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <FormControl size="small" sx={{ width: 125 }}>
              <InputLabel id="filters">Filtros</InputLabel>
              <Select labelId="filters" id="filtersSelect">
                <MenuItem value={0}>Ninguno</MenuItem>
                <MenuItem value={1}>Agrupar por estado</MenuItem>
                <MenuItem value={2}>Agrupar por prioridad</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>

        <TableContainer
          sx={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            overflowX: "auto",
            overflowY: "hidden",
            mt: 3,

            "&::-webkit-scrollbar": {
              height: 8,
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "rgba(0,0,0,0.25)",
              borderRadius: 999,
            },
          }}
        >
          <Table
            size="small"
            sx={{
              minWidth: {
                xs: 850,
                sm: 950,
                md: 1000,
                lg: "100%",
              },
              tableLayout: "fixed",
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: 90 }}>
                  Código
                </TableCell>

                <TableCell sx={{ fontWeight: 700, width: 160 }}>
                  Paciente / Elemento
                </TableCell>

                <TableCell sx={{ fontWeight: 700, width: 150 }}>
                  Origen
                </TableCell>

                <TableCell sx={{ fontWeight: 700, width: 150 }}>
                  Destino
                </TableCell>

                <TableCell
                  align="center"
                  sx={{ fontWeight: 700, width: 130, whiteSpace: "nowrap" }}
                >
                  Hora de salida
                </TableCell>

                <TableCell
                  align="center"
                  sx={{ fontWeight: 700, width: 140, whiteSpace: "nowrap" }}
                >
                  Estado
                </TableCell>

                <TableCell sx={{ fontWeight: 700, width: 120 }}>
                  Prioridad
                </TableCell>

                <TableCell
                  align="center"
                  sx={{ fontWeight: 700, width: 130, whiteSpace: "nowrap" }}
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {visibleTransfers.map((transfer) => (
                <TableRow
                  key={transfer.id}
                  selected={selectedTransferId === transfer.id}
                  sx={{
                    "&.Mui-selected": {
                      bgcolor: "rgba(15, 124, 113, 0.08)",
                    },
                    "&.Mui-selected:hover": {
                      bgcolor: "rgba(15, 124, 113, 0.12)",
                    },
                  }}
                >
                  <TableCell>{transfer.codigo}</TableCell>
                  <TableCell>{transfer.elemento}</TableCell>
                  <TableCell>{transfer.origen}</TableCell>
                  <TableCell>{transfer.destino}</TableCell>
                  <TableCell align="center">{transfer.horaSalida}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={transfer.estado}
                      size="small"
                      sx={{
                        bgcolor:
                          transfer.estado === "En camino"
                            ? "var(--primary-color)"
                            : transfer.estado === "Llegó al destino"
                              ? "var(--green-chip)"
                              : transfer.estado === "Retornando"
                                ? "var(--organe-chip)"
                                : transfer.estado === "Registrado"
                                  ? "var(--violet-chip)"
                                  : "var(--inactive-chip)",
                        color:
                          transfer.estado === "En camino" ||
                          transfer.estado === "Llegó al destino" ||
                          transfer.estado === "Retornando"
                            ? "var(--white-color)"
                            : "var(--text-main-color)",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        minWidth: transfer.estado === "Inactiva" ? 78 : 64,
                        justifyContent: "center",
                        borderRadius: 2,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transfer.prioridad}
                      size="small"
                      sx={{
                        bgcolor:
                          transfer.prioridad === "Urgente"
                            ? "var(--warning)"
                            : "var(--green-chip)",
                        color: "var(--white-color)",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        justifyContent: "center",
                        borderRadius: 2,
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

                      <Tooltip title="Ver detalle">
                        <IconButton
                          size="small"
                          onClick={() => setSelectedTransferId(transfer.id)}
                        >
                          <RemoveRedEyeIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

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
      <TransferDetailsCard transfer={selectedTransfer} />
    </>
  );
}
