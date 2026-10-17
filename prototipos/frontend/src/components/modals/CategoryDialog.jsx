import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from "@mui/material";

import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function CategoryModal({
  open,
  onClose,
  category = null,
  onSubmit,
  loading = false,
}) {
  const { t } = useTranslation("documents");

  const isEditing = Boolean(category);

  const [name, setName] = useState(category?.nombre ?? "");
  const [description, setDescription] = useState(category?.descripcion ?? "");
  const [active, setActive] = useState(Boolean(category?.activo));

  const nameIsEmpty = !name.trim();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = {
      nombre: name.trim(),
      descripcion: description.trim(),
    };

    if (isEditing) {
      data.activo = active;
    }

    await onSubmit(data);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="category-dialog-title"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle id="category-dialog-title">
          {isEditing
            ? t("categories.dialog.editTitle")
            : t("categories.dialog.createTitle")}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t("categories.dialog.name")}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              fullWidth
              autoFocus
            />

            <TextField
              label={t("categories.dialog.description")}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              multiline
              rows={4}
              fullWidth
            />

            {isEditing && (
              <FormControlLabel
                control={
                  <Switch
                    checked={active}
                    onChange={(event) => setActive(event.target.checked)}
                  />
                }
                label={
                  active
                    ? t("categories.dialog.active")
                    : t("categories.dialog.inactive")
                }
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            {t("categories.dialog.cancel")}
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={loading || nameIsEmpty}
          >
            {loading
              ? t("categories.dialog.saving")
              : isEditing
                ? t("categories.dialog.save")
                : t("categories.dialog.create")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
