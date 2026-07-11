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
  Typography,
  Tooltip,
} from "@mui/material";

import StatCard from "../../utils/StatCard";
import TransferDetailsCard from "../../utils/TransferDetailsCard";

import SearchIcon from "@mui/icons-material/Search";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useMemo, useState } from "react";

import { createDummyTransfers, cardsData } from "../../../mockData/transfers";

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
