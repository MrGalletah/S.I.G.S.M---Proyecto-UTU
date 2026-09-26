<?php

declare(strict_types=1);

require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../middleware/requireAuth.php";


$method = $_SERVER["REQUEST_METHOD"];

switch ($method) {

    case "GET":
        requireAuth();
        getPendingAccessRequests();
        break;

    case "PATCH":
        requireAuth();

        $idFunc = filter_var(
            $_GET['id'] ?? null, // agarra los parametros de la URL
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

// Solo devuelve los funcionarios que todavía no fueron habilitados
function getPendingAccessRequests(): void
{
    try {
        $db = Database::getConnection();

        $sql = "SELECT
        id_func,
        nombre,
        correo
        FROM funcionario
        WHERE activo = FALSE
        ORDER BY id_func ASC";

        $stmt = $db->prepare($sql);
        $stmt->execute();

        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendJson(200, ["ok" => true, "solicitudes" => $result]);
    } catch (PDOException $e) {
        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al obtener las solicitudes de acceso."
        ]);
    }
}

// Acepta la solicitud: activo pasa de false a true
function acceptAccessRequest(int $idFunc): void
{
    try {
        $db = Database::getConnection();

        $stmt = $db->prepare(
            'SELECT id_func
            FROM funcionario
            WHERE id_func = :id_func
            AND activo = FALSE'
        );

        $stmt->execute([
            ':id_func' => $idFunc,
        ]);

        if (!$stmt->fetch()) {
            sendJson(404, [
                'ok' => false,
                'mensaje' => 'La solicitud de acceso no existe o ya fue procesada.',
            ]);
            exit;
        }

        $update = $db->prepare(
            'UPDATE funcionario
            SET activo = TRUE
            WHERE id_func = :id_func'
        );

        $update->execute([
            ':id_func' => $idFunc,
        ]);

        sendJson(200, [
            'ok' => true,
            'mensaje' => 'Acceso concedido correctamente.',
        ]);
    } catch (PDOException $e) {
        sendJson(500, [
            'ok' => false,
            'mensaje' => 'Error al aceptar la solicitud de acceso.',
        ]);
    }
}

// Rechaza la solicitud: se borra el registro de la base de datos.
// Solo se permite borrar funcionarios inactivos (solicitudes pendientes),
// nunca una cuenta ya habilitada.
function rejectAccessRequest(int $idFunc): void
{
    try {
        $db = Database::getConnection();

        $stmt = $db->prepare(
            'SELECT id_func
            FROM funcionario
            WHERE id_func = :id_func
            AND activo = FALSE'
        );

        $stmt->execute([
            ':id_func' => $idFunc,
        ]);

        if (!$stmt->fetch()) {
            sendJson(404, [
                'ok' => false,
                'mensaje' => 'La solicitud de acceso no existe o ya fue procesada.',
            ]);
            exit;
        }

        $delete = $db->prepare(
            'DELETE FROM funcionario
            WHERE id_func = :id_func
            AND activo = FALSE'
        );

        $delete->execute([
            ':id_func' => $idFunc,
        ]);

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