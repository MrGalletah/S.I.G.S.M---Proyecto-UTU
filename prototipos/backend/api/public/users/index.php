<?php

declare(strict_types=1);

require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../middleware/requireAuth.php";
require_once __DIR__ . "/../../utils/getJsonBody.php";

$method = $_SERVER["REQUEST_METHOD"];

switch ($method) {

    case "GET":
        requireAuth();

        if (isset($_GET["roles"])) {
            getRoles();
        } else {
            getUsers();
        }
        break;

    case "PATCH":
        $currentUser = requireAuth();

        $idFunc = filter_var(
            $_GET['id'] ?? null,
            FILTER_VALIDATE_INT
        );

        if ($idFunc === false || $idFunc === null || $idFunc < 1) {
            sendJson(400, [
                'ok' => false,
                'mensaje' => 'El ID del usuario no es válido.',
            ]);
            exit;
        }

        $data = getJsonBody();

        if (array_key_exists("activo", $data)) {
            setUserActive($idFunc, $data["activo"], (int) $currentUser['id_func']);
        } else {
            updateUserRoles($idFunc, $data);
        }
        break;

    default:
        sendJson(405, [
            "ok" => false,
            "mensaje" => "Método no permitido."
        ]);
}

function getUsers(): void
{
    try {
        $db = Database::getConnection();

        $stmt = $db->prepare(
            "SELECT
                f.id_func,
                f.nombre,
                f.correo,
                f.activo,
                r.id_rol,
                r.nombre AS rol
             FROM funcionario AS f
             LEFT JOIN rol_usuario AS ru ON ru.id_func = f.id_func
             LEFT JOIN rol AS r ON r.id_rol = ru.id_rol
             WHERE f.activo = TRUE
                OR EXISTS (
                    SELECT 1
                    FROM rol_usuario AS x
                    WHERE x.id_func = f.id_func
                )
             ORDER BY f.nombre ASC, r.id_rol ASC"
        );
        $stmt->execute();

        $users = [];

        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $id = (int) $row["id_func"];

            if (!isset($users[$id])) {
                $users[$id] = [
                    "id_func" => $id,
                    "nombre" => $row["nombre"],
                    "correo" => $row["correo"],
                    "activo" => (bool) $row["activo"],
                    "roles" => [],
                ];
            }

            if ($row["id_rol"] !== null) {
                $users[$id]["roles"][] = [
                    "id_rol" => (int) $row["id_rol"],
                    "nombre" => $row["rol"],
                ];
            }
        }

        sendJson(200, [
            "ok" => true,
            "usuarios" => array_values($users),
        ]);
    } catch (PDOException $e) {
        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al obtener los usuarios."
        ]);
    }
}

function getRoles(): void
{
    try {
        $db = Database::getConnection();

        $stmt = $db->prepare(
            "SELECT id_rol, nombre, descripcion
             FROM rol
             ORDER BY id_rol ASC"
        );
        $stmt->execute();

        sendJson(200, [
            "ok" => true,
            "roles" => $stmt->fetchAll(PDO::FETCH_ASSOC),
        ]);
    } catch (PDOException $e) {
        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al obtener los roles."
        ]);
    }
}

function parseRoleIds(array $data): array
{
    $roles = $data["roles"] ?? null;

    if (!is_array($roles) || count($roles) === 0) {
        sendJson(422, [
            'ok' => false,
            'mensaje' => 'Debe seleccionar al menos un rol.',
        ]);
        exit;
    }

    $roleIds = [];

    foreach ($roles as $role) {
        $roleId = filter_var($role, FILTER_VALIDATE_INT);

        if ($roleId === false || $roleId < 1) {
            sendJson(422, [
                'ok' => false,
                'mensaje' => 'Los roles seleccionados no son válidos.',
            ]);
            exit;
        }

        $roleIds[$roleId] = $roleId;
    }

    return array_values($roleIds);
}

function findManageableUser(PDO $db, int $idFunc): bool
{
    $stmt = $db->prepare(
        'SELECT f.id_func
         FROM funcionario AS f
         WHERE f.id_func = :id_func
         AND (
            f.activo = TRUE
            OR EXISTS (
                SELECT 1
                FROM rol_usuario AS ru
                WHERE ru.id_func = f.id_func
            )
         )'
    );
    $stmt->execute([':id_func' => $idFunc]);

    return $stmt->fetch() !== false;
}

function updateUserRoles(int $idFunc, array $data): void
{
    $roleIds = parseRoleIds($data);

    try {
        $db = Database::getConnection();

        $placeholders = implode(",", array_fill(0, count($roleIds), "?"));

        $checkRoles = $db->prepare(
            "SELECT COUNT(*)
             FROM rol
             WHERE id_rol IN ($placeholders)"
        );
        $checkRoles->execute($roleIds);

        if ((int) $checkRoles->fetchColumn() !== count($roleIds)) {
            sendJson(422, [
                'ok' => false,
                'mensaje' => 'Alguno de los roles seleccionados no existe.',
            ]);
            exit;
        }

        if (!findManageableUser($db, $idFunc)) {
            sendJson(404, [
                'ok' => false,
                'mensaje' => 'El usuario no existe.',
            ]);
            exit;
        }

        $db->beginTransaction();

        $remove = $db->prepare(
            "DELETE FROM rol_usuario
             WHERE id_func = ?
             AND id_rol NOT IN ($placeholders)"
        );
        $remove->execute(array_merge([$idFunc], $roleIds));

        $assign = $db->prepare(
            'INSERT INTO rol_usuario (id_func, id_rol)
             VALUES (:id_func, :id_rol)
             ON DUPLICATE KEY UPDATE id_func = id_func'
        );

        foreach ($roleIds as $roleId) {
            $assign->execute([
                ':id_func' => $idFunc,
                ':id_rol' => $roleId,
            ]);
        }

        $db->commit();

        sendJson(200, [
            'ok' => true,
            'mensaje' => 'Roles actualizados correctamente.',
        ]);
    } catch (PDOException $e) {
        if (isset($db) && $db->inTransaction()) {
            $db->rollBack();
        }

        sendJson(500, [
            'ok' => false,
            'mensaje' => 'Error al actualizar los roles del usuario.',
        ]);
    }
}

function setUserActive(int $idFunc, $activo, int $currentUserId): void
{
    if (!is_bool($activo)) {
        sendJson(422, [
            'ok' => false,
            'mensaje' => 'El estado del usuario no es válido.',
        ]);
        exit;
    }

    if (!$activo && $idFunc === $currentUserId) {
        sendJson(409, [
            'ok' => false,
            'mensaje' => 'No puedes desactivar tu propio usuario.',
        ]);
        exit;
    }

    try {
        $db = Database::getConnection();

        if (!findManageableUser($db, $idFunc)) {
            sendJson(404, [
                'ok' => false,
                'mensaje' => 'El usuario no existe.',
            ]);
            exit;
        }

        $update = $db->prepare(
            'UPDATE funcionario
             SET activo = :activo
             WHERE id_func = :id_func'
        );
        $update->execute([
            ':activo' => $activo ? 1 : 0,
            ':id_func' => $idFunc,
        ]);

        sendJson(200, [
            'ok' => true,
            'mensaje' => $activo
                ? 'Usuario activado correctamente.'
                : 'Usuario desactivado correctamente.',
        ]);
    } catch (PDOException $e) {
        sendJson(500, [
            'ok' => false,
            'mensaje' => 'Error al cambiar el estado del usuario.',
        ]);
    }
}