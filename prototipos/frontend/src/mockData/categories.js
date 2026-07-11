export function createDummyCategories() {
  const categoryNames = [
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
    "Pediatría",
    "Ginecología",
    "Urología",
    "Farmacia",
    "Laboratorio",
    "Nutrición",
    "Salud mental",
    "Rehabilitación",
    "Infectología",
    "Cuidados paliativos",
    "Odontología",
    "Endocrinología",
    "Traumatología",
    "Neurología",
    "Documentación general",
  ];

  return categoryNames.map((name, index) => ({
    id: index + 1,
    cat: name,
    desc: `Encuestas relacionadas con ${name.toLowerCase()}.`,
    docs: Math.floor(Math.random() * 20) + 1,
    createdAt: `${String((index % 28) + 1).padStart(2, "0")}/05/2026`,
    state: index % 5 === 0 ? "Inactiva" : "Activa",
    actions: ["edit", "delete"],
  }));
}