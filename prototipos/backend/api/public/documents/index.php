<?php

require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../middleware/requireAuth.php";

$method = $_SERVER["REQUEST_METHOD"];

switch ($method) {

    case "GET":

        require_once __DIR__ . "/get.php";

        getDocuments();

        break;


    case "POST":

        require_once __DIR__ . "/post.php";

        $user = requireAuth();

        createDocument((int) $user["id_func"]);

        break;


    case "PATCH":

        require_once __DIR__ . "/patch.php";

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