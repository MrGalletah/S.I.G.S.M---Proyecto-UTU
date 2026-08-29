<?php

function getJsonBody(): array
{
    try {
        $data = json_decode(
            file_get_contents('php://input'),
            true,
            512,
            JSON_THROW_ON_ERROR
        );

    } catch (JsonException $e) {
        sendJson(400, [
            'ok' => false,
            'mensaje' => 'El cuerpo de la solicitud contiene un JSON inválido.',
        ]);

        exit;
    }

    if (!is_array($data)) {
        sendJson(400, [
            'ok' => false,
            'mensaje' => 'El cuerpo de la solicitud debe ser un objeto JSON.',
        ]);

        exit;
    }

    return $data;
}