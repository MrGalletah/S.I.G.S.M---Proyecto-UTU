<?php

require_once __DIR__ . "/../config/Database.php";
require_once __DIR__ . "/../middleware/requireAuth.php";
require_once __DIR__ . "/jsonResponse.php";


function serveDocumentFile(
    int $idDoc,
    bool $download = false,
    bool $includeInactive = false
): void {

    try {

        // Para acceder a documentos inactivos
        // es necesario estar autenticado
        if ($includeInactive) {
            requireAuth();
        }


        $db = Database::getConnection();


        // Buscamos el documento y el estado de su categoría
        $stmt = $db->prepare(
            "SELECT
                d.id_doc,
                d.ruta,
                d.titulo,
                d.activo AS documento_activo,
                c.activo AS categoria_activa
            FROM documento d
            INNER JOIN categoria c
                ON d.id_cat = c.id_cat
            WHERE d.id_doc = :id_doc"
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


        // En acceso público tanto el documento como
        // su categoría deben estar activos
        if (
            !$includeInactive &&
            (
                !(bool) $document["documento_activo"] ||
                !(bool) $document["categoria_activa"]
            )
        ) {
            sendJson(404, [
                "ok" => false,
                "mensaje" => "El documento no está disponible."
            ]);
        }


        $storagePath = realpath(__DIR__ . "/../storage");

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


        
        // realpath devuelve false si el archivo
        // no existe
         
        $filePath = realpath($requestedPath);

        if ($filePath === false || !is_file($filePath)) {
            sendJson(404, [
                "ok" => false,
                "mensaje" => "No se encontró el archivo del documento."
            ]);
        }


        // comprobamos que la ruta final siga estando
        // dentro de api/storage

        $storagePrefix = $storagePath . DIRECTORY_SEPARATOR;

        if (!str_starts_with($filePath, $storagePrefix)) {
            sendJson(403, [
                "ok" => false,
                "mensaje" => "Ruta de archivo no permitida."
            ]);
        }

        // cambiamos de nombre al archivo por el titulo
        $downloadName = trim($document["titulo"]) . ".pdf";



        // inline     -> visualizar
        // attachment -> descargar

        $disposition = $download
            ? "attachment"
            : "inline";


        header("Content-Type: application/pdf");

        header(
            "Content-Disposition: {$disposition}; " .
            "filename=\"documento.pdf\"; " .
            "filename*=UTF-8''" . rawurlencode($downloadName)
        );

        header("Content-Length: " . filesize($filePath));

        header("X-Content-Type-Options: nosniff");


        readfile($filePath);

        exit;


    } catch (Throwable $e) {

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al acceder al documento."
        ]);
    }
}