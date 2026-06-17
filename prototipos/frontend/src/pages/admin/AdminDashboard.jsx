import { Box, Typography } from "@mui/material";
import Sidebar from "../../components/admin/Sidebar";
import { useState } from "react";
import DocsDashboard from "../../components/admin/documents/DocsDashboard";
import CategoriesCard from "../../components/admin/documents/CategoriesCard";
export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [content, setContent] = useState("docsDashboard");

  const onOpen = () => {
    setSidebarOpen(true);
  };

  const onClose = () => {
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (content) {
      case "docsDashboard":
        return <DocsDashboard />;

      case "cat":
        return <CategoriesCard variant="full"/>;

      case "docs":
        return <Typography>Pantalla de documentos</Typography>;

      case "enc":
        return <Typography>Pantalla de encuestas</Typography>;

      case "ambDashboard":
        return <Typography>Inicio de ambulancias</Typography>;

      case "new":
        return <Typography>Formulario de nuevo traslado</Typography>;

      case "follow":
        return <Typography>Seguimiento de traslados</Typography>;

      case "users":
        return <Typography>Gestión de usuarios</Typography>;

      case "access":
        return <Typography>Conceder acceso</Typography>;

      default:
        return <Typography>Como llegaste hasta aqui?</Typography>;
    }
  };

  return (
    <>
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
          onClose={onClose}
          onOpen={onOpen}
          setContent={setContent}
        />

        <Box
          component={"main"}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            gridColumn: { xs: "1 / -1", lg: "2 / 3" }
          }}
        >
          <Box
            component={"div"}
            sx={{
              ml: { xs: "72px", lg: 0 },
            }}
          >
            <Typography
              variant="h5"
              component={"h1"}
              sx={{
                fontWeight: 800,
                color: "var(--text-main-colo)",
              }}
            >
              Panel de administración
            </Typography>
          </Box>
          {renderContent()}
        </Box>
      </Box>
    </>
  );
}
