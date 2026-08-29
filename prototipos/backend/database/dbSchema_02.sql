USE sigsm;

CREATE TABLE IF NOT EXISTS categoria (
    id_cat INT UNSIGNED AUTO_INCREMENT,
    id_func INT UNSIGNED NOT NULL,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id_cat),
    FOREIGN KEY (id_func) REFERENCES funcionario (id_func)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS documento (
    id_doc INT UNSIGNED AUTO_INCREMENT,
    id_cat INT UNSIGNED NOT NULL,
    id_func INT UNSIGNED NOT NULL,
    ruta VARCHAR(255) NOT NULL,
    fecha_subida DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    titulo VARCHAR(150) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    descripcion TEXT NOT NULL,
    PRIMARY KEY (id_doc),
    FOREIGN KEY (id_cat) REFERENCES categoria (id_cat),
    FOREIGN KEY (id_func) REFERENCES funcionario (id_func)
) ENGINE = InnoDB;