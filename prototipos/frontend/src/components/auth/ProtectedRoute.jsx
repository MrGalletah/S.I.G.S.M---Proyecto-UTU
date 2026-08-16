import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { Box, CircularProgress } from "@mui/material";
import { getCurrentUser } from "../../apiCalls/auth/authApi";

export default function ProtectedRoute() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await getCurrentUser();

        setUser(response);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [location.pathname]);

  if (loading) {
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

  if (!user) {
    return <Navigate to="/login" replace />;
  } else {
    return <Outlet context={{user}} />;
  }

}
