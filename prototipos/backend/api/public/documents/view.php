<?php

require_once __DIR__ . "/../../utils/documentFile.php";
require_once __DIR__ . "/../../utils/validation.php";


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
    false,
    $includeInactive
);