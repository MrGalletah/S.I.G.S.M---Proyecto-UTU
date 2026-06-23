import { Box } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import AirportShuttleOutlinedIcon from "@mui/icons-material/AirportShuttleOutlined";

export default function TransferStepIcon({ active, completed, className }) {
  return (
    <Box
      className={className}
      sx={{
        width: 26,
        height: 26,
        borderRadius: "50%",
        bgcolor: completed
          ? "var(--green-chip)"
          : active
            ? "var(--primary-color)"
            : "var(--white-color)",
        color: completed || active ? "var(--white-color)" : "transparent",
        border: completed || active ? "none" : "1px solid rgba(0,0,0,0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {completed ? (
        <CheckIcon sx={{ fontSize: 16 }} />
      ) : active ? (
        <AirportShuttleOutlinedIcon sx={{ fontSize: 15 }} />
      ) : null}
    </Box>
  );
}