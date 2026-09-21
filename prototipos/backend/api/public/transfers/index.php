<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../middleware/requireAuth.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../services/TransferQueryService.php";


requireAuth();


switch ($_SERVER["REQUEST_METHOD"]) {

    case "GET":
        getTransfers();
        break;

    default:
        sendJson(405, [
            "ok" => false,
            "mensaje" => "Método no permitido."
        ]);
}


function getTransfers(): void
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
            "Error al obtener traslados: " . $e->getMessage()
        );

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al obtener los traslados."
        ]);
    }
}