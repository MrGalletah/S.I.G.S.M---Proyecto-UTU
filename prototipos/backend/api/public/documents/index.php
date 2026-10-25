<?php

require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../middleware/requireRole.php";

require_once __DIR__ . "/get.php";
require_once __DIR__ . "/postUpdate.php";
require_once __DIR__ . "/post.php";
require_once __DIR__ . "/patch.php";
require_once __DIR__ . "/delete.php";

$method = $_SERVER["REQUEST_METHOD"];

switch ($method) {

    case "GET":

        // La función comprueba los roles cuando
        // se solicita incluir documentos inactivos.
        getDocuments();

        break;


    case "POST":

        $user = requireRole([
            "Administrador",
            "Gestor de documentación"
        ]);

        // Si se manda un ID, actualizamos el documento.
        if (isset($_GET["id"])) {

            $idDoc = requirePositiveInt(
                $_GET["id"],
                "El ID del documento"
            );

            updateDocumentWithFile($idDoc);
        } else {

            createDocument((int) $user["id_func"]);
        }

        break;


    case "PATCH":

        requireRole([
            "Administrador",
            "Gestor de documentación"
        ]);

        $idDoc = requirePositiveInt(
            $_GET["id"] ?? null,
            "El ID del documento"
        );

        updateDocument($idDoc);

        break;


    case "DELETE":

        requireRole([
            "Administrador",
            "Gestor de documentación"
        ]);

        $idDoc = requirePositiveInt(
            $_GET["id"] ?? null,
            "El ID del documento"
        );

        deleteDocument($idDoc);

        break;


    default:

        sendJson(405, [
            "ok" => false,
            "mensaje" => "Método no permitido."
        ]);
}
