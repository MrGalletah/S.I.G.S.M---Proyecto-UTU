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