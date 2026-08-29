CREATE DATABASE IF NOT EXISTS sigsm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE sigsm;

CREATE TABLE IF NOT EXISTS funcionario (
    id_func INT UNSIGNED AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    pwd_hash VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id_func)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS rol (
    id_rol SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL,
    PRIMARY KEY (id_rol)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS rol_usuario (
    id_func INT UNSIGNED NOT NULL,
    id_rol SMALLINT UNSIGNED NOT NULL,
    fecha_asignacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_func, id_rol),
    FOREIGN KEY (id_func) REFERENCES funcionario (id_func) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_rol) REFERENCES rol (id_rol) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;



-- DATOS INICIALES 
INSERT INTO rol (nombre, descripcion) VALUES (
    "Administrador",
    "Puede dar acceso a nuevos funcionarios, crear roles e interactuar con las secciones del sistema"
)