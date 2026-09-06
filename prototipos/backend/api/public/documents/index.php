<?php

require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../middleware/requireAuth.php";

require_once __DIR__ . "/get.php";
require_once __DIR__ . "/postUpdate.php";
require_once __DIR__ . "/post.php";
require_once __DIR__ . "/patch.php";

$method = $_SERVER["REQUEST_METHOD"];

switch ($method) {

    case "GET":

        getDocuments();

        break;


    case "POST":

        $user = requireAuth();

        // Si se manda id actualizamos el documento
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

        requireAuth();

        $idDoc = requirePositiveInt(
            $_GET["id"] ?? null,
            "El ID del documento"
        );

        updateDocument($idDoc);

        break;


    default:

        sendJson(405, [
            "ok" => false,
            "mensaje" => "Método no permitido."
        ]);
}
