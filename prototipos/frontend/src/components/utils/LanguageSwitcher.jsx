import { ToggleButton, ToggleButtonGroup, Stack, Box } from "@mui/material";

import { useTranslation } from "react-i18next";

import esFlag from "../../assets/flags/es.svg";
import enFlag from "../../assets/flags/en.svg";

const languages = [
  {
    value: "es",
    label: "ES",
    flag: esFlag,
  },
  {
    value: "en",
    label: "EN",
    flag: enFlag,
  },
];

export default function LanguageSwitcher({ light = false }) {
  const { i18n } = useTranslation();

  const language = i18n.resolvedLanguage === "en" ? "en" : "es";

  const handleChange = (_, newLanguage) => {
    if (!newLanguage) return;

    i18n.changeLanguage(newLanguage);

    localStorage.setItem("sigsm-language", newLanguage);
  };

  return (
    <ToggleButtonGroup
      value={language}
      exclusive
      onChange={handleChange}
      size="small"
      aria-label="Idioma / Language"
      sx={{
        "& .MuiToggleButton-root": {
          px: 1.5,
          py: 0.7,
          borderColor: light ? "rgba(255,255,255,0.4)" : "var(--primary-color)",

          color: light ? "var(--white-color)" : "var(--primary-color)",

          "&.Mui-selected": {
            bgcolor: light ? "var(--white-color)" : "var(--primary-color)",

            color: light ? "var(--primary-color)" : "var(--white-color)",

            "&:hover": {
              bgcolor: light
                ? "var(--white-color)"
                : "var(--primary-hover-color)",
            },
          },
        },
      }}
    >
      {languages.map((option) => (
        <ToggleButton
          key={option.value}
          value={option.value}
          aria-label={option.value === "es" ? "Español" : "English"}
        >
          <Stack direction="row" spacing={0.8} alignItems="center">
            <Box
              component="img"
              src={option.flag}
              alt=""
              sx={{
                width: 22,
                height: 16,
                objectFit: "cover",
                borderRadius: "2px",
                flexShrink: 0,
              }}
            />

            <Box
              component="span"
              sx={{
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {option.label}
            </Box>
          </Stack>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
