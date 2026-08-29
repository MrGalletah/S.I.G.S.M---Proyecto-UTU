<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../utils/jsonResponse.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store'); // le dice al navegador que no cachee o lo guarde al localStorage


// Solo acepta peticiones POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');

    sendJson(405, [
        'ok' => false,
        'mensaje' => 'Método no permitido.',
    ]);
}

// Lee el JSON del body 
$rawBody = file_get_contents('php://input');

$data = json_decode(
    $rawBody ?: '',
    true
);

if (!is_array($data)) { // no JSON valido 
    sendJson(400, [
        'ok' => false,
        'mensaje' => 'El cuerpo de la solicitud debe ser JSON válido.',
    ]);
}

// Credenciales 
$correo = strtolower(
    trim((string) ($data['correo'] ?? ''))
);

$password = (string) ($data['password'] ?? '');

if (
    !filter_var($correo, FILTER_VALIDATE_EMAIL) ||
    $password === ''
) {
    sendJson(422, [
        'ok' => false,
        'mensaje' => 'Correo y contraseña son obligatorios.',
    ]);
}

try {
    $connection = Database::getConnection();

    // se prepara el stmt que busca el funcionario por el correo 
    $findUser = $connection->prepare(
        'SELECT
            id_func,
            nombre,
            correo,
            pwd_hash,
            activo
         FROM funcionario
         WHERE correo = :correo
         LIMIT 1'
    );
     // ejecuta la consulta con el dato
    $findUser->execute([
        'correo' => $correo,
    ]);

    // devuelve los datos de la consulta 
    $user = $findUser->fetch();

    // mensaje generico de credenciales incorrectas
    if (
        $user === false ||
        !(bool) $user['activo'] ||
        !password_verify($password, $user['pwd_hash'])
    ) {
        sendJson(401, [
            'ok' => false,
            'mensaje' => 'Credenciales incorrectas.',
        ]);
    }

    
    //  Obtiene los roles asignados 
     
    $findRoles = $connection->prepare(
        'SELECT r.nombre
         FROM rol AS r
         INNER JOIN rol_usuario AS ru
            ON ru.id_rol = r.id_rol
         WHERE ru.id_func = :id_func'
    );

    $findRoles->execute([
        'id_func' => $user['id_func'],
    ]);

    $roles = $findRoles->fetchAll( // array con roles
        PDO::FETCH_COLUMN
    );

    // regenera el identificador por si acaso 
    startAppSession();
    session_regenerate_id(true);

    // guarda los datos del usuario en la variable session de php (el server recuerda la session) 
    $_SESSION['usuario'] = [
        'id_func' => (int) $user['id_func'],
        'nombre' => $user['nombre'],
        'correo' => $user['correo'],
        'roles' => $roles,
    ];

    sendJson(200, [
        'ok' => true,
        'mensaje' => 'Inicio de sesión correcto.',
        'usuario' => $_SESSION['usuario'], // devolvemos al usuario en la respuesta 
    ]);
} catch (Throwable $error) {

    
    error_log($error->getMessage()); // guarda el error en los logs del sistema

    sendJson(500, [
        'ok' => false,
        'mensaje' => 'Ocurrió un error interno.',
    ]);
}