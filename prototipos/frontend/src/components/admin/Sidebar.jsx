import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

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
import HistoryIcon from "@mui/icons-material/History";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

import { NavLink, useNavigate, useLocation } from "react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { logout } from "../../apiCalls/auth/authApi";
import LanguageSwitcher from "../utils/LanguageSwitcher";

const DRAWER_WIDTH = 240;

const sections = [
  {
    titleKey: "sidebar.documentation",
    items: [
      {
        labelKey: "sidebar.home",
        icon: <HomeIcon />,
        to: "/documents/dashboard",
      },
      {
        labelKey: "sidebar.categories",
        icon: <FolderOpenIcon />,
        to: "/documents/categories",
      },
      {
        labelKey: "sidebar.documents",
        icon: <DescriptionIcon />,
        to: "/documents/files",
      },
      {
        labelKey: "sidebar.surveys",
        icon: <AssignmentIcon />,
        to: "/documents/surveys",
      },
    ],
  },
  {
    titleKey: "sidebar.ambulances",
    items: [
      {
        labelKey: "sidebar.newTransfer",
        icon: <NoteAddIcon />,
        to: "/ambulances/new",
      },
      {
        labelKey: "sidebar.followUp",
        icon: <QueuePlayNextIcon />,
        to: "/ambulances/follow-up",
      },
      {
        labelKey: "sidebar.history",
        icon: <HistoryIcon />,
        to: "/ambulances/history",
      },
      {
        labelKey: "sidebar.vehicles",
        icon: <DirectionsCarIcon />,
        to: "/ambulances/vehicles",
      },
    ],
  },
  {
    titleKey: "sidebar.administration",
    items: [
      {
        labelKey: "sidebar.users",
        icon: <PeopleIcon />,
        to: "/admin/users",
      },
      {
        labelKey: "sidebar.access",
        icon: <LoginIcon />,
        to: "/admin/access",
      },
      {
        labelKey: "sidebar.userView",
        icon: <PeopleIcon />,
        to: "/documents/view",
      },
    ],
  },
];

export default function Sidebar({ open, onOpen, onClose, user }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      const status = await logout();

      if (status.ok) {
        setLogoutDialogOpen(false);
        navigate("/");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleCloseLogoutDialog = () => {
    if (loggingOut) return;

    setLogoutDialogOpen(false);
  };

  const handleNavigation = (event) => {
    // No cerrar el menú si se abre un enlace
    // en otra pestaña mediante un modificador.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }

    if (!isDesktop) {
      onClose();
    }
  };

  const drawerContent = (
    <>
      {/* Cerrar menú en dispositivos móviles */}
      {!isDesktop && (
        <IconButton
          onClick={onClose}
          aria-label={t("sidebar.closeMenu")}
          sx={{
            alignSelf: "flex-end",
            color: "var(--white-color)",
            mb: 2,
          }}
        >
          <CloseIcon />
        </IconButton>
      )}

      {/* Zona desplazable */}
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
          },
          "&::-webkit-scrollbar-thumb:hover": {
            bgcolor: "rgba(255,255,255,0.4)",
          },
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            mb: 2.5,
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

        {/* Navegación */}
        <Stack spacing={3}>
          {sections.map((section, index) => {
            const headingId = `sidebar-section-${index}`;

            return (
              <Box
                component="section"
                key={section.titleKey}
                aria-labelledby={headingId}
              >
                <Typography
                  component="h2"
                  id={headingId}
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.75)",
                    mb: 1,
                  }}
                >
                  {t(section.titleKey)}
                </Typography>

                <Stack
                  component="ul"
                  spacing={0.5}
                  sx={{
                    m: 0,
                    p: 0,
                    listStyle: "none",
                  }}
                >
                  {section.items.map((item) => (
                    <Box component="li" key={item.to}>
                      <Button
                        component={NavLink}
                        to={item.to}
                        onClick={handleNavigation}
                        startIcon={item.icon}
                        fullWidth
                        sx={{
                          color: "var(--white-color)",
                          gap: 1,
                          px: 3,
                          display: "flex",
                          justifyContent: "flex-start",
                          py: 0.8,
                          borderRadius: 1.5,
                          textTransform: "none",

                          bgcolor:
                            location.pathname === item.to
                              ? "rgba(255,255,255,0.18)"
                              : "transparent",

                          "& svg": {
                            fontSize: 18,
                          },

                          "&:hover": {
                            bgcolor: "rgba(255,255,255,0.12)",
                          },

                          "&.Mui-focusVisible": {
                            outline: "2px solid white",
                            outlineOffset: "2px",
                            bgcolor: "rgba(255,255,255,0.18)",
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 700,
                            textAlign: "left",
                          }}
                        >
                          {t(item.labelKey)}
                        </Typography>
                      </Button>
                    </Box>
                  ))}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* Selector de idioma */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 2,
          flexShrink: 0,
        }}
      >
        <LanguageSwitcher light />
      </Box>
      {/* Usuario */}
      <Box
        sx={{
          width: "100%",
          mt: 2,
          p: 1.5,
          borderRadius: 2.5,
          bgcolor: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.15)",
          flexShrink: 0,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ width: "100%" }}
        >
          {/* Icono de usuario */}
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PersonIcon sx={{ fontSize: 19 }} />
          </Box>

          {/* Nombre y correo */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                lineHeight: 1.35,
                color: "var(--white-color)",
                whiteSpace: "normal",
                overflowWrap: "anywhere",
              }}
            >
              {user.nombre}
            </Typography>

            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 400,
                lineHeight: 1.4,
                mt: 0.3,
                color: "rgba(255,255,255,0.75)",
                whiteSpace: "normal",
                overflowWrap: "anywhere",
              }}
            >
              {user.correo}
            </Typography>
          </Box>

          {/* Cerrar sesión */}
          <IconButton
            onClick={() => setLogoutDialogOpen(true)}
            aria-label={t("sidebar.logout")}
            title={t("sidebar.logout")}
            sx={{
              width: 32,
              height: 32,
              flexShrink: 0,
              color: "var(--white-color)",
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.08)",
              transition: "background-color 0.2s",

              "&:hover": {
                bgcolor: "rgba(255,255,255,0.22)",
              },

              "&.Mui-focusVisible": {
                outline: "2px solid white",
                outlineOffset: "2px",
              },
            }}
          >
            <LogoutIcon sx={{ fontSize: 19 }} />
          </IconButton>
        </Stack>
      </Box>
    </>
  );

  return (
    <>
      {/* Botón de apertura para móviles.
          Se mantiene montado para restaurar
          el foco al cerrar el Drawer. */}
      <IconButton
        onClick={onOpen}
        aria-label={t("sidebar.openMenu")}
        aria-expanded={!isDesktop && open}
        aria-controls={!isDesktop && open ? "sigsm-sidebar" : undefined}
        sx={{
          display: {
            xs: "flex",
            lg: "none",
          },
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
            bgcolor: "var(--primary-hover-color)",
          },

          "&.Mui-focusVisible": {
            outline: "2px solid var(--primary-color)",
            outlineOffset: "3px",
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop || open}
        onClose={onClose}
        ModalProps={{
          keepMounted: false,
        }}
        slotProps={{
          paper: {
            component: "nav",
            id: "sigsm-sidebar",
            "aria-label": t("sidebar.navigation"),
          },
        }}
        sx={{
          width: isDesktop ? DRAWER_WIDTH : 0,
          flexShrink: 0,

          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            height: "100dvh",
            bgcolor: "var(--primary-color)",
            color: "var(--white-color)",
            p: 2.5,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",

            "& .MuiButtonBase-root.Mui-focusVisible": {
              outline: "2px solid white",
              outlineOffset: "2px",
            },
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* cierre de sesión */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleCloseLogoutDialog}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          id="logout-dialog-title"
          sx={{
            fontWeight: 700,
          }}
        >
          {t("sidebar.logoutTitle")}
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            {t("sidebar.logoutDescription")}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseLogoutDialog}
            disabled={loggingOut}
            sx={{
              color: "var(--text-main-color)",
              textTransform: "none",
            }}
          >
            {t("sidebar.cancel")}
          </Button>

          <Button
            onClick={handleLogout}
            variant="contained"
            disabled={loggingOut}
            sx={{
              bgcolor: "var(--primary-color)",
              textTransform: "none",

              "&:hover": {
                bgcolor: "var(--primary-hover-color)",
              },
            }}
          >
            {t("sidebar.confirmLogout")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
