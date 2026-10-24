
<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/validation.php";
require_once __DIR__ . "/../../utils/getJsonBody.php";

require_once __DIR__ . "/../../services/SurveyQuestionUpdateService.php";


function handleUpdateSurveyQuestion(): void
{
    $idPregunta = requirePositiveInt(
        $_GET["id"] ?? null,
        "La pregunta"
    );

    $data = getJsonBody();
    $campos = [];


    // TEXTO

    if (array_key_exists("texto", $data)) {

        $campos["texto"] = requireString(
            $data["texto"],
            "El texto de la pregunta",
            1000
        );
    }


    // TIPO

    if (array_key_exists("tipo", $data)) {

        $tipo = requireString(
            $data["tipo"],
            "El tipo de pregunta"
        );

        if (!in_array(
            $tipo,
            ["abierta", "cerrada", "seleccion"],
            true
        )) {
            sendJson(400, [
                "ok" => false,
                "mensaje" => "El tipo de pregunta no es válido."
            ]);
        }

        $campos["tipo"] = $tipo;
    }


    // OBLIGATORIA

    if (array_key_exists("obligatoria", $data)) {

        $campos["obligatoria"] = requireBoolean(
            $data["obligatoria"],
            "El campo obligatoria"
        );
    }


    // ACTIVA

    if (array_key_exists("activa", $data)) {

        $campos["activa"] = requireBoolean(
            $data["activa"],
            "El campo activa"
        );
    }


    // ORDEN

    if (array_key_exists("orden", $data)) {

        $campos["orden"] = requirePositiveInt(
            $data["orden"],
            "El orden"
        );
    }


    // OPCIONES

    if (array_key_exists("opciones", $data)) {

        $opciones = $data["opciones"];

        if (
            !is_array($opciones) ||
            !array_is_list($opciones) ||
            count($opciones) > 20
        ) {
            sendJson(400, [
                "ok" => false,
                "mensaje" => "Las opciones deben ser un array de hasta 20 elementos."
            ]);
        }

        $opcionesValidadas = [];
        $valores = [];

        foreach ($opciones as $index => $opcion) {

            if (!is_array($opcion)) {
                sendJson(400, [
                    "ok" => false,
                    "mensaje" => "El formato de una opción no es válido."
                ]);
            }

            $texto = requireString(
                $opcion["texto"] ?? null,
                "El texto de la opción " . ($index + 1),
                255
            );

            $valor = $opcion["valor"] ?? null;

            if (!is_int($valor)) {
                sendJson(400, [
                    "ok" => false,
                    "mensaje" => "El valor de la opción debe ser un entero."
                ]);
            }

            if (isset($valores[$valor])) {
                sendJson(400, [
                    "ok" => false,
                    "mensaje" => "No puede haber opciones con el mismo valor."
                ]);
            }

            $valores[$valor] = true;

            $opcionesValidadas[] = [
                "texto" => $texto,
                "valor" => $valor
            ];
        }

        $campos["opciones"] = $opcionesValidadas;
    }


    if (empty($campos)) {
        sendJson(400, [
            "ok" => false,
            "mensaje" => "No se enviaron campos para modificar."
        ]);
    }


    // ACTUALIZAR

    try {

        $db = Database::getConnection();

        $service = new SurveyQuestionUpdateService($db);

        $service->updateQuestion(
            $idPregunta,
            $campos
        );

        sendJson(200, [
            "ok" => true,
            "mensaje" => "Pregunta actualizada correctamente."
        ]);
    } catch (PDOException $e) {

        if (($e->errorInfo[1] ?? null) == 1062) {
            sendJson(409, [
                "ok" => false,
                "mensaje" => "Ya existe otra pregunta con ese orden."
            ]);
        }

        error_log($e->getMessage());

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al actualizar la pregunta."
        ]);
    } catch (RuntimeException $e) {

        if (in_array($e->getCode(), [400, 404, 409], true)) {
            sendJson($e->getCode(), [
                "ok" => false,
                "mensaje" => $e->getMessage()
            ]);
        }

        error_log($e->getMessage());

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al actualizar la pregunta."
        ]);
    } catch (Throwable $e) {

        error_log($e->getMessage());

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al actualizar la pregunta."
        ]);
    }
}
