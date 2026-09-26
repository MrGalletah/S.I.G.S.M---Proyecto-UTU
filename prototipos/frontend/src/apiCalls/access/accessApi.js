import { processResponse } from "../../components/utils/processApiResponse";

const accessUrl = "/api/access";


export async function getPendingAccessRequests() {
    const req = await fetch(`${accessUrl}`, {
        method: "GET",
        credentials: "include",
    });

    return processResponse(req);
}


export async function acceptAccessRequest(idFunc) {
    const req = await fetch(`${accessUrl}?id=${idFunc}`, {
        method: "PATCH",
        credentials: "include",
    });

    return processResponse(req);
}


export async function rejectAccessRequest(idFunc) {
    const req = await fetch(`${accessUrl}?id=${idFunc}`, {
        method: "DELETE",
        credentials: "include",
    });

    return processResponse(req);
}