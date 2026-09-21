import {
  Box,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

export default function TransferSubjectField({
  tipoElemento,
  cedulaPaciente,
  elemento,
  onChange,
}) {
  if (!tipoElemento) {
    return null;
  }

  const isPaciente = tipoElemento === "Paciente";

  const getPlaceholder = () => {
    switch (tipoElemento) {
      case "Muestra biológica":
        return "Ej: Muestra de sangre para laboratorio";

      case "Equipamiento":
        return "Ej: Respirador portátil";

      case "Insumo":
        return "Ej: Material quirúrgico";

      case "Otro":
        return "Describa el elemento a trasladar";

      default:
        return "Ingrese una descripción";
    }
  };

  return (
    <Box
      sx={{
        gridColumn: {
          xs: "1",
          md: "1 / -1",
        },
      }}
    >
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 500,
          mb: 1,
          color: "var(--text-main-color)",
        }}
      >
        {isPaciente
          ? "Cédula del paciente *"
          : "Descripción del elemento *"}
      </Typography>

      <TextField
        fullWidth
        name={isPaciente ? "cedulaPaciente" : "elemento"}
        value={isPaciente ? cedulaPaciente : elemento}
        placeholder={
          isPaciente
            ? "Ej: 4.123.456-7"
            : getPlaceholder()
        }
        onChange={onChange}
        size="small"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            bgcolor: "var(--white-color)",
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                {isPaciente ? (
                  <PersonOutlineOutlinedIcon />
                ) : (
                  <Inventory2OutlinedIcon />
                )}
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  );
}