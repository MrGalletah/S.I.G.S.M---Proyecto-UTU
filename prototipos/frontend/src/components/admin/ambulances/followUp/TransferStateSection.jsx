import { Box, Divider, Stack, TextField, Typography } from "@mui/material";

import { stateTransitions } from "./transferEditUtils";

export default function TransferStateSection({ transfer, form, onChange }) {
  const nextState = stateTransitions[transfer.estado]?.[0] ?? null;

  return (
    <>
      <Divider
        sx={{
          my: 3,
        }}
      />

      <Box>
        <Typography
          sx={{
            fontWeight: 700,
            mb: 0.5,
          }}
        >
          Estado del traslado
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            mb: 2,
          }}
        >
          Estado actual: {transfer.estado}
        </Typography>

        {nextState ? (
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Siguiente estado"
              value={nextState}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />

            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Observación"
              name="observacionEstado"
              value={form.observacionEstado}
              onChange={onChange}
              placeholder="Observación opcional sobre el cambio de estado..."
            />
          </Stack>
        ) : (
          <Typography
            sx={{
              fontSize: 14,
              color: "text.secondary",
            }}
          >
            El traslado ya fue completado.
          </Typography>
        )}
      </Box>
    </>
  );
}
