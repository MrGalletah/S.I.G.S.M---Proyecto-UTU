<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/validation.php";
require_once __DIR__ . "/../../utils/getJsonBody.php";
require_once __DIR__ . "/../../services/TransferStateService.php";


function handleUpdateTransferState(
    int $idFuncionario
): void {
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


        $observacion = cleanOptionalString(
            $data["observacion"] ?? null
        );


        $db = Database::getConnection();

        $service =
            new TransferStateService($db);


        $result = $service->advanceState(
            $idTraslado,
            $version,
            $idFuncionario,
            $observacion
        );


        sendJson(200, [
            "ok" => true,

            "mensaje" =>
                "Estado del traslado actualizado correctamente.",

            ...$result
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
                    "mensaje" => $e->getMessage()
                ]
            );

            return;
        }

        throw $e;

    } catch (Throwable $e) {

        error_log(
            "Error al cambiar estado del traslado: "
            . $e->getMessage()
        );

        sendJson(500, [
            "ok" => false,
            "mensaje" =>
                "Error al cambiar el estado del traslado."
        ]);
    }
}