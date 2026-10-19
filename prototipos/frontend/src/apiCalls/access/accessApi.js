import { processResponse } from "../../components/utils/processApiResponse";

const accessUrl = "/api/access";

export async function getPendingAccessRequests() {
    const req = await fetch(`${accessUrl}`, {
        method: "GET",
        credentials: "include",
    });

    return processResponse(req);
}

export async function getRoles() {
    const req = await fetch(`${accessUrl}?roles=1`, {
        method: "GET",
        credentials: "include",
    });

    return processResponse(req);
}

export async function acceptAccessRequest(idFunc, roles) {
    const req = await fetch(`${accessUrl}?id=${idFunc}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ roles }),
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