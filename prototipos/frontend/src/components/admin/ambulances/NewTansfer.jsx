import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AirportShuttleOutlinedIcon from "@mui/icons-material/AirportShuttleOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";

const initialForm = {
  conductor: "",
  enfermero: "",
  elemento: "",
  tipoTraslado: "",
  origen: "",
  vehiculo: "",
  destino: "",
  prioridad: "",
  fecha: "",
  horaSalida: "",
  horaEstimadaLlegada: "",
  observaciones: "",
};

const fields = [
  {
    name: "conductor",
    label: "Conductor *",
    placeholder: "Juan Pérez",
    icon: <PersonIcon />,
  },
  {
    name: "enfermero",
    label: "Enfermero *",
    placeholder: "Laura Martínez",
    icon: <PersonIcon />,
  },
  {
    name: "elemento",
    label: "Paciente / elemento a trasladar *",
    placeholder: "Juan Pérez",
    icon: <PersonIcon />,
  },
  {
    name: "tipoTraslado",
    label: "Tipo de traslado *",
    placeholder: "Seleccione tipo",
    icon: <LocalHospitalOutlinedIcon />,
    select: true,
    options: [
      "Traslado a su domicilio",
      "Traslado interno",
      "Traslado a otro centro",
      "Retorno al hospital",
    ],
  },
  {
    name: "origen",
    label: "Origen *",
    placeholder: "Hospital de Clínicas",
    icon: <LocationOnOutlinedIcon />,
  },
  {
    name: "vehiculo",
    label: "Vehículo *",
    placeholder: "Seleccione vehículo",
    icon: <AirportShuttleOutlinedIcon />,
    select: true,
    options: [
      "Ambulancia A-01",
      "Ambulancia A-02",
      "Ambulancia A-03",
      "Ambulancia B-01",
    ],
  },
  {
    name: "destino",
    label: "Destino *",
    placeholder: "Islas Canarias 6281",
    icon: <LocationOnOutlinedIcon />,
  },
  {
    name: "prioridad",
    label: "Prioridad *",
    placeholder: "Seleccione prioridad",
    icon: <FlagOutlinedIcon />,
    select: true,
    options: ["Normal", "Urgente"],
  },
  {
    name: "fecha",
    label: "Fecha *",
    placeholder: "24/06/2026",
    icon: <CalendarMonthOutlinedIcon />,
  },
  {
    name: "horaEstimadaLlegada",
    label: "Hora estimada de llegada *",
    placeholder: "11:45",
    icon: <AccessTimeOutlinedIcon />,
    type: "time",
  },
  {
    name: "horaSalida",
    label: "Hora de salida *",
    placeholder: "10:30",
    icon: <AccessTimeOutlinedIcon />,
    type: "time",
  },
];

function FormField({ field, value, onChange }) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 500,
          mb: 1,
          color: "var(--text-main-color)",
        }}
      >
        {field.label}
      </Typography>

      <TextField
        fullWidth
        select={field.select}
        type={field.type || "text"}
        name={field.name}
        value={value}
        placeholder={field.placeholder}
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
                {field.icon}
              </InputAdornment>
            ),
          },
        }}
      >
        {field.select &&
          field.options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
      </TextField>
    </Box>
  );
}

export default function NewTransfer() {
  const [form, setForm] = useState(initialForm);
  const [openAlert, setOpenAlert] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setForm(initialForm);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setOpenAlert(true);
  };

  return (
    <>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          mb: 4,
        }}
      >
        Panel de administración
      </Typography>

      <Card
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 980,
          mx: "auto",
          borderRadius: 4,
          p: { xs: 2.5, md: 4 },
          boxShadow: "var(--card-shadow)",
          overflow: "hidden",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            mb: 3,
          }}
        >
          Datos del traslado
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
            },
            columnGap: { md: 8 },
            rowGap: 2.5,
          }}
        >
          {fields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={form[field.name]}
              onChange={handleChange}
            />
          ))}

          <Box>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 500,
                mb: 1,
                color: "var(--text-main-color)",
              }}
            >
              Observaciones
            </Typography>

            <TextField
              fullWidth
              multiline
              minRows={3}
              name="observaciones"
              value={form.observaciones}
              placeholder="Ingrese observaciones adicionales..."
              onChange={handleChange}
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "var(--white-color)",
                  alignItems: "flex-start",
                },
              }}
            />
          </Box>
        </Box>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            justifyContent: "flex-end",
            mt: 3,
          }}
        >
          <Button
            type="button"
            variant="outlined"
            size="small"
            onClick={handleCancel}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "var(--primary-color)",
              "&:hover": {
                bgcolor: "var(--primary-color)",
              },
            }}
          >
            Registrar traslado
          </Button>
        </Stack>
      </Card>

      <Snackbar
        open={openAlert}
        autoHideDuration={3000}
        onClose={() => setOpenAlert(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setOpenAlert(false)}
        >
          Traslado registrado correctamente. Demo sin envío real.
        </Alert>
      </Snackbar>
    </>
  );
}