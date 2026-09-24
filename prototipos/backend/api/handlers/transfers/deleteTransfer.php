<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/validation.php";
require_once __DIR__ . "/../../utils/getJsonBody.php";
require_once __DIR__ . "/../../services/TransferDeleteService.php";


function handleDeleteTransfer(): void
{
    try {

        $idTraslado = requirePositiveInt(
            $_GET["id"] ?? null,
            "El traslado"
        );


        $data = getJsonBody();


        $version = requirePositiveInt(
            $data["version"] ?? null,
            "La versión"
        );


        $db = Database::getConnection();

        $service =
            new TransferDeleteService($db);


        $newVersion =
            $service->deleteTransfer(
                $idTraslado,
                $version
            );


        sendJson(200, [
            "ok" => true,
            "mensaje" =>
                "Traslado dado de baja correctamente.",
            "id_traslado" =>
                $idTraslado,
            "version" =>
                $newVersion
        ]);

    } catch (InvalidArgumentException $e) {

        sendJson(400, [
            "ok" => false,
            "mensaje" => $e->getMessage()
        ]);

    } catch (RuntimeException $e) {

        if (in_array(
            $e->getCode(),
            [404, 409],
            true
        )) {
            sendJson(
                $e->getCode(),
                [
                    "ok" => false,
                    "mensaje" =>
                        $e->getMessage()
                ]
            );

            return;
        }

        throw $e;

    } catch (Throwable $e) {

        error_log(
            "Error al dar de baja traslado: "
            . $e->getMessage()
        );

        sendJson(500, [
            "ok" => false,
            "mensaje" =>
                "Error al dar de baja el traslado."
        ]);
    }
}