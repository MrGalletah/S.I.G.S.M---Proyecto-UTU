import {
    describe,
    expect,
    it,
} from "vitest";

import {
    formatDate,
} from "./formatDate";


describe(
    "formatDate",
    () => {

        it(
            "convierte una fecha YYYY-MM-DD a DD-MM-YYYY",
            () => {
                const result =
                    formatDate(
                        "2026-10-05",
                    );

                expect(
                    result,
                ).toBe(
                    "05-10-2026",
                );
            },
        );


        it(
            "mantiene correctamente los ceros de día y mes",
            () => {
                const result =
                    formatDate(
                        "2026-01-09",
                    );

                expect(
                    result,
                ).toBe(
                    "09-01-2026",
                );
            },
        );


        it(
            "ignora la hora cuando recibe una fecha y hora de la base de datos",
            () => {
                const result =
                    formatDate(
                        "2026-10-05 14:30:45",
                    );

                expect(
                    result,
                ).toBe(
                    "05-10-2026",
                );
            },
        );


        it(
            "devuelve una cadena vacía si recibe null",
            () => {
                expect(
                    formatDate(null),
                ).toBe("");
            },
        );


        it(
            "devuelve una cadena vacía si recibe una cadena vacía",
            () => {
                expect(
                    formatDate(""),
                ).toBe("");
            },
        );


        it(
            "devuelve una cadena vacía si no recibe ningún valor",
            () => {
                expect(
                    formatDate(),
                ).toBe("");
            },
        );

    },
);