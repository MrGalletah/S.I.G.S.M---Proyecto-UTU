export const vehicleOptions = [
  "Ambulancia A-01",
  "Ambulancia A-02",
  "Ambulancia A-03",
  "Auto 01",
];

export const driverOptions = [
  "Carlos Rodríguez",
  "Juan Pérez",
  "Martín González",
];

export const nurseOptions = [
  "Laura Martínez",
  "María López",
  "Sofía Rodríguez",
];

export const stateTransitions = {
  Registrado: ["En camino"],
  "En camino": ["Llegó al destino"],
  "Llegó al destino": ["Retornando"],
  Retornando: ["Completado"],
  Completado: [],
};

export const initialAssignmentForm = {
  vehiculo: "",
  conductor: "",
  enfermero: "",
  horaSalidaEstimada: "",
  horaLlegadaEstimada: "",
  nuevoEstado: "",
  observacionEstado: "",
};

export function isTransferAssigned(transfer) {
  if (!transfer) return false;

  const baseAssigned =
    Boolean(transfer.vehiculo) &&
    Boolean(transfer.conductor) &&
    Boolean(transfer.horaSalidaEstimada) &&
    Boolean(transfer.horaLlegadaEstimada);

  if (!baseAssigned) return false;

  if (transfer.tipoElemento === "Paciente") {
    return Boolean(transfer.enfermero);
  }

  return true;
}

export function getInitialAssignmentForm(transfer) {
  return {
    vehiculo: transfer?.vehiculo ?? "",
    conductor: transfer?.conductor ?? "",
    enfermero: transfer?.enfermero ?? "",
    horaSalidaEstimada:
      transfer?.horaSalidaEstimada ?? "",
    horaLlegadaEstimada:
      transfer?.horaLlegadaEstimada ?? "",
    nuevoEstado: "",
    observacionEstado: "",
  };
}