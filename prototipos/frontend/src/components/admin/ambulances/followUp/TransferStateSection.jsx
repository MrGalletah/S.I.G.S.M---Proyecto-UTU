import { useTranslation } from "react-i18next";

import { Box, Divider, Stack, TextField, Typography } from "@mui/material";

import { stateTransitions } from "./transferEditUtils";

export default function TransferStateSection({ transfer, form, onChange }) {
  const { t } = useTranslation("transfers");

  // SIGUIENTE ESTADO SEGÚN LAS REGLAS DEL SISTEMA

  const nextState = stateTransitions[transfer.estado]?.[0] ?? null;

  // TRADUCIR EL ESTADO SIN MODIFICAR SU VALOR REAL

  const translateState = (state) =>
    t(`states.${state}`, {
      defaultValue: state ?? "-",
    });

  return (
    <>
      <Divider
        sx={{
          my: 3,
        }}
      />

      <Box>
        {/* TÍTULO */}

        <Typography
          sx={{
            fontWeight: 700,
            mb: 0.5,
          }}
        >
          {t("followUp.stateSection.title")}
        </Typography>

        {/* ESTADO ACTUAL */}

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            mb: 2,
          }}
        >
          {t("followUp.stateSection.currentState", {
            state: translateState(transfer.estado),
          })}
        </Typography>

        {nextState ? (
          <Stack spacing={2}>
            {/* SIGUIENTE ESTADO DE SOLO LECTURA */}

            <TextField
              fullWidth
              size="small"
              label={t("followUp.stateSection.nextState")}
              value={translateState(nextState)}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />

            {/* OBSERVACIÓN */}

            <TextField
              fullWidth
              multiline
              minRows={2}
              label={t("followUp.stateSection.observation")}
              name="observacionEstado"
              value={form.observacionEstado}
              onChange={onChange}
              placeholder={t("followUp.stateSection.observationPlaceholder")}
            />
          </Stack>
        ) : (
          <Typography
            sx={{
              fontSize: 14,
              color: "text.secondary",
            }}
          >
            {t("followUp.stateSection.completed")}
          </Typography>
        )}
      </Box>
    </>
  );
}
