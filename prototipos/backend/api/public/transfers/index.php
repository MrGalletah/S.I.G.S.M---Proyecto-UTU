<?php

require_once __DIR__ . "/../../middleware/requireAuth.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";

require_once __DIR__ . "/../../handlers/transfers/getTransfers.php";
require_once __DIR__ . "/../../handlers/transfers/createTransfer.php";
require_once __DIR__ . "/../../handlers/transfers/deleteTransfer.php";

$user = requireAuth();


switch ($_SERVER["REQUEST_METHOD"]) {

    case "GET":

        handleGetTransfers();

        break;


    case "POST":

        handleCreateTransfer(
            (int) $user["id_func"]
        );

        break;


    case "DELETE":

        handleDeleteTransfer();

        break;


    default:

        sendJson(405, [
            "ok" => false,
            "mensaje" => "Método no permitido."
        ]);
}
