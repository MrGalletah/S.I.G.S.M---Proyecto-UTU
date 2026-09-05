<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../middleware/requireAuth.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/validation.php";


function createDocument(int $idFunc): void
{
    $destination = null;
    $fileSaved = false;

    try {

        // Validación de los datos recibidos
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

        // Validación del archivo
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


        // Comprobamos que la categoría exista
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


        $storagePath = __DIR__ . "/../../../storage/documents";

        // Generamos un nombre único para el PDF
        $fileName = bin2hex(random_bytes(16)) . ".pdf";

        // Destino en el fs
        $destination = $storagePath . "/" . $fileName;


        // Ruta que se guarda en la base de datos
        $ruta = "documents/" . $fileName;


        // Guardamos el archivo
        if (!move_uploaded_file(
            $archivo["tmp_name"],
            $destination
        )) {

            sendJson(500, [
                "ok" => false,
                "mensaje" => "No se pudo guardar el archivo."
            ]);
        }

        $fileSaved = true;

        $sql = "
            INSERT INTO documento (
                id_cat,
                id_func,
                ruta,
                titulo,
                descripcion
            )
            VALUES (
                :id_cat,
                :id_func,
                :ruta,
                :titulo,
                :descripcion
            )
        ";

        $stmt = $db->prepare($sql);

        $stmt->execute([
            ":id_cat" => $idCat,
            ":id_func" => $idFunc,
            ":ruta" => $ruta,
            ":titulo" => $titulo,
            ":descripcion" => $descripcion
        ]);


        sendJson(201, [
            "ok" => true,
            "mensaje" => "Documento creado correctamente.",
            "id_doc" => (int) $db->lastInsertId()
        ]);


    } catch (Throwable $e) {

        // Si el archivo se guardó pero falló el INSERT,
        // eliminamos el PDF para evitar archivos huérfanos
        if (
            $fileSaved &&
            $destination !== null &&
            file_exists($destination)
        ) {
            unlink($destination);
        }


        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al crear el documento."
        ]);
    }
}