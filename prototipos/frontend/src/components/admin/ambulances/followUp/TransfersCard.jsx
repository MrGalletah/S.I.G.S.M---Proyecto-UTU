import {
  Box,
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
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";

import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import TransferFilters from "./TransferFilters";

// COLORES DESDE LAS VARIABLES GLOBALES

const stateColors = {
  Registrado: ["var(--state-registered-bg)", "var(--state-registered-text)"],
  "En camino": ["var(--state-on-route-bg)", "var(--state-on-route-text)"],
  "Llegó al destino": ["var(--state-arrived-bg)", "var(--state-arrived-text)"],
  Retornando: ["var(--state-returning-bg)", "var(--state-returning-text)"],
  Completado: ["var(--state-completed-bg)", "var(--state-completed-text)"],
};

const priorityColors = {
  Urgente: ["var(--priority-urgent-bg)", "var(--priority-urgent-text)"],
  Normal: ["var(--priority-normal-bg)", "var(--priority-normal-text)"],
};

// FECHA Y HORA

function DateCell({ value }) {
  if (!value) return "-";

  const text = String(value);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return text;

  const [, year, month, day] = match;
  const time = text.match(/[T ](\d{2}:\d{2})/)?.[1];

  return (
    <Box>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        {day}/{month}/{year}
      </Typography>

      {time && (
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
          {time}
        </Typography>
      )}
    </Box>
  );
}

// CHIP DE ESTADO O PRIORIDAD

function TransferChip({ label, colors }) {
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: colors?.[0] ?? "var(--inactive-chip)",
        color: colors?.[1] ?? "var(--text-main-color)",
        fontWeight: 700,
        borderRadius: 2,
        height: 27,
      }}
    />
  );
}

// ENCABEZADO ORDENABLE

function SortHeader({ label, field, width, sort, onSortChange }) {
  return (
    <TableCell
      sx={{
        fontWeight: 700,
        width,
        whiteSpace: "nowrap",
      }}
    >
      <TableSortLabel
        active={sort.key === field}
        direction={sort.key === field ? sort.direction : "asc"}
        onClick={() => onSortChange(field)}
        sx={{
          fontWeight: 700,
          "&.Mui-active": {
            color: "var(--primary-color)",
          },
          "&.Mui-active .MuiTableSortLabel-icon": {
            color: "var(--primary-color) !important",
          },
        }}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );
}

export default function TransfersCard({
  visibleTransfers,
  totalTransfers,
  filteredCount,
  selectedTransferId,
  setEditTransferId,
  onViewTransfer,
  page,
  setPage,
  totalPages,
  rowsPerPage,
  search,
  onSearchChange,
  filters,
  onFilterChange,
  sort,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
  onCancelTransfer,
}) {
  const headers = [
    ["Código", "codigo", 95],
    ["Fecha requerida", "fechaRequerida", 145],
    ["Salida estimada", "horaSalidaEstimada", 145],
    ["Estado", "estado", 165],
    ["Prioridad", "prioridad", 110],
  ];

  const sortHeader = (index) => {
    const [label, field, width] = headers[index];

    return (
      <SortHeader
        key={field}
        label={label}
        field={field}
        width={width}
        sort={sort}
        onSortChange={onSortChange}
      />
    );
  };

  return (
    <Card
      sx={{
        borderRadius: 4,
        p: { xs: 2, md: 3 },
        boxShadow: "var(--card-shadow)",
        minWidth: 0,
        overflow: "hidden",
        mt: 2,
      }}
    >
      {/* BUSCADOR Y FILTROS */}

      <TransferFilters
        search={search}
        onSearchChange={onSearchChange}
        filters={filters}
        onFilterChange={onFilterChange}
        total={totalTransfers}
        filteredCount={filteredCount}
        onClear={onClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* TABLA */}

      <TableContainer
        sx={{
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          mt: 1.5,
          "&::-webkit-scrollbar": { height: 8 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(0,0,0,0.25)",
            borderRadius: 999,
          },
        }}
      >
        <Table
          size="small"
          sx={{
            minWidth: 1230,
            tableLayout: "fixed",
          }}
        >
          {/* CABECERA */}

          <TableHead sx={{ bgcolor: "#F8FAFC" }}>
            <TableRow>
              {sortHeader(0)}

              <TableCell sx={{ fontWeight: 700, width: 155 }}>
                Paciente / Elemento
              </TableCell>

              <TableCell sx={{ fontWeight: 700, width: 145 }}>Origen</TableCell>

              <TableCell sx={{ fontWeight: 700, width: 145 }}>
                Destino
              </TableCell>

              {sortHeader(1)}
              {sortHeader(2)}
              {sortHeader(3)}
              {sortHeader(4)}

              <TableCell align="center" sx={{ fontWeight: 700, width: 125 }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          {/* CUERPO */}

          <TableBody>
            {visibleTransfers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  align="center"
                  sx={{ py: 6, color: "text.secondary" }}
                >
                  {totalTransfers === 0
                    ? "No hay traslados activos."
                    : "No se encontraron traslados con los filtros seleccionados."}
                </TableCell>
              </TableRow>
            ) : (
              visibleTransfers.map((transfer) => (
                <TableRow
                  key={transfer.id}
                  hover
                  selected={selectedTransferId === transfer.id}
                  sx={{
                    "&.Mui-selected": {
                      bgcolor: "rgba(15, 124, 113, 0.08)",
                    },
                    "&.Mui-selected:hover": {
                      bgcolor: "rgba(15, 124, 113, 0.12)",
                    },
                    "& td": { py: 1.5 },
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {transfer.codigo}
                  </TableCell>

                  <TableCell>
                    {transfer.tipoElemento === "Paciente"
                      ? transfer.cedulaPaciente || "-"
                      : transfer.elemento || "-"}
                  </TableCell>

                  <TableCell>{transfer.origen}</TableCell>
                  <TableCell>{transfer.destino}</TableCell>

                  <TableCell>
                    <DateCell value={transfer.fechaRequerida} />
                  </TableCell>

                  <TableCell>
                    <DateCell value={transfer.horaSalidaEstimada} />
                  </TableCell>

                  <TableCell>
                    <TransferChip
                      label={transfer.estado}
                      colors={stateColors[transfer.estado]}
                    />
                  </TableCell>

                  <TableCell>
                    <TransferChip
                      label={transfer.prioridad}
                      colors={priorityColors[transfer.prioridad]}
                    />
                  </TableCell>

                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ justifyContent: "center" }}
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
                          onClick={() => onViewTransfer(transfer.id)}
                        >
                          <RemoveRedEyeIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {transfer.anulable && (
                        <Tooltip title="Anular solicitud">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onCancelTransfer(transfer)}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINACIÓN */}

      {filteredCount > rowsPerPage && (
        <Stack sx={{ alignItems: "center", mt: 2.5 }}>
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
