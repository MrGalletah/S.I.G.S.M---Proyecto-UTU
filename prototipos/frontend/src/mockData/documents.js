export function createDummyDocuments() {
  const documentNames = [
    "Protocolo terapéutico de uso de vasopresina",
    "Indicaciones para tratamiento con warfarina",
    "Preparación para estudios imagenológicos",
    "Indicaciones ecocardiograma con dobutamina",
    "Indicaciones ecocardiograma transesofágico",
    "Ingreso a centro de nefrología y trasplante",
    "Plan de alta de enfermería",
    "Prevención de infecciones",
    "Pauta para pacientes ostomizados",
    "Prostatectomía radical",
    "Centellograma de perfusión miocárdica",
    "Indicaciones para usuarios trasplantados",
    "Estudios diagnósticos con pertecneciato",
    "Información general para pacientes",
    "Cuidados posteriores al alta",
    "Recomendaciones preoperatorias",
    "Guía de alimentación hospitalaria",
    "Información sobre medicamentos",
    "Cuidados paliativos para pacientes",
    "Indicaciones de laboratorio",
  ];

  const categories = [
    "Anestesiología",
    "Cardiología",
    "Nefrología",
    "Imagenología",
    "Oncología",
    "Trasplantes",
    "Enfermería",
    "Emergencia",
    "Cirugía",
    "Medicina general",
  ];

  return documentNames.map((name, index) => ({
    id: index + 1,
    document: name,
    category: categories[index % categories.length],
    uploadedAt: `${String((index % 28) + 1).padStart(2, "0")}/05/2026`,
    state: index % 6 === 0 ? "Inactivo" : "Activo",
  }));
}
