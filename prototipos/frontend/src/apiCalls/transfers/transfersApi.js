import { processResponse } from "../../components/utils/processApiResponse";

const transfersUrl = "/api/transfers";

export async function getTransfers() {
    const response = await fetch(
        transfersUrl,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data =
        await processResponse(response);

    return (data.traslados ?? []).map(
        mapTransferListItem
    );
}


export async function getTransferCatalogs() {
    const response = await fetch(
        `${transfersUrl}/catalogs.php`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    return processResponse(response);
}


export async function getTransferDetail(
    idTraslado
) {
    const response = await fetch(
        `${transfersUrl}/detail.php?id=${idTraslado}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data =
        await processResponse(response);

    const transfer =
        data.traslado ?? data;

    return mapTransferDetail(
        transfer
    );
}


export async function createTransfer(data) {
    const response = await fetch(
        transfersUrl,
        {
            method: "POST",
            credentials: "include",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body:
                JSON.stringify(data),
        }
    );

    return processResponse(response);
}


export async function getTransferResources(
    idTraslado,
    inicio,
    fin
) {
    const params =
        new URLSearchParams({
            id_traslado: idTraslado,
            inicio,
            fin,
        });

    const response = await fetch(
        `${transfersUrl}/resources.php?${params.toString()}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    return processResponse(response);
}


export async function assignTransfer(
    idTraslado,
    data
) {
    const response = await fetch(
        `${transfersUrl}/assign.php?id=${idTraslado}`,
        {
            method: "PATCH",
            credentials: "include",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body:
                JSON.stringify(data),
        }
    );

    return processResponse(response);
}


export async function advanceTransferState(
    idTraslado,
    version,
    observacion = null
) {
    const response = await fetch(
        `${transfersUrl}/state.php?id=${idTraslado}`,
        {
            method: "PATCH",
            credentials: "include",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body:
                JSON.stringify({
                    version,
                    observacion,
                }),
        }
    );

    return processResponse(response);
}


export async function deleteTransfer(
    idTraslado,
    version
) {
    const response = await fetch(
        `${transfersUrl}?id=${idTraslado}`,
        {
            method: "DELETE",
            credentials: "include",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body:
                JSON.stringify({
                    version,
                }),
        }
    );

    return processResponse(response);
}


export async function getCompletedTransfers({
    page = 1,
    limit = 20,
    search = "",
    desde = "",
    hasta = "",
} = {}) {
    const params =
        new URLSearchParams();

    params.set("page", page);
    params.set("limit", limit);

    if (search.trim()) {
        params.set(
            "search",
            search.trim()
        );
    }

    if (desde) {
        params.set(
            "desde",
            desde
        );
    }

    if (hasta) {
        params.set(
            "hasta",
            hasta
        );
    }

    const response = await fetch(
        `${transfersUrl}/completed.php?${params.toString()}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    return processResponse(response);
}


function formatPriority(priority) {
    if (!priority) return "";

    return (
        priority.charAt(0).toUpperCase() +
        priority.slice(1).toLowerCase()
    );
}


function mapTransferListItem(transfer) {
    return {
        id: transfer.id_traslado,

        codigo: transfer.codigo,

        version: transfer.version ?? null,

        fechaSolicitud:
            transfer.fecha_solicitud,

        fechaRequerida:
            transfer.fecha_requerida,

        prioridad:
            formatPriority(
                transfer.prioridad
            ),

        tipoTraslado:
            transfer.tipo_traslado?.nombre ?? "",

        tipoElemento:
            transfer.tipo_elemento?.nombre ?? "",

        cedulaPaciente:
            transfer.cedula_paciente ?? null,

        elemento:
            transfer.elemento ?? null,

        origen:
            transfer.origen,

        destino:
            transfer.destino,

        horaSalidaEstimada:
            transfer.hora_salida_estimada ?? null,

        estado:
            transfer.estado?.nombre ?? "",

        asignado:
            Boolean(transfer.asignado),
    };
}


function mapTransferDetail(transfer) {
    const vehicle = transfer.vehiculo;

    return {
        id:
            transfer.id_traslado,

        codigo:
            transfer.codigo,

        version:
            transfer.version ?? null,

        fechaSolicitud:
            transfer.fecha_solicitud,

        fechaRequerida:
            transfer.fecha_requerida,

        prioridad:
            formatPriority(
                transfer.prioridad
            ),

        observaciones:
            transfer.observaciones ?? null,


        tipoTraslado:
            transfer.tipo_traslado?.nombre ?? "",

        idTipoTraslado:
            transfer.tipo_traslado?.id_tipo_traslado ?? null,


        tipoElemento:
            transfer.tipo_elemento?.nombre ?? "",

        idTipoElemento:
            transfer.tipo_elemento?.id_tipo_elemento ?? null,


        cedulaPaciente:
            transfer.cedula_paciente ?? null,

        elemento:
            transfer.elemento ?? null,


        origen:
            transfer.origen,

        destino:
            transfer.destino,


        horaSalidaEstimada:
            transfer.horarios?.salida_estimada ?? null,

        horaLlegadaEstimada:
            transfer.horarios?.llegada_estimada ?? null,

        horaSalidaReal:
            transfer.horarios?.salida_real ?? null,

        horaLlegadaDestino:
            transfer.horarios?.llegada_destino ?? null,


        idVehiculo:
            vehicle?.id_vehiculo ?? null,

        vehiculo:
            vehicle
                ? `${vehicle.matricula} - ${vehicle.modelo}`
                : null,

        vehiculoData:
            vehicle ?? null,


        idConductor:
            transfer.conductor?.id_func ?? null,

        conductor:
            transfer.conductor?.nombre ?? null,


        idEnfermero:
            transfer.enfermero?.id_func ?? null,

        enfermero:
            transfer.enfermero?.nombre ?? null,


        idSolicitante:
            transfer.solicitante?.id_func ?? null,

        solicitante:
            transfer.solicitante?.nombre ?? null,


        idGestor:
            transfer.gestor?.id_func ?? null,

        gestor:
            transfer.gestor?.nombre ?? null,

        fechaGestion:
            transfer.gestor?.fecha_gestion ?? null,


        idEstado:
            transfer.estado?.id_estado ?? null,

        estado:
            transfer.estado?.nombre ?? "",

        estadoOrden:
            transfer.estado?.orden ?? null,


        historial:
            (transfer.historial ?? []).map(
                (item) => ({
                    id:
                        item.id_historial,

                    estado:
                        item.estado?.nombre ?? "",

                    idEstado:
                        item.estado?.id_estado ?? null,

                    estadoOrden:
                        item.estado?.orden ?? null,

                    fechaHora:
                        item.fecha_hora,

                    observacion:
                        item.observacion ?? null,

                    funcionario:
                        item.funcionario?.nombre ?? null,

                    idFuncionario:
                        item.funcionario?.id_func ?? null,
                })
            ),
    };
}
