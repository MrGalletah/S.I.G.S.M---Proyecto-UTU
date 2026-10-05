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

    // PAGINACIÓN

    $page = isset($_GET["page"])
        ? (int) $_GET["page"]
        : 1;

    $limit = isset($_GET["limit"])
        ? (int) $_GET["limit"]
        : 20;


    if ($page < 1) {

        sendJson(400, [
            "ok" => false,
            "mensaje" =>
            "La página debe ser mayor o igual a 1."
        ]);
    }


    if (
        $limit < 1
        || $limit > 100
    ) {

        sendJson(400, [
            "ok" => false,
            "mensaje" =>
            "El límite debe estar entre 1 y 100."
        ]);
    }


    // BÚSQUEDA

    $search = isset($_GET["search"])
        ? trim($_GET["search"])
        : null;


    if ($search === "") {
        $search = null;
    }


    // FECHAS

    $desde = isset($_GET["desde"])
        ? trim($_GET["desde"])
        : null;

    $hasta = isset($_GET["hasta"])
        ? trim($_GET["hasta"])
        : null;


    if ($desde === "") {
        $desde = null;
    }


    if ($hasta === "") {
        $hasta = null;
    }


    if (
        $desde !== null
        && !isValidTransferDate($desde)
    ) {

        sendJson(400, [
            "ok" => false,
            "mensaje" =>
            "La fecha 'desde' no es válida."
        ]);
    }


    if (
        $hasta !== null
        && !isValidTransferDate($hasta)
    ) {

        sendJson(400, [
            "ok" => false,
            "mensaje" =>
            "La fecha 'hasta' no es válida."
        ]);
    }


    if (
        $desde !== null
        && $hasta !== null
        && $desde > $hasta
    ) {

        sendJson(400, [
            "ok" => false,
            "mensaje" =>
            "La fecha 'desde' no puede ser posterior a 'hasta'."
        ]);
    }


    // NO SE PERMITEN FECHAS FUTURAS

    $today = date("Y-m-d");


    if (
        ($desde !== null && $desde > $today)
        || ($hasta !== null && $hasta > $today)
    ) {

        sendJson(400, [
            "ok" => false,
            "mensaje" =>
            "Las fechas del historial no pueden ser posteriores a hoy."
        ]);
    }


    // RECURSOS

    $idVehiculo =
        optionalPositiveInt(
            $_GET["id_vehiculo"] ?? null,
            "El vehículo"
        );


    $idConductor =
        optionalPositiveInt(
            $_GET["id_conductor"] ?? null,
            "El conductor"
        );


    $idEnfermero =
        optionalPositiveInt(
            $_GET["id_enfermero"] ?? null,
            "El enfermero"
        );


    // CONSULTAR

    $db =
        Database::getConnection();


    $service =
        new TransferQueryService($db);


    $result =
        $service->getCompletedTransfers(
            $page,
            $limit,
            $search,
            $desde,
            $hasta,
            $idVehiculo,
            $idConductor,
            $idEnfermero
        );


    sendJson(200, [
        "ok" => true,
        ...$result
    ]);
} catch (Throwable $e) {

    error_log(
        "Error al obtener traslados completados: "
            . $e->getMessage()
    );


    sendJson(500, [
        "ok" => false,
        "mensaje" =>
        "Error al obtener los traslados completados."
    ]);
}
