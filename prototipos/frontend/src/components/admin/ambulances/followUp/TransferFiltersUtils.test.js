import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import {
    filterAndSortTransfers,
    initialFilters,
    initialSort,
} from "./TransferFiltersUtils";

const transfers = [
    {
        id: 15,
        codigo: "TR-00015",

        cedulaPaciente: "4.567.890-1",
        elemento: null,

        origen: "Hospital de Clínicas",
        destino: "Hospital Maciel",

        fechaRequerida: "2026-10-05",

        horaSalidaEstimada:
            "2026-10-05 10:00:00",

        estado: "Registrado",

        prioridad: "Urgente",

        asignado: false,
    },

    {
        id: 27,
        codigo: "TR-00027",

        cedulaPaciente: null,
        elemento: "Equipo médico portátil",

        origen: "Centro Asistencial 8",
        destino: "Hospital de Clínicas",

        fechaRequerida: "2026-10-06",

        horaSalidaEstimada: null,

        estado: "En camino",

        prioridad: "Normal",

        asignado: true,
    },

    {
        id: 42,
        codigo: "TR-00042",

        cedulaPaciente: "3.123.456-7",
        elemento: null,

        origen: "Clínica Médica",
        destino: "Domicilio",

        fechaRequerida: "2026-10-10",

        horaSalidaEstimada:
            "2026-10-10 09:00:00",

        estado: "Retornando",

        prioridad: "Urgente",

        asignado: true,
    },
];

function processTransfers({
    search = "",
    filters = {},
    sort = {},
} = {}) {
    return filterAndSortTransfers(
        transfers,
        search,
        {
            ...initialFilters,
            ...filters,
        },
        {
            ...initialSort,
            ...sort,
        },
    );
}

function getIds(result) {
    return result.map(
        (transfer) => transfer.id,
    );
}

describe(
    "TransferFiltersUtils",
    () => {
        beforeEach(() => {
            vi.useFakeTimers();

            vi.setSystemTime(
                new Date(
                    2026,
                    9,
                    5,
                    12,
                    0,
                    0,
                ),
            );
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it(
            "mantiene el orden de la API si no hay filtros ni ordenación",
            () => {
                const result =
                    processTransfers();

                expect(
                    getIds(result),
                ).toEqual([
                    15,
                    27,
                    42,
                ]);
            },
        );

        it(
            "busca un traslado por código aunque se escriba sin guion",
            () => {
                const result =
                    processTransfers({
                        search: "TR00027",
                    });

                expect(
                    getIds(result),
                ).toEqual([27]);
            },
        );

        it(
            "busca un traslado utilizando únicamente su número",
            () => {
                const result =
                    processTransfers({
                        search: "42",
                    });

                expect(
                    getIds(result),
                ).toEqual([42]);
            },
        );

        it(
            "busca una cédula aunque se introduzca sin puntos ni guion",
            () => {
                const result =
                    processTransfers({
                        search:
                            "45678901",
                    });

                expect(
                    getIds(result),
                ).toEqual([15]);
            },
        );

        it(
            "ignora mayúsculas y tildes durante la búsqueda",
            () => {
                const result =
                    processTransfers({
                        search:
                            "clinica medica",
                    });

                expect(
                    getIds(result),
                ).toEqual([42]);
            },
        );

        it(
            "combina los filtros de estado, prioridad y asignación",
            () => {
                const result =
                    processTransfers({
                        filters: {
                            estado:
                                "En camino",

                            prioridad:
                                "Normal",

                            asignacion:
                                "asignados",
                        },
                    });

                expect(
                    getIds(result),
                ).toEqual([27]);
            },
        );

        it(
            "filtra los traslados pendientes de asignación",
            () => {
                const result =
                    processTransfers({
                        filters: {
                            asignacion:
                                "pendientes",
                        },
                    });

                expect(
                    getIds(result),
                ).toEqual([15]);
            },
        );

        it(
            "filtra los traslados requeridos para hoy",
            () => {
                const result =
                    processTransfers({
                        filters: {
                            fecha: "hoy",
                        },
                    });

                expect(
                    getIds(result),
                ).toEqual([15]);
            },
        );

        it(
            "filtra los traslados requeridos para mañana",
            () => {
                const result =
                    processTransfers({
                        filters: {
                            fecha:
                                "manana",
                        },
                    });

                expect(
                    getIds(result),
                ).toEqual([27]);
            },
        );

        it(
            "filtra los traslados de los próximos siete días",
            () => {
                const result =
                    processTransfers({
                        filters: {
                            fecha:
                                "semana",
                        },
                    });

                expect(
                    getIds(result),
                ).toEqual([
                    15,
                    27,
                    42,
                ]);
            },
        );

        it(
            "ordena los traslados por código de mayor a menor",
            () => {
                const result =
                    processTransfers({
                        sort: {
                            key: "codigo",

                            direction:
                                "desc",
                        },
                    });

                expect(
                    getIds(result),
                ).toEqual([
                    42,
                    27,
                    15,
                ]);
            },
        );

        it(
            "ordena los estados siguiendo el flujo del traslado",
            () => {
                const result =
                    processTransfers({
                        sort: {
                            key: "estado",

                            direction:
                                "asc",
                        },
                    });

                expect(
                    getIds(result),
                ).toEqual([
                    15,
                    27,
                    42,
                ]);
            },
        );

        it(
            "ordena las prioridades dejando primero los urgentes",
            () => {
                const result =
                    processTransfers({
                        sort: {
                            key: "prioridad",

                            direction:
                                "asc",
                        },
                    });

                expect(
                    getIds(result),
                ).toEqual([
                    15,
                    42,
                    27,
                ]);
            },
        );

        it(
            "deja al final los traslados sin hora estimada",
            () => {
                const result =
                    processTransfers({
                        sort: {
                            key:
                                "horaSalidaEstimada",

                            direction:
                                "asc",
                        },
                    });

                expect(
                    getIds(result),
                ).toEqual([
                    15,
                    42,
                    27,
                ]);
            },
        );
    },
);