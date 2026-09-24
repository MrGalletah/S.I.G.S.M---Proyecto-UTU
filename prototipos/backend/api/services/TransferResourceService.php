<?php

class TransferResourceService
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }


    public function getAvailableResources(
        int $idTraslado,
        string $inicio,
        string $fin
    ): array {
        $transfer = $this->getTransferContext(
            $idTraslado
        );

        if ($transfer === null) {
            throw new InvalidArgumentException(
                "El traslado no existe."
            );
        }

        if (!(bool) $transfer["activo"]) {
            throw new InvalidArgumentException(
                "El traslado no se encuentra activo."
            );
        }

        if ($transfer["estado"] !== "Registrado") {
            throw new InvalidArgumentException(
                "Solo se pueden asignar recursos a traslados en estado Registrado."
            );
        }

        $requiresNurse =
            $transfer["tipo_elemento"] === "Paciente";


        return [
            "traslado" => [
                "id_traslado" =>
                    (int) $transfer["id_traslado"],

                "version" =>
                    (int) $transfer["version"],

                "tipo_elemento" => [
                    "id_tipo_elemento" =>
                        (int) $transfer["id_tipo_elemento"],

                    "nombre" =>
                        $transfer["tipo_elemento"]
                ],

                "requiere_enfermero" =>
                    $requiresNurse
            ],

            "intervalo" => [
                "inicio" => $inicio,
                "fin" => $fin
            ],

            "vehiculos" =>
                $this->getAvailableVehicles(
                    (int) $transfer["id_tipo_elemento"],
                    $idTraslado,
                    $inicio,
                    $fin
                ),

            "conductores" =>
                $this->getAvailableEmployees(
                    "Conductor",
                    "id_conductor",
                    $idTraslado,
                    $inicio,
                    $fin
                ),

            "enfermeros" =>
                $this->getAvailableEmployees(
                    "Enfermero",
                    "id_enfermero",
                    $idTraslado,
                    $inicio,
                    $fin
                )
        ];
    }


    private function getTransferContext(
        int $idTraslado
    ): ?array {
        $sql = "
            SELECT
                t.id_traslado,
                t.version,
                t.activo,

                t.id_tipo_elemento,
                te.nombre AS tipo_elemento,

                et.nombre AS estado

            FROM traslado t

            INNER JOIN tipo_elemento te
                ON te.id_tipo_elemento =
                    t.id_tipo_elemento

            INNER JOIN estado_traslado et
                ON et.id_estado =
                    t.id_estado

            WHERE t.id_traslado = :id_traslado

            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->bindValue(
            ":id_traslado",
            $idTraslado,
            PDO::PARAM_INT
        );

        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }


    private function getAvailableVehicles(
        int $idTipoElemento,
        int $idTraslado,
        string $inicio,
        string $fin
    ): array {
        $sql = "
            SELECT
                v.id_vehiculo,
                v.matricula,
                v.modelo,

                tv.id_tipo_vehiculo,
                tv.nombre AS tipo_vehiculo

            FROM vehiculo v

            INNER JOIN tipo_vehiculo tv
                ON tv.id_tipo_vehiculo =
                    v.id_tipo_vehiculo

            INNER JOIN compatibilidad_transporte ct
                ON ct.id_tipo_vehiculo =
                    v.id_tipo_vehiculo

            WHERE
                ct.id_tipo_elemento =
                    :id_tipo_elemento

                AND v.estado = 'OPERATIVO'

                AND NOT EXISTS (
                    SELECT 1

                    FROM traslado t

                    INNER JOIN estado_traslado et
                        ON et.id_estado =
                            t.id_estado

                    WHERE
                        t.id_vehiculo =
                            v.id_vehiculo

                        AND t.id_traslado
                            <> :id_traslado

                        AND t.activo = TRUE

                        AND et.nombre
                            <> 'Completado'

                        AND t.hora_salida_estimada
                            IS NOT NULL

                        AND t.hora_llegada_estimada
                            IS NOT NULL

                        AND t.hora_salida_estimada
                            < :fin

                        AND t.hora_llegada_estimada
                            > :inicio
                )

            ORDER BY
                tv.nombre,
                v.matricula
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            "id_tipo_elemento" =>
                $idTipoElemento,

            "id_traslado" =>
                $idTraslado,

            "inicio" =>
                $inicio,

            "fin" =>
                $fin
        ]);

        $rows = $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );

        return array_map(
            fn(array $row) => [
                "id_vehiculo" =>
                    (int) $row["id_vehiculo"],

                "matricula" =>
                    $row["matricula"],

                "modelo" =>
                    $row["modelo"],

                "tipo" => [
                    "id_tipo_vehiculo" =>
                        (int) $row["id_tipo_vehiculo"],

                    "nombre" =>
                        $row["tipo_vehiculo"]
                ]
            ],
            $rows
        );
    }


    private function getAvailableEmployees(
        string $role,
        string $transferColumn,
        int $idTraslado,
        string $inicio,
        string $fin
    ): array {
        $allowedColumns = [
            "id_conductor",
            "id_enfermero"
        ];

        if (!in_array(
            $transferColumn,
            $allowedColumns,
            true
        )) {
            throw new InvalidArgumentException(
                "Recurso no válido."
            );
        }


        $sql = "
            SELECT DISTINCT
                f.id_func,
                f.nombre

            FROM funcionario f

            INNER JOIN rol_usuario ru
                ON ru.id_func =
                    f.id_func

            INNER JOIN rol r
                ON r.id_rol =
                    ru.id_rol

            WHERE
                f.activo = TRUE

                AND r.nombre = :rol

                AND NOT EXISTS (
                    SELECT 1

                    FROM traslado t

                    INNER JOIN estado_traslado et
                        ON et.id_estado =
                            t.id_estado

                    WHERE
                        t.$transferColumn =
                            f.id_func

                        AND t.id_traslado
                            <> :id_traslado

                        AND t.activo = TRUE

                        AND et.nombre
                            <> 'Completado'

                        AND t.hora_salida_estimada
                            IS NOT NULL

                        AND t.hora_llegada_estimada
                            IS NOT NULL

                        AND t.hora_salida_estimada
                            < :fin

                        AND t.hora_llegada_estimada
                            > :inicio
                )

            ORDER BY f.nombre
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            "rol" =>
                $role,

            "id_traslado" =>
                $idTraslado,

            "inicio" =>
                $inicio,

            "fin" =>
                $fin
        ]);

        $rows = $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );

        return array_map(
            fn(array $row) => [
                "id_func" =>
                    (int) $row["id_func"],

                "nombre" =>
                    $row["nombre"]
            ],
            $rows
        );
    }
}