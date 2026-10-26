<?php

require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../handlers/surveys/createSurveyResponse.php";


if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    sendJson(405, [
        "ok" => false,
        "mensaje" => "Método no permitido."
    ]);
}


handleCreateSurveyResponse();
