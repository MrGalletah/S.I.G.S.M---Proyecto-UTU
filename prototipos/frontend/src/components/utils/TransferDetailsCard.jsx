import { Box, Card, Divider, Stack, Typography } from "@mui/material";
import DetailItem from "./DetailItem";
import StatusTimeline from "./StatusTimeline";

import PersonIcon from "@mui/icons-material/Person";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AirportShuttleOutlinedIcon from "@mui/icons-material/AirportShuttleOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

export default function TransferDetailsCard({ transfer }) {
  if (!transfer) return null;

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
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "310px 1px 1fr",
          },
          gap: { xs: 3, md: 4 },
          alignItems: "start",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 800,
              mb: 2,
            }}
          >
            Detalle del traslado
          </Typography>

          <Stack spacing={0.6}>
            <DetailItem
              icon={<PersonIcon />}
              label="Paciente / elemento"
              value={transfer.elemento}
            />

            <DetailItem
              icon={<BadgeOutlinedIcon />}
              label="Conductor"
              value={transfer.conductor}
            />

            <DetailItem
              icon={<BadgeOutlinedIcon />}
              label="Acompañante"
              value={transfer.acompanante}
            />

            <DetailItem
              icon={<AirportShuttleOutlinedIcon />}
              label="Ambulancia"
              value={transfer.ambulancia}
            />

            <DetailItem
              icon={<LocationOnOutlinedIcon />}
              label="Origen"
              value={transfer.origen}
            />

            <DetailItem
              icon={<LocationOnOutlinedIcon />}
              label="Destino"
              value={transfer.destino}
            />

            <DetailItem
              icon={<AccessTimeOutlinedIcon />}
              label="Hora salida"
              value={`16/06/2026 - ${transfer.horaSalida}`}
            />

            <DetailItem
              icon={<AccessTimeOutlinedIcon />}
              label="Hora estimada de llegada"
              value={transfer.horaEstimadaSalida}
            />
          </Stack>
        </Box>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            display: { xs: "none", md: "block" },
          }}
        />

        <StatusTimeline transfer={transfer} />
      </Box>
    </Card>
  );
}
