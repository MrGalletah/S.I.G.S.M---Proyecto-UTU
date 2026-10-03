
export const initialFilters = {
    estado: "",
    prioridad: "",
    asignacion: "",
    fecha: "",
};

export const initialSort = {
    key: "",
    direction: "asc",
};

const stateOrder = {
    Registrado: 0,
    "En camino": 1,
    "Llegó al destino": 2,
    Retornando: 3,
    Completado: 4,
};

// NORMALIZACIÓN PARA EL BUSCADOR

function normalize(value) {
    return String(value ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// FECHA LOCAL YYYY-MM-DD

function localDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// BÚSQUEDA GENERAL

function matchesSearch(transfer, search) {
    const term = normalize(search);

    if (!term) return true;

    const fields = [
        transfer.codigo,
        transfer.cedulaPaciente,
        transfer.elemento,
        transfer.origen,
        transfer.destino,
    ];

    if (fields.some((value) => normalize(value).includes(term))) {
        return true;
    }

    // Código sin guiones ni espacios.

    const compactTerm = term.replace(/[\s.-]/g, "");
    const compactCode = normalize(transfer.codigo)
        .replace(/[\s.-]/g, "");

    if (compactCode.includes(compactTerm)) {
        return true;
    }

    // Cédula sin separadores o código introducido como número.

    if (/^\d+$/.test(compactTerm)) {
        const cedula = String(transfer.cedulaPaciente ?? "")
            .replace(/\D/g, "");

        return (
            cedula.includes(compactTerm) ||
            Number(compactTerm) === transfer.id
        );
    }

    return false;
}

// FILTRO DE FECHA REQUERIDA

function matchesDate(transfer, filters) {
    if (!filters.fecha) return true;

    const date = transfer.fechaRequerida
        ? String(transfer.fechaRequerida).slice(0, 10)
        : null;

    if (!date) return false;

    const today = new Date();

    switch (filters.fecha) {
        case "hoy":
            return date === localDate(today);

        case "manana":
            today.setDate(today.getDate() + 1);
            return date === localDate(today);

        case "semana": {
            const start = localDate(today);
            today.setDate(today.getDate() + 6);

            return date >= start && date <= localDate(today);
        }

        default:
            return true;
    }
}

// ORDENACIÓN

function compareTransfers(a, b, sort) {
    const direction = sort.direction === "asc" ? 1 : -1;

    switch (sort.key) {
        case "codigo":
            return direction * (a.id - b.id);

        case "estado":
            return direction * (
                (stateOrder[a.estado] ?? 99) -
                (stateOrder[b.estado] ?? 99)
            );

        case "prioridad": {
            const priority = (transfer) =>
                transfer.prioridad === "Urgente" ? 0 : 1;

            return direction * (priority(a) - priority(b));
        }

        case "fechaRequerida":
        case "horaSalidaEstimada": {
            const timestamp = (value) => {
                if (!value) return null;

                const time = new Date(
                    String(value).replace(" ", "T"),
                ).getTime();

                return Number.isFinite(time) ? time : null;
            };

            const first = timestamp(a[sort.key]);
            const second = timestamp(b[sort.key]);

            // Los traslados sin fecha siempre quedan al final.

            if (first === null && second === null) return 0;
            if (first === null) return 1;
            if (second === null) return -1;

            return direction * (first - second);
        }

        default:
            return 0;
    }
}

// PROCESAR LISTADO

export function filterAndSortTransfers(
    transfers,
    search,
    filters,
    sort,
) {

    const result = transfers.filter((transfer) => {
        if (!matchesSearch(transfer, search)) return false;

        if (filters.estado && transfer.estado !== filters.estado) {
            return false;
        }

        if (
            filters.prioridad &&
            transfer.prioridad !== filters.prioridad
        ) {
            return false;
        }

        if (
            filters.asignacion === "asignados" &&
            !transfer.asignado
        ) {
            return false;
        }

        if (
            filters.asignacion === "pendientes" &&
            transfer.asignado
        ) {
            return false;
        }

        return matchesDate(transfer, filters);
    });

    // Sin ordenación manual se conserva el orden de la API.

    return sort.key
        ? result.sort((a, b) => compareTransfers(a, b, sort))
        : result;
}
