import { useEffect, useState } from "react";

import { Box, Button, Card, Stack, TextField, Typography } from "@mui/material";

import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import TransferFormField from "./TransferFormField";
import TransferSubjectField from "./TransferSubjectField";

import {
  initialForm,
  routeRules,
  prioridadOptions,
} from "./transferFormConfig";

import {
  createTransfer,
  getTransferCatalogs,
} from "../../../../apiCalls/transfers/transfersApi";

import { useNotification } from "../../../../hooks/useNotification";
import NotificationSnackbar from "../../../utils/NotificationSnackbar";

export default function NewTransfer() {
  const [form, setForm] = useState(initialForm);

  const [transferTypes, setTransferTypes] = useState([]);
  const [elementTypes, setElementTypes] = useState([]);

  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { notification, showNotification, closeNotification } =
    useNotification();

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const data = await getTransferCatalogs();

        setTransferTypes(data.tipos_traslado ?? []);

        setElementTypes(data.tipos_elemento ?? []);
      } catch (error) {
        showNotification(error.message, "error");
      } finally {
        setLoadingCatalogs(false);
      }
    };

    loadCatalogs();
  }, []);

  const selectedTransferType = transferTypes.find(
    (type) => Number(type.id_tipo_traslado) === Number(form.tipoTraslado),
  );

  const selectedElementType = elementTypes.find(
    (type) => Number(type.id_tipo_elemento) === Number(form.tipoElemento),
  );

  const transferTypeName = selectedTransferType?.nombre ?? "";

  const elementTypeName = selectedElementType?.nombre ?? "";

  const currentRouteRule = routeRules[transferTypeName] ?? {
    lockOrigen: false,
    lockDestino: false,
  };

  const tipoTrasladoOptions = transferTypes.map((type) => ({
    value: type.id_tipo_traslado,
    label: type.nombre,
  }));

  const tipoElementoOptions = elementTypes.map((type) => ({
    value: type.id_tipo_elemento,
    label: type.nombre,
  }));

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => {
      if (name === "tipoTraslado") {
        const selectedType = transferTypes.find(
          (type) => Number(type.id_tipo_traslado) === Number(value),
        );

        const rule = routeRules[selectedType?.nombre] ?? {
          origen: "",
          destino: "",
        };

        return {
          ...prev,
          tipoTraslado: value,
          origen: rule.origen ?? "",
          destino: rule.destino ?? "",
        };
      }

      if (name === "tipoElemento") {
        return {
          ...prev,
          tipoElemento: value,
          cedulaPaciente: "",
          elemento: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleCancel = () => {
    setForm({
      ...initialForm,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.tipoTraslado ||
      !form.tipoElemento ||
      !form.origen.trim() ||
      !form.destino.trim() ||
      !form.prioridad ||
      !form.fechaRequerida
    ) {
      showNotification("Complete todos los campos obligatorios.", "error");

      return;
    }

    if (elementTypeName === "Paciente" && !form.cedulaPaciente.trim()) {
      showNotification("Ingrese la cédula del paciente.", "error");

      return;
    }

    if (elementTypeName !== "Paciente" && !form.elemento.trim()) {
      showNotification("Ingrese una descripción del elemento.", "error");

      return;
    }

    if (
      transferTypeName !== "Traslado interno" &&
      form.origen.trim().toLowerCase() === form.destino.trim().toLowerCase()
    ) {
      showNotification(
        "El origen y el destino no pueden ser iguales.",
        "error",
      );

      return;
    }

    const transferData = {
      id_tipo_traslado: Number(form.tipoTraslado),

      id_tipo_elemento: Number(form.tipoElemento),

      cedula_paciente:
        elementTypeName === "Paciente" ? form.cedulaPaciente.trim() : null,

      elemento: elementTypeName !== "Paciente" ? form.elemento.trim() : null,

      origen: form.origen.trim(),

      destino: form.destino.trim(),

      prioridad: form.prioridad.toUpperCase(),

      fecha_requerida: form.fechaRequerida,

      observaciones: form.observaciones.trim() || null,
    };

    try {
      setSubmitting(true);

      await createTransfer(transferData);

      showNotification(
        "Solicitud de traslado registrada correctamente.",
        "success",
      );

      setForm({
        ...initialForm,
      });
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Card
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 980,
          mx: "auto",
          borderRadius: 4,
          p: { xs: 2.5, md: 4 },
          boxShadow: "var(--card-shadow)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            mb: 0.5,
          }}
        >
          Nueva solicitud de traslado
        </Typography>

        <Typography
          sx={{
            fontSize: 14,
            color: "text.secondary",
            mb: 3,
          }}
        >
          Ingrese los datos necesarios para solicitar el traslado.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
            },
            columnGap: { md: 8 },
            rowGap: 2.5,
          }}
        >
          <TransferFormField
            label="Tipo de traslado *"
            name="tipoTraslado"
            value={form.tipoTraslado}
            onChange={handleChange}
            icon={<LocalHospitalOutlinedIcon />}
            select
            options={tipoTrasladoOptions}
            disabled={loadingCatalogs}
          />

          <TransferFormField
            label="Tipo de elemento *"
            name="tipoElemento"
            value={form.tipoElemento}
            onChange={handleChange}
            icon={<Inventory2OutlinedIcon />}
            select
            options={tipoElementoOptions}
            disabled={loadingCatalogs}
          />

          <TransferSubjectField
            tipoElemento={elementTypeName}
            cedulaPaciente={form.cedulaPaciente}
            elemento={form.elemento}
            onChange={handleChange}
          />

          <TransferFormField
            label="Origen *"
            name="origen"
            value={form.origen}
            onChange={handleChange}
            icon={<LocationOnOutlinedIcon />}
            disabled={currentRouteRule.lockOrigen}
          />

          <TransferFormField
            label="Destino *"
            name="destino"
            value={form.destino}
            onChange={handleChange}
            icon={<LocationOnOutlinedIcon />}
            disabled={currentRouteRule.lockDestino}
          />

          <TransferFormField
            label="Prioridad *"
            name="prioridad"
            value={form.prioridad}
            onChange={handleChange}
            icon={<FlagOutlinedIcon />}
            select
            options={prioridadOptions}
          />

          <TransferFormField
            label="Fecha requerida *"
            name="fechaRequerida"
            value={form.fechaRequerida}
            onChange={handleChange}
            icon={<CalendarMonthOutlinedIcon />}
            type="date"
          />

          <Box
            sx={{
              gridColumn: {
                xs: "1",
                md: "1 / -1",
              },
            }}
          >
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 500,
                mb: 1,
              }}
            >
              Observaciones
            </Typography>

            <TextField
              fullWidth
              multiline
              minRows={3}
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              placeholder="Ingrese observaciones adicionales..."
              disabled={submitting}
            />
          </Box>
        </Box>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            justifyContent: "flex-end",
            mt: 3,
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={submitting || loadingCatalogs}
          >
            {submitting ? "Enviando..." : "Enviar solicitud"}
          </Button>
        </Stack>
      </Card>

      <NotificationSnackbar
        notification={notification}
        onClose={closeNotification}
      />
    </>
  );
}
