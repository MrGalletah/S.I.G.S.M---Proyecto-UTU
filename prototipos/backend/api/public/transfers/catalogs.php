<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../middleware/requireAuth.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../services/TransferCatalogService.php";


requireAuth();


if ($_SERVER["REQUEST_METHOD"] !== "GET") {

    sendJson(405, [
        "ok" => false,
        "mensaje" => "Método no permitido."
    ]);
}


try {
    
    $db = Database::getConnection();

    $service = new TransferCatalogService($db);

    $catalogs = $service->getCatalogs();

    sendJson(200, [
        "ok" => true,
        ...$catalogs
    ]);
} catch (Throwable $e) {

    error_log(
        "Error al obtener catálogos de traslados: "
            . $e->getMessage()
    );

    sendJson(500, [
        "ok" => false,
        "mensaje" =>
        "Error al obtener los catálogos de traslados."
    ]);
}
