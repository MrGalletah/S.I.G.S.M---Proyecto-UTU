import { Box, Paper, Stack, Typography } from "@mui/material";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import GppGoodIcon from "@mui/icons-material/GppGood";
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import LoginForm from "../components/login/LoginForm";

export default function Login() {
  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#EAF6F5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: "100%",
            maxWidth: "980px",
            height: "600px",
            borderRadius: 3,
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "40% 60%",
            },
          }}
        >
          {/* Izquierda */}
          <Box
            sx={{
              bgcolor: "var(--primary-color)",
              p: 5,
              display: {
                xs: "none",
                md: "flex",
              },
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <MonitorHeartIcon sx={{ fontSize: 44, color: "#fff" }} />
            </Box>

            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 800,
                mb: 2,
                color: "var(--white-color)",
              }}
            >
              Portal Médico
            </Typography>

            <Typography
              sx={{
                color: "var(--white-color)",
                fontWeight: 600,
                fontSize: 14,
                lineHeight: 1.7,
                maxWidth: 280,
                mb: 5,
              }}
            >
              Acceso seguro para personal sanitario, gestión de ambulancias y
              documentación.
            </Typography>

            <Stack spacing={2.2}>
                {/* Badge 1 */}
              <Stack direction={"row"} spacing={1.5}sx={{alignItems: "center"}}>
                {" "}
                <GppGoodIcon sx={{ color: "var(--white-color)", fontSize: 22 }} />
                <Typography
                  sx={{
                    color: "var(--white-color)",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  Entorno protegido
                </Typography>
              </Stack>
                {/* Badge 2 */}
              <Stack direction={"row"} spacing={1.5} sx={{alignItems: "center"}}>
                {" "}
                <ContentPasteIcon sx={{ color: "var(--white-color)", fontSize: 22 }} />
                <Typography
                  sx={{
                    color: "var(--white-color)",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  Información centralizada
                </Typography>
              </Stack>
            </Stack>
          </Box>
          {/* Derecha */}
          <Box
            sx={{
              p: {xs : 3, sm: 4, md: 5},
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
              
            }}
          >
            <LoginForm />
          </Box>
        </Paper>
      </Box>
    </>
  );
}
