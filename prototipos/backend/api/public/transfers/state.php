<?php

require_once __DIR__ . "/../../middleware/requireRole.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../handlers/transfers/updateTransferState.php";


if ($_SERVER["REQUEST_METHOD"] !== "PATCH") {

    header("Allow: PATCH");

    sendJson(405, [
        "ok" => false,
        "mensaje" => "Método no permitido."
    ]);
}


$user = requireRole([
    "Administrador",
    "Gestor de traslados"
]);

handleUpdateTransferState(
    (int) $user["id_func"]
);
