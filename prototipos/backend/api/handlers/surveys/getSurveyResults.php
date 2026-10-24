
<?php

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/validation.php";

require_once __DIR__ . "/../../services/SurveyResultsService.php";


function handleGetSurveyResults(): void
{
    // VALIDAR ENCUESTA

    $idEncuesta = requirePositiveInt(
        $_GET["id"] ?? null,
        "La encuesta"
    );


    try {

        // CONSULTAR RESULTADOS

        $db = Database::getConnection();

        $service = new SurveyResultsService($db);

        $resultados = $service->getResults(
            $idEncuesta
        );


        if ($resultados === null) {

            sendJson(404, [
                "ok" => false,
                "mensaje" => "La encuesta no existe."
            ]);
        }


        sendJson(200, [
            "ok" => true,
            "resultados" => $resultados
        ]);

    } catch (Throwable $e) {

        error_log(
            "Error al obtener resultados de encuesta: "
            . $e->getMessage()
        );

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al obtener los resultados."
        ]);
    }
}
