import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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

// RELACIÓN ENTRE NOMBRES DE BD Y CLAVES DE TRADUCCIÓN

const transferTypeKeys = {
  "Traslado interno": "internal",
  "Traslado a otro centro": "otherCenter",
  "Traslado a domicilio": "home",
  "Retorno al hospital": "return",
  Otro: "other",
};

const elementTypeKeys = {
  Paciente: "patient",
  "Muestra biológica": "biologicalSample",
  Equipamiento: "equipment",
  Insumo: "supply",
  Otro: "other",
};

export default function NewTransfer() {
  const { t } = useTranslation("transfers");

  // FORMULARIO

  const [form, setForm] = useState(initialForm);

  // CATÁLOGOS

  const [transferTypes, setTransferTypes] = useState([]);
  const [elementTypes, setElementTypes] = useState([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  // ENVÍO

  const [submitting, setSubmitting] = useState(false);

  // NOTIFICACIONES

  const { notification, showNotification, closeNotification } =
    useNotification();

  // CARGAR CATÁLOGOS DESDE LA API

  useEffect(() => {
    let cancelled = false;

    const loadCatalogs = async () => {
      try {
        setLoadingCatalogs(true);

        const data = await getTransferCatalogs();

        if (cancelled) return;

        setTransferTypes(data.tipos_traslado ?? []);
        setElementTypes(data.tipos_elemento ?? []);
      } catch (error) {
        if (cancelled) return;

        console.error(error);

        showNotification(
          error.message || t("newTransfer.errors.loadCatalogs"),
          "error",
        );
      } finally {
        if (!cancelled) {
          setLoadingCatalogs(false);
        }
      }
    };

    loadCatalogs();

    return () => {
      cancelled = true;
    };
  }, [showNotification, t]);

  // IDENTIFICAR TIPOS SELECCIONADOS

  const selectedTransferType = transferTypes.find(
    (type) => Number(type.id_tipo_traslado) === Number(form.tipoTraslado),
  );

  const selectedElementType = elementTypes.find(
    (type) => Number(type.id_tipo_elemento) === Number(form.tipoElemento),
  );

  // MANTENER LOS NOMBRES ORIGINALES PARA LAS REGLAS

  const transferTypeName = selectedTransferType?.nombre ?? "";
  const elementTypeName = selectedElementType?.nombre ?? "";

  const currentRouteRule = routeRules[transferTypeName] ?? {
    lockOrigen: false,
    lockDestino: false,
  };

  // TRADUCIR SOLO LAS ETIQUETAS VISIBLES

  const tipoTrasladoOptions = transferTypes.map((type) => {
    const translationKey = transferTypeKeys[type.nombre];

    return {
      value: type.id_tipo_traslado,
      label: translationKey
        ? t(`newTransfer.transferTypes.${translationKey}`)
        : type.nombre,
    };
  });

  const tipoElementoOptions = elementTypes.map((type) => {
    const translationKey = elementTypeKeys[type.nombre];

    return {
      value: type.id_tipo_elemento,
      label: translationKey
        ? t(`newTransfer.elementTypes.${translationKey}`)
        : type.nombre,
    };
  });

  const priorityOptions = prioridadOptions.map((priority) => ({
    value: priority,
    label: t(`priorities.${priority}`),
  }));

  // ACTUALIZAR FORMULARIO

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => {
      // TIPO DE TRASLADO

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

      // TIPO DE ELEMENTO

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

  // LIMPIAR FORMULARIO

  const handleCancel = () => {
    setForm({ ...initialForm });
  };

  // CREAR SOLICITUD

  const handleSubmit = async (event) => {
    event.preventDefault();

    // CAMPOS OBLIGATORIOS

    if (
      !form.tipoTraslado ||
      !form.tipoElemento ||
      !form.origen.trim() ||
      !form.destino.trim() ||
      !form.prioridad ||
      !form.fechaRequerida
    ) {
      showNotification(t("newTransfer.errors.required"), "error");
      return;
    }

    // PACIENTE

    if (elementTypeName === "Paciente" && !form.cedulaPaciente.trim()) {
      showNotification(t("newTransfer.errors.patientId"), "error");
      return;
    }

    // OTRO ELEMENTO

    if (elementTypeName !== "Paciente" && !form.elemento.trim()) {
      showNotification(t("newTransfer.errors.element"), "error");
      return;
    }

    // VALIDAR ORIGEN Y DESTINO

    if (
      transferTypeName !== "Traslado interno" &&
      form.origen.trim().toLowerCase() === form.destino.trim().toLowerCase()
    ) {
      showNotification(t("newTransfer.errors.sameLocation"), "error");
      return;
    }

    // DATOS PARA EL BACKEND

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

      showNotification(t("newTransfer.success"), "success");

      setForm({ ...initialForm });
    } catch (error) {
      console.error(error);

      showNotification(
        error.message || t("newTransfer.errors.submit"),
        "error",
      );
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
        {/* CABECERA */}

        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            mb: 0.5,
          }}
        >
          {t("newTransfer.title")}
        </Typography>

        <Typography
          sx={{
            fontSize: 14,
            color: "text.secondary",
            mb: 3,
          }}
        >
          {t("newTransfer.description")}
        </Typography>

        {/* CAMPOS */}

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
          {/* TIPO DE TRASLADO */}

          <TransferFormField
            label={t("newTransfer.transferType")}
            name="tipoTraslado"
            value={form.tipoTraslado}
            onChange={handleChange}
            icon={<LocalHospitalOutlinedIcon />}
            select
            options={tipoTrasladoOptions}
            disabled={loadingCatalogs || submitting}
          />

          {/* TIPO DE ELEMENTO */}

          <TransferFormField
            label={t("newTransfer.elementType")}
            name="tipoElemento"
            value={form.tipoElemento}
            onChange={handleChange}
            icon={<Inventory2OutlinedIcon />}
            select
            options={tipoElementoOptions}
            disabled={loadingCatalogs || submitting}
          />

          {/* PACIENTE O ELEMENTO */}

          <TransferSubjectField
            tipoElemento={elementTypeName}
            cedulaPaciente={form.cedulaPaciente}
            elemento={form.elemento}
            onChange={handleChange}
          />

          {/* ORIGEN */}

          <TransferFormField
            label={t("newTransfer.origin")}
            name="origen"
            value={form.origen}
            onChange={handleChange}
            icon={<LocationOnOutlinedIcon />}
            disabled={currentRouteRule.lockOrigen || submitting}
          />

          {/* DESTINO */}

          <TransferFormField
            label={t("newTransfer.destination")}
            name="destino"
            value={form.destino}
            onChange={handleChange}
            icon={<LocationOnOutlinedIcon />}
            disabled={currentRouteRule.lockDestino || submitting}
          />

          {/* PRIORIDAD */}

          <TransferFormField
            label={t("newTransfer.priority")}
            name="prioridad"
            value={form.prioridad}
            onChange={handleChange}
            icon={<FlagOutlinedIcon />}
            select
            options={priorityOptions}
            disabled={submitting}
          />

          {/* FECHA REQUERIDA */}

          <TransferFormField
            label={t("newTransfer.requiredDate")}
            name="fechaRequerida"
            value={form.fechaRequerida}
            onChange={handleChange}
            icon={<CalendarMonthOutlinedIcon />}
            type="date"
            disabled={submitting}
          />

          {/* OBSERVACIONES */}

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
              {t("newTransfer.observations")}
            </Typography>

            <TextField
              fullWidth
              multiline
              minRows={3}
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              placeholder={t("newTransfer.observationsPlaceholder")}
              disabled={submitting}
            />
          </Box>
        </Box>

        {/* ACCIONES */}

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
            {t("newTransfer.cancel")}
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={submitting || loadingCatalogs}
          >
            {submitting ? t("newTransfer.submitting") : t("newTransfer.submit")}
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
