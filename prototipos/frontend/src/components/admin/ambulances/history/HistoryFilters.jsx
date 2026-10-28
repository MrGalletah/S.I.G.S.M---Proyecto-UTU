import { useTranslation } from "react-i18next";

import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";

import RefreshButton from "../../../utils/RefreshButton";

// FECHA LOCAL DE HOY

function getToday() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// SELECT REUTILIZABLE DE RECURSOS

function ResourceSelect({
  label,
  value,
  onChange,
  options,
  disabled = false,
  allLabel,
}) {
  return (
    <FormControl size="small" fullWidth disabled={disabled}>
      <InputLabel>{label}</InputLabel>

      <Select
        value={value}
        label={label}
        onChange={(event) => onChange(event.target.value)}
      >
        <MenuItem value="">{allLabel}</MenuItem>

        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// FILTROS DEL HISTORIAL

export default function HistoryFilters({
  search,
  desde,
  hasta,
  idVehiculo,
  idConductor,
  idEnfermero,
  estado,

  vehicles,
  drivers,
  nurses,

  loadingResources,
  total,
  hasAppliedFilters,

  onSearchChange,
  onDesdeChange,
  onHastaChange,
  onVehicleChange,
  onDriverChange,
  onNurseChange,
  onEstadoChange,

  onSearch,
  onClear,

  refreshFetchData,
  refreshSetData,
  onRefreshSuccess,
  onRefreshError,
}) {
  const { t } = useTranslation("transfers");

  const today = getToday();

  // FILTROS PENDIENTES

  const hasDraftFilters =
    Boolean(search.trim()) ||
    Boolean(desde) ||
    Boolean(hasta) ||
    Boolean(idVehiculo) ||
    Boolean(idConductor) ||
    Boolean(idEnfermero) ||
    estado !== "todos";

  const showClearFilters = hasDraftFilters || hasAppliedFilters;

  // CATÁLOGOS

  const vehicleOptions = vehicles.map((vehicle) => ({
    value: vehicle.id_vehiculo,
    label: `${vehicle.matricula} - ${vehicle.modelo}`,
  }));

  const driverOptions = drivers.map((driver) => ({
    value: driver.id_func,
    label: driver.nombre,
  }));

  const nurseOptions = nurses.map((nurse) => ({
    value: nurse.id_func,
    label: nurse.nombre,
  }));

  // APLICAR FILTROS

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* ENCABEZADO Y BÚSQUEDA */}

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={1.5}
        sx={{
          justifyContent: "space-between",
          alignItems: {
            xs: "stretch",
            md: "center",
          },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            {t("history.filters.title")}
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            {t("history.filters.description")}
          </Typography>
        </Box>

        {/* BUSCADOR */}

        <TextField
          size="small"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("history.filters.search")}
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
      </Stack>

      {/* FILTROS */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
            xl: "repeat(6, minmax(0, 1fr))",
          },

          gap: 1.5,
          mt: 3,
          alignItems: "center",
        }}
      >
        {/* FECHA DESDE */}

        <TextField
          type="date"
          size="small"
          label={t("history.filters.finishedFrom")}
          value={desde}
          onChange={(event) => onDesdeChange(event.target.value)}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
            htmlInput: {
              max: hasta && hasta < today ? hasta : today,
            },
          }}
        />

        {/* FECHA HASTA */}

        <TextField
          type="date"
          size="small"
          label={t("history.filters.finishedTo")}
          value={hasta}
          onChange={(event) => onHastaChange(event.target.value)}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
            htmlInput: {
              min: desde || undefined,
              max: today,
            },
          }}
        />
        {/* ESTADO */}

        <TextField
          select
          size="small"
          fullWidth
          label={t("history.filters.status")}
          value={estado}
          onChange={(event) => onEstadoChange(event.target.value)}
        >
          <MenuItem value="todos">{t("history.filters.allStatuses")}</MenuItem>

          <MenuItem value="completados">
            {t("history.filters.completed")}
          </MenuItem>

          <MenuItem value="cancelados">
            {t("history.filters.cancelled")}
          </MenuItem>
        </TextField>

        {/* VEHÍCULO */}

        <ResourceSelect
          label={t("history.filters.vehicle")}
          value={idVehiculo}
          onChange={onVehicleChange}
          options={vehicleOptions}
          disabled={loadingResources}
          allLabel={t("history.filters.all")}
        />

        {/* CONDUCTOR */}

        <ResourceSelect
          label={t("history.filters.driver")}
          value={idConductor}
          onChange={onDriverChange}
          options={driverOptions}
          disabled={loadingResources}
          allLabel={t("history.filters.all")}
        />

        {/* ENFERMERO */}

        <ResourceSelect
          label={t("history.filters.nurse")}
          value={idEnfermero}
          onChange={onNurseChange}
          options={nurseOptions}
          disabled={loadingResources}
          allLabel={t("history.filters.all")}
        />

        {/* ACCIONES */}

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            gridColumn: {
              xs: "1 / -1",
            },
            justifyContent: {
              xs: "flex-start",
              xl: "flex-end",
            },
          }}
        >
          <Button
            type="submit"
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              height: 40,
              whiteSpace: "nowrap",
            }}
          >
            {t("history.filters.apply")}
          </Button>

          <RefreshButton
            fetchData={refreshFetchData}
            setData={refreshSetData}
            onSuccess={onRefreshSuccess}
            onError={onRefreshError}
          />
        </Stack>
      </Box>

      {/* RESULTADOS Y LIMPIAR */}

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
          {t("history.filters.results", {
            count: total,
          })}
        </Typography>

        {showClearFilters && (
          <Button
            size="small"
            type="button"
            startIcon={<FilterAltOffOutlinedIcon />}
            onClick={onClear}
            sx={{
              textTransform: "none",
              color: "text.secondary",
            }}
          >
            {t("history.filters.clear")}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
