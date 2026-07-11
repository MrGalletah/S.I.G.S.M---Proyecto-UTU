import { SvgIcon } from "@mui/material";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";

export function createDummyTransfers() {
  const currentYear = new Date().getFullYear();

  const elements = [
    "María Gómez",
    "Juan Pérez",
    "Camilla con paciente",
    "Muestra de laboratorio",
    "Equipo médico",
    "Paciente pediátrico",
    "Silla de ruedas",
    "Paciente UCI",
    "Insumos quirúrgicos",
    "Paciente ambulatorio",
    "Bolsa de sangre",
    "Medicamento urgente",
    "Historia clínica",
    "Paciente postoperatorio",
    "Oxígeno portátil",
  ];

  const origins = [
    "Hospital de Clínicas",
    "Emergencia",
    "UCI",
    "Pediatría",
    "Laboratorio",
    "Quirófano",
    "Imagenología",
    "Cardiología",
    "Oncología",
    "Farmacia",
  ];

  const destinations = [
    "Islas Canarias 1234",
    "Sanatorio Central",
    "Clínica del Sol",
    "Hospital Pasteur",
    "Laboratorio externo",
    "Centro de Imagenología",
    "Domicilio del paciente",
    "Banco de Sangre",
    "Hospital Maciel",
    "Mutualista Norte",
  ];

  const states = [
    "Registrado",
    "En camino",
    "Llegó al destino",
    "Retornando",
    "Completado",
  ];

  const drivers = [
    "Laura Martínez",
    "Carlos Rodríguez",
    "Pedro Silva",
    "Ana Fernández",
    "Luis Pereira",
    "Sofía Castro",
    "Miguel Torres",
    "Valentina Núñez",
  ];

  const companions = [
    "Ambulancia A-01",
    "Enfermero Javier",
    "Dra. Patricia López",
    "Aux. Camila Díaz",
    "Téc. Marcos Ruiz",
    "Paramédico Andrés",
    "Sin acompañante",
  ];

  const ambulances = [
    "Ambulancia A-01",
    "Ambulancia A-02",
    "Ambulancia A-03",
    "Ambulancia B-01",
    "Ambulancia B-02",
    "Ambulancia C-01",
  ];

  const getRandomItem = (array) =>
    array[Math.floor(Math.random() * array.length)];

  const getTime = (index, baseHour = 8) => {
    const hour = baseHour + Math.floor(index / 2);
    const minutes = index % 2 === 0 ? "00" : "30";

    return `${String(hour).padStart(2, "0")}:${minutes}`;
  };

  return Array.from({ length: 25 }, (_, index) => {
    const id = index + 1;
    const horaSalida = getTime(index, 8);

    return {
      id,
      codigo: `TR-${currentYear}-${String(id).padStart(3, "0")}`,
      elemento: getRandomItem(elements),
      origen: getRandomItem(origins),
      destino: getRandomItem(destinations),
      horaSalida,
      estado: getRandomItem(states),
      prioridad: index % 7 === 0 ? "Urgente" : "Normal",
      conductor: getRandomItem(drivers),
      acompanante: getRandomItem(companions),
      ambulancia: getRandomItem(ambulances),
      horaEstimadaSalida: getTime(index + 1, 8),
      actions: ["view", "edit", "delete"],
    };
  });
}


export const cardsData = [
  {
    label: "Traslados activos",
    icon: (
      <SvgIcon>
        <svg
          viewBox="0 0 17 17"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          fill="#0F7C71"
          stroke="#0F7C71"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <path
              d="M14.33 8l-1.876-4.377-3.438 9.783-4.015-13.11-2.37 7.704h-2.631v1h3.369l1.63-5.296 3.95 12.903 3.597-10.23 1.124 2.623h3.33v-1z"
              fill="#000000"
            ></path>{" "}
          </g>
        </svg>
      </SvgIcon>
    ),
    value: 12,
    subtitle: "En proceso actualmente",
    colors: {
      background: "#E3F5F3",
      text: "#0F7C71",
    },
  },

  {
    label: "Completados hoy",
    icon: <TaskAltIcon />,
    value: 5,
    subtitle: undefined,
    colors: {
      background: "#E3F5F3",
      text: "#0F7C71",
    },
  },
  {
    label: "Urgentes",
    icon: <NotificationImportantIcon />,
    value: 2,
    subtitle: undefined,
    colors: {
      background: "#FDE2E2",
      text: "#DE040A",
    },
  },
];
