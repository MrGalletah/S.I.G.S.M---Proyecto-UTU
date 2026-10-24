
<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/validation.php";
require_once __DIR__ . "/../../utils/getJsonBody.php";

require_once __DIR__ . "/../../services/SurveyUpdateService.php";


function handleUpdateSurvey(): void
{
    // IDENTIFICADOR

    $idEncuesta = requirePositiveInt(
        $_GET["id"] ?? null,
        "La encuesta"
    );

    $data = getJsonBody();

    $campos = [];


    // TÍTULO

    if (array_key_exists("titulo", $data)) {

        $campos["titulo"] = requireString(
            $data["titulo"],
            "El título",
            150
        );
    }


    // DESCRIPCIÓN

    if (array_key_exists("descripcion", $data)) {

        $descripcion = $data["descripcion"];

        if (
            $descripcion !== null &&
            !is_string($descripcion)
        ) {
            sendJson(400, [
                "ok" => false,
                "mensaje" => "La descripción debe ser texto o null."
            ]);
        }

        if ($descripcion !== null) {

            $descripcion = trim($descripcion);

            if (mb_strlen($descripcion) > 2000) {
                sendJson(400, [
                    "ok" => false,
                    "mensaje" => "La descripción no puede superar los 2000 caracteres."
                ]);
            }

            if ($descripcion === "") {
                $descripcion = null;
            }
        }

        $campos["descripcion"] = $descripcion;
    }


    // CATEGORÍA

    if (array_key_exists("id_cat", $data)) {

        $campos["id_cat"] = optionalPositiveInt(
            $data["id_cat"],
            "La categoría"
        );
    }


    // ANONIMATO

    if (array_key_exists("anonima", $data)) {

        $campos["anonima"] = requireBoolean(
            $data["anonima"],
            "El campo anónima"
        );
    }


    // ESTADO

    if (array_key_exists("activo", $data)) {

        $campos["activo"] = requireBoolean(
            $data["activo"],
            "El campo activo"
        );
    }


    // COMPROBAR CAMPOS

    if (empty($campos)) {

        sendJson(400, [
            "ok" => false,
            "mensaje" => "No se enviaron campos para modificar."
        ]);
    }


    // ACTUALIZAR

    try {

        $db = Database::getConnection();

        $service = new SurveyUpdateService($db);

        $service->updateSurvey(
            $idEncuesta,
            $campos
        );

        sendJson(200, [
            "ok" => true,
            "mensaje" => "Encuesta actualizada correctamente."
        ]);
    } catch (PDOException $e) {

        error_log(
            "Error SQL al actualizar encuesta: "
                . $e->getMessage()
        );

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al actualizar la encuesta."
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
            "mensaje" => "Error al actualizar la encuesta."
        ]);
    } catch (Throwable $e) {

        error_log($e->getMessage());

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al actualizar la encuesta."
        ]);
    }
}
