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
