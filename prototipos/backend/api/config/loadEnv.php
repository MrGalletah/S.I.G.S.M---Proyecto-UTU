<?php

declare(strict_types=1);

// lee el .env  y carga las variables de entorno
function loadEnv(string $path): void
{
    if (!is_file($path)) {
        return;
    }

    $variables = parse_ini_file(
        $path,  // ruta del archivo
        false,  // dice si queremos procesar las secciones del archivo 
        INI_SCANNER_RAW // dice a php que interprete los valores como texto independientemente del tipo de dato 
    );

    if ($variables === false) {
        throw new RuntimeException(
            "No se pudo leer el archivo .env: {$path}"
        );
    }

    foreach ($variables as $name => $value) { // loopeamos con clave => valor
        $name = trim((string) $name);
        $value = trim((string) $value);

        if ($name === '') {
            continue; // detiene la vuelta actual y pasa a la siguiente si el nombre de la variable esta vacio 
        }

        if (getenv($name) !== false) { 
            continue; // salta de vuelta si la variable ya existe en el entorno
        }

        putenv("{$name}={$value}");

        $_ENV[$name] = $value;
        $_SERVER[$name] = $value;
    }
}