import { processResponse } from "../../components/utils/processApiResponse";

const documentsUrl = "/api/documents";

export async function getUserDocuments() {

    const req = await fetch(`${documentsUrl}`, {
        method: "GET",
    })

    const data = processResponse(req);
    return data;
}


export async function getAllDocuments() {

    const req = await fetch(`${documentsUrl}/?includeInactive=true`, {
        method: "GET",
        credentials: "include"
    })

    const data = processResponse(req);
    return data;
}

// Puede modificar la data y el archivo fisico
export async function createOrUpdateDocument(data, idDoc = null) {

    const url =
        idDoc === null
            ? documentsUrl
            : `${documentsUrl}?id=${idDoc}`;

    const formData = new FormData();

    formData.append("id_cat", data.id_cat);
    formData.append("titulo", data.titulo);
    formData.append("descripcion", data.descripcion);
    formData.append("archivo", data.archivo);

    if (idDoc !== null) {
        formData.append("activo", data.activo);
    }

    const req = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: formData
    });

    return processResponse(req);
}

// Solo modifica la data 
export async function updateDocument(data, idDoc) {

    const req = await fetch(`${documentsUrl}?id=${idDoc}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });

    return processResponse(req);
}

export async function deleteDocument(idDoc) {
  const response = await fetch(`/api/documents?id=${idDoc}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error al eliminar el documento.");
  }

  return data;
}