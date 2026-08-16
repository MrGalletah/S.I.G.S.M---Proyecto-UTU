import { processResponse } from "../../components/utils/processApiResponse";

const authUrl = "/api/categories";

export async function getUserCategories() {

        const req = await fetch(`${authUrl}`, {
            method: "GET",
        })

        const data = processResponse(req);
        return data;
}

export async function getAllCategories() {

            const req = await fetch(`${authUrl}/?includeInactive=true`, {
            method: "GET",
            credentials: "include"
        })

        const data = processResponse(req);
        return data;
}