<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/validation.php";
require_once __DIR__ . "/../../services/TransferResourceService.php";


function handleGetTransferResources(): void
{
    try {

        $idTraslado = requirePositiveInt(
            $_GET["id_traslado"] ?? null,
            "El traslado"
        );

        $inicio = requireDateTime(
            $_GET["inicio"] ?? null,
            "La hora de salida"
        );

        $fin = requireDateTime(
            $_GET["fin"] ?? null,
            "La hora de llegada"
        );


        if ($fin <= $inicio) {
            sendJson(400, [
                "ok" => false,
                "mensaje" =>
                "La hora de llegada debe ser posterior a la hora de salida."
            ]);
        }


        $db = Database::getConnection();

        $service =
            new TransferResourceService($db);

        $resources =
            $service->getAvailableResources(
                $idTraslado,
                $inicio,
                $fin
            );


        sendJson(200, [
            "ok" => true,
            ...$resources
        ]);
    } catch (InvalidArgumentException $e) {

        sendJson(400, [
            "ok" => false,
            "mensaje" => $e->getMessage()
        ]);
    } catch (RuntimeException $e) {

        if ($e->getCode() === 409) {
            sendJson(409, [
                "ok" => false,
                "mensaje" => $e->getMessage()
            ]);

            return;
        }

        throw $e;
    } catch (Throwable $e) {

        error_log(
            "Error al obtener recursos disponibles: "
                . $e->getMessage()
        );

        sendJson(500, [
            "ok" => false,
            "mensaje" =>
            "Error al obtener los recursos disponibles."
        ]);
    }
}
