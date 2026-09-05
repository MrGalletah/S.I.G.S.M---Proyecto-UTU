<?php

require_once __DIR__ . "/jsonResponse.php";


function requireString(
    mixed $value,
    string $label,
    ?int $maxLength = null
): string {

    if (!is_string($value)) {
        sendJson(400, [
            "ok" => false,
            "mensaje" => "$label es obligatorio."
        ]);
    }

    $value = trim($value);

    if ($value === "") {
        sendJson(400, [
            "ok" => false,
            "mensaje" => "$label es obligatorio."
        ]);
    }

    if (
        $maxLength !== null &&
        mb_strlen($value) > $maxLength
    ) {
        sendJson(400, [
            "ok" => false,
            "mensaje" => "$label no puede superar los $maxLength caracteres."
        ]);
    }

    return $value;
}


function requirePositiveInt(
    mixed $value,
    string $label
): int {

    $value = filter_var(
        $value,
        FILTER_VALIDATE_INT
    );

    if ($value === false || $value < 1) {
        sendJson(400, [
            "ok" => false,
            "mensaje" => "$label no es válido."
        ]);
    }

    return $value;
}


function optionalBoolean(
    mixed $value,
    string $label,
    bool $default = true
): bool {

    if ($value === null) {
        return $default;
    }

    $value = filter_var(
        $value,
        FILTER_VALIDATE_BOOLEAN,
        FILTER_NULL_ON_FAILURE
    );

    if ($value === null) {
        sendJson(400, [
            "ok" => false,
            "mensaje" => "$label debe ser true o false."
        ]);
    }

    return $value;
}

function requireBoolean(
    mixed $value,
    string $label
): bool {

    if (!is_bool($value)) {
        sendJson(400, [
            "ok" => false,
            "mensaje" => "$label debe ser true o false."
        ]);
    }

    return $value;
}

function requireUploadedFile(
    array $files,
    string $field,
    string $label
): array {

    if (!isset($files[$field])) {
        sendJson(400, [
            "ok" => false,
            "mensaje" => "$label es obligatorio."
        ]);
    }

    $file = $files[$field];

    if ($file["error"] === UPLOAD_ERR_NO_FILE) {
        sendJson(400, [
            "ok" => false,
            "mensaje" => "$label es obligatorio."
        ]);
    }

    if ($file["error"] !== UPLOAD_ERR_OK) {
        sendJson(400, [
            "ok" => false,
            "mensaje" => "Ocurrió un error al subir $label."
        ]);
    }

    return $file;
}


function validateMimeType(
    array $file,
    array $allowedTypes
): string {

    $finfo = new finfo(FILEINFO_MIME_TYPE);

    $mimeType = $finfo->file($file["tmp_name"]);

    if ($mimeType === false) {
        sendJson(400, [
            "ok" => false,
            "mensaje" => "No se pudo determinar el tipo del archivo."
        ]);
    }

    if (!in_array($mimeType, $allowedTypes, true)) {
        sendJson(400, [
            "ok" => false,
            "mensaje" => "El tipo de archivo no está permitido."
        ]);
    }

    return $mimeType;
}