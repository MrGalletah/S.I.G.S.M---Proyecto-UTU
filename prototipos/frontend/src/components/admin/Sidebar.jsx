import { Box, Button, IconButton, Stack, Typography } from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import QueuePlayNextIcon from "@mui/icons-material/QueuePlayNext";
import LoginIcon from "@mui/icons-material/Login";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLocation, useNavigate } from "react-router";

const sections = [
  {
    title: "Módulo de documentación",
    items: [
      { label: "Inicio", icon: <HomeIcon />, to: "/documents/dashboard" },
      {
        label: "Categorías",
        icon: <FolderOpenIcon />,
        to: "/documents/categories",
      },
      {
        label: "Documentos",
        icon: <DescriptionIcon />,
        to: "/documents/files",
      },
      {
        label: "Encuestas",
        icon: <AssignmentIcon />,
        to: "/documents/surveys",
      },
    ],
  },
  {
    title: "Módulo de ambulancias",
    items: [
      { label: "Nuevo traslado", icon: <NoteAddIcon />, to: "/ambulances/new" },
      {
        label: "Seguimiento",
        icon: <QueuePlayNextIcon />,
        to: "/ambulances/follow-up",
      },
    ],
  },
  {
    title: "Administrador general",
    items: [
      { label: "Vista de usuarios", icon: <PeopleIcon />, to: "/admin/users/view" },
      { label: "Usuarios", icon: <PeopleIcon />, to: "/admin/users" },
      { label: "Acceso", icon: <LoginIcon />, to: "/admin/access" },
    ],
  },
];

export default function Sidebar({ open, onOpen, onClose}) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {!open && (
        <IconButton
          onClick={onOpen}
          aria-label="Abrir menú de navegación"
          sx={{
            display: { xs: "flex", lg: "none" },
            position: "fixed",
            top: 16,
            left: 16,
            bgcolor: "var(--primary-color)",
            color: "var(--white-color)",
            width: 48,
            height: 48,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
            zIndex: 10,
            "&:hover": {
              bgcolor: "var(--primary-color)",
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Box
        component="nav"
        aria-label="Menú principal"
        sx={{
          width: "240px",
          height: "100dvh",
          bgcolor: "var(--primary-color)",
          color: "var(--white-color)",
          p: 2.5,
          position: { xs: "fixed", lg: "sticky" },
          top: 0,
          left: 0,
          transform: {
            xs: open ? "translateX(0)" : "translateX(-100%)",
            lg: "translateX(0)",
          },
          transition: "transform 0.25s ease",
          display: "flex",
          flexDirection: "column",
          zIndex: 10,
          overflow: "hidden",
        }}
      >
        <IconButton
          onClick={onClose}
          aria-label="Cerrar menú de navegación"
          sx={{
            display: { xs: "inline-flex", lg: "none" },
            alignSelf: "flex-end",
            color: "var(--white-color)",
            mb: 2,
            flexShrink: 0,
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Zona scrolleable */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            pr: 0.5,
            pb: 2,

            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "rgba(255,255,255,0.25)",
              borderRadius: "999px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              bgcolor: "rgba(255,255,255,0.4)",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              mb: 5,
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <LocalHospitalIcon />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                HC
              </Typography>

              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                Hospital de Clínicas
              </Typography>
            </Box>
          </Box>

          <Stack spacing={3}>
            {sections.map((section) => (
              <Box key={section.title}>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.75)",
                    mb: 1,
                  }}
                >
                  {section.title}
                </Typography>

                <Stack spacing={0.5}>
                  {section.items.map((item) => (
                    <Button
                      key={item.label}
                      startIcon={item.icon}
                      variant="text"
                      sx={{
                        color: "var(--white-color)",
                        gap: 1,
                        px: 3,
                        display: "flex",
                        justifyContent: "start",
                        py: 0.8,
                        borderRadius: 1.5,
                        bgcolor:
                          location.pathname === item.to
                            ? "rgba(255,255,255,0.18)"
                            : "transparent",
                        cursor: "pointer",
                        "& svg": {
                          fontSize: 18,
                        },
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.12)",
                        },
                      }}
                      onClick={() => {
                        navigate(item.to);
                        onClose();
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Button>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Usuario fijo abajo */}
        <Box
          sx={{
            width: "100%",
            mt: 2,
            borderRadius: 2,
            p: 1,
            bgcolor: "var(--white-color)28",
            display: "flex",
            gap: 3,
            flexShrink: 0,
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PersonIcon />
            </Box>

            <Box
              sx={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 800,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Administrador
              </Typography>

              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: "rgba(216, 216, 216, 0.9)",
                  mt: 0.3,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                admin@hc.com
              </Typography>
            </Box>

            <IconButton
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: "var(--white-color)",
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </>
  );
}
