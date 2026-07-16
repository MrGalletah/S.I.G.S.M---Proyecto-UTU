export async function processResponse(response) {
  const contentType = response.headers.get("content-type");

  if (!contentType.includes("application/json")) {
    throw new Error("El servidor devolvió una respuesta inválida.");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.mensaje || "Ocurrió un error al procesar la solicitud."
    );
  }

  return data;
}