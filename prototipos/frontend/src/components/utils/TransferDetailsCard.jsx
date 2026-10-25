import { useTranslation } from "react-i18next";

import { Box, Card, Chip, Stack, Tooltip, Typography } from "@mui/material";

import DetailItem from "./DetailItem";
import StatusTimeline from "./StatusTimeline";
import { formatDate } from "./formatDate";

import PersonIcon from "@mui/icons-material/Person";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AirportShuttleOutlinedIcon from "@mui/icons-material/AirportShuttleOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";

// TIPOS ORIGINALES DE MARIA DB

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

// FORMATEAR FECHA Y HORA

function formatDateTime(value) {
  if (!value) return "-";

  const normalized = String(value).replace("T", " ");
  const [date, time] = normalized.split(" ");

  return formatDate(date) + (time ? ` - ${time.slice(0, 5)}` : "");
}

// CAMPO DE DETALLE CON TOOLTIP

function DetailField({ icon, label, value }) {
  const displayValue = value || "-";

  return (
    <Tooltip
      title={displayValue}
      arrow
      placement="top"
      disableHoverListener={String(displayValue).length <= 25}
    >
      <Box>
        <DetailItem icon={icon} label={label} value={displayValue} />
      </Box>
    </Tooltip>
  );
}

// TÍTULO DE SECCIÓN

function SectionTitle({ children }) {
  return (
    <Typography
      sx={{
        fontSize: 16,
        fontWeight: 800,
        mb: 2,
        color: "var(--text-main-color)",
      }}
    >
      {children}
    </Typography>
  );
}

// DETALLES DEL TRASLADO

export default function TransferDetailsCard({ transfer }) {
  const { t } = useTranslation("transfers");

  if (!transfer) return null;

  // DATOS ORIGINALES PARA LAS REGLAS

  const isPatient = transfer.tipoElemento === "Paciente";
  const urgent = transfer.prioridad === "Urgente";

  const nurse =
    transfer.enfermero ||
    (isPatient ? t("details.pending") : t("details.notRequired"));

  // TRADUCCIÓN DE LOS TIPOS DE TRASLADO

  const translateTransferType = (value) => {
    const key = transferTypeKeys[value];

    return key ? t(`newTransfer.transferTypes.${key}`) : value;
  };

  // TRADUCCIÓN DE LOS TIPOS DE ELEMENTO

  const translateElementType = (value) => {
    const key = elementTypeKeys[value];

    return key ? t(`newTransfer.elementTypes.${key}`) : value;
  };

  // TRADUCCIÓN DE LA PRIORIDAD

  const translatePriority = (value) =>
    t(`priorities.${value}`, {
      defaultValue: value ?? "-",
    });

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
      {/* CABECERA */}

      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 19,
              fontWeight: 800,
              color: "var(--text-main-color)",
            }}
          >
            {t("details.title", {
              code: transfer.codigo,
            })}
          </Typography>
        </Box>

        {/* PRIORIDAD */}

        <Chip
          label={translatePriority(transfer.prioridad)}
          size="small"
          sx={{
            bgcolor: urgent
              ? "var(--priority-urgent-bg)"
              : "var(--priority-normal-bg)",

            color: urgent
              ? "var(--priority-urgent-text)"
              : "var(--priority-normal-text)",

            fontWeight: 700,
            borderRadius: 2,
          }}
        />
      </Stack>

      {/* CONTENIDO */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
            lg: "1fr 1fr 1.25fr",
          },

          gap: { xs: 3, md: 4 },
          alignItems: "start",
        }}
      >
        {/* DATOS DE LA SOLICITUD */}

        <Box
          sx={{
            minWidth: 0,
            pr: { md: 2 },

            borderRight: {
              md: "1px solid rgba(0,0,0,0.1)",
            },
          }}
        >
          <SectionTitle>{t("details.requestSection")}</SectionTitle>

          <Stack spacing={0.8}>
            {/* TIPO DE TRASLADO */}

            <DetailField
              icon={<DescriptionOutlinedIcon />}
              label={t("details.transferType")}
              value={translateTransferType(transfer.tipoTraslado)}
            />

            {/* TIPO DE ELEMENTO */}

            <DetailField
              icon={<CategoryOutlinedIcon />}
              label={t("details.elementType")}
              value={translateElementType(transfer.tipoElemento)}
            />

            {/* PACIENTE O ELEMENTO */}

            <DetailField
              icon={<PersonIcon />}
              label={isPatient ? t("details.patientId") : t("details.item")}
              value={isPatient ? transfer.cedulaPaciente : transfer.elemento}
            />

            {/* ORIGEN */}

            <DetailField
              icon={<LocationOnOutlinedIcon />}
              label={t("details.origin")}
              value={transfer.origen}
            />

            {/* DESTINO */}

            <DetailField
              icon={<LocationOnOutlinedIcon />}
              label={t("details.destination")}
              value={transfer.destino}
            />

            {/* FECHA REQUERIDA */}

            <DetailField
              icon={<EventOutlinedIcon />}
              label={t("details.requiredDate")}
              value={formatDate(transfer.fechaRequerida)}
            />

            {/* FECHA DE SOLICITUD */}

            <DetailField
              icon={<AccessTimeOutlinedIcon />}
              label={t("details.requestDate")}
              value={formatDateTime(transfer.fechaSolicitud)}
            />

            {/* SOLICITANTE */}

            <DetailField
              icon={<BadgeOutlinedIcon />}
              label={t("details.requester")}
              value={transfer.solicitante}
            />
          </Stack>

          {/* OBSERVACIONES */}

          {transfer.observaciones && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                bgcolor: "var(--primary-color-shadow)",
                borderRadius: 2,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "center",
                  mb: 0.5,
                  color: "var(--primary-color)",
                }}
              >
                <NotesOutlinedIcon fontSize="small" />

                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {t("details.observations")}
                </Typography>
              </Stack>

              <Typography
                sx={{
                  fontSize: 12,
                  overflowWrap: "anywhere",
                }}
              >
                {transfer.observaciones}
              </Typography>
            </Box>
          )}
        </Box>

        {/* RECURSOS Y HORARIOS */}

        <Box
          sx={{
            minWidth: 0,
            pr: { lg: 2 },

            borderRight: {
              lg: "1px solid rgba(0,0,0,0.1)",
            },
          }}
        >
          <SectionTitle>{t("details.resourcesSection")}</SectionTitle>

          <Stack spacing={0.8}>
            {/* VEHÍCULO */}

            <DetailField
              icon={<AirportShuttleOutlinedIcon />}
              label={t("details.vehicle")}
              value={transfer.vehiculo || t("details.pending")}
            />

            {/* CONDUCTOR */}

            <DetailField
              icon={<BadgeOutlinedIcon />}
              label={t("details.driver")}
              value={transfer.conductor || t("details.pending")}
            />

            {/* ENFERMERO */}

            <DetailField
              icon={<PersonIcon />}
              label={t("details.nurse")}
              value={nurse}
            />

            {/* GESTOR */}

            <DetailField
              icon={<BadgeOutlinedIcon />}
              label={t("details.manager")}
              value={transfer.gestor || t("details.pending")}
            />

            {/* FECHA DE GESTIÓN */}

            <DetailField
              icon={<EventOutlinedIcon />}
              label={t("details.managementDate")}
              value={formatDateTime(transfer.fechaGestion)}
            />

            {/* SALIDA ESTIMADA */}

            <DetailField
              icon={<AccessTimeOutlinedIcon />}
              label={t("details.estimatedDeparture")}
              value={formatDateTime(transfer.horaSalidaEstimada)}
            />

            {/* LLEGADA ESTIMADA */}

            <DetailField
              icon={<AccessTimeOutlinedIcon />}
              label={t("details.estimatedArrival")}
              value={formatDateTime(transfer.horaLlegadaEstimada)}
            />

            {/* SALIDA REAL */}

            <DetailField
              icon={<AccessTimeOutlinedIcon />}
              label={t("details.actualDeparture")}
              value={formatDateTime(transfer.horaSalidaReal)}
            />

            {/* LLEGADA AL DESTINO */}

            <DetailField
              icon={<FlagOutlinedIcon />}
              label={t("details.destinationArrival")}
              value={formatDateTime(transfer.horaLlegadaDestino)}
            />
          </Stack>
        </Box>

        {/* SEGUIMIENTO DEL TRASLADO */}

        <Box
          sx={{
            minWidth: 0,

            gridColumn: {
              xs: "auto",
              md: "1 / -1",
              lg: "auto",
            },

            borderTop: {
              xs: "1px solid rgba(0,0,0,0.1)",
              lg: "none",
            },

            pt: {
              xs: 2,
              lg: 0,
            },
          }}
        >
          <StatusTimeline transfer={transfer} />
        </Box>
      </Box>
    </Card>
  );
}
