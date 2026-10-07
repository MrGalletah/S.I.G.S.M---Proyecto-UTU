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
            getPendingAccessRequests();
        }
        break;

    case "PATCH":
        requireAuth();

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

        acceptAccessRequest($idFunc);
        break;

    case "DELETE":
        requireAuth();

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

        rejectAccessRequest($idFunc);
        break;

    default:
        sendJson(405, [
            "ok" => false,
            "mensaje" => "Método no permitido."
        ]);
}

function getPendingAccessRequests(): void
{
    try {
        $db = Database::getConnection();

        $stmt = $db->prepare(
            "SELECT id_func, nombre, correo
             FROM funcionario
             WHERE activo = FALSE
             ORDER BY id_func ASC"
        );
        $stmt->execute();

        sendJson(200, [
            "ok" => true,
            "solicitudes" => $stmt->fetchAll(PDO::FETCH_ASSOC),
        ]);
    } catch (PDOException $e) {
        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al obtener las solicitudes de acceso."
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

function acceptAccessRequest(int $idFunc): void
{
    $data = getJsonBody();
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

    $roleIds = array_values($roleIds);

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

        $db->beginTransaction();

        $activate = $db->prepare(
            'UPDATE funcionario
             SET activo = TRUE
             WHERE id_func = :id_func
             AND activo = FALSE'
        );
        $activate->execute([':id_func' => $idFunc]);

        if ($activate->rowCount() === 0) {
            $db->rollBack();

            sendJson(404, [
                'ok' => false,
                'mensaje' => 'La solicitud de acceso no existe o ya fue procesada.',
            ]);
            exit;
        }

        $assign = $db->prepare(
            'INSERT INTO rol_usuario (id_func, id_rol)
             VALUES (:id_func, :id_rol)'
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
            'mensaje' => 'Acceso concedido correctamente.',
        ]);
    } catch (PDOException $e) {
        if (isset($db) && $db->inTransaction()) {
            $db->rollBack();
        }

        sendJson(500, [
            'ok' => false,
            'mensaje' => 'Error al aceptar la solicitud de acceso.',
        ]);
    }
}

function rejectAccessRequest(int $idFunc): void
{
    try {
        $db = Database::getConnection();

        $delete = $db->prepare(
            'DELETE FROM funcionario
             WHERE id_func = :id_func
             AND activo = FALSE'
        );
        $delete->execute([':id_func' => $idFunc]);

        if ($delete->rowCount() === 0) {
            sendJson(404, [
                'ok' => false,
                'mensaje' => 'La solicitud de acceso no existe o ya fue procesada.',
            ]);
            exit;
        }

        sendJson(200, [
            'ok' => true,
            'mensaje' => 'Solicitud de acceso rechazada.',
        ]);
    } catch (PDOException $e) {
        sendJson(500, [
            'ok' => false,
            'mensaje' => 'Error al rechazar la solicitud de acceso.',
        ]);
    }
}