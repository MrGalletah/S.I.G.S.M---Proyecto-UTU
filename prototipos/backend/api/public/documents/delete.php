<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";


function deleteDocument(int $idDoc): void
{
    $db = null;

    try {

        $db = Database::getConnection();


        // Buscamos el documento antes de borrarlo
        // para obtener la ruta del archivo

        $stmt = $db->prepare(
            "SELECT
                id_doc,
                ruta
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


        $storagePath = realpath(__DIR__ . "/../../storage");

        if ($storagePath === false) {
            sendJson(500, [
                "ok" => false,
                "mensaje" => "No se encontró la carpeta de almacenamiento."
            ]);
        }



        $relativePath = ltrim(
            str_replace("\\", "/", $document["ruta"]),
            "/"
        );

        $requestedPath =
            $storagePath .
            DIRECTORY_SEPARATOR .
            str_replace("/", DIRECTORY_SEPARATOR, $relativePath);

        $filePath = realpath($requestedPath);


        /*
         * Si el archivo existe comprobamos que este
         * realmente dentro de storage
         *
         * Si no existe seguimos igualmente para poder
         * limpiar registros de la DB
         */

        if ($filePath !== false && is_file($filePath)) {

            $storagePrefix = $storagePath . DIRECTORY_SEPARATOR;

            if (!str_starts_with($filePath, $storagePrefix)) {
                sendJson(403, [
                    "ok" => false,
                    "mensaje" => "Ruta de archivo no permitida."
                ]);
            }
        }


        $db->beginTransaction();


        // Eliminamos el registro

        $stmt = $db->prepare(
            "DELETE FROM documento
             WHERE id_doc = :id_doc"
        );

        $stmt->execute([
            ":id_doc" => $idDoc
        ]);


        // Si el PDF existe, lo eliminamos físicamente

        if ($filePath !== false && is_file($filePath)) {

            if (!unlink($filePath)) {
                throw new RuntimeException(
                    "No se pudo eliminar el archivo físico."
                );
            }
        }


        $db->commit();


        sendJson(200, [
            "ok" => true,
            "mensaje" => "Documento eliminado correctamente."
        ]);


    } catch (Throwable $e) {

        if (
            $db instanceof PDO &&
            $db->inTransaction()
        ) {
            $db->rollBack();
        }


        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al eliminar el documento."
        ]);
    }
}