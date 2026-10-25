<?php

declare(strict_types=1);

function sendJson(int $statusCode, array $data): never
{
    http_response_code($statusCode);

    header('Content-Type: application/json; charset=utf-8');

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}