import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";

import {
  Box,
  CircularProgress,
  Alert,
  Button,
  Snackbar,
  Stack,
} from "@mui/material";

import { getCurrentUser } from "../../apiCalls/auth/authApi";

export default function ProtectedRoute() {
  const location = useLocation();

  // undefined: todavía no se comprobó la sesión
  // null: no hay sesión
  // objeto: usuario autenticado
  const [user, setUser] = useState(undefined);

  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        // CONSULTAR USUARIO Y ROLES ACTUALES
        const currentUser = await getCurrentUser();

        if (!active) return;

        setUser(currentUser);
        setError(null);
      } catch (err) {
        if (!active) return;

        console.error("Error al verificar la sesión:", err);

        setError("No se pudo verificar la sesión con el servidor.");
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [location.pathname, retry]);

  // PRIMERA CARGA

  if (user === undefined) {
    if (error) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            bgcolor: "var(--main-bg-color)",
            p: 3,
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Alert severity="error">{error}</Alert>

            <Button
              variant="contained"
              onClick={() => setRetry((prev) => prev + 1)}
            >
              Reintentar
            </Button>
          </Stack>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "var(--main-bg-color)",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // SESIÓN INEXISTENTE O CADUCADA

  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  // SESIÓN VÁLIDA

  return (
    <>
      <Outlet context={{ user }} />

      {/* ERROR AL ACTUALIZAR LA SESIÓN */}

      <Snackbar
        open={Boolean(error)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          severity="warning"
          variant="filled"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setRetry((prev) => prev + 1)}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
