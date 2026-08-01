import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router";
import { login } from "../../auth/authApi";

export default function LoginForm() {
  const navigate = useNavigate();
  const [mail, setMail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlesubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const req = await login(mail, pwd);

      console.log("Usuario autenticado:", req.usuario);

      navigate("/documents/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box
        component={"form"}
        onSubmit={handlesubmit}
        sx={{
          width: "100%",
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 800,
            color: "#1f2937",
            mb: 1,
          }}
        >
          Iniciar sesión
        </Typography>

        <Typography
          component="p"
          sx={{
            fontSize: 14,
            color: "#6b7280",
            mb: 4,
          }}
        >
          Ingrese sus credenciales para acceder al sistema.
        </Typography>

        <Stack spacing={2.5}>
          <TextField
            autoFocus
            label="Correo electrónico"
            placeholder="Ingrese su correo"
            fullWidth
            value={mail}
            onChange={(e) => setMail(e.target.value)}
          />

          <TextField
            label="Contraseña"
            placeholder="Ingrese su contraseña"
            type="password"
            fullWidth
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />

          <FormControlLabel
            control={
              <Checkbox
                sx={{
                  color: "var(--primary-color)",
                  "&.Mui-checked": {
                    color: "var(--primary-color)",
                  },
                }}
              />
            }
            label="Recordarme"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              bgcolor: "var(--primary-color)",
              py: 1.3,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 15,
              "&:hover": {
                bgcolor: "#0A476D",
              },
            }}
          >
            Ingresar
          </Button>

          <Typography
            sx={{
              textAlign: "center",
              fontSize: 14,
              color: "#6b7280",
            }}
          >
            ¿No tienes cuenta?{" "}
            <Link
              href="#"
              underline="none"
              sx={{
                color: "var(--primary-color)",
                fontWeight: 700,
              }}
            >
              Solicitar acceso
            </Link>
          </Typography>
        </Stack>
      </Box>
    </>
  );
}
