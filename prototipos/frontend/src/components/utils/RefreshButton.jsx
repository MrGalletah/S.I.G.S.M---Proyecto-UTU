import { useState } from "react";
import { useTranslation } from "react-i18next";

import { CircularProgress, IconButton, Tooltip } from "@mui/material";

import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

export default function RefreshButton({
  fetchData,
  setData,
  onSuccess,
  onError,
  label,
}) {
  const { t } = useTranslation("common");

  const [refreshing, setRefreshing] = useState(false);

  const buttonLabel = label ?? t("refresh.label");

  const handleRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);

    try {
      const data = await fetchData();

      setData(data);

      onSuccess?.(data);
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error(t("refresh.error"), error);
      }
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Tooltip title={buttonLabel}>
      <span>
        <IconButton
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          aria-label={buttonLabel}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            width: 40,
            height: 40,
            color: "var(--primary-color)",

            "&:hover": {
              bgcolor: "rgba(15, 124, 113, 0.08)",
            },
          }}
        >
          {refreshing ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <RefreshRoundedIcon />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
}
