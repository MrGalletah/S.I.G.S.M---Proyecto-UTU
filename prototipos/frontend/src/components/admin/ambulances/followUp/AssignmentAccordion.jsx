import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  driverOptions,
  nurseOptions,
  vehicleOptions,
} from "./transferEditUtils";

import { formatDate } from "../../../utils/formatDate"

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
}) {
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
          <Typography sx={{ fontWeight: 700 }}>
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
              : "Seleccione vehículo, personal y horarios."}
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
            <ReadOnlyField
              label="Vehículo"
              value={transfer.vehiculo}
            />

            <ReadOnlyField
              label="Conductor"
              value={transfer.conductor}
            />

            <ReadOnlyField
              label="Enfermero"
              value={transfer.enfermero}
            />

            <ReadOnlyField
              label="Salida estimada"
              value={formatDate(
                transfer.horaSalidaEstimada
              )}
            />

            <ReadOnlyField
              label="Llegada estimada"
              value={formatDate(
                transfer.horaLlegadaEstimada
              )}
            />
          </Box>
        ) : (
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
              select
              fullWidth
              size="small"
              label="Vehículo *"
              name="vehiculo"
              value={form.vehiculo}
              onChange={onChange}
            >
              {vehicleOptions.map((vehicle) => (
                <MenuItem key={vehicle} value={vehicle}>
                  {vehicle}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              size="small"
              label="Conductor *"
              name="conductor"
              value={form.conductor}
              onChange={onChange}
            >
              {driverOptions.map((driver) => (
                <MenuItem key={driver} value={driver}>
                  {driver}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              size="small"
              label={
                transfer.tipoElemento === "Paciente"
                  ? "Enfermero *"
                  : "Enfermero"
              }
              name="enfermero"
              value={form.enfermero}
              onChange={onChange}
            >
              {transfer.tipoElemento !== "Paciente" && (
                <MenuItem value="">
                  Sin asignar
                </MenuItem>
              )}

              {nurseOptions.map((nurse) => (
                <MenuItem key={nurse} value={nurse}>
                  {nurse}
                </MenuItem>
              ))}
            </TextField>

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
        )}
      </AccordionDetails>
    </Accordion>
  );
}