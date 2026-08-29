import { useState } from "react";

export function useNotification() {
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const closeNotification = (event, reason) => {
    if (reason === "clickaway") return;

    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  };

  return {
    notification,
    showNotification,
    closeNotification,
  };
}