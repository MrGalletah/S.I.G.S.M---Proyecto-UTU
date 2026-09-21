<?php

require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../handlers/transfers/getTransfers.php";


requireAuth();


switch ($_SERVER["REQUEST_METHOD"]) {

    case "GET":
        handleGetTransfers();
        break;

    default:
        sendJson(405, [
            "ok" => false,
            "mensaje" => "Método no permitido."
        ]);
}


