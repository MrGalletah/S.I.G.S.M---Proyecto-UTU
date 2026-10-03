import { Box, Tooltip, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

import { formatDate } from "./formatDate";

const transferSteps = [
  "Registrado",
  "En camino",
  "Llegó al destino",
  "Retornando",
  "Completado",
];

function formatDateTime(value) {
  if (!value) return "-";

  const [date, time] = String(value).replace("T", " ").split(" ");

  return formatDate(date) + (time ? ` - ${time.slice(0, 5)}` : "");
}

export default function StatusTimeline({ transfer }) {
  const currentStepIndex = transferSteps.indexOf(transfer.estado);

  const history = transfer.historial ?? [];

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 800,
          mb: 2,
        }}
      >
        Seguimiento del traslado
      </Typography>

      {transferSteps.map((step, index) => {
        const isDone = index <= currentStepIndex;

        const isCompleted =
          index < currentStepIndex ||
          (index === currentStepIndex && step === "Completado");

        const isCurrent = index === currentStepIndex && !isCompleted;

        const entry = history.find((item) => item.estado === step);

        const fechaHora =
          entry?.fechaHora ?? (index === 0 ? transfer.fechaSolicitud : null);

        const funcionario =
          entry?.funcionario ?? (index === 0 ? transfer.solicitante : null);

        const observacion = entry?.observacion?.trim();

        return (
          <Box
            key={step}
            sx={{
              display: "grid",
              gridTemplateColumns: "26px minmax(0, 1fr)",
              columnGap: 1.5,
              minHeight: 58,
            }}
          >
            {/* CÍRCULO Y CONECTOR */}

            <Box
              sx={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {/* LÍNEA VERTICAL */}

              {index < transferSteps.length - 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 26,
                    bottom: 0,
                    width: 2,

                    bgcolor: isCompleted
                      ? "var(--green-chip)"
                      : "rgba(0,0,0,0.14)",
                  }}
                />
              )}

              {/* INDICADOR DEL ESTADO */}

              <Box
                sx={{
                  position: "relative",
                  zIndex: 1,

                  width: 26,
                  height: 26,
                  flexShrink: 0,
                  borderRadius: "50%",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  bgcolor: isCompleted
                    ? "var(--green-chip)"
                    : isCurrent
                      ? "var(--primary-color)"
                      : "var(--inactive-chip)",

                  color: isDone
                    ? "var(--white-color)"
                    : "var(--text-muted-color)",

                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {isCompleted ? <CheckIcon sx={{ fontSize: 16 }} /> : index + 1}
              </Box>
            </Box>

            {/* INFORMACIÓN DEL ESTADO */}

            <Box
              sx={{
                minWidth: 0,
                pb: index === transferSteps.length - 1 ? 0 : 2,
              }}
            >
              {/* ESTADO Y FECHA */}

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  columnGap: 1.5,
                  rowGap: 0.25,
                  minHeight: 26,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 800,

                    color: isCurrent
                      ? "var(--primary-color)"
                      : isDone
                        ? "var(--text-main-color)"
                        : "var(--text-muted-color)",
                  }}
                >
                  {step}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 11,
                    color: "text.secondary",
                  }}
                >
                  {isDone ? formatDateTime(fechaHora) : "Pendiente"}
                </Typography>
              </Box>

              {/* FUNCIONARIO */}

              {isDone && funcionario && (
                <Typography
                  sx={{
                    fontSize: 11,
                    color: "text.secondary",
                    mt: 0.25,
                  }}
                >
                  {index === 0 ? "Registrado por: " : "Actualizado por: "}

                  <Box
                    component="span"
                    sx={{
                      fontWeight: 700,
                      color: "var(--text-main-color)",
                    }}
                  >
                    {funcionario}
                  </Box>
                </Typography>
              )}

              {/* OBSERVACIÓN */}

              {isDone && observacion && (
                <Tooltip title={observacion} arrow placement="top">
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "text.secondary",
                      mt: 0.75,
                      lineHeight: 1.5,

                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      overflowWrap: "anywhere",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        fontWeight: 700,
                        color: "var(--primary-color)",
                      }}
                    >
                      Observación:{" "}
                    </Box>

                    {observacion}
                  </Typography>
                </Tooltip>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
