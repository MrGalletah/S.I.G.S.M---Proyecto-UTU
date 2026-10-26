<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/getJsonBody.php";
require_once __DIR__ . "/../../utils/validation.php";

require_once __DIR__ . "/../../services/SurveyQuestionCreateService.php";


function handleCreateSurveyQuestion(): void
{
    try {

        $data = getJsonBody();


        // ENCUESTA

        $idEncuesta = requirePositiveInt(
            $data["id_encuesta"] ?? null,
            "La encuesta"
        );


        // PREGUNTA

        $texto = requireString(
            $data["texto"] ?? null,
            "El texto de la pregunta",
            1000
        );

        $tipo = requireString(
            $data["tipo"] ?? null,
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


        // OBLIGATORIA

        $obligatoria = array_key_exists("obligatoria", $data)
            ? requireBoolean(
                $data["obligatoria"],
                "El campo obligatoria"
            )
            : false;


        // ORDEN

        $orden = requirePositiveInt(
            $data["orden"] ?? null,
            "El orden"
        );


        // OPCIONES

        $opciones = $data["opciones"] ?? [];

        if (!is_array($opciones) || !array_is_list($opciones)) {
            sendJson(400, [
                "ok" => false,
                "mensaje" => "Las opciones deben ser un array."
            ]);
        }


        // PREGUNTAS ABIERTAS

        if ($tipo === "abierta" && count($opciones) > 0) {

            sendJson(400, [
                "ok" => false,
                "mensaje" => "Las preguntas abiertas no admiten opciones."
            ]);
        }


        // PREGUNTAS CON OPCIONES

        if ($tipo !== "abierta") {

            if (count($opciones) < 2 || count($opciones) > 20) {

                sendJson(400, [
                    "ok" => false,
                    "mensaje" => "La pregunta debe tener entre 2 y 20 opciones."
                ]);
            }
        }


        // VALIDAR CADA OPCIÓN

        $opcionesValidadas = [];
        $valores = [];

        foreach ($opciones as $index => $opcion) {

            if (!is_array($opcion)) {

                sendJson(400, [
                    "ok" => false,
                    "mensaje" => "El formato de una opción no es válido."
                ]);
            }

            $textoOpcion = requireString(
                $opcion["texto"] ?? null,
                "El texto de la opción " . ($index + 1),
                255
            );

            $valor = $opcion["valor"] ?? null;

            if (!is_int($valor)) {

                sendJson(400, [
                    "ok" => false,
                    "mensaje" => "El valor de cada opción debe ser un número entero."
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
                "texto" => $textoOpcion,
                "valor" => $valor
            ];
        }


        // CREAR PREGUNTA

        $db = Database::getConnection();

        $service = new SurveyQuestionCreateService($db);

        $idPregunta = $service->createQuestion(
            $idEncuesta,
            $texto,
            $tipo,
            $obligatoria,
            $orden,
            $opcionesValidadas
        );


        sendJson(201, [
            "ok" => true,
            "mensaje" => "Pregunta creada correctamente.",
            "id_pregunta" => $idPregunta
        ]);
    } catch (PDOException $e) {

        if (($e->errorInfo[1] ?? null) == 1062) {

            sendJson(409, [
                "ok" => false,
                "mensaje" => "Ya existe una pregunta con ese orden en la encuesta."
            ]);
        }

        error_log("Error SQL al crear pregunta: " . $e->getMessage());

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al crear la pregunta."
        ]);
    } catch (RuntimeException $e) {

        if (in_array($e->getCode(), [404, 409], true)) {

            sendJson($e->getCode(), [
                "ok" => false,
                "mensaje" => $e->getMessage()
            ]);
        }

        error_log("Error al crear pregunta: " . $e->getMessage());

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al crear la pregunta."
        ]);
    } catch (Throwable $e) {

        error_log("Error al crear pregunta: " . $e->getMessage());

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al crear la pregunta."
        ]);
    }
}
