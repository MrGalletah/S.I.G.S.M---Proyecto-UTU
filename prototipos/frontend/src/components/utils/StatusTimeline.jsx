import { useTranslation } from "react-i18next";

import { Box, Tooltip, Typography } from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import { formatDate } from "./formatDate";

// ESTADOS NORMALES

const transferSteps = [
  "Registrado",
  "En camino",
  "Llegó al destino",
  "Retornando",
  "Completado",
];

// FORMATEAR FECHA Y HORA

function formatDateTime(value) {
  if (!value) return "-";

  const [date, time] = String(value).replace("T", " ").split(" ");

  return formatDate(date) + (time ? ` - ${time.slice(0, 5)}` : "");
}

// TIMELINE DEL TRASLADO

export default function StatusTimeline({ transfer }) {
  const { t } = useTranslation("transfers");

  const isCancelled = transfer.estado === "Cancelado";

  // LOS CANCELADOS TIENEN SU PROPIA RUTA

  const steps = isCancelled ? ["Registrado", "Cancelado"] : transferSteps;

  const currentStepIndex = steps.indexOf(transfer.estado);

  const history = transfer.historial ?? [];

  // TRADUCIR ESTADOS

  const translateState = (state) =>
    t(`states.${state}`, {
      defaultValue: state,
    });

  return (
    <Box sx={{ width: "100%" }}>
      {/* TÍTULO */}

      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 800,
          mb: 2,
        }}
      >
        {t("timeline.title")}
      </Typography>

      {/* ESTADOS DEL TRASLADO */}

      {steps.map((step, index) => {
        const cancelledStep = step === "Cancelado";

        const isDone = index <= currentStepIndex;

        const isCompleted =
          index < currentStepIndex ||
          (index === currentStepIndex &&
            (step === "Completado" || cancelledStep));

        const isCurrent = index === currentStepIndex && !isCompleted;

        // BUSCAR REGISTRO HISTÓRICO

        const entry = history.find((item) => item.estado === step);

        // PARA CANCELACIONES ANTIGUAS SIN HISTORIAL
        // UTILIZAR LA FECHA DE BAJA ORIGINAL

        const fechaHora =
          entry?.fechaHora ??
          (cancelledStep
            ? transfer.fechaCancelacion
            : index === 0
              ? transfer.fechaSolicitud
              : null);

        const funcionario =
          entry?.funcionario ?? (index === 0 ? transfer.solicitante : null);

        const observacion = entry?.observacion?.trim();

        // COLORES

        const completedColor = cancelledStep
          ? "var(--priority-urgent-text)"
          : "var(--green-chip)";

        const circleColor = cancelledStep
          ? "var(--priority-urgent-text)"
          : isCompleted
            ? "var(--green-chip)"
            : isCurrent
              ? "var(--primary-color)"
              : "var(--inactive-chip)";

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

              {index < steps.length - 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 26,
                    bottom: 0,
                    width: 2,

                    bgcolor: isCancelled
                      ? "var(--priority-urgent-text)"
                      : isCompleted
                        ? "var(--green-chip)"
                        : "rgba(0,0,0,0.14)",
                  }}
                />
              )}

              {/* INDICADOR */}

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

                  bgcolor: circleColor,

                  color: isDone
                    ? "var(--white-color)"
                    : "var(--text-muted-color)",

                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {cancelledStep ? (
                  <CloseIcon sx={{ fontSize: 16 }} />
                ) : isCompleted ? (
                  <CheckIcon sx={{ fontSize: 16 }} />
                ) : (
                  index + 1
                )}
              </Box>
            </Box>

            {/* INFORMACIÓN DEL ESTADO */}

            <Box
              sx={{
                minWidth: 0,
                pb: index === steps.length - 1 ? 0 : 2,
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

                    color: cancelledStep
                      ? completedColor
                      : isCurrent
                        ? "var(--primary-color)"
                        : isDone
                          ? "var(--text-main-color)"
                          : "var(--text-muted-color)",
                  }}
                >
                  {translateState(step)}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 11,
                    color: "text.secondary",
                  }}
                >
                  {isDone ? formatDateTime(fechaHora) : t("timeline.pending")}
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
                  {index === 0
                    ? t("timeline.registeredBy")
                    : t("timeline.updatedBy")}{" "}
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
                        color: cancelledStep
                          ? "var(--priority-urgent-text)"
                          : "var(--primary-color)",
                      }}
                    >
                      {t("timeline.observation")}{" "}
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
