<?php

require_once __DIR__ . "/../../middleware/requireRole.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";

require_once __DIR__ . "/../../handlers/surveys/createSurveyQuestion.php";
require_once __DIR__ . "/../../handlers/surveys/updateSurveyQuestion.php";


switch ($_SERVER["REQUEST_METHOD"]) {

    case "POST":

        requireRole([
            "Administrador",
            "Gestor de documentación"
        ]);

        handleCreateSurveyQuestion();
        break;


    case "PATCH":

        requireRole([
            "Administrador",
            "Gestor de documentación"
        ]);

        handleUpdateSurveyQuestion();
        break;


    default:

        sendJson(405, [
            "ok" => false,
            "mensaje" => "Método no permitido."
        ]);
}
