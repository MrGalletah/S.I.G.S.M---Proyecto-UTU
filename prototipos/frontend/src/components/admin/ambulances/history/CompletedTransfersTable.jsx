import { useTranslation } from "react-i18next";

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
  if (!value) return "-";

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

// TABLA DEL HISTORIAL

export default function CompletedTransfersTable({
  transfers,
  page,
  totalPages,
  onPageChange,
  onView,
}) {
  const { t } = useTranslation("transfers");

  // TRADUCIR PRIORIDAD SIN CAMBIAR EL DATO

  const translatePriority = (priority) =>
    t(`priorities.${priority}`, {
      defaultValue: priority ?? "-",
    });

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
          {/* CABECERA */}

          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 700,
                  width: 95,
                }}
              >
                {t("history.table.code")}
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,
                  width: 160,
                }}
              >
                {t("history.table.subject")}
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,
                  width: 165,
                }}
              >
                {t("history.table.origin")}
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,
                  width: 165,
                }}
              >
                {t("history.table.destination")}
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,
                  width: 130,
                }}
              >
                {t("history.table.requiredDate")}
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,
                  width: 120,
                }}
              >
                {t("history.table.completedAt")}
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,
                  width: 110,
                }}
              >
                {t("history.table.priority")}
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  fontWeight: 700,
                  width: 90,
                }}
              >
                {t("history.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>

          {/* CUERPO */}

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
                  {t("history.table.empty")}
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

                  {/* FECHA DE FINALIZACIÓN */}

                  <TableCell>
                    <FinalizationDate value={transfer.fechaFinalizacion} />
                  </TableCell>

                  {/* PRIORIDAD */}

                  <TableCell>
                    <Chip
                      label={translatePriority(transfer.prioridad)}
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
                    <Tooltip title={t("history.table.viewDetail")}>
                      <IconButton
                        size="small"
                        aria-label={t("history.table.viewDetail")}
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
            onChange={(_, value) => onPageChange(value)}
            size="small"
            shape="rounded"
          />
        </Stack>
      )}
    </>
  );
}
