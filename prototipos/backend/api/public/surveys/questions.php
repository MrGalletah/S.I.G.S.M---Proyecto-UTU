
<?php

require_once __DIR__ . "/../../middleware/requireAuth.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";

require_once __DIR__ . "/../../handlers/surveys/createSurveyQuestion.php";
require_once __DIR__ . "/../../handlers/surveys/updateSurveyQuestion.php";


switch ($_SERVER["REQUEST_METHOD"]) {

    case "POST":

        requireAuth();
        handleCreateSurveyQuestion();
        break;

    case "PATCH":

        requireAuth();
        handleUpdateSurveyQuestion();
        break;

    default:

        sendJson(405, [
            "ok" => false,
            "mensaje" => "Método no permitido."
        ]);
}
