import { processResponse } from "../../components/utils/processApiResponse";

const categoriesUrl = "/api/categories";

export async function getUserCategories() {

    const req = await fetch(`${categoriesUrl}`, {
        method: "GET",
    })

    const data = processResponse(req);
    return data;
}

export async function getAllCategories() {

    const req = await fetch(`${categoriesUrl}/?includeInactive=true`, {
        method: "GET",
        credentials: "include"
    })

    const data = processResponse(req);
    return data;
}


// Si le pasas idCat actualiza si no la crea
export async function createOrUpdateCategory(data, idCat = null) {

    const url =
        idCat === null
            ? categoriesUrl
            : `${categoriesUrl}?id=${idCat}`;

    const req = await fetch(url, {
        method: idCat === null ? "POST" : "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });

    return processResponse(req);
}