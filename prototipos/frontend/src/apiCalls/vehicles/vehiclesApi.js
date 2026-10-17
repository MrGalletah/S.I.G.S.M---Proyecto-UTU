
import { processResponse } from "../../components/utils/processApiResponse";

const vehiclesUrl = "/api/vehicles";

export async function getVehicles() {
    const response = await fetch(vehiclesUrl, {
        method: "GET",
        credentials: "include",
    });

    const data = await processResponse(response);

    return data.vehiculos ?? [];
}

export async function getVehicleTypes() {
    const response = await fetch(`${vehiclesUrl}?types`, {
        method: "GET",
        credentials: "include",
    });

    const data = await processResponse(response);

    return data.tipos ?? [];
}

export async function saveVehicle(vehicle, id = null) {
    const response = await fetch(
        id ? `${vehiclesUrl}?id=${id}` : vehiclesUrl,
        {
            method: id ? "PATCH" : "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(vehicle),
        }
    );

    return processResponse(response);
}
