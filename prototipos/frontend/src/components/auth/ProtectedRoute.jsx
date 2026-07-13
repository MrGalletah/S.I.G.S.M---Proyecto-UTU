// import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
// import { Box, CircularProgress } from "@mui/material";

export default function ProtectedRoute() {
  {
    /* const [status, setStatus] = useState("loading");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/me.php", {
          method: "GET",
          credentials: "include",
        });

        setStatus(response.ok ? "authenticated" : "guest");
      } catch {
        setStatus("guest");
      }
    };

    checkSession();
  }, []);

  if (status === "loading") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (status === "guest") {
    return <Navigate to="/login" replace />;
  }
*/
  }
  return <Outlet />; // <Navigate to="/login" replace /> Pa simular la protección TODO: implementar la autenticación con php
} 
