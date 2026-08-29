USE sigsm;

-- 1. VEHÍCULO

CREATE TABLE vehiculo (
    id_vehiculo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    matricula VARCHAR(20) NOT NULL UNIQUE,
    modelo VARCHAR(100) NOT NULL,

    tipo ENUM(
        'AMBULANCIA',
        'AUTO',
        'OTRO'
    ) NOT NULL,

    estado ENUM(
        'DISPONIBLE',
        'EN_TRASLADO',
        'FUERA_DE_SERVICIO',
        'MANTENIMIENTO'
    ) NOT NULL DEFAULT 'DISPONIBLE'
);


-- 2. ESTADO DEL TRASLADO

CREATE TABLE estado_traslado (
    id_estado INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(50) NOT NULL UNIQUE,

    orden TINYINT UNSIGNED NOT NULL UNIQUE,

    descripcion VARCHAR(255),

    CONSTRAINT chk_estado_orden
        CHECK (orden > 0)
);


INSERT INTO estado_traslado (
    nombre,
    orden,
    descripcion
)
VALUES
(
    'Registrado',
    1,
    'El traslado fue registrado en el sistema'
),
(
    'En camino',
    2,
    'El vehículo salió hacia el destino'
),
(
    'Llegó al destino',
    3,
    'El traslado llegó al destino'
),
(
    'Retornando',
    4,
    'El vehículo se encuentra regresando'
),
(
    'Completado',
    5,
    'El traslado finalizó'
);


-- 3. TIPO DE ELEMENTO

CREATE TABLE tipo_elemento (
    id_tipo_elemento INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(50) NOT NULL UNIQUE,

    descripcion VARCHAR(255)
);


INSERT INTO tipo_elemento (nombre)
VALUES
    ('Paciente'),
    ('Muestra biológica'),
    ('Equipamiento'),
    ('Insumo'),
    ('Otro');


-- 4. COMPATIBILIDAD ENTRE ELEMENTO Y VEHÍCULO

CREATE TABLE compatibilidad_transporte (
    id_tipo_elemento INT UNSIGNED NOT NULL,

    tipo_vehiculo ENUM(
        'AMBULANCIA',
        'AUTO',
        'OTRO'
    ) NOT NULL,

    PRIMARY KEY (
        id_tipo_elemento,
        tipo_vehiculo
    ),

    CONSTRAINT fk_compatibilidad_elemento
        FOREIGN KEY (id_tipo_elemento)
        REFERENCES tipo_elemento(id_tipo_elemento)
);


-- 5. TRASLADO

CREATE TABLE traslado (
    id_traslado INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    fecha_solicitud DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP,


    -- HORARIOS PLANIFICADOS

    hora_salida_estimada DATETIME NOT NULL,

    hora_llegada_estimada DATETIME NOT NULL,


    -- HORARIOS REALES

    hora_salida DATETIME NULL,

    hora_llegada DATETIME NULL,


    -- ELEMENTO TRASLADADO

    elemento VARCHAR(150) NOT NULL,

    id_tipo_elemento INT UNSIGNED NOT NULL,


    -- RECORRIDO

    origen VARCHAR(150) NOT NULL,

    destino VARCHAR(150) NOT NULL,


    -- PERSONAL Y VEHÍCULO

    id_vehiculo INT UNSIGNED NOT NULL,

    id_conductor INT UNSIGNED NOT NULL,

    id_enfermero INT UNSIGNED NULL,


    -- ESTADO Y SOLICITANTE

    id_estado INT UNSIGNED NOT NULL,

    id_func_solicitante INT UNSIGNED NOT NULL,


    -- CLAVES FORÁNEAS

    CONSTRAINT fk_traslado_tipo_elemento
        FOREIGN KEY (id_tipo_elemento)
        REFERENCES tipo_elemento(id_tipo_elemento),

    CONSTRAINT fk_traslado_vehiculo
        FOREIGN KEY (id_vehiculo)
        REFERENCES vehiculo(id_vehiculo),

    CONSTRAINT fk_traslado_conductor
        FOREIGN KEY (id_conductor)
        REFERENCES funcionario(id_func),

    CONSTRAINT fk_traslado_enfermero
        FOREIGN KEY (id_enfermero)
        REFERENCES funcionario(id_func),

    CONSTRAINT fk_traslado_estado
        FOREIGN KEY (id_estado)
        REFERENCES estado_traslado(id_estado),

    CONSTRAINT fk_traslado_solicitante
        FOREIGN KEY (id_func_solicitante)
        REFERENCES funcionario(id_func),


    -- RESTRICCIONES

    -- La llegada estimada debe ser posterior
    -- a la salida estimada.

    CONSTRAINT chk_traslado_horario_estimado
        CHECK (
            hora_llegada_estimada > hora_salida_estimada
        ),


    -- Si se registra la hora real de llegada,
    -- debe existir una hora real de salida y
    -- la llegada no puede ser anterior.

    CONSTRAINT chk_traslado_horario_real
        CHECK (
            hora_llegada IS NULL
            OR (
                hora_salida IS NOT NULL
                AND hora_llegada >= hora_salida
            )
        ),


    -- Origen y destino no pueden estar vacíos
    -- ni ser iguales.

    CONSTRAINT chk_traslado_origen_destino
        CHECK (
            TRIM(origen) <> ''
            AND TRIM(destino) <> ''
            AND origen <> destino
        ),


    -- Debe existir una descripción del elemento
    -- o paciente trasladado.

    CONSTRAINT chk_traslado_elemento
        CHECK (
            TRIM(elemento) <> ''
        )
);


-- 6. HISTORIAL DE ESTADOS DEL TRASLADO

CREATE TABLE historial_estado_traslado (
    id_historial INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    id_traslado INT UNSIGNED NOT NULL,

    id_estado INT UNSIGNED NOT NULL,

    fecha_hora DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    observacion TEXT NULL,

    id_func INT UNSIGNED NOT NULL,


    CONSTRAINT fk_historial_traslado
        FOREIGN KEY (id_traslado)
        REFERENCES traslado(id_traslado),

    CONSTRAINT fk_historial_estado
        FOREIGN KEY (id_estado)
        REFERENCES estado_traslado(id_estado),

    CONSTRAINT fk_historial_funcionario
        FOREIGN KEY (id_func)
        REFERENCES funcionario(id_func)
);



-- 7. ÍNDICES PARA VALIDACIÓN DE DISPONIBILIDAD

-- Búsqueda de traslados de un vehículo
-- dentro de un intervalo de tiempo.

CREATE INDEX idx_traslado_vehiculo_horario
ON traslado (
    id_vehiculo,
    hora_salida_estimada,
    hora_llegada_estimada
);


-- Búsqueda de traslados asignados
-- a un conductor.

CREATE INDEX idx_traslado_conductor_horario
ON traslado (
    id_conductor,
    hora_salida_estimada,
    hora_llegada_estimada
);


-- Búsqueda de traslados asignados
-- a un enfermero.

CREATE INDEX idx_traslado_enfermero_horario
ON traslado (
    id_enfermero,
    hora_salida_estimada,
    hora_llegada_estimada
);


-- Consulta cronológica del historial
-- correspondiente a un traslado.

CREATE INDEX idx_historial_traslado_fecha
ON historial_estado_traslado (
    id_traslado,
    fecha_hora
);