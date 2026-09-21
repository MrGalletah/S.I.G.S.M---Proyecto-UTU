<?php

class TransferQueryService
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }


        public function getActiveTransfers(): array
    {
        $sql = "
            SELECT
                t.id_traslado,
                t.fecha_solicitud,
                t.fecha_requerida,
                t.prioridad,

                tt.id_tipo_traslado,
                tt.nombre AS tipo_traslado,

                te.id_tipo_elemento,
                te.nombre AS tipo_elemento,

                t.elemento,
                t.cedula_paciente,

                t.origen,
                t.destino,

                t.hora_salida_estimada,

                et.id_estado,
                et.nombre AS estado,
                et.orden AS estado_orden,

                CASE
                    WHEN
                        t.id_vehiculo IS NOT NULL
                        AND t.id_conductor IS NOT NULL
                        AND t.id_func_gestor IS NOT NULL
                        AND t.fecha_gestion IS NOT NULL
                        AND t.hora_salida_estimada IS NOT NULL
                        AND t.hora_llegada_estimada IS NOT NULL
                    THEN 1
                    ELSE 0
                END AS asignado

            FROM traslado t

            INNER JOIN tipo_traslado tt
                ON tt.id_tipo_traslado = t.id_tipo_traslado

            INNER JOIN tipo_elemento te
                ON te.id_tipo_elemento = t.id_tipo_elemento

            INNER JOIN estado_traslado et
                ON et.id_estado = t.id_estado

            WHERE
                t.activo = TRUE
                AND et.nombre <> 'Completado'

            ORDER BY
                CASE
                    WHEN t.prioridad = 'URGENTE' THEN 0
                    ELSE 1
                END,
                t.fecha_requerida ASC,
                t.fecha_solicitud ASC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(
            fn(array $row) => $this->formatTransferListItem($row),
            $rows
        );
    }

    public function getCompletedTransfers(
        int $page,
        int $limit,
        ?string $search = null,
        ?string $desde = null,
        ?string $hasta = null
    ): array {
        $offset = ($page - 1) * $limit;

        $where = [
            "t.activo = TRUE",
            "et.nombre = 'Completado'"
        ];

        $params = [];

        if ($search !== null && $search !== "") {

            if (preg_match('/^TR-(\d+)$/i', $search, $matches)) {

                $where[] = "t.id_traslado = :search_id";
                $params["search_id"] = (int) $matches[1];
            } else {

                $where[] = "
                (
                    t.cedula_paciente LIKE :search_cedula
                    OR t.elemento LIKE :search_elemento
                    OR t.origen LIKE :search_origen
                    OR t.destino LIKE :search_destino
                )
            ";

                $searchValue = "%" . $search . "%";

                $params["search_cedula"] = $searchValue;
                $params["search_elemento"] = $searchValue;
                $params["search_origen"] = $searchValue;
                $params["search_destino"] = $searchValue;
            }
        }

        if ($desde !== null) {
            $where[] = "finalizacion.fecha_finalizacion >= :desde";
            $params["desde"] = $desde . " 00:00:00";
        }

        if ($hasta !== null) {
            $where[] = "finalizacion.fecha_finalizacion <= :hasta";
            $params["hasta"] = $hasta . " 23:59:59";
        }

        $whereSql = implode(" AND ", $where);


        $completionJoin = "
        INNER JOIN (
            SELECT
                h.id_traslado,
                MAX(h.fecha_hora) AS fecha_finalizacion

            FROM historial_estado_traslado h

            INNER JOIN estado_traslado eh
                ON eh.id_estado = h.id_estado

            WHERE eh.nombre = 'Completado'

            GROUP BY h.id_traslado
        ) finalizacion
            ON finalizacion.id_traslado = t.id_traslado
    ";


        $countSql = "
        SELECT COUNT(*)

        FROM traslado t

        INNER JOIN estado_traslado et
            ON et.id_estado = t.id_estado

        $completionJoin

        WHERE $whereSql
    ";

        $countStmt = $this->db->prepare($countSql);

        foreach ($params as $key => $value) {
            $countStmt->bindValue(
                ":" . $key,
                $value,
                PDO::PARAM_STR
            );
        }

        if (isset($params["search_id"])) {
            $countStmt->bindValue(
                ":search_id",
                $params["search_id"],
                PDO::PARAM_INT
            );
        }

        $countStmt->execute();

        $total = (int) $countStmt->fetchColumn();


        $sql = "
        SELECT
            t.id_traslado,
            t.fecha_solicitud,
            t.fecha_requerida,
            t.prioridad,

            tt.id_tipo_traslado,
            tt.nombre AS tipo_traslado,

            te.id_tipo_elemento,
            te.nombre AS tipo_elemento,

            t.elemento,
            t.cedula_paciente,

            t.origen,
            t.destino,

            finalizacion.fecha_finalizacion

        FROM traslado t

        INNER JOIN tipo_traslado tt
            ON tt.id_tipo_traslado = t.id_tipo_traslado

        INNER JOIN tipo_elemento te
            ON te.id_tipo_elemento = t.id_tipo_elemento

        INNER JOIN estado_traslado et
            ON et.id_estado = t.id_estado

        $completionJoin

        WHERE $whereSql

        ORDER BY finalizacion.fecha_finalizacion DESC

        LIMIT :limit
        OFFSET :offset
    ";

        $stmt = $this->db->prepare($sql);

        foreach ($params as $key => $value) {

            if ($key === "search_id") {
                $stmt->bindValue(
                    ":search_id",
                    $value,
                    PDO::PARAM_INT
                );

                continue;
            }

            $stmt->bindValue(
                ":" . $key,
                $value,
                PDO::PARAM_STR
            );
        }

        $stmt->bindValue(
            ":limit",
            $limit,
            PDO::PARAM_INT
        );

        $stmt->bindValue(
            ":offset",
            $offset,
            PDO::PARAM_INT
        );

        $stmt->execute();

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $transfers = array_map(
            fn(array $row) =>
            $this->formatCompletedTransferListItem($row),
            $rows
        );

        return [
            "traslados" => $transfers,

            "paginacion" => [
                "pagina" => $page,
                "limite" => $limit,
                "total" => $total,
                "total_paginas" =>
                $total === 0
                    ? 0
                    : (int) ceil($total / $limit)
            ],

            "filtros" => [
                "search" => $search,
                "desde" => $desde,
                "hasta" => $hasta
            ]
        ];
    }

    public function getTransferById(int $idTransfer): ?array
    {
        $sql = "
        SELECT
            t.id_traslado,
            t.fecha_solicitud,
            t.fecha_requerida,
            t.prioridad,
            t.observaciones,

            tt.id_tipo_traslado,
            tt.nombre AS tipo_traslado,

            te.id_tipo_elemento,
            te.nombre AS tipo_elemento,

            t.elemento,
            t.cedula_paciente,

            t.origen,
            t.destino,

            t.hora_salida_estimada,
            t.hora_llegada_estimada,
            t.hora_salida_real,
            t.hora_llegada_destino,

            t.id_vehiculo,
            v.matricula AS vehiculo_matricula,
            v.modelo AS vehiculo_modelo,

            tv.id_tipo_vehiculo,
            tv.nombre AS tipo_vehiculo,

            t.id_conductor,
            conductor.nombre AS conductor,

            t.id_enfermero,
            enfermero.nombre AS enfermero,

            t.id_func_solicitante,
            solicitante.nombre AS solicitante,

            t.id_func_gestor,
            gestor.nombre AS gestor,

            t.fecha_gestion,

            et.id_estado,
            et.nombre AS estado,
            et.orden AS estado_orden,

            t.activo,
            t.fecha_baja

        FROM traslado t

        INNER JOIN tipo_traslado tt
            ON tt.id_tipo_traslado = t.id_tipo_traslado

        INNER JOIN tipo_elemento te
            ON te.id_tipo_elemento = t.id_tipo_elemento

        INNER JOIN estado_traslado et
            ON et.id_estado = t.id_estado

        INNER JOIN funcionario solicitante
            ON solicitante.id_func = t.id_func_solicitante

        LEFT JOIN funcionario gestor
            ON gestor.id_func = t.id_func_gestor

        LEFT JOIN vehiculo v
            ON v.id_vehiculo = t.id_vehiculo

        LEFT JOIN tipo_vehiculo tv
            ON tv.id_tipo_vehiculo = v.id_tipo_vehiculo

        LEFT JOIN funcionario conductor
            ON conductor.id_func = t.id_conductor

        LEFT JOIN funcionario enfermero
            ON enfermero.id_func = t.id_enfermero

        WHERE
            t.id_traslado = :id_transfer
            AND t.activo = TRUE

        LIMIT 1
    ";

        $stmt = $this->db->prepare($sql);

        $stmt->bindValue(
            ":id_transfer",
            $idTransfer,
            PDO::PARAM_INT
        );

        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        $history = $this->getTransferHistory($idTransfer);

        return $this->formatTransferDetail(
            $row,
            $history
        );
    }

    private function getTransferHistory(int $idTransfer): array
    {
        $sql = "
        SELECT
            h.id_historial,
            h.fecha_hora,
            h.observacion,

            et.id_estado,
            et.nombre AS estado,
            et.orden AS estado_orden,

            f.id_func,
            f.nombre AS funcionario

        FROM historial_estado_traslado h

        INNER JOIN estado_traslado et
            ON et.id_estado = h.id_estado

        INNER JOIN funcionario f
            ON f.id_func = h.id_func

        WHERE h.id_traslado = :id_transfer

        ORDER BY
            h.fecha_hora ASC,
            h.id_historial ASC
    ";

        $stmt = $this->db->prepare($sql);

        $stmt->bindValue(
            ":id_transfer",
            $idTransfer,
            PDO::PARAM_INT
        );

        $stmt->execute();

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(
            fn(array $row) => [
                "id_historial" =>
                (int) $row["id_historial"],

                "estado" => [
                    "id_estado" =>
                    (int) $row["id_estado"],

                    "nombre" =>
                    $row["estado"],

                    "orden" =>
                    (int) $row["estado_orden"]
                ],

                "fecha_hora" =>
                $row["fecha_hora"],

                "observacion" =>
                $row["observacion"],

                "funcionario" => [
                    "id_func" =>
                    (int) $row["id_func"],

                    "nombre" =>
                    $row["funcionario"]
                ]
            ],
            $rows
        );
    }


    
    private function formatTransferDetail(
        array $row,
        array $history
    ): array {
        return [
            "id_traslado" =>
            (int) $row["id_traslado"],

            "codigo" => "TR-" . str_pad(
                $row["id_traslado"],
                5,
                "0",
                STR_PAD_LEFT
            ),

            "fecha_solicitud" =>
            $row["fecha_solicitud"],

            "fecha_requerida" =>
            $row["fecha_requerida"],

            "prioridad" =>
            $row["prioridad"],

            "observaciones" =>
            $row["observaciones"],

            "tipo_traslado" => [
                "id_tipo_traslado" =>
                (int) $row["id_tipo_traslado"],

                "nombre" =>
                $row["tipo_traslado"]
            ],

            "tipo_elemento" => [
                "id_tipo_elemento" =>
                (int) $row["id_tipo_elemento"],

                "nombre" =>
                $row["tipo_elemento"]
            ],

            "elemento" =>
            $row["elemento"],

            "cedula_paciente" =>
            $row["cedula_paciente"],

            "origen" =>
            $row["origen"],

            "destino" =>
            $row["destino"],

            "horarios" => [
                "salida_estimada" =>
                $row["hora_salida_estimada"],

                "llegada_estimada" =>
                $row["hora_llegada_estimada"],

                "salida_real" =>
                $row["hora_salida_real"],

                "llegada_destino" =>
                $row["hora_llegada_destino"]
            ],

            "vehiculo" =>
            $row["id_vehiculo"] !== null
                ? [
                    "id_vehiculo" =>
                    (int) $row["id_vehiculo"],

                    "matricula" =>
                    $row["vehiculo_matricula"],

                    "modelo" =>
                    $row["vehiculo_modelo"],

                    "tipo" => [
                        "id_tipo_vehiculo" =>
                        (int) $row["id_tipo_vehiculo"],

                        "nombre" =>
                        $row["tipo_vehiculo"]
                    ]
                ]
                : null,

            "conductor" =>
            $row["id_conductor"] !== null
                ? [
                    "id_func" =>
                    (int) $row["id_conductor"],

                    "nombre" =>
                    $row["conductor"]
                ]
                : null,

            "enfermero" =>
            $row["id_enfermero"] !== null
                ? [
                    "id_func" =>
                    (int) $row["id_enfermero"],

                    "nombre" =>
                    $row["enfermero"]
                ]
                : null,

            "solicitante" => [
                "id_func" =>
                (int) $row["id_func_solicitante"],

                "nombre" =>
                $row["solicitante"]
            ],

            "gestor" =>
            $row["id_func_gestor"] !== null
                ? [
                    "id_func" =>
                    (int) $row["id_func_gestor"],

                    "nombre" =>
                    $row["gestor"],

                    "fecha_gestion" =>
                    $row["fecha_gestion"]
                ]
                : null,

            "estado" => [
                "id_estado" =>
                (int) $row["id_estado"],

                "nombre" =>
                $row["estado"],

                "orden" =>
                (int) $row["estado_orden"]
            ],

            "historial" =>
            $history
        ];
    }

    private function formatCompletedTransferListItem(
        array $row
    ): array {
        return [
            "id_traslado" => (int) $row["id_traslado"],

            "codigo" => "TR-" . str_pad(
                $row["id_traslado"],
                5,
                "0",
                STR_PAD_LEFT
            ),

            "fecha_solicitud" =>
            $row["fecha_solicitud"],

            "fecha_requerida" =>
            $row["fecha_requerida"],

            "fecha_finalizacion" =>
            $row["fecha_finalizacion"],

            "prioridad" =>
            $row["prioridad"],

            "tipo_traslado" => [
                "id_tipo_traslado" =>
                (int) $row["id_tipo_traslado"],

                "nombre" =>
                $row["tipo_traslado"]
            ],

            "tipo_elemento" => [
                "id_tipo_elemento" =>
                (int) $row["id_tipo_elemento"],

                "nombre" =>
                $row["tipo_elemento"]
            ],

            "cedula_paciente" =>
            $row["cedula_paciente"],

            "elemento" =>
            $row["elemento"],

            "origen" =>
            $row["origen"],

            "destino" =>
            $row["destino"]
        ];
    }

    private function formatTransferListItem(array $row): array
    {
        return [
            "id_traslado" => (int) $row["id_traslado"],

            "codigo" => "TR-" . str_pad(
                $row["id_traslado"],
                5,
                "0",
                STR_PAD_LEFT
            ),

            "fecha_solicitud" => $row["fecha_solicitud"],
            "fecha_requerida" => $row["fecha_requerida"],

            "prioridad" => $row["prioridad"],

            "tipo_traslado" => [
                "id_tipo_traslado" => (int) $row["id_tipo_traslado"],
                "nombre" => $row["tipo_traslado"]
            ],

            "tipo_elemento" => [
                "id_tipo_elemento" => (int) $row["id_tipo_elemento"],
                "nombre" => $row["tipo_elemento"]
            ],

            "elemento" => $row["elemento"],
            "cedula_paciente" => $row["cedula_paciente"],

            "origen" => $row["origen"],
            "destino" => $row["destino"],

            "hora_salida_estimada" =>
            $row["hora_salida_estimada"],

            "estado" => [
                "id_estado" => (int) $row["id_estado"],
                "nombre" => $row["estado"],
                "orden" => (int) $row["estado_orden"]
            ],

            "asignado" => (bool) $row["asignado"]
        ];
    }

}