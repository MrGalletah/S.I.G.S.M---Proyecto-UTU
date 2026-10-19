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

export default function TransferDetailsCard({ transfer }) {
  if (!transfer) return null;

  const isPatient = transfer.tipoElemento === "Paciente";

  const nurse =
    transfer.enfermero || (isPatient ? "Pendiente" : "No requerido");

  const urgent = transfer.prioridad === "Urgente";

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
            Detalle del traslado {transfer.codigo}
          </Typography>
        </Box>

        <Chip
          label={transfer.prioridad}
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
          <SectionTitle>Datos de la solicitud</SectionTitle>

          <Stack spacing={0.8}>
            <DetailField
              icon={<DescriptionOutlinedIcon />}
              label="Tipo de traslado"
              value={transfer.tipoTraslado}
            />

            <DetailField
              icon={<CategoryOutlinedIcon />}
              label="Tipo de elemento"
              value={transfer.tipoElemento}
            />

            <DetailField
              icon={<PersonIcon />}
              label={isPatient ? "Cédula del paciente" : "Elemento"}
              value={isPatient ? transfer.cedulaPaciente : transfer.elemento}
            />

            <DetailField
              icon={<LocationOnOutlinedIcon />}
              label="Origen"
              value={transfer.origen}
            />

            <DetailField
              icon={<LocationOnOutlinedIcon />}
              label="Destino"
              value={transfer.destino}
            />

            <DetailField
              icon={<EventOutlinedIcon />}
              label="Fecha requerida"
              value={formatDate(transfer.fechaRequerida)}
            />

            <DetailField
              icon={<AccessTimeOutlinedIcon />}
              label="Fecha de solicitud"
              value={formatDateTime(transfer.fechaSolicitud)}
            />

            <DetailField
              icon={<BadgeOutlinedIcon />}
              label="Solicitante"
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
                  Observaciones
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
          <SectionTitle>Recursos y horarios</SectionTitle>

          <Stack spacing={0.8}>
            <DetailField
              icon={<AirportShuttleOutlinedIcon />}
              label="Vehículo"
              value={transfer.vehiculo || "Pendiente "}
            />

            <DetailField
              icon={<BadgeOutlinedIcon />}
              label="Conductor"
              value={transfer.conductor || "Pendiente"}
            />

            <DetailField
              icon={<PersonIcon />}
              label="Enfermero"
              value={nurse}
            />

            <DetailField
              icon={<BadgeOutlinedIcon />}
              label="Gestor"
              value={transfer.gestor || "Pendiente"}
            />

            <DetailField
              icon={<EventOutlinedIcon />}
              label="Fecha de gestión"
              value={formatDateTime(transfer.fechaGestion)}
            />

            <DetailField
              icon={<AccessTimeOutlinedIcon />}
              label="Salida estimada"
              value={formatDateTime(transfer.horaSalidaEstimada)}
            />

            <DetailField
              icon={<AccessTimeOutlinedIcon />}
              label="Llegada estimada"
              value={formatDateTime(transfer.horaLlegadaEstimada)}
            />

            <DetailField
              icon={<AccessTimeOutlinedIcon />}
              label="Salida real"
              value={formatDateTime(transfer.horaSalidaReal)}
            />

            <DetailField
              icon={<FlagOutlinedIcon />}
              label="Llegada al destino"
              value={formatDateTime(transfer.horaLlegadaDestino)}
            />
          </Stack>
        </Box>

        {/* SEGUIMIENTO */}

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
