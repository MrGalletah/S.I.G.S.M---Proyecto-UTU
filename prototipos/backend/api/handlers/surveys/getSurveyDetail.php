
<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/validation.php";
require_once __DIR__ . "/../../middleware/requireAuth.php";

require_once __DIR__ . "/../../services/SurveyQueryService.php";


function handleGetSurveyDetail(): void
{
    try {

        // PARÁMETROS

        $idEncuesta = requirePositiveInt(
            $_GET["id"] ?? null,
            "La encuesta"
        );

        $includeInactive = optionalBoolean(
            $_GET["includeInactive"] ?? null,
            "El parámetro includeInactive",
            false
        );


        // AUTENTICACIÓN

        if ($includeInactive) {
            requireAuth();
        }


        // CONSULTA

        $db = Database::getConnection();

        $service = new SurveyQueryService($db);

        $encuesta = $service->getSurveyById(
            $idEncuesta,
            $includeInactive
        );


        if ($encuesta === null) {

            sendJson(404, [
                "ok" => false,
                "mensaje" => "La encuesta no existe o no está disponible."
            ]);
        }


        sendJson(200, [
            "ok" => true,
            "encuesta" => $encuesta
        ]);
    } catch (Throwable $e) {

        error_log(
            "Error al obtener encuesta: "
                . $e->getMessage()
        );

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al obtener la encuesta."
        ]);
    }
}
