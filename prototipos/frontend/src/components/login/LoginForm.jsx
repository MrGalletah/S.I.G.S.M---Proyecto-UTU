import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router";
import { login, requestAccess } from "../../apiCalls/auth/authApi";
import { useNotification } from "../../hooks/useNotification";

export default function LoginForm() {
  const navigate = useNavigate();
  const { notification, showNotification, closeNotification } =
    useNotification();

  const [name, setName] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [mail, setMail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetFields = () => {
    setName("");
    setMail("");
    setPwd("");
    setConfirmPwd("");
    setError("");
  };

  const handleToggleLogin = (e) => {
    e.preventDefault();
    setShowLogin((prev) => !prev);
    resetFields();
  };

  const handlesubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (showLogin) {

      if (!name.trim()) {
        setError("El nombre es obligatorio");
        showNotification("El nombre es obligatorio", "error");
        return;
      }

      if (pwd !== confirmPwd) {
        setError("Las contraseñas no coinciden");
        showNotification("Las contraseñas no coinciden", "error");
        return;
      }

      setLoading(true);

      try {
        const req = await requestAccess(name, mail, pwd);

        showNotification(
          req.mensaje ||
            "Solicitud enviada. Un administrador debe activar tu cuenta.",
          "success"
        );

        setShowLogin(false);
        resetFields();
      } catch (e) {
        setError(e.message);
        showNotification(e.message, "error");
      } finally {
        setLoading(false);
      }

      return;
    }

    setLoading(true);

    try {
      const req = await login(mail, pwd);

      console.log("Usuario autenticado:", req.usuario);

      navigate("/documents/dashboard");
    } catch (e) {
      setError(e.message);
      showNotification(e.message, "error");
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
          {showLogin ? "Solicitar acceso" : "Iniciar sesión"}
        </Typography>

        <Typography
          component="p"
          sx={{
            fontSize: 14,
            color: "#6b7280",
            mb: 4,
          }}
        >
          {showLogin
            ? "Complete sus datos para solicitar acceso al sistema."
            : "Ingrese sus credenciales para acceder al sistema."}
        </Typography>

        <Stack spacing={1.5}>
          <TextField
            label="Correo electrónico"
            placeholder="Ingrese su correo"
            fullWidth
            value={mail}
            error={Boolean(error)}
            helperText={error && !showLogin ? "Correo incorrecto" : " "}
            onChange={(e) => setMail(e.target.value)}
          />

          {showLogin && (
            <TextField
              label="Nombre"
              placeholder="Juan"
              type="text"
              fullWidth
              error={Boolean(error)}
              helperText={error ? error : " "}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}


          <TextField
            label="Contraseña"
            placeholder="Ingrese su contraseña"
            type="password"
            fullWidth
            error={Boolean(error)}
            helperText={error && !showLogin ? "Contraseña incorrecta" : " "}
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />

          {showLogin && (
            <TextField
              label="Confirmar contraseña"
              placeholder="Repita su contraseña"
              type="password"
              fullWidth
              error={Boolean(error)}
              helperText={error ? error : " "}
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
            />
          )}

          {!showLogin && (
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
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
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
            {showLogin ? "Solicitar acceso" : "Ingresar"}
          </Button>

          <Typography
            sx={{
              textAlign: "center",
              fontSize: 14,
              color: "#6b7280",
            }}
          >
            {showLogin ? (
              <>
                ¿Ya tienes cuenta?{" "}
                <Link
                  href="#"
                  underline="none"
                  onClick={handleToggleLogin}
                  sx={{
                    color: "var(--primary-color)",
                    fontWeight: 700,
                  }}
                >
                  Iniciar sesión
                </Link>
              </>
            ) : (
              <>
                ¿No tienes cuenta?{" "}
                <Link
                  href="#"
                  underline="none"
                  onClick={handleToggleLogin}
                  sx={{
                    color: "var(--primary-color)",
                    fontWeight: 700,
                  }}
                >
                  Solicitar acceso
                </Link>
              </>
            )}
          </Typography>
        </Stack>
      </Box>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ horizontal: "center", vertical: "top" }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}