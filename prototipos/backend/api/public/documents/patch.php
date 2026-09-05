<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../middleware/requireAuth.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/getJsonBody.php";
require_once __DIR__ . "/../../utils/validation.php";


function updateDocument(int $idDoc): void
{
    try {

        $data = getJsonBody();

        $db = Database::getConnection();


        // Comprobamos que el documento exista

        $stmt = $db->prepare(
            "SELECT id_doc
             FROM documento
             WHERE id_doc = :id_doc"
        );

        $stmt->execute([
            ":id_doc" => $idDoc
        ]);

        if (!$stmt->fetch()) {
            sendJson(404, [
                "ok" => false,
                "mensaje" => "El documento no existe."
            ]);
        }


        $fields = [];

        $params = [
            ":id_doc" => $idDoc
        ];


        // CATEGORÍA

        if (array_key_exists("id_cat", $data)) {

            $idCat = requirePositiveInt(
                $data["id_cat"],
                "La categoría"
            );


            // Comprobamos que la nueva categoría exista

            $stmt = $db->prepare(
                "SELECT id_cat
                 FROM categoria
                 WHERE id_cat = :id_cat"
            );

            $stmt->execute([
                ":id_cat" => $idCat
            ]);

            if (!$stmt->fetch()) {
                sendJson(404, [
                    "ok" => false,
                    "mensaje" => "La categoría no existe."
                ]);
            }


            $fields[] = "id_cat = :id_cat";
            $params[":id_cat"] = $idCat;
        }


        // TÍTULO

        if (array_key_exists("titulo", $data)) {

            $titulo = requireString(
                $data["titulo"],
                "El título",
                150
            );

            $fields[] = "titulo = :titulo";
            $params[":titulo"] = $titulo;
        }


        // DESCRIPCIÓN

        if (array_key_exists("descripcion", $data)) {

            $descripcion = requireString(
                $data["descripcion"],
                "La descripción"
            );

            $fields[] = "descripcion = :descripcion";
            $params[":descripcion"] = $descripcion;
        }


        // ACTIVO

        if (array_key_exists("activo", $data)) {

            $activo = requireBoolean(
                $data["activo"],
                "El estado activo"
            );

            $fields[] = "activo = :activo";
            $params[":activo"] = $activo ? 1 : 0;
        }


        // No se envió ningún campo modificable

        if (empty($fields)) {
            sendJson(400, [
                "ok" => false,
                "mensaje" => "No se enviaron campos para modificar."
            ]);
        }


        $sql = "
            UPDATE documento
            SET " . implode(", ", $fields) . "
            WHERE id_doc = :id_doc
        ";


        $stmt = $db->prepare($sql);

        $stmt->execute($params);


        sendJson(200, [
            "ok" => true,
            "mensaje" => "Documento actualizado correctamente."
        ]);


    } catch (PDOException $e) {

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al actualizar el documento."
        ]);
    }
}