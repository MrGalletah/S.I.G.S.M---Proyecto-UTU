import { useTranslation } from "react-i18next";

import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";

// SELECT REUTILIZABLE

function FilterSelect({ label, value, onChange, options }) {
  return (
    <TextField
      select
      fullWidth
      size="small"
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
        },
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

// FILTROS DE SEGUIMIENTO

export default function TransferFilters({
  search,
  onSearchChange,
  filters,
  onFilterChange,
  total,
  filteredCount,
  onClear,
  hasActiveFilters,
  refreshControl,
}) {
  const { t } = useTranslation("transfers");

  // ESTADOS
  // Los valores originales se mantienen para los filtros.

  const stateOptions = [
    {
      value: "",
      label: t("followUp.filters.allStates"),
    },
    {
      value: "Registrado",
      label: t("states.Registrado"),
    },
    {
      value: "En camino",
      label: t("states.En camino"),
    },
    {
      value: "Llegó al destino",
      label: t("states.Llegó al destino"),
    },
    {
      value: "Retornando",
      label: t("states.Retornando"),
    },
    {
      value: "Cancelado",
      label: t("states.Cancelado"),
    },
  ];

  // PRIORIDADES

  const priorityOptions = [
    {
      value: "",
      label: t("followUp.filters.allPriorities"),
    },
    {
      value: "Urgente",
      label: t("priorities.Urgente"),
    },
    {
      value: "Normal",
      label: t("priorities.Normal"),
    },
  ];

  // ASIGNACIÓN

  const assignmentOptions = [
    {
      value: "",
      label: t("followUp.filters.allTransfers"),
    },
    {
      value: "pendientes",
      label: t("followUp.filters.pending"),
    },
    {
      value: "asignados",
      label: t("followUp.filters.assigned"),
    },
  ];

  // FECHAS

  const dateOptions = [
    {
      value: "",
      label: t("followUp.filters.allDates"),
    },
    {
      value: "hoy",
      label: t("followUp.filters.today"),
    },
    {
      value: "manana",
      label: t("followUp.filters.tomorrow"),
    },
    {
      value: "semana",
      label: t("followUp.filters.nextSevenDays"),
    },
  ];

  return (
    <>
      {/* CABECERA Y BUSCADOR */}

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          width: "100%",
          alignItems: {
            xs: "stretch",
            md: "center",
          },
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {t("followUp.filters.title")}
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            {t("followUp.filters.description")}
          </Typography>
        </Box>

        {/* BÚSQUEDA */}
        <Stack direction={"row"} spacing={2}>
          <TextField
            size="small"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("followUp.filters.search")}
            sx={{
              width: {
                xs: "100%",
                md: 365,
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        color: "text.secondary",
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />
          {refreshControl}
        </Stack>
      </Stack>

      {/* FILTROS */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1.5,
          mt: 3,
        }}
      >
        {/* ESTADO */}

        <FilterSelect
          label={t("followUp.filters.state")}
          value={filters.estado}
          onChange={(value) => onFilterChange("estado", value)}
          options={stateOptions}
        />

        {/* PRIORIDAD */}

        <FilterSelect
          label={t("followUp.filters.priority")}
          value={filters.prioridad}
          onChange={(value) => onFilterChange("prioridad", value)}
          options={priorityOptions}
        />

        {/* ASIGNACIÓN */}

        <FilterSelect
          label={t("followUp.filters.assignment")}
          value={filters.asignacion}
          onChange={(value) => onFilterChange("asignacion", value)}
          options={assignmentOptions}
        />

        {/* FECHA REQUERIDA */}

        <FilterSelect
          label={t("followUp.filters.requiredDate")}
          value={filters.fecha}
          onChange={(value) => onFilterChange("fecha", value)}
          options={dateOptions}
        />
      </Box>

      {/* RESULTADOS Y LIMPIAR FILTROS */}

      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          mt: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          {t("followUp.filters.count", {
            filtered: filteredCount,
            total,
          })}
        </Typography>

        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<FilterAltOffOutlinedIcon />}
            onClick={onClear}
            sx={{
              textTransform: "none",
              color: "text.secondary",
            }}
          >
            {t("followUp.filters.clear")}
          </Button>
        )}
      </Stack>
    </>
  );
}
