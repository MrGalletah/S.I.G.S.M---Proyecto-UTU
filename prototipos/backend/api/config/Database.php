<?php

declare(strict_types=1); // tipos estrictos

require_once __DIR__ . '/loadEnv.php'; // importa la funcion 

loadEnv(dirname(__DIR__) . '/.env'); // carga variables de entorno

final class Database
{
    private static ?PDO $connection = null;  //PHP data objects (herramienta pa hacer consultas y conectarse a la db) 

    private function __construct() {}

    public static function getConnection(): PDO
    {
        if (self::$connection !== null) {  // Reutilizamos la conexion si ya existe
            return self::$connection;
        }

        // Variables de entorno con fallback 

        $host = getenv('DB_HOST') ?: '127.0.0.1';
        $port = getenv('DB_PORT') ?: '3306';
        $database = getenv('DB_NAME') ?: 'sigsm';
        $username = getenv('DB_USER') ?: 'sigsm_app';
        $password = getenv('DB_PASSWORD');

        if ($password === false || $password === '') {
            throw new RuntimeException(
                'No se definió la variable DB_PASSWORD.'
            );
        }

        // Cadena que le explica a PDO como conectarse

        $dsn = sprintf(  // sprintf funciona igual que el formateo de strings en python
            'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
            $host,
            $port,
            $database
        );



        // Creamos la conexion con dsn, usuario, pwd y opciones
        self::$connection = new PDO(
            $dsn,
            $username,
            $password,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, // lanza excepcion cuando ocurren errores
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, // hace que las consultas se devuelvan como arrays asociativos (objetos de js maso)
                PDO::ATTR_EMULATE_PREPARES => false, // especifica que las consultas las maneja MariaDB y no PHP (ayuda a prevenir inyecciones sql)
            ]
        );

        return self::$connection;
    }
}
