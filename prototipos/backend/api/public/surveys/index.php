
<?php

require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../middleware/requireAuth.php";

require_once __DIR__ . "/../../handlers/surveys/getSurveys.php";
require_once __DIR__ . "/../../handlers/surveys/createSurvey.php";
require_once __DIR__ . "/../../handlers/surveys/updateSurvey.php";


switch ($_SERVER["REQUEST_METHOD"]) {

    case "GET":

        handleGetSurveys();
        break;

    case "POST":

        $user = requireAuth();

        handleCreateSurvey(
            (int) $user["id_func"]
        );
        break;

    case "PATCH":

        requireAuth();
        handleUpdateSurvey();
        break;

    default:

        sendJson(405, [
            "ok" => false,
            "mensaje" => "Método no permitido."
        ]);
}
