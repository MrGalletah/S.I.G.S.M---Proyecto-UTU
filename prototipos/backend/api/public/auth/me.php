<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../utils/jsonResponse.php';

header('Cache-Control: no-store'); // impide cachearlo al navegador 

if ($_SERVER['REQUEST_METHOD'] !== 'GET') { // solo metodo GET 
    header('Allow: GET');

    sendJson(405, [
        'ok' => false,
        'mensaje' => 'Método no permitido.',
    ]);
}

startAppSession();  // busca la cookie pa ver si existe SESSION

$usuario = $_SESSION['usuario'] ?? null; // guarda el usuario de la sesion o null si no existe

if ($usuario === null) {
    sendJson(401, [
        'ok' => false,
        'mensaje' => 'No hay una sesión activa.',
    ]);
}

sendJson(200, [
    'ok' => true,
    'usuario' => $usuario,
]);
