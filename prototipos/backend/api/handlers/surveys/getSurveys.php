
<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/validation.php";
require_once __DIR__ . "/../../middleware/requireAuth.php";

require_once __DIR__ . "/../../services/SurveyQueryService.php";


function handleGetSurveys(): void
{
    try {

        // FILTROS

        $includeInactive = optionalBoolean(
            $_GET["includeInactive"] ?? null,
            "El parámetro includeInactive",
            false
        );

        $idCat = optionalPositiveInt(
            $_GET["categoryId"] ?? null,
            "La categoría"
        );


        // AUTENTICACIÓN

        if ($includeInactive) {
            requireAuth();
        }


        // CONSULTA

        $db = Database::getConnection();

        $service = new SurveyQueryService($db);

        $encuestas = $service->getSurveys(
            $includeInactive,
            $idCat
        );


        sendJson(200, [
            "ok" => true,
            "encuestas" => $encuestas
        ]);
    } catch (Throwable $e) {

        error_log(
            "Error al obtener encuestas: "
                . $e->getMessage()
        );

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al obtener las encuestas."
        ]);
    }
}
