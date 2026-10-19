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

// FECHA LOCAL DE HOY

function getToday() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// SELECT DE RECURSOS

function ResourceSelect({ label, value, onChange, options, disabled = false }) {
  return (
    <FormControl size="small" fullWidth disabled={disabled}>
      <InputLabel>{label}</InputLabel>

      <Select
        value={value}
        label={label}
        onChange={(event) => onChange(event.target.value)}
      >
        <MenuItem value="">Todos</MenuItem>

        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function HistoryFilters({
  search,
  desde,
  hasta,

  idVehiculo,
  idConductor,
  idEnfermero,

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

  onSearch,
  onClear,
}) {
  const today = getToday();

  // VALORES QUE EL USUARIO ESTÁ EDITANDO

  const hasDraftFilters =
    Boolean(search.trim()) ||
    Boolean(desde) ||
    Boolean(hasta) ||
    Boolean(idVehiculo) ||
    Boolean(idConductor) ||
    Boolean(idEnfermero);

  // MOSTRAR LIMPIAR SI HAY ALGO ESCRITO
  // O SI SIGUEN EXISTIENDO FILTROS APLICADOS

  const showClearFilters = hasDraftFilters || hasAppliedFilters;

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

  const handleSubmit = (event) => {
    event.preventDefault();

    onSearch();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* CABECERA */}

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
            Historial de traslados
          </Typography>

          <Typography
            sx={{
              fontSize: 13,

              color: "text.secondary",
            }}
          >
            Consulta de traslados completados
          </Typography>
        </Box>

        {/* BUSCADOR GENERAL */}

        <TextField
          size="small"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Código, cédula, elemento o ubicación..."
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

            xl: "repeat(5, minmax(0, 1fr)) auto",
          },

          gap: 1.5,

          mt: 3,

          alignItems: "center",
        }}
      >
        {/* DESDE */}

        <TextField
          type="date"
          size="small"
          label="Finalizado desde"
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

        {/* HASTA */}

        <TextField
          type="date"
          size="small"
          label="Finalizado hasta"
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

        {/* VEHÍCULO */}

        <ResourceSelect
          label="Vehículo"
          value={idVehiculo}
          onChange={onVehicleChange}
          options={vehicleOptions}
          disabled={loadingResources}
        />

        {/* CONDUCTOR */}

        <ResourceSelect
          label="Conductor"
          value={idConductor}
          onChange={onDriverChange}
          options={driverOptions}
          disabled={loadingResources}
        />

        {/* ENFERMERO */}

        <ResourceSelect
          label="Enfermero"
          value={idEnfermero}
          onChange={onNurseChange}
          options={nurseOptions}
          disabled={loadingResources}
        />

        {/* APLICAR */}

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
          Aplicar filtros
        </Button>
      </Box>

      {/* RESULTADOS */}

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
          {total}{" "}
          {total === 1 ? "traslado encontrado" : "traslados encontrados"}
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
            Limpiar filtros
          </Button>
        )}
      </Stack>
    </Box>
  );
}
