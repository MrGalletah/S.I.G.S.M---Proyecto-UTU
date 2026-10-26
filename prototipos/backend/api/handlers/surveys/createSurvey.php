<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/validation.php";
require_once __DIR__ . "/../../utils/getJsonBody.php";

require_once __DIR__ . "/../../services/SurveyCreateService.php";


function handleCreateSurvey(int $idFunc): void
{
    try {

        // DATOS

        $data = getJsonBody();

        $titulo = requireString(
            $data["titulo"] ?? null,
            "El título",
            150
        );


        // DESCRIPCIÓN OPCIONAL

        $descripcion = $data["descripcion"] ?? null;

        if (
            $descripcion !== null
            && !is_string($descripcion)
        ) {
            sendJson(400, [
                "ok" => false,
                "mensaje" => "La descripción debe ser texto o null."
            ]);
        }

        if ($descripcion !== null) {

            $descripcion = trim($descripcion);

            if ($descripcion === "") {
                $descripcion = null;
            }

            if (
                $descripcion !== null
                && mb_strlen($descripcion) > 2000
            ) {
                sendJson(400, [
                    "ok" => false,
                    "mensaje" => "La descripción no puede superar los 2000 caracteres."
                ]);
            }
        }


        // CATEGORÍA OPCIONAL

        $idCat = optionalPositiveInt(
            $data["id_cat"] ?? null,
            "La categoría"
        );


        // ENCUESTA ANÓNIMA

        $anonima = optionalBoolean(
            $data["anonima"] ?? null,
            "El campo anónima",
            true
        );


        // CREAR ENCUESTA

        $db = Database::getConnection();

        $service = new SurveyCreateService($db);

        $idEncuesta = $service->createSurvey(
            $idFunc,
            $idCat,
            $titulo,
            $descripcion,
            $anonima
        );


        sendJson(201, [
            "ok" => true,
            "mensaje" => "Encuesta creada correctamente.",
            "id_encuesta" => $idEncuesta
        ]);
    } catch (InvalidArgumentException $e) {

        sendJson(400, [
            "ok" => false,
            "mensaje" => $e->getMessage()
        ]);
    } catch (Throwable $e) {

        error_log(
            "Error al crear encuesta: "
                . $e->getMessage()
        );

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al crear la encuesta."
        ]);
    }
}
