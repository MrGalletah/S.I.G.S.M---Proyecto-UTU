<?php

require_once __DIR__ . "/../../middleware/requireRole.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../handlers/transfers/getTransferResources.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {

    sendJson(405, [
        "ok" => false,
        "mensaje" => "Método no permitido."
    ]);
}

requireRole([
    "Administrador",
    "Gestor de traslados"
]);

handleGetTransferResources();