<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/jsonResponse.php';


function requireAuth(): array
{
    startAppSession();

    // COMPROBAR SESIÓN

    $sessionUser = $_SESSION['usuario'] ?? null;

    if (
        !is_array($sessionUser) ||
        !isset($sessionUser['id_func'])
    ) {
        sendJson(401, [
            'ok' => false,
            'mensaje' => 'No autenticado.'
        ]);
    }

    $idFunc = filter_var(
        $sessionUser['id_func'],
        FILTER_VALIDATE_INT,
        ['options' => ['min_range' => 1]]
    );

    if ($idFunc === false) {
        unset($_SESSION['usuario']);

        sendJson(401, [
            'ok' => false,
            'mensaje' => 'Sesión no válida.'
        ]);
    }

    try {

        // CONSULTAR FUNCIONARIO Y ROLES ACTUALES

        $db = Database::getConnection();

        $stmt = $db->prepare(
            'SELECT
                f.id_func,
                f.nombre,
                f.correo,
                f.activo,
                r.nombre AS rol

             FROM funcionario AS f

             LEFT JOIN rol_usuario AS ru
                ON ru.id_func = f.id_func

             LEFT JOIN rol AS r
                ON r.id_rol = ru.id_rol

             WHERE f.id_func = :id_func'
        );

        $stmt->execute([
            'id_func' => $idFunc
        ]);

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // COMPROBAR QUE SIGA EXISTIENDO Y ACTIVO

        if (
            empty($rows) ||
            !(bool) $rows[0]['activo']
        ) {
            unset($_SESSION['usuario']);

            sendJson(401, [
                'ok' => false,
                'mensaje' => 'La sesión ya no es válida.'
            ]);
        }

        // RECUPERAR ROLES ACTUALES

        $roles = [];

        foreach ($rows as $row) {
            if ($row['rol'] !== null) {
                $roles[] = $row['rol'];
            }
        }

        // ACTUALIZAR SESIÓN

        $_SESSION['usuario'] = [
            'id_func' => (int) $rows[0]['id_func'],
            'nombre' => $rows[0]['nombre'],
            'correo' => $rows[0]['correo'],
            'roles' => array_values(array_unique($roles))
        ];

        return $_SESSION['usuario'];
    } catch (Throwable $error) {

        error_log(
            'Error al validar sesión: ' .
                $error->getMessage()
        );

        sendJson(500, [
            'ok' => false,
            'mensaje' => 'Error al validar la sesión.'
        ]);
    }
}
