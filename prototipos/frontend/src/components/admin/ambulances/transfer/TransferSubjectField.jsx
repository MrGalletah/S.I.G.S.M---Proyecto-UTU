import { useTranslation } from "react-i18next";

import { Box, InputAdornment, TextField, Typography } from "@mui/material";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

export default function TransferSubjectField({
  tipoElemento,
  cedulaPaciente,
  elemento,
  onChange,
}) {
  const { t } = useTranslation("transfers");

  if (!tipoElemento) {
    return null;
  }

  // EL NOMBRE ORIGINAL VIENE DE MARIA DB

  const isPaciente = tipoElemento === "Paciente";

  // PLACEHOLDER SEGÚN EL TIPO DE ELEMENTO

  const getPlaceholder = () => {
    switch (tipoElemento) {
      case "Muestra biológica":
        return t("newTransfer.subject.biologicalSamplePlaceholder");

      case "Equipamiento":
        return t("newTransfer.subject.equipmentPlaceholder");

      case "Insumo":
        return t("newTransfer.subject.supplyPlaceholder");

      case "Otro":
        return t("newTransfer.subject.otherPlaceholder");

      default:
        return t("newTransfer.subject.defaultPlaceholder");
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
          ? t("newTransfer.patientId")
          : t("newTransfer.elementDescription")}
      </Typography>

      <TextField
        fullWidth
        name={isPaciente ? "cedulaPaciente" : "elemento"}
        value={isPaciente ? cedulaPaciente : elemento}
        placeholder={
          isPaciente
            ? t("newTransfer.subject.patientPlaceholder")
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
