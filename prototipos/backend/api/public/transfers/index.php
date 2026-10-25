
<?php

require_once __DIR__ . "/../../middleware/requireRole.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";

require_once __DIR__ . "/../../handlers/transfers/getTransfers.php";
require_once __DIR__ . "/../../handlers/transfers/createTransfer.php";
require_once __DIR__ . "/../../handlers/transfers/deleteTransfer.php";


switch ($_SERVER["REQUEST_METHOD"]) {

    case "GET":

        requireRole([
            "Administrador",
            "Gestor de traslados"
        ]);

        handleGetTransfers();
        break;


    case "POST":

        $user = requireRole([
            "Administrador",
            "Solicitante de traslado"
        ]);

        handleCreateTransfer(
            (int) $user["id_func"]
        );

        break;


    case "DELETE":

        requireRole([
            "Administrador",
            "Gestor de traslados"
        ]);

        handleDeleteTransfer();
        break;


    default:

        sendJson(405, [
            "ok" => false,
            "mensaje" => "Método no permitido."
        ]);
}
