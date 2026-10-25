<?php

require_once __DIR__ . "/../../utils/documentFile.php";
require_once __DIR__ . "/../../utils/validation.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    header("Allow: GET");

    sendJson(405, [
        "ok" => false,
        "mensaje" => "Método no permitido."
    ]);
}


$idDoc = requirePositiveInt(
    $_GET["id"] ?? null,
    "El ID del documento"
);


$includeInactive = optionalBoolean(
    $_GET["includeInactive"] ?? null,
    "includeInactive",
    false
);


serveDocumentFile(
    $idDoc,
    true,
    $includeInactive
);
