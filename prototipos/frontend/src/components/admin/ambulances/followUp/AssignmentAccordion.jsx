import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

import { formatDate } from "../../../utils/formatDate";

function ReadOnlyField({ label, value }) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          color: "text.secondary",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 15,
          color: "var(--text-main-color)",
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}

export default function AssignmentAccordion({
  transfer,
  assigned,
  form,
  onChange,
  resources,
  loadingResources,
  onLoadResources,
}) {
  const requiresNurse = transfer.tipoElemento === "Paciente";

  const intervalComplete =
    Boolean(form.horaSalidaEstimada) && Boolean(form.horaLlegadaEstimada);

  return (
    <Accordion
      defaultExpanded={!assigned}
      disableGutters
      sx={{
        mt: 2,

        border: "1px solid",

        borderColor: "divider",

        borderRadius: "12px !important",

        boxShadow: "none",

        "&::before": {
          display: "none",
        },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
            }}
          >
            Asignación del traslado
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            {assigned
              ? "Recursos asignados al traslado."
              : "Defina primero el horario para consultar los recursos disponibles."}
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        {assigned ? (
          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },

              gap: 2.5,
            }}
          >
            <ReadOnlyField label="Vehículo" value={transfer.vehiculo} />

            <ReadOnlyField label="Conductor" value={transfer.conductor} />

            <ReadOnlyField label="Enfermero" value={transfer.enfermero} />

            <ReadOnlyField
              label="Salida estimada"
              value={formatDate(transfer.horaSalidaEstimada)}
            />

            <ReadOnlyField
              label="Llegada estimada"
              value={formatDate(transfer.horaLlegadaEstimada)}
            />
          </Box>
        ) : (
          <>
            {/* PRIMERO: INTERVALO */}

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },

                gap: 2.5,
              }}
            >
              <TextField
                fullWidth
                size="small"
                type="datetime-local"
                label="Salida estimada *"
                name="horaSalidaEstimada"
                value={form.horaSalidaEstimada}
                onChange={onChange}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <TextField
                fullWidth
                size="small"
                type="datetime-local"
                label="Llegada estimada *"
                name="horaLlegadaEstimada"
                value={form.horaLlegadaEstimada}
                onChange={onChange}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Box>

            {/* CONSULTAR DISPONIBILIDAD */}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={onLoadResources}
                disabled={!intervalComplete || loadingResources}
                startIcon={
                  loadingResources ? (
                    <CircularProgress size={16} />
                  ) : (
                    <SearchOutlinedIcon />
                  )
                }
                sx={{
                  textTransform: "none",

                  borderRadius: 2,
                  fontWeight: 700,
                }}
              >
                {loadingResources
                  ? "Consultando..."
                  : resources
                    ? "Actualizar disponibilidad"
                    : "Consultar disponibilidad"}
              </Button>
            </Box>

            {/* RECURSOS:
                SOLO APARECEN DESPUÉS
                DE CONSULTAR LA API */}

            {resources && (
              <>
                <Divider
                  sx={{
                    my: 3,
                  }}
                />

                <Typography
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                  }}
                >
                  Recursos disponibles
                </Typography>

                <Typography
                  sx={{
                    fontSize: 13,
                    color: "text.secondary",

                    mb: 2,
                  }}
                >
                  Seleccione los recursos disponibles para el intervalo
                  indicado.
                </Typography>

                <Box
                  sx={{
                    display: "grid",

                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                    },

                    gap: 2.5,
                  }}
                >
                  {/* VEHÍCULO */}

                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Vehículo *"
                    name="idVehiculo"
                    value={form.idVehiculo}
                    onChange={onChange}
                    disabled={resources.vehiculos.length === 0}
                  >
                    {resources.vehiculos.length > 0 ? (
                      resources.vehiculos.map((vehicle) => (
                        <MenuItem
                          key={vehicle.id_vehiculo}
                          value={vehicle.id_vehiculo}
                        >
                          {vehicle.matricula}
                          {" - "}
                          {vehicle.modelo}

                          {vehicle.tipo?.nombre
                            ? ` (${vehicle.tipo.nombre})`
                            : ""}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        No hay vehículos disponibles
                      </MenuItem>
                    )}
                  </TextField>

                  {/* CONDUCTOR */}

                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Conductor *"
                    name="idConductor"
                    value={form.idConductor}
                    onChange={onChange}
                    disabled={resources.conductores.length === 0}
                  >
                    {resources.conductores.length > 0 ? (
                      resources.conductores.map((driver) => (
                        <MenuItem key={driver.id_func} value={driver.id_func}>
                          {driver.nombre}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        No hay conductores disponibles
                      </MenuItem>
                    )}
                  </TextField>

                  {/* ENFERMERO */}

                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={requiresNurse ? "Enfermero *" : "Enfermero"}
                    name="idEnfermero"
                    value={form.idEnfermero}
                    onChange={onChange}
                    disabled={resources.enfermeros.length === 0}
                  >
                    {!requiresNurse && (
                      <MenuItem value="">Sin asignar</MenuItem>
                    )}

                    {resources.enfermeros.length > 0
                      ? resources.enfermeros.map((nurse) => (
                          <MenuItem key={nurse.id_func} value={nurse.id_func}>
                            {nurse.nombre}
                          </MenuItem>
                        ))
                      : requiresNurse && (
                          <MenuItem disabled value="">
                            No hay enfermeros disponibles
                          </MenuItem>
                        )}
                  </TextField>
                </Box>
              </>
            )}
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
