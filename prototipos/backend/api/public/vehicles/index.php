<?php

declare(strict_types=1);

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../middleware/requireAuth.php";
require_once __DIR__ . "/../../utils/jsonResponse.php";
require_once __DIR__ . "/../../utils/getJsonBody.php";

requireAuth();

$method = $_SERVER["REQUEST_METHOD"];

switch ($method) {
    case "GET":
        if (isset($_GET["types"])) {
            getVehicleTypes();
        } else {
            getVehicles();
        }
        break;

    case "POST":
        createVehicle();
        break;

    case "PATCH":
        $idVehiculo = filter_var(
            $_GET["id"] ?? null,
            FILTER_VALIDATE_INT
        );

        if ($idVehiculo === false || $idVehiculo === null || $idVehiculo < 1) {
            sendJson(400, [
                "ok" => false,
                "mensaje" => "El ID del vehículo no es válido."
            ]);
        }

        updateVehicle($idVehiculo);
        break;

    default:
        sendJson(405, [
            "ok" => false,
            "mensaje" => "Método no permitido."
        ]);
}


// LISTAR VEHÍCULOS

function getVehicles(): void
{
    try {
        $db = Database::getConnection();

        $stmt = $db->query(
            "SELECT
                v.id_vehiculo,
                v.matricula,
                v.modelo,
                v.estado,
                tv.id_tipo_vehiculo,
                tv.nombre AS tipo
            FROM vehiculo v
            INNER JOIN tipo_vehiculo tv
                ON tv.id_tipo_vehiculo = v.id_tipo_vehiculo
            ORDER BY v.matricula ASC"
        );

        $vehicles = [];

        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $vehicles[] = [
                "id_vehiculo" => (int) $row["id_vehiculo"],
                "matricula" => $row["matricula"],
                "modelo" => $row["modelo"],
                "estado" => $row["estado"],
                "tipo" => [
                    "id_tipo_vehiculo" => (int) $row["id_tipo_vehiculo"],
                    "nombre" => $row["tipo"]
                ]
            ];
        }

        sendJson(200, [
            "ok" => true,
            "vehiculos" => $vehicles
        ]);
    } catch (Throwable $e) {
        error_log("Error al listar vehículos: " . $e->getMessage());

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al obtener los vehículos."
        ]);
    }
}


// OBTENER TIPOS DE VEHÍCULO

function getVehicleTypes(): void
{
    try {
        $db = Database::getConnection();

        $stmt = $db->query(
            "SELECT
                id_tipo_vehiculo,
                nombre,
                descripcion
            FROM tipo_vehiculo
            ORDER BY id_tipo_vehiculo ASC"
        );

        sendJson(200, [
            "ok" => true,
            "tipos" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    } catch (Throwable $e) {
        error_log("Error al obtener tipos de vehículo: " . $e->getMessage());

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al obtener los tipos de vehículo."
        ]);
    }
}


// VALIDAR DATOS DEL VEHÍCULO

function validateVehicleData(array $data): array
{
    $matricula = $data["matricula"] ?? null;
    $modelo = $data["modelo"] ?? null;
    $tipo = $data["id_tipo_vehiculo"] ?? null;
    $estado = $data["estado"] ?? "OPERATIVO";

    if (!is_string($matricula) || trim($matricula) === "") {
        sendJson(400, [
            "ok" => false,
            "mensaje" => "La matrícula es obligatoria."
        ]);
    }

    if (!is_string($modelo) || trim($modelo) === "") {
        sendJson(400, [
            "ok" => false,
            "mensaje" => "El modelo es obligatorio."
        ]);
    }

    $matricula = strtoupper(trim($matricula));
    $modelo = trim($modelo);

    if (strlen($matricula) > 20 || strlen($modelo) > 100) {
        sendJson(400, [
            "ok" => false,
            "mensaje" => "La matrícula o el modelo superan la longitud permitida."
        ]);
    }

    $tipo = filter_var($tipo, FILTER_VALIDATE_INT);

    if ($tipo === false || $tipo < 1) {
        sendJson(400, [
            "ok" => false,
            "mensaje" => "El tipo de vehículo no es válido."
        ]);
    }

    $estadosPermitidos = [
        "OPERATIVO",
        "FUERA_DE_SERVICIO",
        "MANTENIMIENTO"
    ];

    if (!in_array($estado, $estadosPermitidos, true)) {
        sendJson(400, [
            "ok" => false,
            "mensaje" => "El estado del vehículo no es válido."
        ]);
    }

    return [
        "matricula" => $matricula,
        "modelo" => $modelo,
        "id_tipo_vehiculo" => $tipo,
        "estado" => $estado
    ];
}


// CREAR VEHÍCULO

function createVehicle(): void
{
    $data = validateVehicleData(getJsonBody());

    try {
        $db = Database::getConnection();

        $stmt = $db->prepare(
            "INSERT INTO vehiculo (
                matricula,
                modelo,
                id_tipo_vehiculo,
                estado
            ) VALUES (
                :matricula,
                :modelo,
                :id_tipo_vehiculo,
                :estado
            )"
        );

        $stmt->execute($data);

        sendJson(201, [
            "ok" => true,
            "mensaje" => "Vehículo registrado correctamente.",
            "id_vehiculo" => (int) $db->lastInsertId()
        ]);
    } catch (PDOException $e) {
        if ($e->getCode() === "23000") {
            sendJson(409, [
                "ok" => false,
                "mensaje" => "La matrícula ya está registrada o el tipo de vehículo no existe."
            ]);
        }

        error_log("Error al crear vehículo: " . $e->getMessage());

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al registrar el vehículo."
        ]);
    }
}


// EDITAR VEHÍCULO


function updateVehicle(int $idVehiculo): void
{
    $data = validateVehicleData(getJsonBody());

    $db = null;

    try {
        $db = Database::getConnection();

        $db->beginTransaction();

        // Bloquear el vehículo mientras se modifica.

        $check = $db->prepare(
            "SELECT id_vehiculo
            FROM vehiculo
            WHERE id_vehiculo = :id_vehiculo
            FOR UPDATE"
        );

        $check->execute([
            "id_vehiculo" => $idVehiculo
        ]);

        if (!$check->fetch()) {
            $db->rollBack();

            sendJson(404, [
                "ok" => false,
                "mensaje" => "El vehículo no existe."
            ]);
        }

        // Comprobar si está realizando un traslado.

        $checkTransfer = $db->prepare(
            "SELECT 1
            FROM traslado t
            INNER JOIN estado_traslado et
                ON et.id_estado = t.id_estado
            WHERE
                t.id_vehiculo = :id_vehiculo
                AND t.activo = TRUE
                AND et.nombre IN (
                    'En camino',
                    'Llegó al destino',
                    'Retornando'
                )
            LIMIT 1"
        );

        $checkTransfer->execute([
            "id_vehiculo" => $idVehiculo
        ]);

        if ($checkTransfer->fetch()) {
            $db->rollBack();

            sendJson(409, [
                "ok" => false,
                "mensaje" =>
                "No se puede modificar el vehículo porque está realizando un traslado."
            ]);
        }

        // Actualizar los datos.

        $stmt = $db->prepare(
            "UPDATE vehiculo
            SET
                matricula = :matricula,
                modelo = :modelo,
                id_tipo_vehiculo = :id_tipo_vehiculo,
                estado = :estado
            WHERE id_vehiculo = :id_vehiculo"
        );

        $stmt->execute([
            ...$data,
            "id_vehiculo" => $idVehiculo
        ]);

        $db->commit();

        sendJson(200, [
            "ok" => true,
            "mensaje" => "Vehículo actualizado correctamente."
        ]);
    } catch (PDOException $e) {
        if ($db !== null && $db->inTransaction()) {
            $db->rollBack();
        }

        if ($e->getCode() === "23000") {
            sendJson(409, [
                "ok" => false,
                "mensaje" =>
                "La matrícula ya está registrada o el tipo de vehículo no existe."
            ]);
        }

        error_log("Error al actualizar vehículo: " . $e->getMessage());

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al actualizar el vehículo."
        ]);
    } catch (Throwable $e) {
        if ($db !== null && $db->inTransaction()) {
            $db->rollBack();
        }

        error_log("Error al actualizar vehículo: " . $e->getMessage());

        sendJson(500, [
            "ok" => false,
            "mensaje" => "Error al actualizar el vehículo."
        ]);
    }
}
