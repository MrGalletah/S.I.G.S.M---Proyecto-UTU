import { Box, Typography } from "@mui/material";

export default function StatCard({ item, colors }) {
  const { label, icon, value, subtitle } = item;


  return (
    <>
      <Box
        sx={{
          bgcolor: "var(--white-color)",
          borderRadius: 3,
          p: 2,
          minHeight: 88,
          minWidth: 200,
          maxWidth: 240,
          display: "flex",
          alignItems: "center",
          gap: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          border: "var(--border-gray)",
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            bgcolor: colors ? colors.background : "var(--primary-color-shadow)",
            color: colors ?  colors.text :  "var(--primary-color)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,
            "& svg": {
                fontSize: 24
            }
          }}
        >
          {icon}
        </Box>

          <Box>
            <Typography sx={{
                fontSize: 26,
                fontWeight: 900,
                lineHeight: 1,
                color: "var(--text-main-color)"
            }}>
                {value}
            </Typography>

            <Typography sx={{
                fontSize: 12,
                fontWeight: 800,
                color: "var(--text-main-color)",
                mt: .2
            }}>
                {label}
            </Typography>

            {subtitle && (
                <Typography sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-muted-color)",
                    mt: .2
                }}>
                    {subtitle}
                </Typography>
            )}
          </Box>


      </Box>
    </>
  );
}
