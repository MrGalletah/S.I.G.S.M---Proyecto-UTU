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
import { useTranslation } from "react-i18next";

import { login, requestAccess } from "../../apiCalls/auth/authApi";
import { useNotification } from "../../hooks/useNotification";

export default function LoginForm() {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");

  const { notification, showNotification, closeNotification } =
    useNotification();

  const [requestingAccess, setRequestingAccess] = useState(false);

  const [name, setName] = useState("");
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

  const handleToggleMode = (event) => {
    event.preventDefault();

    setRequestingAccess((prev) => !prev);
    resetFields();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // VALIDACIONES DE SOLICITUD DE ACCESO
    if (requestingAccess) {
      if (!name.trim()) {
        const message = t("request.nameRequired");

        setError(message);
        showNotification(message, "error");
        return;
      }

      if (pwd !== confirmPwd) {
        const message = t("request.passwordMismatch");

        setError(message);
        showNotification(message, "error");
        return;
      }
    }

    setLoading(true);

    try {
      if (requestingAccess) {
        // SOLICITUD DE ACCESO
        await requestAccess(name.trim(), mail.trim(), pwd);

        showNotification(t("request.success"), "success");

        resetFields();
        setRequestingAccess(false);
      } else {
        // INICIO DE SESIÓN
        await login(mail, pwd);

        navigate("/documents/dashboard");
      }
    } catch (error) {
      const message =
        error.message ||
        (requestingAccess
          ? t("request.submitError")
          : t("login.invalidCredentials"));

      setError(message);
      showNotification(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
        {/* TÍTULO */}
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 800,
            color: "#1f2937",
            mb: 1,
          }}
        >
          {requestingAccess ? t("request.title") : t("login.title")}
        </Typography>

        {/* DESCRIPCIÓN */}
        <Typography
          component="p"
          sx={{
            fontSize: 14,
            color: "#6b7280",
            mb: 4,
          }}
        >
          {requestingAccess ? t("request.description") : t("login.description")}
        </Typography>

        <Stack spacing={1.5}>
          {/* CORREO */}
          <TextField
            label={t("login.email")}
            placeholder={t("login.emailPlaceholder")}
            fullWidth
            value={mail}
            error={Boolean(error) && !requestingAccess}
            helperText={
              error && !requestingAccess ? t("login.emailError") : " "
            }
            onChange={(event) => setMail(event.target.value)}
          />

          {/* NOMBRE */}
          {requestingAccess && (
            <TextField
              label={t("request.name")}
              placeholder={t("request.namePlaceholder")}
              type="text"
              fullWidth
              value={name}
              error={Boolean(error) && !name.trim()}
              helperText={error && !name.trim() ? error : " "}
              onChange={(event) => setName(event.target.value)}
            />
          )}

          {/* CONTRASEÑA */}
          <TextField
            label={t("login.password")}
            placeholder={t("login.passwordPlaceholder")}
            type="password"
            fullWidth
            value={pwd}
            error={Boolean(error) && !requestingAccess}
            helperText={
              error && !requestingAccess ? t("login.passwordError") : " "
            }
            onChange={(event) => setPwd(event.target.value)}
          />

          {/* CONFIRMAR CONTRASEÑA */}
          {requestingAccess && (
            <TextField
              label={t("request.confirmPassword")}
              placeholder={t("request.confirmPasswordPlaceholder")}
              type="password"
              fullWidth
              value={confirmPwd}
              error={Boolean(error) && pwd !== confirmPwd}
              helperText={
                error && pwd !== confirmPwd
                  ? t("request.passwordMismatch")
                  : " "
              }
              onChange={(event) => setConfirmPwd(event.target.value)}
            />
          )}

          {/* RECORDARME */}
          {!requestingAccess && (
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
              label={t("login.remember")}
            />
          )}

          {/* ENVIAR */}
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
            {requestingAccess ? t("request.submit") : t("login.submit")}
          </Button>

          {/* CAMBIAR DE FORMULARIO */}
          <Typography
            sx={{
              textAlign: "center",
              fontSize: 14,
              color: "#6b7280",
            }}
          >
            {requestingAccess ? (
              <>
                {t("request.hasAccount")}{" "}
                <Link
                  href="#"
                  underline="none"
                  onClick={handleToggleMode}
                  sx={{
                    color: "var(--primary-color)",
                    fontWeight: 700,
                  }}
                >
                  {t("login.title")}
                </Link>
              </>
            ) : (
              <>
                {t("login.noAccount")}{" "}
                <Link
                  href="#"
                  underline="none"
                  onClick={handleToggleMode}
                  sx={{
                    color: "var(--primary-color)",
                    fontWeight: 700,
                  }}
                >
                  {t("login.requestAccess")}
                </Link>
              </>
            )}
          </Typography>
        </Stack>
      </Box>

      {/* NOTIFICACIONES */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{
          horizontal: "center",
          vertical: "top",
        }}
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
