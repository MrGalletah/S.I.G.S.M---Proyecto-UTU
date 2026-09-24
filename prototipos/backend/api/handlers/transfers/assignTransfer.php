<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/validation.php";
require_once __DIR__ . "/../../utils/getJsonBody.php";
require_once __DIR__ . "/../../services/TransferAssignmentService.php";


function handleAssignTransfer(
    int $idGestor
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

        $idVehiculo = requirePositiveInt(
            $data["id_vehiculo"] ?? null,
            "El vehículo"
        );

        $idConductor = requirePositiveInt(
            $data["id_conductor"] ?? null,
            "El conductor"
        );

        $idEnfermero = optionalPositiveInt(
            $data["id_enfermero"] ?? null,
            "El enfermero"
        );


        $horaSalida = requireDateTime(
            $data["hora_salida_estimada"] ?? null,
            "La hora de salida"
        );

        $horaLlegada = requireDateTime(
            $data["hora_llegada_estimada"] ?? null,
            "La hora de llegada"
        );


        if ($horaLlegada <= $horaSalida) {
            sendJson(400, [
                "ok" => false,
                "mensaje" =>
                    "La hora de llegada debe ser posterior a la hora de salida."
            ]);
        }


        $db = Database::getConnection();

        $service =
            new TransferAssignmentService($db);

        $newVersion =
            $service->assignTransfer(
                $idTraslado,
                $version,
                $idVehiculo,
                $idConductor,
                $idEnfermero,
                $horaSalida,
                $horaLlegada,
                $idGestor
            );


        sendJson(200, [
            "ok" => true,

            "mensaje" =>
                "Recursos asignados correctamente.",

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
        }

        throw $e;

    } catch (Throwable $e) {

        error_log(
            "Error al asignar traslado: "
            . $e->getMessage()
        );

        sendJson(500, [
            "ok" => false,
            "mensaje" =>
                "Error al asignar los recursos."
        ]);
    }
}