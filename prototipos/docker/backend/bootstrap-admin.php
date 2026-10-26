<?php
declare(strict_types=1);

require_once '/var/www/api/config/Database.php';

// Credenciales recibidas desde Docker Compose
$nombre = trim(getenv('ADMIN_NAME') ?: '');
$correo = trim(getenv('ADMIN_EMAIL') ?: '');
$password = getenv('ADMIN_PASSWORD');

// Validación
if ($nombre === '' || mb_strlen($nombre) > 100) {
    throw new RuntimeException('Nombre de administrador inválido.');
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    throw new RuntimeException('Correo de administrador inválido.');
}

if ($password === false || strlen($password) < 12) {
    throw new RuntimeException(
        'La contraseña del administrador debe tener al menos 12 caracteres.'
    );
}

$db = Database::getConnection();

try {
    $db->beginTransaction();

    // Buscar el rol Administrador
    $stmt = $db->prepare(
        "SELECT id_rol FROM rol WHERE nombre = 'Administrador'"
    );
    $stmt->execute();

    $idRol = $stmt->fetchColumn();

    if ($idRol === false) {
        throw new RuntimeException('No existe el rol Administrador.');
    }

    // Comprobar si el funcionario ya existe
    $stmt = $db->prepare(
        "SELECT id_func FROM funcionario WHERE correo = :correo FOR UPDATE"
    );

    $stmt->execute([':correo' => $correo]);

    $idFunc = $stmt->fetchColumn();

    if ($idFunc !== false) {

        // Comprobar que ya tenga el rol de administrador
        $stmt = $db->prepare(
            "SELECT 1 FROM rol_usuario
             WHERE id_func = :id_func AND id_rol = :id_rol"
        );

        $stmt->execute([
            ':id_func' => $idFunc,
            ':id_rol' => $idRol
        ]);

        if ($stmt->fetchColumn() === false) {
            throw new RuntimeException(
                'El correo ya existe, pero no pertenece a un administrador.'
            );
        }

        $db->commit();
        echo "El administrador ya existe. No se modificó.\n";
        exit(0);
    }

    // Crear el funcionario con contraseña hasheada
    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $db->prepare(
        "INSERT INTO funcionario (nombre, correo, pwd_hash, activo)
         VALUES (:nombre, :correo, :hash, TRUE)"
    );

    $stmt->execute([
        ':nombre' => $nombre,
        ':correo' => $correo,
        ':hash' => $hash
    ]);

    $idFunc = (int) $db->lastInsertId();

    // Asignar el rol Administrador
    $stmt = $db->prepare(
        "INSERT INTO rol_usuario (id_func, id_rol)
         VALUES (:id_func, :id_rol)"
    );

    $stmt->execute([
        ':id_func' => $idFunc,
        ':id_rol' => $idRol
    ]);

    $db->commit();

    echo "Administrador inicial creado correctamente.\n";

} catch (Throwable $e) {

    if ($db->inTransaction()) {
        $db->rollBack();
    }

    fwrite(STDERR, $e->getMessage() . "\n");
    exit(1);
}
