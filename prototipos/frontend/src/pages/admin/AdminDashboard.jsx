import { Box, Typography } from "@mui/material";
import Sidebar from "../../components/admin/Sidebar";
import { useState } from "react";
import DocsDashboard from "../../components/admin/documents/DocsDashboard";
import CategoriesCard from "../../components/admin/documents/CategoriesCard";
import SurveysCard from "../../components/admin/documents/SurveysCard"
import DocsCard from "../../components/admin/documents/DocsCard";
import NewTransfer from "../../components/admin/ambulances/NewTansfer";
import FollowUp from "../../components/admin/ambulances/FollowUp";
import UserView from "../../components/admin/general/UserView";


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
        return <DocsCard variant="full"/>;

      case "enc":
        return <SurveysCard variant="full" />;

      case "new":
        return <NewTransfer />;

      case "follow":
        return <FollowUp />;

      case "usersView": 
        return <UserView />;

      case "users":
        return <Typography>Gestión de usuarios 🚧 En construcción 🚧  </Typography>;

      case "access":
        return <Typography>Conceder acceso 🚧 En construcción 🚧 </Typography>;

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
            gridColumn: { xs: "1 / -1", lg: "2 / 3" },
            minWidth: 0
          }}
        >
          {renderContent()}
        </Box>
      </Box>
    </>
  );
}
