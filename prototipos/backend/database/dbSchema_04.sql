-- ENCUESTA

CREATE TABLE encuesta (
    id_encuesta INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_cat INT UNSIGNED NOT NULL,
    id_func INT UNSIGNED NOT NULL,

    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    anonima BOOLEAN NOT NULL DEFAULT TRUE,
    activo BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT chk_encuesta_titulo
        CHECK (CHAR_LENGTH(TRIM(titulo)) > 0),

    CONSTRAINT fk_encuesta_categoria
        FOREIGN KEY (id_cat)
        REFERENCES categoria(id_cat)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_encuesta_funcionario
        FOREIGN KEY (id_func)
        REFERENCES funcionario(id_func)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;


-- PREGUNTA

CREATE TABLE pregunta (
    id_pregunta INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_encuesta INT UNSIGNED NOT NULL,

    texto TEXT NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    obligatoria BOOLEAN NOT NULL DEFAULT FALSE,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    orden INT UNSIGNED NOT NULL,

    CONSTRAINT chk_pregunta_texto
        CHECK (CHAR_LENGTH(TRIM(texto)) > 0),

    CONSTRAINT chk_pregunta_tipo
        CHECK (tipo IN ('abierta', 'cerrada', 'seleccion')),

    CONSTRAINT chk_pregunta_orden
        CHECK (orden > 0),

    -- Evita dos preguntas con la misma posición
    -- dentro de una encuesta.
    CONSTRAINT uq_pregunta_orden
        UNIQUE (id_encuesta, orden),

    CONSTRAINT fk_pregunta_encuesta
        FOREIGN KEY (id_encuesta)
        REFERENCES encuesta(id_encuesta)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;


-- OPCION DE RESPUESTA

CREATE TABLE opcion_respuesta (
    id_opcion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_pregunta INT UNSIGNED NOT NULL,

    texto VARCHAR(255) NOT NULL,
    valor INT NOT NULL,

    CONSTRAINT chk_opcion_texto
        CHECK (CHAR_LENGTH(TRIM(texto)) > 0),

    CONSTRAINT uq_opcion_valor
        UNIQUE (id_pregunta, valor),

    CONSTRAINT uq_pregunta_opcion
        UNIQUE (id_pregunta, id_opcion),

    CONSTRAINT fk_opcion_pregunta
        FOREIGN KEY (id_pregunta)
        REFERENCES pregunta(id_pregunta)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;


-- RESPUESTA GENERAL DE UNA ENCUESTA

CREATE TABLE respuesta_encuesta (
    id_respuesta_encuesta INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_encuesta INT UNSIGNED NOT NULL,

    cedula VARCHAR(20) NULL,
    fecha_respuesta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_respuesta_encuesta
        FOREIGN KEY (id_encuesta)
        REFERENCES encuesta(id_encuesta)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;


-- DETALLE DE RESPUESTA

CREATE TABLE detalle_respuesta (
    id_detalle_respuesta INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    id_pregunta INT UNSIGNED NOT NULL,
    id_respuesta_encuesta INT UNSIGNED NOT NULL,

    id_opcion INT UNSIGNED NULL,
    respuesta TEXT NULL,

    -- Si existe un detalle, debe contener una opción
    -- seleccionada o una respuesta escrita.
    CONSTRAINT chk_detalle_con_respuesta
        CHECK (
            id_opcion IS NOT NULL
            OR (
                respuesta IS NOT NULL
                AND CHAR_LENGTH(TRIM(respuesta)) > 0
            )
        ),

    -- Una respuesta no puede responder dos veces
    -- la misma pregunta.
    CONSTRAINT uq_detalle_pregunta
        UNIQUE (id_respuesta_encuesta, id_pregunta),

    CONSTRAINT fk_detalle_respuesta_encuesta
        FOREIGN KEY (id_respuesta_encuesta)
        REFERENCES respuesta_encuesta(id_respuesta_encuesta)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_detalle_pregunta
        FOREIGN KEY (id_pregunta)
        REFERENCES pregunta(id_pregunta)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    -- Esto es mejor que hacer simplemente:
    -- FOREIGN KEY (id_opcion) REFERENCES opcion_respuesta(id_opcion)
    --
    -- porque también garantiza que la opción seleccionada
    -- pertenece a ESA pregunta.
    CONSTRAINT fk_detalle_opcion
        FOREIGN KEY (id_pregunta, id_opcion)
        REFERENCES opcion_respuesta(id_pregunta, id_opcion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;