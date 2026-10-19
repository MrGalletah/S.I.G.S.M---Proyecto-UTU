<?php

class TransferCatalogService
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }


    public function getCatalogs(): array
    {
        // TIPOS DE TRASLADO

        $transferTypesSql = "
            SELECT
                id_tipo_traslado,
                nombre,
                descripcion

            FROM tipo_traslado

            WHERE activo = TRUE

            ORDER BY id_tipo_traslado ASC
        ";


        // TIPOS DE ELEMENTO

        $elementTypesSql = "
            SELECT
                id_tipo_elemento,
                nombre,
                descripcion

            FROM tipo_elemento

            ORDER BY id_tipo_elemento ASC
        ";


        // VEHÍCULOS QUE APARECEN
        // EN TRASLADOS COMPLETADOS

        $historyVehiclesSql = "
            SELECT DISTINCT
                v.id_vehiculo,
                v.matricula,
                v.modelo

            FROM traslado t

            INNER JOIN estado_traslado et
                ON et.id_estado = t.id_estado

            INNER JOIN vehiculo v
                ON v.id_vehiculo = t.id_vehiculo

            WHERE
                t.activo = TRUE
                AND et.nombre = 'Completado'

            ORDER BY
                v.matricula ASC,
                v.modelo ASC
        ";


        // CONDUCTORES QUE APARECEN
        // EN TRASLADOS COMPLETADOS

        $historyDriversSql = "
            SELECT DISTINCT
                f.id_func,
                f.nombre

            FROM traslado t

            INNER JOIN estado_traslado et
                ON et.id_estado = t.id_estado

            INNER JOIN funcionario f
                ON f.id_func = t.id_conductor

            WHERE
                t.activo = TRUE
                AND et.nombre = 'Completado'

            ORDER BY f.nombre ASC
        ";


        // ENFERMEROS QUE APARECEN
        // EN TRASLADOS COMPLETADOS

        $historyNursesSql = "
            SELECT DISTINCT
                f.id_func,
                f.nombre

            FROM traslado t

            INNER JOIN estado_traslado et
                ON et.id_estado = t.id_estado

            INNER JOIN funcionario f
                ON f.id_func = t.id_enfermero

            WHERE
                t.activo = TRUE
                AND et.nombre = 'Completado'

            ORDER BY f.nombre ASC
        ";


        // EJECUTAR CONSULTAS

        $transferTypesStmt =
            $this->db->prepare(
                $transferTypesSql
            );

        $transferTypesStmt->execute();


        $elementTypesStmt =
            $this->db->prepare(
                $elementTypesSql
            );

        $elementTypesStmt->execute();


        $historyVehiclesStmt =
            $this->db->prepare(
                $historyVehiclesSql
            );

        $historyVehiclesStmt->execute();


        $historyDriversStmt =
            $this->db->prepare(
                $historyDriversSql
            );

        $historyDriversStmt->execute();


        $historyNursesStmt =
            $this->db->prepare(
                $historyNursesSql
            );

        $historyNursesStmt->execute();


        // OBTENER RESULTADOS

        $transferTypes =
            $transferTypesStmt->fetchAll(
                PDO::FETCH_ASSOC
            );

        $elementTypes =
            $elementTypesStmt->fetchAll(
                PDO::FETCH_ASSOC
            );

        $historyVehicles =
            $historyVehiclesStmt->fetchAll(
                PDO::FETCH_ASSOC
            );

        $historyDrivers =
            $historyDriversStmt->fetchAll(
                PDO::FETCH_ASSOC
            );

        $historyNurses =
            $historyNursesStmt->fetchAll(
                PDO::FETCH_ASSOC
            );


        return [
            "tipos_traslado" => array_map(
                fn(array $row) => [
                    "id_tipo_traslado" =>
                    (int) $row["id_tipo_traslado"],

                    "nombre" =>
                    $row["nombre"],

                    "descripcion" =>
                    $row["descripcion"]
                ],
                $transferTypes
            ),


            "tipos_elemento" => array_map(
                fn(array $row) => [
                    "id_tipo_elemento" =>
                    (int) $row["id_tipo_elemento"],

                    "nombre" =>
                    $row["nombre"],

                    "descripcion" =>
                    $row["descripcion"]
                ],
                $elementTypes
            ),


            "vehiculos_historial" => array_map(
                fn(array $row) => [
                    "id_vehiculo" =>
                    (int) $row["id_vehiculo"],

                    "matricula" =>
                    $row["matricula"],

                    "modelo" =>
                    $row["modelo"]
                ],
                $historyVehicles
            ),


            "conductores_historial" => array_map(
                fn(array $row) => [
                    "id_func" =>
                    (int) $row["id_func"],

                    "nombre" =>
                    $row["nombre"]
                ],
                $historyDrivers
            ),


            "enfermeros_historial" => array_map(
                fn(array $row) => [
                    "id_func" =>
                    (int) $row["id_func"],

                    "nombre" =>
                    $row["nombre"]
                ],
                $historyNurses
            )
        ];
    }
}
