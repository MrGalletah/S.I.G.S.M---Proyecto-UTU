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
        $transferTypesSql = "
        SELECT
            id_tipo_traslado,
            nombre,
            descripcion
        FROM tipo_traslado
        WHERE activo = TRUE
        ORDER BY id_tipo_traslado ASC
    ";

        $elementTypesSql = "
        SELECT
            id_tipo_elemento,
            nombre,
            descripcion
        FROM tipo_elemento
        ORDER BY id_tipo_elemento ASC
    ";


        $transferTypesStmt = $this->db->prepare($transferTypesSql);
        $transferTypesStmt->execute();

        $elementTypesStmt = $this->db->prepare($elementTypesSql);
        $elementTypesStmt->execute();


        $transferTypes = $transferTypesStmt->fetchAll(
            PDO::FETCH_ASSOC
        );

        $elementTypes = $elementTypesStmt->fetchAll(
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
            )
        ];
    }
}
