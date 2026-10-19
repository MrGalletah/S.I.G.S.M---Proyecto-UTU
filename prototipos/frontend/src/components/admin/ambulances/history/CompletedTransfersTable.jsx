import {
  Box,
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
  Tooltip,
  Typography,
} from "@mui/material";

import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";

import { formatDate } from "../../../utils/formatDate";

// PACIENTE O ELEMENTO

function getSubject(transfer) {
  if (transfer.tipoElemento === "Paciente") {
    return transfer.cedulaPaciente || "-";
  }

  return transfer.elemento || "-";
}

// FECHA Y HORA DE FINALIZACIÓN

function FinalizationDate({ value }) {
  if (!value) {
    return "-";
  }

  const normalized = String(value).replace("T", " ");

  const [date, time] = normalized.split(" ");

  return (
    <Box>
      <Typography
        sx={{
          fontSize: 13,

          fontWeight: 600,

          whiteSpace: "nowrap",
        }}
      >
        {formatDate(date)}
      </Typography>

      {time && (
        <Typography
          sx={{
            fontSize: 11,

            color: "text.secondary",
          }}
        >
          {time.slice(0, 5)}
        </Typography>
      )}
    </Box>
  );
}

export default function CompletedTransfersTable({
  transfers,
  page,
  totalPages,
  onPageChange,
  onView,
}) {
  return (
    <>
      <TableContainer
        sx={{
          mt: 3,

          width: "100%",

          maxWidth: "100%",

          overflowX: "auto",

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
            minWidth: 1000,

            tableLayout: "fixed",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 700,

                  width: 95,
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

                  width: 165,
                }}
              >
                Origen
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,

                  width: 165,
                }}
              >
                Destino
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,

                  width: 130,
                }}
              >
                Fecha requerida
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,

                  width: 120,
                }}
              >
                Finalizado
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,

                  width: 110,
                }}
              >
                Prioridad
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  fontWeight: 700,

                  width: 90,
                }}
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {transfers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  align="center"
                  sx={{
                    py: 6,

                    color: "text.secondary",
                  }}
                >
                  No se encontraron traslados completados.
                </TableCell>
              </TableRow>
            ) : (
              transfers.map((transfer) => (
                <TableRow key={transfer.id} hover>
                  {/* CÓDIGO */}

                  <TableCell>{transfer.codigo}</TableCell>

                  {/* PACIENTE / ELEMENTO */}

                  <TableCell>{getSubject(transfer)}</TableCell>

                  {/* ORIGEN */}

                  <TableCell>
                    <Typography
                      sx={{
                        fontSize: 13,

                        overflow: "hidden",

                        textOverflow: "ellipsis",

                        whiteSpace: "nowrap",
                      }}
                    >
                      {transfer.origen}
                    </Typography>
                  </TableCell>

                  {/* DESTINO */}

                  <TableCell>
                    <Typography
                      sx={{
                        fontSize: 13,

                        overflow: "hidden",

                        textOverflow: "ellipsis",

                        whiteSpace: "nowrap",
                      }}
                    >
                      {transfer.destino}
                    </Typography>
                  </TableCell>

                  {/* FECHA REQUERIDA */}

                  <TableCell>{formatDate(transfer.fechaRequerida)}</TableCell>

                  {/* FINALIZACIÓN */}

                  <TableCell>
                    <FinalizationDate value={transfer.fechaFinalizacion} />
                  </TableCell>

                  {/* PRIORIDAD */}

                  <TableCell>
                    <Chip
                      label={transfer.prioridad}
                      size="small"
                      sx={{
                        bgcolor:
                          transfer.prioridad === "Urgente"
                            ? "var(--priority-urgent-bg)"
                            : "var(--priority-normal-bg)",

                        color:
                          transfer.prioridad === "Urgente"
                            ? "var(--priority-urgent-text)"
                            : "var(--priority-normal-text)",

                        fontWeight: 700,

                        borderRadius: 2,
                      }}
                    />
                  </TableCell>

                  {/* ACCIONES */}

                  <TableCell align="center">
                    <Tooltip title="Ver detalle">
                      <IconButton
                        size="small"
                        onClick={() => onView(transfer.id)}
                      >
                        <RemoveRedEyeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINACIÓN */}

      {totalPages > 1 && (
        <Stack
          direction="row"
          sx={{
            justifyContent: "center",

            mt: 3,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => onPageChange(value)}
            size="small"
            shape="rounded"
          />
        </Stack>
      )}
    </>
  );
}
