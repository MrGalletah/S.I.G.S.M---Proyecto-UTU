import { Box, Typography } from "@mui/material";

export default function DetailItem({ icon, label, value }) {
  return (
    <Box
      sx={{
        minHeight: 32,
        px: 1.2,
        py: 0.5,
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 1.5,
        bgcolor: "rgba(0,0,0,0.02)",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box
        sx={{
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          "& svg": {
            fontSize: 18,
          },
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: 12,
          color: "text.secondary",
          flex: 1,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 800,
          textAlign: "right",
          maxWidth: "55%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
