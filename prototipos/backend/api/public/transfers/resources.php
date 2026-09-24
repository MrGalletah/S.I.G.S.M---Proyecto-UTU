<?php

require_once __DIR__ . "/../../middleware/requireAuth.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../handlers/transfers/getTransferResources.php";


requireAuth();


if ($_SERVER["REQUEST_METHOD"] !== "GET") {

    sendJson(405, [
        "ok" => false,
        "mensaje" => "Método no permitido."
    ]);
}


handleGetTransferResources();