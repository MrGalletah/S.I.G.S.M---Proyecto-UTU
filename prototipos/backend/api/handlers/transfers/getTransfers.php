<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../services/transfers/TransferQueryService.php";


function handleGetTransfers(): void
{
    try {

        $db = Database::getConnection();

        $service = new TransferQueryService($db);

        $transfers = $service->getActiveTransfers();

        sendJson(200, [
            "ok" => true,
            "traslados" => $transfers
        ]);

    } catch (Throwable $e) {

        error_log(
            "Error al obtener traslados: "
            . $e->getMessage()
        );

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al obtener los traslados."
        ]);
    }
}