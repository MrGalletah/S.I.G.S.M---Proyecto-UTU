<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../utils/jsonResponse.php';

function requireAuth(): array
{
    startAppSession();

    if (
        !isset($_SESSION['usuario']) ||
        !is_array($_SESSION['usuario']) ||
        !isset($_SESSION['usuario']['id_func'])
    ) {
        sendJson(401, [
            'ok' => false,
            'mensaje' => 'No autenticado.',
        ]);

        exit;
    }

    return $_SESSION['usuario'];
}