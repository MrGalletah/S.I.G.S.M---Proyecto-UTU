<?php

declare(strict_types=1);  // Tipos estrictos 

require_once __DIR__ . '/../config/Database.php';  // __DIR__ directorio actual (str concatenation con el .) importa el archivo Database

try {
    $connection = Database::getConnection(); // usamos la conexion existente

    $databaseName = $connection
        ->query('SELECT DATABASE()')
        ->fetchColumn();

    $adminCount = $connection
        ->query(
            "SELECT COUNT(*)
             FROM funcionario AS f
             INNER JOIN rol_usuario AS ru
                 ON ru.id_func = f.id_func
             INNER JOIN rol AS r
                 ON r.id_rol = ru.id_rol
             WHERE r.nombre = 'administrador'"
        )
        ->fetchColumn();

    echo "Conexión correcta.\n";
    echo "Base de datos: {$databaseName}\n";
    echo "Administradores encontrados: {$adminCount}\n";

} catch (Throwable $error) {
    // imprime el error en la terminal
    fwrite(
        STDERR,
        "Error de conexión: {$error->getMessage()}\n"
    );

    exit(1);
}