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

export default function TransferFilters({
  search,
  onSearchChange,
  filters,
  onFilterChange,
  total,
  filteredCount,
  onClear,
  hasActiveFilters,
}) {

  return (
    <>
      {/* CABECERA Y BUSCADOR */}

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Traslados en curso
          </Typography>

          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            Gestión y seguimiento de solicitudes activas
          </Typography>
        </Box>

        <TextField
          size="small"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Código, cédula, elemento o ubicación..."
          sx={{ width: { xs: "100%", md: 365 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
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
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1.5,
          mt: 3,
        }}
      >
        <FilterSelect
          label="Estado"
          value={filters.estado}
          onChange={(value) => onFilterChange("estado", value)}
          options={[
            { value: "", label: "Todos los estados" },
            { value: "Registrado", label: "Registrado" },
            { value: "En camino", label: "En camino" },
            {
              value: "Llegó al destino",
              label: "Llegó al destino",
            },
            { value: "Retornando", label: "Retornando" },
          ]}
        />

        <FilterSelect
          label="Prioridad"
          value={filters.prioridad}
          onChange={(value) => onFilterChange("prioridad", value)}
          options={[
            { value: "", label: "Todas las prioridades" },
            { value: "Urgente", label: "Urgente" },
            { value: "Normal", label: "Normal" },
          ]}
        />

        <FilterSelect
          label="Asignación"
          value={filters.asignacion}
          onChange={(value) => onFilterChange("asignacion", value)}
          options={[
            { value: "", label: "Todos los traslados" },
            {
              value: "pendientes",
              label: "Pendientes de asignación",
            },
            { value: "asignados", label: "Asignados" },
          ]}
        />

        <FilterSelect
          label="Fecha requerida"
          value={filters.fecha}
          onChange={(value) => onFilterChange("fecha", value)}
          options={[
            { value: "", label: "Todas las fechas" },
            { value: "hoy", label: "Hoy" },
            { value: "manana", label: "Mañana" },
            { value: "semana", label: "Próximos 7 días" },
          ]}
        />
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
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
          {filteredCount} de {total} traslados
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
            Limpiar filtros
          </Button>
        )}
      </Stack>
    </>
  );
}
