import { processResponse } from "../../components/utils/processApiResponse";

const usersUrl = "/api/users";

export async function getUsers({
    page = 1,
    limit = 20,
    search = "",
    estado = "all",
    id_rol = null,
    signal,
} = {}) {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        estado,
    });

    if (search.trim()) {
        params.set("search", search.trim());
    }

    if (id_rol !== null && id_rol !== "all") {
        params.set("id_rol", String(id_rol));
    }

    const req = await fetch(`${usersUrl}?${params.toString()}`, {
        method: "GET",
        credentials: "include",
        signal,
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