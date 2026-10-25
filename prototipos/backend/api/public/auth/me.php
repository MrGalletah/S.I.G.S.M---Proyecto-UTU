<?php
declare(strict_types=1);

require_once __DIR__ . '/../../middleware/requireAuth.php';
require_once __DIR__ . '/../../utils/jsonResponse.php';

header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {

    header('Allow: GET');

    sendJson(405, [
        'ok' => false,
        'mensaje' => 'Método no permitido.'
    ]);
}

// OBTENER USUARIO Y ROLES ACTUALIZADOS

$usuario = requireAuth();

sendJson(200, [
    'ok' => true,
    'usuario' => $usuario
]);
