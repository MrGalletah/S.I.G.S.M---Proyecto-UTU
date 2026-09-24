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

import SearchIcon from "@mui/icons-material/Search";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

function formatTime(dateTime) {
  if (!dateTime) {
    return "-";
  }

  const normalized = dateTime.replace(" ", "T");

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return dateTime;
  }

  return date.toLocaleTimeString("es-UY", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTransferSubject(transfer) {
  if (transfer.tipoElemento === "Paciente") {
    return transfer.cedulaPaciente || "-";
  }

  return transfer.elemento || "-";
}

export default function TransfersCard({
  visibleTransfers,
  selectedTransferId,
  setSelectedTransferId,
  setEditTransferId,
  showPagination,
  totalPages,
  page,
  setPage,
}) {
  return (
    <>
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
        {/* CABECERA */}

        <Stack
          direction="row"
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
            {/* BUSCADOR */}

            <TextField
              placeholder="Buscar traslado, paciente o código"
              size="small"
              sx={{
                width: {
                  lg: 350,
                  md: 250,
                },
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

            {/* FILTROS */}

            <FormControl
              size="small"
              sx={{
                width: 125,
              }}
            >
              <InputLabel id="filters">Filtros</InputLabel>

              <Select
                labelId="filters"
                id="filtersSelect"
                label="Filtros"
                defaultValue={0}
              >
                <MenuItem value={0}>Ninguno</MenuItem>

                <MenuItem value={1}>Agrupar por estado</MenuItem>

                <MenuItem value={2}>Agrupar por prioridad</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>

        {/* TABLA */}

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
            {/* CABECERA TABLA */}

            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    width: 90,
                  }}
                >
                  Código
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700,
                    width: 160,
                  }}
                >
                  Paciente / Elemento
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700,
                    width: 150,
                  }}
                >
                  Origen
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700,
                    width: 150,
                  }}
                >
                  Destino
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700,
                    width: 130,
                    whiteSpace: "nowrap",
                  }}
                >
                  Hora de salida
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700,
                    width: 140,
                    whiteSpace: "nowrap",
                  }}
                >
                  Estado
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700,
                    width: 120,
                  }}
                >
                  Prioridad
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700,
                    width: 130,
                    whiteSpace: "nowrap",
                  }}
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            {/* CUERPO TABLA */}

            <TableBody>
              {visibleTransfers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{
                      py: 5,
                      color: "text.secondary",
                    }}
                  >
                    No hay traslados activos.
                  </TableCell>
                </TableRow>
              ) : (
                visibleTransfers.map((transfer) => (
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
                    {/* CÓDIGO */}

                    <TableCell>{transfer.codigo}</TableCell>

                    {/* PACIENTE / ELEMENTO */}

                    <TableCell>{getTransferSubject(transfer)}</TableCell>

                    {/* ORIGEN */}

                    <TableCell>{transfer.origen}</TableCell>

                    {/* DESTINO */}

                    <TableCell>{transfer.destino}</TableCell>

                    {/* HORA SALIDA */}

                    <TableCell align="center">
                      {formatTime(transfer.horaSalidaEstimada)}
                    </TableCell>

                    {/* ESTADO */}

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
                          justifyContent: "center",

                          borderRadius: 2,
                        }}
                      />
                    </TableCell>

                    {/* PRIORIDAD */}

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

                    {/* ACCIONES */}

                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          justifyContent: "center",
                        }}
                      >
                        <Tooltip title="Gestionar traslado">
                          <IconButton
                            size="small"
                            onClick={() => setEditTransferId(transfer.id)}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Ver detalle">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedTransferId(transfer.id)}
                          >
                            <RemoveRedEyeIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Anular solicitud">
                          <IconButton size="small" color="error">
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* PAGINACIÓN */}

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
    </>
  );
}
