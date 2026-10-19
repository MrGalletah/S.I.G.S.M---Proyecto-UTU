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

export default function LoginForm() {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");

  const [requestingAccess, setRequestingAccess] = useState(false);

  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleOpenSnackbar = (message = "", severity = "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;

    setOpenSnackbar(false);
  };

  const resetFields = () => {
    setMail("");
    setPwd("");
    setConfirmPwd("");
    setError("");
    setOpenSnackbar(false);
  };

  const handleToggleMode = (event) => {
    event.preventDefault();

    setRequestingAccess((prev) => !prev);
    resetFields();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // SOLICITUD DE ACCESO
    if (requestingAccess) {
      if (!name.trim()) {
        setError(t("request.nameRequired"));
        handleOpenSnackbar();
        return;
      }
      if (pwd !== confirmPwd) {
        setError(t("request.passwordMismatch"));
        handleOpenSnackbar();
        return;
      }

      setLoading(true);
      try {
        await requestAccess(name.trim(), mail.trim(), pwd);
        setRequestingAccess(false);
        resetFields();
        handleOpenSnackbar(t("request.success"), "success");
      } catch (error) {
        setError(error.message || t("request.sendError"));
        handleOpenSnackbar();
      } finally {
        setLoading(false);
      }
      return;
    }

    // INICIO DE SESIÓN
    setLoading(true);

    try {
      await login(mail, pwd);

      navigate("/documents/dashboard");
    } catch (error) {
      setError(error.message || t("login.invalidCredentials"));
      handleOpenSnackbar();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
        }}
      >
        {/* Título */}
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

        {/* Descripción */}
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
          {/* Correo electrónico */}
          <TextField
            label={t("login.email")}
            placeholder={t("login.emailPlaceholder")}
            fullWidth
            value={mail}
            error={Boolean(error)}
            helperText={
              error && !requestingAccess ? t("login.emailError") : " "
            }
            onChange={(event) => setMail(event.target.value)}
          />

          {/* Nombre: solo solicitud de acceso */}
          {requestingAccess && (
            <TextField
              label={t("request.name")}
              placeholder={t("request.namePlaceholder")}
              type="text"
              fullWidth
              error={Boolean(error)}
              helperText={error || " "}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          )}

          {/* Contraseña */}
          <TextField
            label={t("login.password")}
            placeholder={t("login.passwordPlaceholder")}
            type="password"
            fullWidth
            error={Boolean(error)}
            helperText={
              error && !requestingAccess ? t("login.passwordError") : " "
            }
            value={pwd}
            onChange={(event) => setPwd(event.target.value)}
          />

          {/* Confirmar contraseña */}
          {requestingAccess && (
            <TextField
              label={t("request.confirmPassword")}
              placeholder={t("request.confirmPasswordPlaceholder")}
              type="password"
              fullWidth
              error={Boolean(error)}
              helperText={error || " "}
              value={confirmPwd}
              onChange={(event) => setConfirmPwd(event.target.value)}
            />
          )}

          {/* Recordarme */}
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

          {/* Enviar formulario */}
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

          {/* Alternar entre formularios */}
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

      {/* Notificaciones */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          horizontal: "center",
          vertical: "top",
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            width: "100%",
          }}
        >
          {snackbarMessage || error || t("login.invalidCredentials")}
        </Alert>
      </Snackbar>
    </>
  );
}
