import {
  Box,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { stateTransitions } from "./transferEditUtils";

export default function TransferStateSection({
  transfer,
  form,
  onChange,
}) {
  const availableStates =
    stateTransitions[transfer.estado] ?? [];

  return (
    <>
      <Divider sx={{ my: 3 }} />

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

        {availableStates.length > 0 ? (
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Nuevo estado *"
              name="nuevoEstado"
              value={form.nuevoEstado}
              onChange={onChange}
            >
              {availableStates.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </TextField>

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