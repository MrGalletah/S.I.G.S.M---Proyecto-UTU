<?php

require_once __DIR__ . "/../../middleware/requireAuth.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../handlers/transfers/assignTransfer.php";


$user = requireAuth();


if ($_SERVER["REQUEST_METHOD"] !== "PATCH") {

    sendJson(405, [
        "ok" => false,
        "mensaje" => "Método no permitido."
    ]);
}


handleAssignTransfer(
    (int) $user["id_func"]
);