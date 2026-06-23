import { Box, Step, StepConnector, StepLabel, Stepper, Typography } from "@mui/material";
import TransferStepIcon from "./TransferStepIcon";

const transferSteps = [
  "Registrado",
  "En camino",
  "Llegó al destino",
  "Retornando",
  "Completado",
];


export default function StatusTimeline({ transfer }) {
  const currentStepIndex = Math.max(transferSteps.indexOf(transfer.estado), 0);
  const date = "16/06/2026";

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        sx={{
          fontSize: 18,
          fontWeight: 800,
          mb: 2,
        }}
      >
        Estado actual
      </Typography>

      <Stepper
        activeStep={currentStepIndex}
        orientation="vertical"
        connector={
          <StepConnector
            sx={{
              ml: "12px",

              "& .MuiStepConnector-line": {
                borderColor: "rgba(0,0,0,0.12)",
                minHeight: 24,
              },
            }}
          />
        }
        sx={{
          "& .MuiStep-root": {
            pb: 0,
          },

          "& .MuiStepLabel-root": {
            alignItems: "flex-start",
            p: 0,
          },

          "& .MuiStepLabel-iconContainer": {
            p: 0,
            pr: 2,
          },

          "& .MuiStepLabel-labelContainer": {
            width: "100%",
          },

          "& .MuiStepLabel-label": {
            mt: 0,
          },
        }}
      >
        {transferSteps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isDone = isCompleted || isCurrent;

          return (
            <Step key={step} completed={isCompleted}>
              <StepLabel StepIconComponent={TransferStepIcon}>
                <Box
                  sx={{
                    pb: 1.5,
                    borderBottom:
                      index !== transferSteps.length - 1
                        ? "1px solid rgba(0,0,0,0.1)"
                        : "none",
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: index === 0 ? "1fr 1fr" : "1fr",
                    },
                    gap: 2,
                    minHeight: 44,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 800,
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
                      {isDone
                        ? `${date} - ${
                            index === 0 ? "10:25" : transfer.horaSalida
                          }`
                        : "Pendiente"}
                    </Typography>
                  </Box>

                  {index === 0 && (
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        Traslado registrado en el sistema por
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 11,
                          color: "text.secondary",
                        }}
                      >
                        Juan Pérez
                      </Typography>
                    </Box>
                  )}
                </Box>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}