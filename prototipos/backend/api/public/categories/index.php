<?php

require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../middleware/requireAuth.php";
# require_once __DIR__ . "/../../middleware/requireRole.php";
require_once __DIR__ . "/../../utils/getJsonBody.php";



$method = $_SERVER["REQUEST_METHOD"];

switch ($method) {

    case "GET":

        $includeInactive = filter_var($_GET["includeInactive"] ?? false, FILTER_VALIDATE_BOOLEAN);

        if ($includeInactive) {
            requireAuth();
        }

        getCategories($includeInactive);
        break;

    case "POST":
        $user = requireAuth();
        createCategory((int) $user["id_func"]);
        break;

    case 'PATCH':
        $user = requireAuth();

        $idCat = filter_var(
            $_GET['id'] ?? null, // agarra los parametros de la URL
            FILTER_VALIDATE_INT
        );

        if ($idCat === false || $idCat === null || $idCat < 1) {
            sendJson(400, [
                'ok' => false,
                'mensaje' => 'El ID de la categoría no es válido.',
            ]);
            exit;
        }

        updateCategory($idCat);
        break;

    default:
        sendJson(405, [
            "ok" => false,
            "mensaje" => "Método no permitido."
        ]);
}

function getCategories(bool $includeInactive = false): void
{
    try {
        $db = Database::getConnection();

        $sql = "SELECT
         c.id_cat,
         c.id_func,
         c.nombre,
         c.descripcion,
         c.activo,
         c.fecha_creacion,
         COUNT(d.id_doc) AS documentos
         FROM categoria AS c
         LEFT JOIN documento AS d
         ON d.id_cat = c.id_cat 
         ";

         if(!$includeInactive) {
            $sql .= " WHERE c.activo = TRUE ";
         }

         $sql .= " GROUP BY
        c.id_cat,
        c.id_func,
        c.nombre,
        c.descripcion,
        c.activo,
        c.fecha_creacion
        ORDER BY c.nombre ASC; ";

        $stmt = $db->prepare($sql);
        $stmt->execute();

        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendJson(200, ["ok" => true, "categorias" => $result]);
    } catch (PDOException $e) {
        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al obtener las categorías."
        ]);
    }
}

function createCategory(int $idFunc): void
{
    try {
        $data = getJsonBody();

        $nombre = trim($data['nombre'] ?? '');

        $descripcion = isset($data['descripcion'])
            ? trim($data['descripcion'])
            : null;

        if ($nombre === '') {
            sendJson(400, [
                'ok' => false,
                'mensaje' => 'El nombre de la categoría es obligatorio.',
            ]);
            exit;
        }

        if (mb_strlen($nombre) > 50) {
            sendJson(400, [
                'ok' => false,
                'mensaje' => 'El nombre no puede superar los 50 caracteres.',
            ]);
            exit;
        }

        if ($descripcion !== null && mb_strlen($descripcion) > 255) {
            sendJson(400, [
                'ok' => false,
                'mensaje' => 'La descripción no puede superar los 255 caracteres.',
            ]);
            exit;
        }

        if ($descripcion === '') {
            $descripcion = null;
        }

        $db = Database::getConnection();

        $sql = '
            INSERT INTO categoria (
                id_func,
                nombre,
                descripcion
            )
            VALUES (
                :id_func,
                :nombre,
                :descripcion
            )
        ';

        $stmt = $db->prepare($sql);

        $stmt->execute([
            ':id_func' => $idFunc,
            ':nombre' => $nombre,
            ':descripcion' => $descripcion,
        ]);

        sendJson(201, [
            'ok' => true,
            'mensaje' => 'Categoría creada correctamente.',
            'id_cat' => (int) $db->lastInsertId(),
        ]);
    } catch (PDOException $e) {

        // 1062 = Duplicate entry
        if (($e->errorInfo[1] ?? null) === 1062) {
            sendJson(409, [
                'ok' => false,
                'mensaje' => 'Ya existe una categoría con ese nombre.',
            ]);
            exit;
        }

        sendJson(500, [
            'ok' => false,
            'mensaje' => 'Error al crear la categoría.',
        ]);
    }
}

function updateCategory(int $idCat): void
{
    try {
        $data = getJsonBody();

        $db = Database::getConnection();

        // Primero comprobamos que exista
        $stmt = $db->prepare(
            'SELECT id_cat
             FROM categoria
             WHERE id_cat = :id_cat'
        );

        $stmt->execute([
            ':id_cat' => $idCat,
        ]);

        if (!$stmt->fetch()) {
            sendJson(404, [
                'ok' => false,
                'mensaje' => 'La categoría no existe.',
            ]);
            exit;
        }

        $fields = [];
        $params = [
            ':id_cat' => $idCat,
        ];

        // NOMBRE
        if (array_key_exists('nombre', $data)) {

            if (!is_string($data['nombre'])) {
                sendJson(400, [
                    'ok' => false,
                    'mensaje' => 'El nombre debe ser una cadena de texto.',
                ]);
                exit;
            }

            $nombre = trim($data['nombre']);

            if ($nombre === '') {
                sendJson(400, [
                    'ok' => false,
                    'mensaje' => 'El nombre de la categoría no puede estar vacío.',
                ]);
                exit;
            }

            if (mb_strlen($nombre) > 50) {
                sendJson(400, [
                    'ok' => false,
                    'mensaje' => 'El nombre no puede superar los 50 caracteres.',
                ]);
                exit;
            }

            $fields[] = 'nombre = :nombre';
            $params[':nombre'] = $nombre;
        }

        // DESCRIPCIÓN
        if (array_key_exists('descripcion', $data)) {

            if (
                $data['descripcion'] !== null &&
                !is_string($data['descripcion'])
            ) {
                sendJson(400, [
                    'ok' => false,
                    'mensaje' => 'La descripción debe ser texto o null.',
                ]);
                exit;
            }

            $descripcion = $data['descripcion'] === null
                ? null
                : trim($data['descripcion']);

            if ($descripcion === '') {
                $descripcion = null;
            }

            if (
                $descripcion !== null &&
                mb_strlen($descripcion) > 255
            ) {
                sendJson(400, [
                    'ok' => false,
                    'mensaje' => 'La descripción no puede superar los 255 caracteres.',
                ]);
                exit;
            }

            $fields[] = 'descripcion = :descripcion';
            $params[':descripcion'] = $descripcion;
        }

        // ACTIVO
        if (array_key_exists('activo', $data)) {

            if (!is_bool($data['activo'])) {
                sendJson(400, [
                    'ok' => false,
                    'mensaje' => 'El estado activo debe ser true o false.',
                ]);
                exit;
            }

            $fields[] = 'activo = :activo';
            $params[':activo'] = $data['activo'] ? true : false;
        }

        // Si no mandaron ningún campo modificable
        if (empty($fields)) {
            sendJson(400, [
                'ok' => false,
                'mensaje' => 'No se enviaron campos para modificar.',
            ]);
            exit;
        }

        $sql = '
            UPDATE categoria
            SET ' . implode(', ', $fields) . '
            WHERE id_cat = :id_cat
        ';

        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        sendJson(200, [
            'ok' => true,
            'mensaje' => 'Categoría actualizada correctamente.',
        ]);
    } catch (PDOException $e) {

        if (($e->errorInfo[1] ?? null) === 1062) {
            sendJson(409, [
                'ok' => false,
                'mensaje' => 'Ya existe una categoría con ese nombre.',
            ]);
            exit;
        }

        sendJson(500, [
            'ok' => false,
            'mensaje' => 'Error al actualizar la categoría.',
        ]);
    }
}
