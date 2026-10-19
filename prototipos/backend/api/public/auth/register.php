<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../utils/jsonResponse.php';
require_once __DIR__ . '/../../utils/validation.php';
require_once __DIR__ . '/../../utils/getJsonBody.php';


// Solo acepta peticiones POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');

    sendJson(405, [
        'ok' => false,
        'mensaje' => 'Método no permitido.',
    ]);
}

$data = getJsonBody();

// Datos de la solicitud
$nombre = trim(
    (string) ($data['nombre'] ?? '')
);

$correo = strtolower(
    trim((string) ($data['correo'] ?? ''))
);

$password = (string) ($data['password'] ?? '');

if ($nombre === '' || mb_strlen($nombre) > 100) {
    sendJson(422, [
        'ok' => false,
        'mensaje' => 'El nombre es obligatorio y no puede superar los 100 caracteres.',
    ]);
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    sendJson(422, [
        'ok' => false,
        'mensaje' => 'El correo no es válido.',
    ]);
}

if (mb_strlen($password) < 8) {
    sendJson(422, [
        'ok' => false,
        'mensaje' => 'La contraseña debe tener al menos 8 caracteres.',
    ]);
}

try {
    $connection = Database::getConnection();

    // Comprobamos que no exista ya un funcionario con ese correo
    $findUser = $connection->prepare(
        'SELECT id_func
        FROM funcionario
        WHERE correo = :correo
        LIMIT 1'
    );

    $findUser->execute([
        'correo' => $correo,
    ]);

    if ($findUser->fetch() !== false) {
        sendJson(409, [
            'ok' => false,
            'mensaje' => 'Ya existe una cuenta registrada con ese correo.',
        ]);
    }

    $pwdHash = password_hash($password, PASSWORD_DEFAULT);

    // Se crea el funcionario con activo = false
    $insert = $connection->prepare(
        'INSERT INTO funcionario (nombre, correo, pwd_hash, activo)
        VALUES (:nombre, :correo, :pwd_hash, 0)'
    );

    $insert->execute([
        'nombre' => $nombre,
        'correo' => $correo,
        'pwd_hash' => $pwdHash,
    ]);

    sendJson(201, [
        'ok' => true,
        'mensaje' => 'Solicitud enviada correctamente. Un administrador debe activar tu cuenta antes de que puedas ingresar.',
        'id_func' => (int) $connection->lastInsertId(),
    ]);
} catch (Throwable $error) {

    // Colisión de carrera sobre el UNIQUE de correo (dos solicitudes simultáneas)
    if (
        $error instanceof PDOException &&
        (int) $error->getCode() === 23000
    ) {
        sendJson(409, [
            'ok' => false,
            'mensaje' => 'Ya existe una cuenta registrada con ese correo.',
        ]);
    }

    error_log($error->getMessage()); // guarda el error en los logs del sistema

    sendJson(500, [
        'ok' => false,
        'mensaje' => 'Ocurrió un error interno.',
    ]);
}