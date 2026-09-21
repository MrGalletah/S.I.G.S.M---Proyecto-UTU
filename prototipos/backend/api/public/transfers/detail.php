<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../middleware/requireAuth.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/validation.php";
require_once __DIR__ . "/../../services/TransferQueryService.php";


requireAuth();


if ($_SERVER["REQUEST_METHOD"] !== "GET") {

    sendJson(405, [
        "ok" => false,
        "mensaje" => "Método no permitido."
    ]);
}


try {

    $idTransfer = requirePositiveInt(
        $_GET["id"] ?? null,
        "El traslado"
    );

    $db = Database::getConnection();

    $service = new TransferQueryService($db);

    $transfer = $service->getTransferById(
        $idTransfer
    );


    if ($transfer === null) {

        sendJson(404, [
            "ok" => false,
            "mensaje" =>
            "El traslado no existe."
        ]);
    }


    sendJson(200, [
        "ok" => true,
        "traslado" => $transfer
    ]);
} catch (Throwable $e) {

    error_log(
        "Error al obtener detalle del traslado: "
            . $e->getMessage()
    );

    sendJson(500, [
        "ok" => false,
        "mensaje" =>
        "Error al obtener el traslado."
    ]);
}
