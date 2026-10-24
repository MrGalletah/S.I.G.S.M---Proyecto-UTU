
<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/validation.php";
require_once __DIR__ . "/../../utils/getJsonBody.php";

require_once __DIR__ . "/../../services/SurveyResponseCreateService.php";


function handleCreateSurveyResponse(): void
{
    // DATOS

    $data = getJsonBody();

    $idEncuesta = requirePositiveInt(
        $data["id_encuesta"] ?? null,
        "La encuesta"
    );


    // CÉDULA OPCIONAL
    // El servicio comprobará si la encuesta
    // permite o requiere identificar al paciente.

    $cedula = null;

    if (
        array_key_exists("cedula", $data)
        && $data["cedula"] !== null
    ) {

        $cedula = requireString(
            $data["cedula"],
            "La cédula",
            20
        );
    }


    // RESPUESTAS

    $respuestas = $data["respuestas"] ?? null;

    if (
        !is_array($respuestas)
        || !array_is_list($respuestas)
        || count($respuestas) < 1
        || count($respuestas) > 100
    ) {

        sendJson(400, [
            "ok" => false,
            "mensaje" => "Debe enviar entre 1 y 100 respuestas."
        ]);
    }


    $respuestasValidadas = [];
    $preguntasRecibidas = [];


    foreach ($respuestas as $index => $item) {

        if (!is_array($item)) {

            sendJson(400, [
                "ok" => false,
                "mensaje" => "El formato de una respuesta no es válido."
            ]);
        }


        // IDENTIFICADOR DE PREGUNTA

        $idPregunta = requirePositiveInt(
            $item["id_pregunta"] ?? null,
            "La pregunta"
        );


        // EVITAR PREGUNTAS REPETIDAS

        if (isset($preguntasRecibidas[$idPregunta])) {

            sendJson(400, [
                "ok" => false,
                "mensaje" => "No se puede responder dos veces la misma pregunta."
            ]);
        }

        $preguntasRecibidas[$idPregunta] = true;


        // DETERMINAR TIPO DE RESPUESTA

        $tieneOpcion = isset($item["id_opcion"]);
        $tieneTexto = isset($item["respuesta"]);


        if ($tieneOpcion === $tieneTexto) {

            sendJson(400, [
                "ok" => false,
                "mensaje" => "Cada respuesta debe contener una opción o un texto, pero no ambos."
            ]);
        }


        $idOpcion = null;
        $textoRespuesta = null;


        // RESPUESTA CON OPCIÓN

        if ($tieneOpcion) {

            $idOpcion = requirePositiveInt(
                $item["id_opcion"],
                "La opción"
            );
        }


        // RESPUESTA ABIERTA

        if ($tieneTexto) {

            $textoRespuesta = requireString(
                $item["respuesta"],
                "La respuesta",
                4000
            );
        }


        $respuestasValidadas[] = [
            "id_pregunta" => $idPregunta,
            "id_opcion" => $idOpcion,
            "respuesta" => $textoRespuesta
        ];
    }


    // GUARDAR RESPUESTAS

    try {

        $db = Database::getConnection();

        $service = new SurveyResponseCreateService($db);

        $idRespuesta = $service->createResponse(
            $idEncuesta,
            $cedula,
            $respuestasValidadas
        );


        sendJson(201, [
            "ok" => true,
            "mensaje" => "Encuesta respondida correctamente.",
            "id_respuesta_encuesta" => $idRespuesta
        ]);
    } catch (InvalidArgumentException $e) {

        sendJson(400, [
            "ok" => false,
            "mensaje" => $e->getMessage()
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
            "mensaje" => "Error al guardar las respuestas."
        ]);
    } catch (Throwable $e) {

        error_log(
            "Error al responder encuesta: "
                . $e->getMessage()
        );

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al guardar las respuestas."
        ]);
    }
}
