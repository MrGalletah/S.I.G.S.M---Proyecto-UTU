import {
    describe,
    expect,
    it,
} from "vitest";

import {
    getInitialAssignmentForm,
    initialAssignmentForm,
    isTransferAssigned,
    stateTransitions,
} from "./transferEditUtils";


// TRASLADO BASE COMPLETAMENTE ASIGNADO

function createTransfer(
    overrides = {},
) {
    return {
        tipoElemento:
            "Equipamiento",

        vehiculo:
            "SAA 1234 - Renault Master",

        conductor:
            "Juan Pérez",

        enfermero:
            null,

        horaSalidaEstimada:
            "2026-10-05 10:00:00",

        horaLlegadaEstimada:
            "2026-10-05 11:00:00",

        ...overrides,
    };
}


describe(
    "transferEditUtils",
    () => {

        describe(
            "stateTransitions",
            () => {

                it(
                    "define correctamente el flujo completo de estados",
                    () => {
                        expect(
                            stateTransitions,
                        ).toEqual({
                            Registrado: [
                                "En camino",
                            ],

                            "En camino": [
                                "Llegó al destino",
                            ],

                            "Llegó al destino": [
                                "Retornando",
                            ],

                            Retornando: [
                                "Completado",
                            ],

                            Completado: [],
                        });
                    },
                );


                it(
                    "no permite ningún estado posterior a Completado",
                    () => {
                        expect(
                            stateTransitions.Completado,
                        ).toEqual([]);
                    },
                );

            },
        );


        describe(
            "initialAssignmentForm",
            () => {

                it(
                    "inicializa todos los campos vacíos",
                    () => {
                        expect(
                            initialAssignmentForm,
                        ).toEqual({
                            vehiculo: "",
                            conductor: "",
                            enfermero: "",
                            horaSalidaEstimada: "",
                            horaLlegadaEstimada: "",
                            nuevoEstado: "",
                            observacionEstado: "",
                        });
                    },
                );

            },
        );


        describe(
            "isTransferAssigned",
            () => {

                it(
                    "devuelve false si no recibe un traslado",
                    () => {
                        expect(
                            isTransferAssigned(
                                null,
                            ),
                        ).toBe(false);
                    },
                );


                it(
                    "devuelve false si falta el vehículo",
                    () => {
                        const transfer =
                            createTransfer({
                                vehiculo: null,
                            });

                        expect(
                            isTransferAssigned(
                                transfer,
                            ),
                        ).toBe(false);
                    },
                );


                it(
                    "devuelve false si falta el conductor",
                    () => {
                        const transfer =
                            createTransfer({
                                conductor: null,
                            });

                        expect(
                            isTransferAssigned(
                                transfer,
                            ),
                        ).toBe(false);
                    },
                );


                it(
                    "devuelve false si falta la hora de salida estimada",
                    () => {
                        const transfer =
                            createTransfer({
                                horaSalidaEstimada:
                                    null,
                            });

                        expect(
                            isTransferAssigned(
                                transfer,
                            ),
                        ).toBe(false);
                    },
                );


                it(
                    "devuelve false si falta la hora de llegada estimada",
                    () => {
                        const transfer =
                            createTransfer({
                                horaLlegadaEstimada:
                                    null,
                            });

                        expect(
                            isTransferAssigned(
                                transfer,
                            ),
                        ).toBe(false);
                    },
                );


                it(
                    "considera asignado un traslado de elemento sin enfermero",
                    () => {
                        const transfer =
                            createTransfer({
                                tipoElemento:
                                    "Equipamiento",

                                enfermero:
                                    null,
                            });

                        expect(
                            isTransferAssigned(
                                transfer,
                            ),
                        ).toBe(true);
                    },
                );


                it(
                    "no considera asignado un traslado de paciente si falta el enfermero",
                    () => {
                        const transfer =
                            createTransfer({
                                tipoElemento:
                                    "Paciente",

                                enfermero:
                                    null,
                            });

                        expect(
                            isTransferAssigned(
                                transfer,
                            ),
                        ).toBe(false);
                    },
                );


                it(
                    "considera asignado un traslado de paciente cuando tiene todos los recursos",
                    () => {
                        const transfer =
                            createTransfer({
                                tipoElemento:
                                    "Paciente",

                                enfermero:
                                    "Ana Rodríguez",
                            });

                        expect(
                            isTransferAssigned(
                                transfer,
                            ),
                        ).toBe(true);
                    },
                );

            },
        );


        describe(
            "getInitialAssignmentForm",
            () => {

                it(
                    "carga en el formulario los datos existentes del traslado",
                    () => {
                        const transfer =
                            createTransfer({
                                tipoElemento:
                                    "Paciente",

                                enfermero:
                                    "Ana Rodríguez",
                            });


                        const result =
                            getInitialAssignmentForm(
                                transfer,
                            );


                        expect(
                            result,
                        ).toEqual({
                            vehiculo:
                                "SAA 1234 - Renault Master",

                            conductor:
                                "Juan Pérez",

                            enfermero:
                                "Ana Rodríguez",

                            horaSalidaEstimada:
                                "2026-10-05 10:00:00",

                            horaLlegadaEstimada:
                                "2026-10-05 11:00:00",

                            nuevoEstado:
                                "",

                            observacionEstado:
                                "",
                        });
                    },
                );


                it(
                    "mantiene vacíos el nuevo estado y la observación aunque el traslado ya tenga recursos",
                    () => {
                        const transfer =
                            createTransfer();


                        const result =
                            getInitialAssignmentForm(
                                transfer,
                            );


                        expect(
                            result.nuevoEstado,
                        ).toBe("");


                        expect(
                            result.observacionEstado,
                        ).toBe("");
                    },
                );


                it(
                    "devuelve todos los campos vacíos si no recibe un traslado",
                    () => {
                        const result =
                            getInitialAssignmentForm(
                                null,
                            );


                        expect(
                            result,
                        ).toEqual({
                            vehiculo: "",
                            conductor: "",
                            enfermero: "",
                            horaSalidaEstimada: "",
                            horaLlegadaEstimada: "",
                            nuevoEstado: "",
                            observacionEstado: "",
                        });
                    },
                );

            },
        );

    },
);