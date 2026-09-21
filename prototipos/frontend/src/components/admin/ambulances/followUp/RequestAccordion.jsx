import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
          wordBreak: "break-word",
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}

export default function RequestAccordion({ transfer }) {
  return (
    <Accordion
      defaultExpanded
      disableGutters
      sx={{
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
            Datos de la solicitud
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Información ingresada por el funcionario solicitante.
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
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
            label="Código"
            value={transfer.codigo}
          />

          <ReadOnlyField
            label="Tipo de traslado"
            value={transfer.tipoTraslado}
          />

          <ReadOnlyField
            label="Tipo de elemento"
            value={transfer.tipoElemento}
          />

          {transfer.tipoElemento === "Paciente" ? (
            <ReadOnlyField
              label="Cédula del paciente"
              value={transfer.cedulaPaciente}
            />
          ) : (
            <ReadOnlyField
              label="Elemento"
              value={transfer.elemento}
            />
          )}

          <ReadOnlyField
            label="Origen"
            value={transfer.origen}
          />

          <ReadOnlyField
            label="Destino"
            value={transfer.destino}
          />

          <ReadOnlyField
            label="Prioridad"
            value={transfer.prioridad}
          />

          <ReadOnlyField
            label="Fecha requerida"
            value={formatDate(transfer.fechaRequerida)}
          />

          <Box
            sx={{
              gridColumn: {
                xs: "1",
                sm: "1 / -1",
              },
            }}
          >
            <ReadOnlyField
              label="Observaciones"
              value={transfer.observaciones}
            />
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}