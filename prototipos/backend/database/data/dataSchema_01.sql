-- Contraseña para TODOS los funcionarios de prueba:
-- 123456
-- El hash fue generado con password_hash(..., PASSWORD_BCRYPT)
-- y es compatible con password_verify() de PHP.

USE sigsm;

START TRANSACTION;

-- 1. ROLES
-- ON DUPLICATE KEY evita errores si
-- este script se ejecuta más de una vez.

INSERT INTO
    rol (nombre, descripcion)
VALUES (
        'Administrador',
        'Puede administrar funcionarios, roles y acceder a las distintas secciones del sistema.'
    ),
    (
        'Gestor de documentación',
        'Puede gestionar categorías, documentos y contenido del módulo de documentación.'
    ),
    (
        'Solicitante de traslado',
        'Puede crear solicitudes de traslado dentro del módulo de ambulancias.'
    ),
    (
        'Gestor de traslados',
        'Puede gestionar, asignar recursos y actualizar el estado de los traslados.'
    )
ON DUPLICATE KEY UPDATE
    descripcion = VALUES(descripcion);

-- 2. FUNCIONARIOS

-- Todos los usuarios utilizan la contraseña:
-- 123456

INSERT INTO
    funcionario (
        nombre,
        correo,
        pwd_hash,
        activo
    )
VALUES (
        'Administrador General',
        'admin@sigsm.test',
        '$2y$12$lBID56z9LVhcY4VdC8KBMurK.OKBehXBpAEp8YEk0AfnEq15EjVhS',
        TRUE
    ),
    (
        'Lucía Fernández',
        'documentacion@sigsm.test',
        '$2y$12$lBID56z9LVhcY4VdC8KBMurK.OKBehXBpAEp8YEk0AfnEq15EjVhS',
        TRUE
    ),
    (
        'Diego Pereira',
        'traslados@sigsm.test',
        '$2y$12$lBID56z9LVhcY4VdC8KBMurK.OKBehXBpAEp8YEk0AfnEq15EjVhS',
        TRUE
    ),
    (
        'Carolina Rodríguez',
        'solicitudes@sigsm.test',
        '$2y$12$lBID56z9LVhcY4VdC8KBMurK.OKBehXBpAEp8YEk0AfnEq15EjVhS',
        TRUE
    ),
    (
        'Martín Suárez',
        'multirol@sigsm.test',
        '$2y$12$lBID56z9LVhcY4VdC8KBMurK.OKBehXBpAEp8YEk0AfnEq15EjVhS',
        TRUE
    )
ON DUPLICATE KEY UPDATE
    nombre = VALUES(nombre),
    pwd_hash = VALUES(pwd_hash),
    activo = VALUES(activo);

-- 3. RELACIÓN FUNCIONARIO - ROL

-- Administrador General
INSERT IGNORE INTO
    rol_usuario (id_func, id_rol)
SELECT f.id_func, r.id_rol
FROM funcionario AS f
    CROSS JOIN rol AS r
WHERE
    f.correo = 'admin@sigsm.test'
    AND r.nombre = 'Administrador';

-- Gestora de documentación
INSERT IGNORE INTO
    rol_usuario (id_func, id_rol)
SELECT f.id_func, r.id_rol
FROM funcionario AS f
    CROSS JOIN rol AS r
WHERE
    f.correo = 'documentacion@sigsm.test'
    AND r.nombre = 'Gestor de documentación';

-- Gestor de traslados
INSERT IGNORE INTO
    rol_usuario (id_func, id_rol)
SELECT f.id_func, r.id_rol
FROM funcionario AS f
    CROSS JOIN rol AS r
WHERE
    f.correo = 'traslados@sigsm.test'
    AND r.nombre = 'Gestor de traslados';

-- Solicitante de traslado
INSERT IGNORE INTO
    rol_usuario (id_func, id_rol)
SELECT f.id_func, r.id_rol
FROM funcionario AS f
    CROSS JOIN rol AS r
WHERE
    f.correo = 'solicitudes@sigsm.test'
    AND r.nombre = 'Solicitante de traslado';

-- Usuario con más de un rol para probar la relación N:M
INSERT IGNORE INTO
    rol_usuario (id_func, id_rol)
SELECT f.id_func, r.id_rol
FROM funcionario AS f
    CROSS JOIN rol AS r
WHERE
    f.correo = 'multirol@sigsm.test'
    AND r.nombre = 'Gestor de documentación';

INSERT IGNORE INTO
    rol_usuario (id_func, id_rol)
SELECT f.id_func, r.id_rol
FROM funcionario AS f
    CROSS JOIN rol AS r
WHERE
    f.correo = 'multirol@sigsm.test'
    AND r.nombre = 'Solicitante de traslado';

COMMIT;