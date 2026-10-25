import { useTranslation } from "react-i18next";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { formatDate } from "../../../utils/formatDate";

// NOMBRES ORIGINALES DE LA BASE DE DATOS

const transferTypeKeys = {
  "Traslado interno": "internal",
  "Traslado a otro centro": "otherCenter",
  "Traslado a domicilio": "home",
  "Retorno al hospital": "return",
  Otro: "other",
};

const elementTypeKeys = {
  Paciente: "patient",
  "Muestra biológica": "biologicalSample",
  Equipamiento: "equipment",
  Insumo: "supply",
  Otro: "other",
};

// CAMPO DE SOLO LECTURA

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
  const { t } = useTranslation("transfers");

  // TRADUCIR TIPOS, SIN MODIFICAR LOS DATOS ORIGINALES

  const translateTransferType = (value) => {
    const key = transferTypeKeys[value];

    return key ? t(`newTransfer.transferTypes.${key}`) : value;
  };

  const translateElementType = (value) => {
    const key = elementTypeKeys[value];

    return key ? t(`newTransfer.elementTypes.${key}`) : value;
  };

  const translatePriority = (value) =>
    t(`priorities.${value}`, {
      defaultValue: value ?? "-",
    });

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
      {/* ENCABEZADO */}

      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>
            {t("followUp.request.title")}
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            {t("followUp.request.description")}
          </Typography>
        </Box>
      </AccordionSummary>

      {/* DATOS */}

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
          {/* CÓDIGO */}

          <ReadOnlyField
            label={t("followUp.request.code")}
            value={transfer.codigo}
          />

          {/* TIPO DE TRASLADO */}

          <ReadOnlyField
            label={t("followUp.request.transferType")}
            value={translateTransferType(transfer.tipoTraslado)}
          />

          {/* TIPO DE ELEMENTO */}

          <ReadOnlyField
            label={t("followUp.request.elementType")}
            value={translateElementType(transfer.tipoElemento)}
          />

          {/* PACIENTE O ELEMENTO */}

          {transfer.tipoElemento === "Paciente" ? (
            <ReadOnlyField
              label={t("followUp.request.patientId")}
              value={transfer.cedulaPaciente}
            />
          ) : (
            <ReadOnlyField
              label={t("followUp.request.item")}
              value={transfer.elemento}
            />
          )}

          {/* ORIGEN */}

          <ReadOnlyField
            label={t("followUp.request.origin")}
            value={transfer.origen}
          />

          {/* DESTINO */}

          <ReadOnlyField
            label={t("followUp.request.destination")}
            value={transfer.destino}
          />

          {/* PRIORIDAD */}

          <ReadOnlyField
            label={t("followUp.request.priority")}
            value={translatePriority(transfer.prioridad)}
          />

          {/* FECHA REQUERIDA */}

          <ReadOnlyField
            label={t("followUp.request.requiredDate")}
            value={formatDate(transfer.fechaRequerida)}
          />

          {/* OBSERVACIONES */}

          <Box
            sx={{
              gridColumn: {
                xs: "1",
                sm: "1 / -1",
              },
            }}
          >
            <ReadOnlyField
              label={t("followUp.request.observations")}
              value={transfer.observaciones}
            />
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
