<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/getJsonBody.php";
require_once __DIR__ . "/../../utils/validation.php";

require_once __DIR__ . "/../../services/SurveyQuestionOrderService.php";


function handleReorderSurveyQuestions(): void
{
    $data = getJsonBody();

    $idEncuesta = requirePositiveInt(
        $data["id_encuesta"] ?? null,
        "La encuesta"
    );

    $preguntas = $data["preguntas"] ?? null;

    // VALIDAR ARRAY

    if (
        !is_array($preguntas) ||
        !array_is_list($preguntas) ||
        count($preguntas) === 0 ||
        count($preguntas) > 500
    ) {
        sendJson(400, [
            "ok" => false,
            "mensaje" => "Debe enviar una lista válida de preguntas."
        ]);
    }

    // VALIDAR IDENTIFICADORES

    $ids = [];

    foreach ($preguntas as $idPregunta) {

        if (
            !is_int($idPregunta) ||
            $idPregunta <= 0 ||
            isset($ids[$idPregunta])
        ) {
            sendJson(400, [
                "ok" => false,
                "mensaje" => "Los identificadores deben ser únicos y positivos."
            ]);
        }

        $ids[$idPregunta] = true;
    }


    try {

        $db = Database::getConnection();

        $service = new SurveyQuestionOrderService($db);

        $service->reorder($idEncuesta, $preguntas);

        sendJson(200, [
            "ok" => true,
            "mensaje" => "Preguntas reordenadas correctamente."
        ]);

    } catch (RuntimeException $e) {

        if (in_array($e->getCode(), [404, 409], true)) {

            sendJson($e->getCode(), [
                "ok" => false,
                "mensaje" => $e->getMessage()
            ]);
        }

        error_log($e->getMessage());

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al reordenar las preguntas."
        ]);

    } catch (Throwable $e) {

        error_log(
            "Error al reordenar preguntas: " . $e->getMessage()
        );

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al reordenar las preguntas."
        ]);
    }
}
