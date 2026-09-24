<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/getJsonBody.php";
require_once __DIR__ . "/../../utils/validation.php";
require_once __DIR__ . "/../../services/TransferCreateService.php";


function handleCreateTransfer(int $idSolicitante): void
{
    try {

        $data = getJsonBody();

        $idTipoTraslado = requirePositiveInt(
            $data["id_tipo_traslado"] ?? null,
            "El tipo de traslado"
        );

        $idTipoElemento = requirePositiveInt(
            $data["id_tipo_elemento"] ?? null,
            "El tipo de elemento"
        );

        $origen = requireString(
            $data["origen"] ?? null,
            "El origen",
            150
        );

        $destino = requireString(
            $data["destino"] ?? null,
            "El destino",
            150
        );


        $prioridad = strtoupper(
            trim($data["prioridad"] ?? "")
        );

        if (!in_array(
            $prioridad,
            ["NORMAL", "URGENTE"],
            true
        )) {
            sendJson(400, [
                "ok" => false,
                "mensaje" => "La prioridad no es válida."
            ]);
        }


        $fechaRequerida = trim(
            $data["fecha_requerida"] ?? ""
        );

        if (!isValidTransferDate($fechaRequerida)) {
            sendJson(400, [
                "ok" => false,
                "mensaje" => "La fecha requerida no es válida."
            ]);
        }

        if ($fechaRequerida < date("Y-m-d")) {
            sendJson(400, [
                "ok" => false,
                "mensaje" =>
                "La fecha requerida no puede ser anterior a hoy."
            ]);
        }


        $payload = [
            "id_tipo_traslado" => $idTipoTraslado,
            "id_tipo_elemento" => $idTipoElemento,

            "cedula_paciente" => cleanOptionalString(
                $data["cedula_paciente"] ?? null
            ),

            "elemento" => cleanOptionalString(
                $data["elemento"] ?? null
            ),

            "origen" => $origen,
            "destino" => $destino,

            "prioridad" => $prioridad,

            "fecha_requerida" => $fechaRequerida,

            "observaciones" => cleanOptionalString(
                $data["observaciones"] ?? null
            )
        ];


        $db = Database::getConnection();

        $service = new TransferCreateService($db);

        $idTraslado = $service->createTransfer(
            $payload,
            $idSolicitante
        );


        sendJson(201, [
            "ok" => true,
            "mensaje" =>
            "Solicitud de traslado registrada correctamente.",

            "id_traslado" => $idTraslado,

            "codigo" => "TR-" . str_pad(
                $idTraslado,
                5,
                "0",
                STR_PAD_LEFT
            ),

            "version" => 1
        ]);
    } catch (InvalidArgumentException $e) {

        sendJson(400, [
            "ok" => false,
            "mensaje" => $e->getMessage()
        ]);
    } catch (Throwable $e) {

        error_log(
            "Error al crear traslado: "
                . $e->getMessage()
        );

        sendJson(500, [
            "ok" => false,
            "mensaje" =>
            "Error al registrar el traslado."
        ]);
    }
}
