import { Box } from "@mui/material";
import { Outlet, useOutletContext } from "react-router";
import { useState } from "react";

import Sidebar from "../../components/admin/Sidebar";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {user} = useOutletContext()

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "var(--main-bg-color)",
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          lg: "240px 1fr",
        },
      }}
    >
      <Sidebar
        open={sidebarOpen}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <Box
        component="main"
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          gridColumn: { xs: "1 / -1", lg: "2 / 3" },
          minWidth: 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}