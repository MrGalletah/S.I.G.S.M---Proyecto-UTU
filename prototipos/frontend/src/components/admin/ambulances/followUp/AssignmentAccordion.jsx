import { useTranslation } from "react-i18next";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

import { formatDate } from "../../../utils/formatDate";

// CAMPO DE SOLO LECTURA

function ReadOnlyField({ label, value }) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          color: "text.secondary",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 15,
          color: "var(--text-main-color)",
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}

export default function AssignmentAccordion({
  transfer,
  assigned,
  form,
  onChange,
  resources,
  loadingResources,
  onLoadResources,
}) {
  const { t } = useTranslation("transfers");

  // REGLAS ORIGINALES DE ASIGNACIÓN

  const requiresNurse = transfer.tipoElemento === "Paciente";

  const canEdit = transfer.estado === "Registrado";

  const intervalComplete =
    Boolean(form.horaSalidaEstimada) && Boolean(form.horaLlegadaEstimada);

  return (
    <Accordion
      defaultExpanded={!assigned || canEdit}
      disableGutters
      sx={{
        mt: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px !important",
        boxShadow: "none",
        "&::before": {
          display: "none",
        },
      }}
    >
      {/* ENCABEZADO */}

      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>
            {t("followUp.assignment.title")}
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            {!canEdit
              ? t("followUp.assignment.readOnlyDescription")
              : assigned
                ? t("followUp.assignment.editDescription")
                : t("followUp.assignment.newDescription")}
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        {!canEdit ? (
          // TRASLADO YA INICIADO: SOLO LECTURA

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 2.5,
            }}
          >
            <ReadOnlyField
              label={t("followUp.assignment.vehicle")}
              value={transfer.vehiculo}
            />

            <ReadOnlyField
              label={t("followUp.assignment.driver")}
              value={transfer.conductor}
            />

            <ReadOnlyField
              label={t("followUp.assignment.nurse")}
              value={transfer.enfermero}
            />

            <ReadOnlyField
              label={t("followUp.assignment.estimatedDeparture")}
              value={formatDate(transfer.horaSalidaEstimada)}
            />

            <ReadOnlyField
              label={t("followUp.assignment.estimatedArrival")}
              value={formatDate(transfer.horaLlegadaEstimada)}
            />
          </Box>
        ) : (
          <>
            {/* RECURSOS ASIGNADOS ACTUALMENTE */}

            {assigned && !resources && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },
                  gap: 2,
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "var(--main-bg-color)",
                }}
              >
                <ReadOnlyField
                  label={t("followUp.assignment.currentVehicle")}
                  value={transfer.vehiculo}
                />

                <ReadOnlyField
                  label={t("followUp.assignment.currentDriver")}
                  value={transfer.conductor}
                />

                <ReadOnlyField
                  label={t("followUp.assignment.currentNurse")}
                  value={transfer.enfermero}
                />
              </Box>
            )}

            {/* HORARIOS ESTIMADOS */}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 2.5,
              }}
            >
              <TextField
                fullWidth
                size="small"
                type="datetime-local"
                label={t("followUp.assignment.estimatedDepartureRequired")}
                name="horaSalidaEstimada"
                value={form.horaSalidaEstimada}
                onChange={onChange}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <TextField
                fullWidth
                size="small"
                type="datetime-local"
                label={t("followUp.assignment.estimatedArrivalRequired")}
                name="horaLlegadaEstimada"
                value={form.horaLlegadaEstimada}
                onChange={onChange}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Box>

            {/* CONSULTAR DISPONIBILIDAD */}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={onLoadResources}
                disabled={!intervalComplete || loadingResources}
                startIcon={
                  loadingResources ? (
                    <CircularProgress size={16} />
                  ) : (
                    <SearchOutlinedIcon />
                  )
                }
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 700,
                }}
              >
                {loadingResources
                  ? t("followUp.assignment.checking")
                  : resources
                    ? t("followUp.assignment.refreshAvailability")
                    : t("followUp.assignment.checkAvailability")}
              </Button>
            </Box>

            {/* RECURSOS DISPONIBLES */}

            {resources && (
              <>
                <Divider sx={{ my: 3 }} />

                <Typography
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                  }}
                >
                  {t("followUp.assignment.availableResources")}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 13,
                    color: "text.secondary",
                    mb: 2,
                  }}
                >
                  {assigned
                    ? t("followUp.assignment.keepResources")
                    : t("followUp.assignment.selectResources")}
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                    },
                    gap: 2.5,
                  }}
                >
                  {/* VEHÍCULO */}

                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={t("followUp.assignment.vehicleRequired")}
                    name="idVehiculo"
                    value={form.idVehiculo}
                    onChange={onChange}
                    disabled={resources.vehiculos.length === 0}
                  >
                    {resources.vehiculos.length > 0 ? (
                      resources.vehiculos.map((vehicle) => (
                        <MenuItem
                          key={vehicle.id_vehiculo}
                          value={vehicle.id_vehiculo}
                        >
                          {vehicle.matricula}
                          {" - "}
                          {vehicle.modelo}
                          {vehicle.tipo?.nombre
                            ? ` (${vehicle.tipo.nombre})`
                            : ""}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        {t("followUp.assignment.noVehicles")}
                      </MenuItem>
                    )}
                  </TextField>

                  {/* CONDUCTOR */}

                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={t("followUp.assignment.driverRequired")}
                    name="idConductor"
                    value={form.idConductor}
                    onChange={onChange}
                    disabled={resources.conductores.length === 0}
                  >
                    {resources.conductores.length > 0 ? (
                      resources.conductores.map((driver) => (
                        <MenuItem key={driver.id_func} value={driver.id_func}>
                          {driver.nombre}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        {t("followUp.assignment.noDrivers")}
                      </MenuItem>
                    )}
                  </TextField>

                  {/* ENFERMERO */}

                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={
                      requiresNurse
                        ? t("followUp.assignment.nurseRequired")
                        : t("followUp.assignment.nurse")
                    }
                    name="idEnfermero"
                    value={form.idEnfermero}
                    onChange={onChange}
                    disabled={
                      requiresNurse && resources.enfermeros.length === 0
                    }
                  >
                    {!requiresNurse && (
                      <MenuItem value="">
                        {t("followUp.assignment.unassigned")}
                      </MenuItem>
                    )}

                    {resources.enfermeros.map((nurse) => (
                      <MenuItem key={nurse.id_func} value={nurse.id_func}>
                        {nurse.nombre}
                      </MenuItem>
                    ))}

                    {requiresNurse && resources.enfermeros.length === 0 && (
                      <MenuItem disabled value="">
                        {t("followUp.assignment.noNurses")}
                      </MenuItem>
                    )}
                  </TextField>
                </Box>
              </>
            )}
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
