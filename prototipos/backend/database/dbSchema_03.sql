USE sigsm;

-- TIPO DE VEHÍCULO

CREATE TABLE tipo_vehiculo (
    id_tipo_vehiculo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(50) NOT NULL UNIQUE,

    descripcion VARCHAR(255) NULL
);


INSERT INTO tipo_vehiculo (nombre)
VALUES
    ('Ambulancia'),
    ('Auto'),
    ('Otro');


-- VEHÍCULO

CREATE TABLE vehiculo (
    id_vehiculo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    matricula VARCHAR(20) NOT NULL UNIQUE,

    modelo VARCHAR(100) NOT NULL,

    id_tipo_vehiculo INT UNSIGNED NOT NULL,

    estado ENUM(
        'OPERATIVO',
        'FUERA_DE_SERVICIO',
        'MANTENIMIENTO'
    ) NOT NULL DEFAULT 'OPERATIVO',

    CONSTRAINT fk_vehiculo_tipo
        FOREIGN KEY (id_tipo_vehiculo)
        REFERENCES tipo_vehiculo(id_tipo_vehiculo)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- ESTADO DEL TRASLADO

CREATE TABLE estado_traslado (
    id_estado INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(50) NOT NULL UNIQUE,

    orden TINYINT UNSIGNED NOT NULL UNIQUE,

    descripcion VARCHAR(255) NULL,

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


-- TIPO DE ELEMENTO

CREATE TABLE tipo_elemento (
    id_tipo_elemento INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(50) NOT NULL UNIQUE,

    descripcion VARCHAR(255) NULL
);


INSERT INTO tipo_elemento (nombre)
VALUES
    ('Paciente'),
    ('Muestra biológica'),
    ('Equipamiento'),
    ('Insumo'),
    ('Otro');


-- TIPO DE TRASLADO

CREATE TABLE tipo_traslado (
    id_tipo_traslado INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL UNIQUE,

    descripcion VARCHAR(255) NULL,

    activo BOOLEAN NOT NULL DEFAULT TRUE
);


INSERT INTO tipo_traslado (nombre)
VALUES
    ('Traslado interno'),
    ('Traslado a otro centro'),
    ('Traslado a domicilio'),
    ('Retorno al hospital'),
    ('Otro');


-- COMPATIBILIDAD

CREATE TABLE compatibilidad_transporte (
    id_tipo_elemento INT UNSIGNED NOT NULL,

    id_tipo_vehiculo INT UNSIGNED NOT NULL,

    PRIMARY KEY (
        id_tipo_elemento,
        id_tipo_vehiculo
    ),

    CONSTRAINT fk_compatibilidad_elemento
        FOREIGN KEY (id_tipo_elemento)
        REFERENCES tipo_elemento(id_tipo_elemento)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_compatibilidad_vehiculo
        FOREIGN KEY (id_tipo_vehiculo)
        REFERENCES tipo_vehiculo(id_tipo_vehiculo)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- TRASLADO

CREATE TABLE traslado (
    id_traslado INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    fecha_solicitud DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    fecha_requerida DATE NOT NULL,

    prioridad ENUM(
        'NORMAL',
        'URGENTE'
    ) NOT NULL DEFAULT 'NORMAL',

    observaciones TEXT NULL,

    id_tipo_traslado INT UNSIGNED NOT NULL,

    id_tipo_elemento INT UNSIGNED NOT NULL,

    elemento VARCHAR(150) NULL,

    cedula_paciente VARCHAR(20) NULL,

    origen VARCHAR(150) NOT NULL,

    destino VARCHAR(150) NOT NULL,

    hora_salida_estimada DATETIME NULL,

    hora_llegada_estimada DATETIME NULL,

    hora_salida_real DATETIME NULL,

    hora_llegada_destino DATETIME NULL,

    id_vehiculo INT UNSIGNED NULL,

    id_conductor INT UNSIGNED NULL,

    id_enfermero INT UNSIGNED NULL,

    id_func_solicitante INT UNSIGNED NOT NULL,

    id_func_gestor INT UNSIGNED NULL,

    fecha_gestion DATETIME NULL,

    id_estado INT UNSIGNED NOT NULL,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    fecha_baja DATETIME NULL,

    version INT UNSIGNED NOT NULL DEFAULT 1,

    CONSTRAINT fk_traslado_tipo_traslado
        FOREIGN KEY (id_tipo_traslado)
        REFERENCES tipo_traslado(id_tipo_traslado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_traslado_tipo_elemento
        FOREIGN KEY (id_tipo_elemento)
        REFERENCES tipo_elemento(id_tipo_elemento)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_traslado_vehiculo
        FOREIGN KEY (id_vehiculo)
        REFERENCES vehiculo(id_vehiculo)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_traslado_conductor
        FOREIGN KEY (id_conductor)
        REFERENCES funcionario(id_func)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_traslado_enfermero
        FOREIGN KEY (id_enfermero)
        REFERENCES funcionario(id_func)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_traslado_solicitante
        FOREIGN KEY (id_func_solicitante)
        REFERENCES funcionario(id_func)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_traslado_gestor
        FOREIGN KEY (id_func_gestor)
        REFERENCES funcionario(id_func)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_traslado_estado
        FOREIGN KEY (id_estado)
        REFERENCES estado_traslado(id_estado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,


    CONSTRAINT chk_traslado_origen_destino
        CHECK (
            TRIM(origen) <> ''
            AND TRIM(destino) <> ''
        ),

    CONSTRAINT chk_traslado_elemento
        CHECK (
            (
                cedula_paciente IS NOT NULL
                AND TRIM(cedula_paciente) <> ''
                AND elemento IS NULL
            )
            OR
            (
                elemento IS NOT NULL
                AND TRIM(elemento) <> ''
                AND cedula_paciente IS NULL
            )
        ),

    CONSTRAINT chk_traslado_horario_estimado
        CHECK (
            (
                hora_salida_estimada IS NULL
                AND hora_llegada_estimada IS NULL
            )
            OR
            (
                hora_salida_estimada IS NOT NULL
                AND hora_llegada_estimada IS NOT NULL
                AND hora_llegada_estimada > hora_salida_estimada
            )
        ),

    CONSTRAINT chk_traslado_asignacion
        CHECK (
            (
                id_vehiculo IS NULL
                AND id_conductor IS NULL
                AND id_enfermero IS NULL
                AND id_func_gestor IS NULL
                AND fecha_gestion IS NULL
                AND hora_salida_estimada IS NULL
                AND hora_llegada_estimada IS NULL
            )
            OR
            (
                id_vehiculo IS NOT NULL
                AND id_conductor IS NOT NULL
                AND id_func_gestor IS NOT NULL
                AND fecha_gestion IS NOT NULL
                AND hora_salida_estimada IS NOT NULL
                AND hora_llegada_estimada IS NOT NULL
            )
        ),

    CONSTRAINT chk_traslado_horario_real
        CHECK (
            hora_llegada_destino IS NULL
            OR (
                hora_salida_real IS NOT NULL
                AND hora_llegada_destino >= hora_salida_real
            )
        ),

    CONSTRAINT chk_traslado_baja
        CHECK (
            (
                activo = TRUE
                AND fecha_baja IS NULL
            )
            OR
            (
                activo = FALSE
                AND fecha_baja IS NOT NULL
            )
        )
);


-- HISTORIAL DE ESTADOS

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
        REFERENCES traslado(id_traslado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_historial_estado
        FOREIGN KEY (id_estado)
        REFERENCES estado_traslado(id_estado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_historial_funcionario
        FOREIGN KEY (id_func)
        REFERENCES funcionario(id_func)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- ÍNDICES

CREATE INDEX idx_traslado_estado_prioridad
ON traslado (
    id_estado,
    prioridad,
    fecha_requerida
);


CREATE INDEX idx_traslado_solicitante
ON traslado (
    id_func_solicitante,
    fecha_solicitud
);


CREATE INDEX idx_traslado_gestor
ON traslado (
    id_func_gestor,
    id_estado
);


CREATE INDEX idx_traslado_cedula_paciente
ON traslado (
    cedula_paciente
);


CREATE INDEX idx_traslado_vehiculo_horario
ON traslado (
    id_vehiculo,
    hora_salida_estimada,
    hora_llegada_estimada
);


CREATE INDEX idx_traslado_conductor_horario
ON traslado (
    id_conductor,
    hora_salida_estimada,
    hora_llegada_estimada
);


CREATE INDEX idx_traslado_enfermero_horario
ON traslado (
    id_enfermero,
    hora_salida_estimada,
    hora_llegada_estimada
);


CREATE INDEX idx_historial_traslado_fecha
ON historial_estado_traslado (
    id_traslado,
    fecha_hora
);


CREATE INDEX idx_vehiculo_tipo_estado
ON vehiculo (
    id_tipo_vehiculo,
    estado
);