export async function processResponse(response) {
  
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.mensaje || "Ocurrió un error al procesar la solicitud."
    );
  }

  return data;
}