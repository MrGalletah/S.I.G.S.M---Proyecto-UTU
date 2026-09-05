<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../middleware/requireAuth.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/validation.php";

function getDocuments(): void
{
    try {

        $includeInactive = optionalBoolean(
            $_GET["includeInactive"] ?? null,
            "includeInactive",
            false
        );

        $categoryId = null;

        if (isset($_GET["categoryId"])) {
            $categoryId = requirePositiveInt(
                $_GET["categoryId"],
                "La categoría"
            );
        }

        if ($includeInactive) {
            requireAuth();
        }


        $db = Database::getConnection();


        $sql = "
            SELECT
                c.id_cat,
                c.nombre AS categoria,
                c.activo AS categoria_activa,

                d.id_doc,
                d.id_func,
                d.ruta,
                d.fecha_subida,
                d.titulo,
                d.activo AS documento_activo,
                d.descripcion

            FROM categoria c

            LEFT JOIN documento d
                ON d.id_cat = c.id_cat
        ";


        $conditions = [];
        $params = [];


        if (!$includeInactive) {

            $conditions[] = "c.activo = TRUE";
            $conditions[] = "d.id_doc IS NOT NULL";
            $conditions[] = "d.activo = TRUE";
        }

        if ($categoryId !== null) {

            $conditions[] = "c.id_cat = :id_cat";
            $params[":id_cat"] = $categoryId;
        }


        if (!empty($conditions)) {
            $sql .= " WHERE " . implode(" AND ", $conditions);
        }


        $sql .= "
            ORDER BY
                c.nombre ASC,
                d.fecha_subida DESC
        ";


        $stmt = $db->prepare($sql);

        $stmt->execute($params);

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);



        // AGRUPAMOS DOCUMENTOS POR CATEGORÍA
        $categories = [];

        foreach ($rows as $row) {

            $idCat = (int) $row["id_cat"];


            
            // Creamos la categoría si todavía no existe. 
            if (!isset($categories[$idCat])) {

                $category = [
                    "id_cat" => $idCat,
                    "nombre" => $row["categoria"],
                    "documentos" => []
                ];



                // En administración devolvemos también
                // el estado de la categoría.
                if ($includeInactive) {
                    $category["activo"] = (bool) $row["categoria_activa"];
                }


                $categories[$idCat] = $category;
            }


            // Con LEFT JOIN puede existir una categoría
            // que no tenga documentos.

            if ($row["id_doc"] !== null) {

                $document = [
                    "id_doc" => (int) $row["id_doc"],
                    "id_func" => (int) $row["id_func"],
                    "ruta" => $row["ruta"],
                    "fecha_subida" => $row["fecha_subida"],
                    "titulo" => $row["titulo"],
                    "descripcion" => $row["descripcion"]
                ];


                if ($includeInactive) {
                    $document["activo"] =
                        (bool) $row["documento_activo"];
                }


                $categories[$idCat]["documentos"][] = $document;
            }
        }


        $categories = array_values($categories);


        sendJson(200, [
            "ok" => true,
            "categorias" => $categories
        ]);


    } catch (Throwable $e) {

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al obtener los documentos."
        ]);
    }
}