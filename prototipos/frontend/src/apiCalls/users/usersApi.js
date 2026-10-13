import { processResponse } from "../../components/utils/processApiResponse";

const usersUrl = "/api/users";

export async function getUsers() {
    const req = await fetch(`${usersUrl}`, {
        method: "GET",
        credentials: "include",
    });

    return processResponse(req);
}

export async function getRoles() {
    const req = await fetch(`${usersUrl}?roles=1`, {
        method: "GET",
        credentials: "include",
    });

    return processResponse(req);
}

export async function updateUserRoles(idFunc, roles) {
    const req = await fetch(`${usersUrl}?id=${idFunc}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ roles }),
    });

    return processResponse(req);
}

export async function setUserActive(idFunc, activo) {
    const req = await fetch(`${usersUrl}?id=${idFunc}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ activo }),
    });

    return processResponse(req);
}