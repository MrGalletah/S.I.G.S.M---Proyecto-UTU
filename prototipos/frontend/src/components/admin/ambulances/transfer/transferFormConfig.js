export const HOSPITAL_CLINICAS = "Hospital de Clínicas";

export const initialForm = {
  tipoTraslado: "",
  tipoElemento: "",
  cedulaPaciente: "",
  elemento: "",
  origen: "",
  destino: "",
  prioridad: "Normal",
  fechaRequerida: "",
  observaciones: "",
};

export const routeRules = {
  "Traslado interno": {
    origen: HOSPITAL_CLINICAS,
    destino: HOSPITAL_CLINICAS,
    lockOrigen: true,
    lockDestino: true,
  },

  "Traslado a otro centro": {
    origen: HOSPITAL_CLINICAS,
    destino: "",
    lockOrigen: true,
    lockDestino: false,
  },

  "Traslado a domicilio": {
    origen: HOSPITAL_CLINICAS,
    destino: "",
    lockOrigen: true,
    lockDestino: false,
  },

  "Retorno al hospital": {
    origen: "",
    destino: HOSPITAL_CLINICAS,
    lockOrigen: false,
    lockDestino: true,
  },

  Otro: {
    origen: "",
    destino: "",
    lockOrigen: false,
    lockDestino: false,
  },
};

export const prioridadOptions = [
  "Normal",
  "Urgente",
];