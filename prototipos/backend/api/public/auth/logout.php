<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../utils/jsonResponse.php';

header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { // solo POST 
    header('Allow: POST');

    sendJson(405, [
        'ok' => false,
        'mensaje' => 'Método no permitido.',
    ]);
}

startAppSession();

// Vacia los datos de la sesion actual 
$_SESSION = [];

// Elimina cookies del navegador 
if (ini_get('session.use_cookies')) {
    $cookieParams = session_get_cookie_params(); // recupera la config utilizada pa crear la cookie 

    setcookie(
        session_name(),
        '',
        [
            'expires' => time() - 3600, // fecha de eliminacion en el pasado fuerza la eliminacion en el navegador 
            'path' => $cookieParams['path'],
            'domain' => $cookieParams['domain'],
            'secure' => $cookieParams['secure'],
            'httponly' => $cookieParams['httponly'],
            'samesite' => $cookieParams['samesite'] ?? 'Lax',
        ]
    );
}

// elimina la sesion almacenada en el servidor
session_destroy();

sendJson(200, [
    'ok' => true,
    'mensaje' => 'Sesión cerrada correctamente.',
]);
