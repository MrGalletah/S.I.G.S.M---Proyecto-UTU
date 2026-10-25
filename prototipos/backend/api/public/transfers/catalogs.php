<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../middleware/requireRole.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../services/TransferCatalogService.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {

    sendJson(405, [
        "ok" => false,
        "mensaje" => "Método no permitido."
    ]);
}

$user = requireRole([
    "Administrador",
    "Gestor de traslados",
    "Solicitante de traslado"
]);


try {

    $db = Database::getConnection();

    $service = new TransferCatalogService($db);

    $catalogs = $service->getCatalogs();

    // Solo los gestores pueden consultar
    // los recursos utilizados en el historial.

    $canManageTransfers = (bool) array_intersect(
        $user["roles"] ?? [],
        [
            "Administrador",
            "Gestor de traslados"
        ]
    );

    if (!$canManageTransfers) {
        unset(
            $catalogs["vehiculos_historial"],
            $catalogs["conductores_historial"],
            $catalogs["enfermeros_historial"]
        );
    }

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
