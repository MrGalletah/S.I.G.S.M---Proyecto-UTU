<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/validation.php";


function updateDocumentWithFile(int $idDoc): void
{
    try {

        $idCat = requirePositiveInt(
            $_POST["id_cat"] ?? null,
            "La categoría"
        );

        $titulo = requireString(
            $_POST["titulo"] ?? null,
            "El título",
            150
        );

        $descripcion = requireString(
            $_POST["descripcion"] ?? null,
            "La descripción"
        );

        $activoRaw = $_POST["activo"] ?? null;

        if (!in_array($activoRaw, ["true", "false"], true)) {
            sendJson(400, [
                "ok" => false,
                "mensaje" => "El estado activo debe ser true o false."
            ]);
        }

        $activo = $activoRaw === "true";


        // Validamos el PDF nuevo

        $archivo = requireUploadedFile(
            $_FILES,
            "archivo",
            "El archivo"
        );

        validateMimeType(
            $archivo,
            ["application/pdf"]
        );


        $db = Database::getConnection();


        // Documento actual

        $stmt = $db->prepare(
            "SELECT ruta
             FROM documento
             WHERE id_doc = :id_doc"
        );

        $stmt->execute([
            ":id_doc" => $idDoc
        ]);

        $document = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$document) {
            sendJson(404, [
                "ok" => false,
                "mensaje" => "El documento no existe."
            ]);
        }


        // Comprobamos la categoría

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


        // Ruta física DEL MISMO archivo

        $destination =
            __DIR__
            . "/../../storage/"
            . $document["ruta"];


        // Reemplazamos el PDF anterior

        if (!move_uploaded_file(
            $archivo["tmp_name"],
            $destination
        )) {
            sendJson(500, [
                "ok" => false,
                "mensaje" => "No se pudo reemplazar el archivo."
            ]);
        }


        // Actualizamos los demás datos

        $sql = "
            UPDATE documento
            SET
                id_cat = :id_cat,
                titulo = :titulo,
                descripcion = :descripcion,
                activo = :activo
            WHERE id_doc = :id_doc
        ";

        $stmt = $db->prepare($sql);

        $stmt->execute([
            ":id_cat" => $idCat,
            ":titulo" => $titulo,
            ":descripcion" => $descripcion,
            ":activo" => $activo ? 1 : 0,
            ":id_doc" => $idDoc
        ]);


        sendJson(200, [
            "ok" => true,
            "mensaje" => "Documento actualizado correctamente."
        ]);

    } catch (Throwable $e) {

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al actualizar el documento."
        ]);
    }
}