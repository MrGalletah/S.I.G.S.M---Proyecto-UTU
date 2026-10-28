-- S.I.G.S.M. | Seed Demo v3 (cancelados), para instalacion limpia de MariaDB 11.4.
-- Compatible con dbSchema_01.sql a dbSchema_04.sql del repositorio.
-- ORDEN: inicializar DB -> completar admin-init -> importar este seed.
-- NO copiar a /docker-entrypoint-initdb.d/: depende del administrador ya creado.
-- INSTALACION LIMPIA: se espera SOLO el admin de admin-init (1 funcionario,
-- 1 asignacion de rol) y ninguna categoria/documento/traslado/encuesta previa.
-- Esta comprobacion ESTRICTA es intencionada: el instalador borra los volumenes.
-- Las tolerancias de 1 o 2 usuarios/categorias eran solo para la prueba anterior.
-- Genera: 80 funcionarios (incluye admin), 150 asignaciones de rol,
-- 35 vehiculos, 20 categorias, 2000 traslados (20 cancelados), 30 encuestas,
-- 200 preguntas, 600 opciones, 5000 formularios y sus detalles.
-- TODAS las preguntas activas y obligatorias reciben respuesta.
-- Las opcionales pueden quedar sin responder en una fraccion de formularios.
-- Datos sinteticos: nunca introducir cedulas o datos reales de pacientes.
-- No genera documentos: se necesitan PDFs reales en el almacenamiento.
-- No repetir sobre DB con seed previo: se bloquea antes de modificar datos.
-- Las cuentas sinteticas usan un hash bcrypt no divulgado para pruebas de login.

USE sigsm;

DROP PROCEDURE IF EXISTS seed_sigsm_demo;
-- Se cambia temporalmente el delimitador para definir el procedimiento.
DELIMITER $$

CREATE PROCEDURE seed_sigsm_demo()
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE j INT DEFAULT 0;
    DECLARE k INT DEFAULT 0;
    DECLARE n INT DEFAULT 0;
    DECLARE contador INT DEFAULT 0;
    DECLARE opciones INT DEFAULT 0;
    DECLARE encuesta_seq INT DEFAULT 0;
    DECLARE num_preguntas INT DEFAULT 0;
    DECLARE num_no_abiertas INT DEFAULT 0;
    DECLARE es_abierta BOOLEAN DEFAULT FALSE;

    DECLARE admin_id INT UNSIGNED;
    DECLARE func_id INT UNSIGNED;
    DECLARE otro_rol SMALLINT UNSIGNED;
    DECLARE rol_principal SMALLINT UNSIGNED;
    DECLARE rol_administrador SMALLINT UNSIGNED;
    DECLARE rol_conductor SMALLINT UNSIGNED;
    DECLARE rol_enfermero SMALLINT UNSIGNED;
    DECLARE rol_gestor SMALLINT UNSIGNED;
    DECLARE rol_solicitante SMALLINT UNSIGNED;
    DECLARE rol_documentos SMALLINT UNSIGNED;
    DECLARE rol_medico SMALLINT UNSIGNED;
    DECLARE rol_administrativo SMALLINT UNSIGNED;
    DECLARE id_tipo_vehiculo INT UNSIGNED;
    DECLARE id_tipo_elemento INT UNSIGNED;
    DECLARE id_tipo_traslado INT UNSIGNED;
    DECLARE id_registrado INT UNSIGNED;
    DECLARE id_camino INT UNSIGNED;
    DECLARE id_llego INT UNSIGNED;
    DECLARE id_retornando INT UNSIGNED;
    DECLARE id_completado INT UNSIGNED;
    DECLARE id_cancelado INT UNSIGNED;
    DECLARE estado_actual INT UNSIGNED;
    DECLARE traslado_id INT UNSIGNED;
    DECLARE encuesta_id INT UNSIGNED;
    DECLARE pregunta_id INT UNSIGNED;
    DECLARE respuesta_id INT UNSIGNED;
    DECLARE opcion_id INT UNSIGNED;
    DECLARE vehiculo_id INT UNSIGNED;
    DECLARE conductor_id INT UNSIGNED;
    DECLARE enfermero_id INT UNSIGNED;
    DECLARE solicitante_id INT UNSIGNED;
    DECLARE gestor_id INT UNSIGNED;
    DECLARE categoria_id INT UNSIGNED;
    DECLARE creador_id INT UNSIGNED;
    DECLARE elem_texto VARCHAR(150);
    DECLARE ci_paciente VARCHAR(20);
    DECLARE estado_vehiculo VARCHAR(20);
    DECLARE origen_texto VARCHAR(150);
    DECLARE destino_texto VARCHAR(150);
    DECLARE tipo_pregunta VARCHAR(30);
    DECLARE texto_pregunta TEXT;
    DECLARE salida DATETIME;
    DECLARE llegada_estimada DATETIME;
    DECLARE salida_real DATETIME;
    DECLARE llegada_real DATETIME;
    DECLARE momento_solicitud DATETIME;
    DECLARE momento_gestion DATETIME;
    DECLARE momento_baja DATETIME;
    DECLARE momento_respuesta DATETIME;
    DECLARE esta_activo BOOLEAN DEFAULT TRUE;
    DECLARE version_actual INT UNSIGNED;
    DECLARE con_asignacion BOOLEAN;
    DECLARE bcrypt_demo VARCHAR(255) DEFAULT '$2y$12$88ZKK6dlJ/rY4o7UF2Q3Zu2b9JUKr3dn7dcaemqQSdVBeuG0S7Ysi';

    -- Si cualquier INSERT o comprobacion falla, revertir toda la carga.
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- Esta protección evita mezclar el seed con una instalación en uso.
    SELECT COUNT(*) INTO contador FROM funcionario;
    IF contador <> 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Seed: se esperaba únicamente el funcionario administrador creado por admin-init';
    END IF;
    SELECT COUNT(*) INTO contador FROM rol_usuario;
    IF contador <> 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Seed: se esperaba una única asignación de rol de administrador';
    END IF;
    SELECT COUNT(*) INTO contador FROM traslado;
    IF contador <> 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seed: ya existen traslados';
    END IF;
    SELECT COUNT(*) INTO contador FROM encuesta;
    IF contador <> 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seed: ya existen encuestas';
    END IF;
    SELECT COUNT(*) INTO contador FROM vehiculo;
    IF contador <> 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seed: ya existen vehículos';
    END IF;
    SELECT COUNT(*) INTO contador FROM categoria;
    IF contador <> 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seed: ya existen categorías';
    END IF;
    SELECT COUNT(*) INTO contador FROM documento;
    IF contador <> 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seed: ya existen documentos';
    END IF;
    -- dbSchema_03.sql ya inserta compatibilidades; no deben estar vacias.
    -- La sección 4 usa INSERT IGNORE para evitar duplicados.
    SELECT COUNT(*) INTO contador FROM rol;
    IF contador <> 8 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seed: el catálogo de roles no coincide con dbSchema_01';
    END IF;

    SELECT MIN(id_func) INTO admin_id FROM funcionario;
    SELECT id_rol INTO rol_administrador FROM rol WHERE nombre = 'Administrador';
    SELECT id_rol INTO rol_conductor FROM rol WHERE nombre = 'Conductor';
    SELECT id_rol INTO rol_enfermero FROM rol WHERE nombre = 'Enfermero';
    SELECT id_rol INTO rol_gestor FROM rol WHERE nombre = 'Gestor de traslados';
    SELECT id_rol INTO rol_solicitante FROM rol WHERE nombre = 'Solicitante de traslado';
    SELECT id_rol INTO rol_documentos FROM rol WHERE nombre = 'Gestor de documentación';
    SELECT id_rol INTO rol_medico FROM rol WHERE nombre = 'Médico';
    SELECT id_rol INTO rol_administrativo FROM rol WHERE nombre = 'Administrativo';
    IF NOT EXISTS (SELECT 1 FROM rol_usuario WHERE id_func = admin_id AND id_rol = rol_administrador) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seed: el funcionario inicial no es administrador';
    END IF;

    SELECT id_estado INTO id_registrado FROM estado_traslado WHERE nombre = 'Registrado';
    SELECT id_estado INTO id_camino FROM estado_traslado WHERE nombre = 'En camino';
    SELECT id_estado INTO id_llego FROM estado_traslado WHERE nombre = 'Llegó al destino';
    SELECT id_estado INTO id_retornando FROM estado_traslado WHERE nombre = 'Retornando';
    SELECT id_estado INTO id_completado FROM estado_traslado WHERE nombre = 'Completado';
    SELECT id_estado INTO id_cancelado FROM estado_traslado WHERE nombre = 'Cancelado';
    IF id_registrado IS NULL
        OR id_camino IS NULL
        OR id_llego IS NULL
        OR id_retornando IS NULL
        OR id_completado IS NULL
        OR id_cancelado IS NULL
    THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Seed: falta algún estado de traslado';
    END IF;

    CREATE TEMPORARY TABLE tmp_seed_func (
        seq INT PRIMARY KEY, id INT UNSIGNED NOT NULL
    ) ENGINE=MEMORY;
    CREATE TEMPORARY TABLE tmp_seed_vehicle (
        seq INT PRIMARY KEY, id INT UNSIGNED NOT NULL
    ) ENGINE=MEMORY;
    CREATE TEMPORARY TABLE tmp_seed_category (
        seq INT PRIMARY KEY, id INT UNSIGNED NOT NULL
    ) ENGINE=MEMORY;
    CREATE TEMPORARY TABLE tmp_seed_survey (
        seq INT PRIMARY KEY, id INT UNSIGNED NOT NULL
    ) ENGINE=MEMORY;
    CREATE TEMPORARY TABLE tmp_seed_question (
        survey_seq INT NOT NULL,
        question_seq INT NOT NULL,
        id INT UNSIGNED NOT NULL,
        abierta BOOLEAN NOT NULL,
        numero_opciones INT NOT NULL,
        PRIMARY KEY (survey_seq, question_seq)
    ) ENGINE=MEMORY;
    CREATE TEMPORARY TABLE tmp_seed_option (
        id_pregunta INT UNSIGNED NOT NULL,
        seq INT NOT NULL,
        id INT UNSIGNED NOT NULL,
        PRIMARY KEY (id_pregunta, seq)
    ) ENGINE=MEMORY;

    START TRANSACTION;

    -- 1) 79 funcionarios demo + 1 administrador existente = 80.
    -- 79 roles principales + 70 secundarios + 1 del administrador = 150.
    SET i = 1;
    WHILE i <= 79 DO
        INSERT INTO funcionario (nombre, correo, pwd_hash, activo)
        VALUES (
            CONCAT(
                ELT(1 + ((i - 1) MOD 16),
                    'Camila', 'Mateo', 'Valentina', 'Joaquín',
                    'Florencia', 'Santiago', 'Lucía', 'Agustín',
                    'Martina', 'Nicolás', 'Sofía', 'Federico',
                    'Paula', 'Bruno', 'Carolina', 'Tomás'),
                ' ',
                ELT(1 + ((i * 7) MOD 16),
                    'Pereira', 'Rodríguez', 'González', 'Silva',
                    'Fernández', 'García', 'Díaz', 'Sosa',
                    'Cabrera', 'Acosta', 'Torres', 'Suárez',
                    'López', 'Martínez', 'Castro', 'Viera')
            ),
            CONCAT('func.demo.', LPAD(i, 3, '0'), '@sigsm.test'),
            bcrypt_demo,
            IF(i IN (73, 76, 79), FALSE, TRUE)
        );
        SET func_id = LAST_INSERT_ID();
        INSERT INTO tmp_seed_func VALUES (i, func_id);

        SET rol_principal = CASE
            WHEN i BETWEEN 1 AND 18 THEN rol_conductor
            WHEN i BETWEEN 19 AND 32 THEN rol_enfermero
            WHEN i BETWEEN 33 AND 42 THEN rol_gestor
            WHEN i BETWEEN 43 AND 57 THEN rol_solicitante
            WHEN i BETWEEN 58 AND 63 THEN rol_documentos
            WHEN i BETWEEN 64 AND 69 THEN rol_medico
            ELSE rol_administrativo
        END;
        INSERT INTO rol_usuario (id_func, id_rol) VALUES (func_id, rol_principal);

        IF i <= 70 THEN
            SET otro_rol = CASE
                WHEN i BETWEEN 1 AND 42 THEN rol_solicitante
                WHEN i BETWEEN 43 AND 63 THEN rol_administrativo
                WHEN i BETWEEN 64 AND 69 THEN rol_solicitante
                ELSE rol_solicitante
            END;
            INSERT INTO rol_usuario (id_func, id_rol) VALUES (func_id, otro_rol);
        END IF;
        SET i = i + 1;
    END WHILE;

    -- 2) 20 categorías, varias inactivas para probar filtros.
    SET i = 1;
    WHILE i <= 20 DO
        SELECT id INTO creador_id FROM tmp_seed_func WHERE seq = 58 + ((i - 1) MOD 6);
        INSERT INTO categoria (id_func, nombre, descripcion, fecha_creacion, activo)
        VALUES (
            creador_id,
            ELT(i,
                'Cardiología', 'Emergencias', 'Pediatría', 'Traumatología',
                'Laboratorio', 'Enfermería', 'Farmacia', 'Imágenes',
                'Cirugía', 'Neurología', 'Oncología', 'Medicina Interna',
                'Administración', 'Recursos Humanos', 'Mantenimiento',
                'Seguridad', 'Logística', 'Ambulancias',
                'Calidad Asistencial', 'Atención al Usuario'),
            CONCAT('Categoría de demostración ', i, ' para S.I.G.S.M.'),
            DATE_SUB(NOW(), INTERVAL 160 DAY),
            IF(i MOD 7 = 0, FALSE, TRUE)
        );
        INSERT INTO tmp_seed_category VALUES (i, LAST_INSERT_ID());
        SET i = i + 1;
    END WHILE;

    -- 3) 35 vehículos: 20 ambulancias, 12 autos, 3 de otro tipo.
    SET i = 1;
    WHILE i <= 35 DO
        SELECT tv.id_tipo_vehiculo INTO id_tipo_vehiculo FROM tipo_vehiculo AS tv
        WHERE tv.nombre = CASE
            WHEN i <= 20 THEN 'Ambulancia'
            WHEN i <= 32 THEN 'Auto'
            ELSE 'Otro'
        END;
        SET estado_vehiculo = CASE
            WHEN i >= 34 THEN 'FUERA_DE_SERVICIO'
            WHEN i BETWEEN 31 AND 33 THEN 'MANTENIMIENTO'
            ELSE 'OPERATIVO'
        END;
        INSERT INTO vehiculo (matricula, modelo, id_tipo_vehiculo, estado)
        VALUES (
            CONCAT('DEMO', LPAD(i, 4, '0')),
            CASE WHEN i <= 20 THEN 'Ambulancia de demostración'
                 WHEN i <= 32 THEN 'Vehículo utilitario de demostración'
                 ELSE 'Vehículo especial de demostración' END,
            id_tipo_vehiculo,
            estado_vehiculo
        );
        INSERT INTO tmp_seed_vehicle VALUES (i, LAST_INSERT_ID());
        SET i = i + 1;
    END WHILE;

    -- 4) Compatibilidad de carga para que resources.php tenga relaciones válidas.
    INSERT IGNORE INTO compatibilidad_transporte (id_tipo_elemento, id_tipo_vehiculo)
    SELECT te.id_tipo_elemento, tv.id_tipo_vehiculo
    FROM tipo_elemento AS te CROSS JOIN tipo_vehiculo AS tv
    WHERE (te.nombre = 'Paciente' AND tv.nombre = 'Ambulancia')
       OR (te.nombre = 'Muestra biológica' AND tv.nombre IN ('Ambulancia', 'Auto'))
       OR (te.nombre IN ('Equipamiento', 'Insumo', 'Otro'));

        -- 5) 2.000 TRASLADOS:
        -- 1.800 completados
        -- 15 en curso
        -- 165 registrados
        -- 20 cancelados:
        --   10 con recursos asignados
        --   10 sin recursos asignados

        SET i = 1;

        WHILE i <= 2000 DO

        -- Los últimos 10 asignados se cancelarán antes de salir.

            SET con_asignacion =
                i <= 1815
                OR (i BETWEEN 1981 AND 1990);

            SET esta_activo = i <= 1980;

            SET estado_actual = CASE
                WHEN i <= 1800 THEN id_completado
                WHEN i <= 1805 THEN id_camino
                WHEN i <= 1810 THEN id_llego
                WHEN i <= 1815 THEN id_retornando
                WHEN i <= 1980 THEN id_registrado
                ELSE id_cancelado
            END;

            SET version_actual = CASE
                WHEN i <= 1800 THEN 5
                WHEN i <= 1805 THEN 2
                WHEN i <= 1810 THEN 3
                WHEN i <= 1815 THEN 4
                WHEN i <= 1980 THEN 1
                WHEN i <= 1990 THEN 3
                ELSE 2
            END;
        SET salida = CASE
            WHEN i <= 1800 THEN DATE_ADD(
                DATE_SUB(CURDATE(), INTERVAL (121 - CEIL(i / 15)) DAY),
                INTERVAL (8 + (FLOOR((i - 1) / 15) MOD 2) * 4) HOUR
            )
            WHEN i <= 1805 THEN DATE_SUB(NOW(), INTERVAL 20 MINUTE)
            WHEN i <= 1810 THEN DATE_SUB(NOW(), INTERVAL 70 MINUTE)
            WHEN i <= 1815 THEN DATE_SUB(NOW(), INTERVAL 95 MINUTE)
            WHEN i <= 1980 THEN DATE_ADD(
                DATE_ADD(CURDATE(), INTERVAL (1 + ((i - 1816) MOD 21)) DAY),
                INTERVAL (8 + ((i - 1816) MOD 3) * 3) HOUR
            )
            ELSE DATE_SUB(NOW(), INTERVAL 1 DAY)
        END;
        SET llegada_estimada = IF(con_asignacion, DATE_ADD(salida, INTERVAL 105 MINUTE), NULL);
        SET salida_real = IF(estado_actual = id_cancelado, NULL,  IF(con_asignacion, DATE_ADD(salida, INTERVAL 2 MINUTE), NULL));
        SET llegada_real = IF(estado_actual IN (id_llego, id_retornando, id_completado),
                             DATE_ADD(salida, INTERVAL 60 MINUTE), NULL);
        SET momento_solicitud = DATE_SUB(salida, INTERVAL 1 DAY);
        SET momento_gestion = IF(con_asignacion, DATE_SUB(salida, INTERVAL 2 HOUR), NULL);
        -- Los cancelados se anulan media hora antes de la salida prevista.
        -- Si hubo asignacion, se cancela despues de la fecha_gestion.
        SET momento_baja = IF(esta_activo, NULL, DATE_SUB(salida, INTERVAL 30 MINUTE));

        SELECT tt.id_tipo_traslado INTO id_tipo_traslado FROM tipo_traslado AS tt
        WHERE tt.nombre = ELT(1 + ((i - 1) MOD 5),
            'Traslado interno', 'Traslado a otro centro', 'Traslado a domicilio',
            'Retorno al hospital', 'Otro');
        SELECT te.id_tipo_elemento INTO id_tipo_elemento FROM tipo_elemento AS te
        WHERE te.nombre = CASE
            WHEN i MOD 2 = 0 THEN 'Paciente'
            WHEN i MOD 5 = 0 THEN 'Muestra biológica'
            WHEN i MOD 5 = 1 THEN 'Equipamiento'
            WHEN i MOD 5 = 3 THEN 'Insumo'
            ELSE 'Otro'
        END;
        IF i MOD 2 = 0 THEN
            SET ci_paciente = CONCAT('DEMO-P-', LPAD(i, 6, '0'));
            SET elem_texto = NULL;
        ELSE
            SET ci_paciente = NULL;
            SET elem_texto = CONCAT('Elemento demostración #', i);
        END IF;

        -- Coherencia de ruta entre origen/destino y el tipo de traslado.
        SET origen_texto = CASE ((i - 1) MOD 5)
            WHEN 0 THEN 'Emergencia - Hospital de Clínicas'
            WHEN 1 THEN 'Hospital de Clínicas'
            WHEN 2 THEN 'Hospital de Clínicas'
            WHEN 3 THEN 'Domicilio de demostración'
            ELSE 'Policlínica'
        END;
        SET destino_texto = CASE ((i - 1) MOD 5)
            WHEN 0 THEN 'Unidad de cuidados - Hospital de Clínicas'
            WHEN 1 THEN 'Centro asistencial externo'
            WHEN 2 THEN 'Domicilio de demostración'
            WHEN 3 THEN 'Hospital de Clínicas'
            ELSE 'Laboratorio central'
        END;

        SET vehiculo_id = NULL;
        SET conductor_id = NULL;
        SET enfermero_id = NULL;
        SET gestor_id = NULL;
        IF con_asignacion THEN
            SELECT id INTO vehiculo_id FROM tmp_seed_vehicle WHERE seq = 1 + ((i - 1) MOD 15);
            SELECT id INTO conductor_id FROM tmp_seed_func WHERE seq = 1 + ((i - 1) MOD 15);
            SELECT id INTO gestor_id FROM tmp_seed_func WHERE seq = 33 + ((i - 1) MOD 10);
            IF i MOD 2 = 0 THEN
                SELECT id INTO enfermero_id FROM tmp_seed_func WHERE seq = 19 + ((i - 1) MOD 14);
            END IF;
        END IF;
        SELECT id INTO solicitante_id FROM tmp_seed_func WHERE seq = 33 + (i MOD 25);

        INSERT INTO traslado (
            fecha_solicitud, fecha_requerida, prioridad, observaciones,
            id_tipo_traslado, id_tipo_elemento, elemento, cedula_paciente,
            origen, destino, hora_salida_estimada, hora_llegada_estimada,
            hora_salida_real, hora_llegada_destino,
            id_vehiculo, id_conductor, id_enfermero,
            id_func_solicitante, id_func_gestor, fecha_gestion,
            id_estado, activo, fecha_baja, version
        ) VALUES (
            momento_solicitud, DATE(salida), IF(i MOD 7 = 0, 'URGENTE', 'NORMAL'),
            CONCAT('Traslado ficticio de demostración #', i),
            id_tipo_traslado, id_tipo_elemento, elem_texto, ci_paciente,
            origen_texto, destino_texto,
            IF(con_asignacion, salida, NULL), llegada_estimada,
            salida_real, llegada_real,
            vehiculo_id, conductor_id, enfermero_id,
            solicitante_id, gestor_id, momento_gestion,
            estado_actual, esta_activo, momento_baja, version_actual
        );
        SET traslado_id = LAST_INSERT_ID();

        -- El historial respeta las transiciones registradas en el frontend.
        INSERT INTO historial_estado_traslado
            (id_traslado, id_estado, fecha_hora, observacion, id_func)
        VALUES (traslado_id, id_registrado, momento_solicitud,
                'Solicitud registrada (datos de demostración)', solicitante_id);
        IF estado_actual IN (
            id_camino,
            id_llego,
            id_retornando,
            id_completado
        ) THEN
            INSERT INTO historial_estado_traslado
                (id_traslado, id_estado, fecha_hora, observacion, id_func)
            VALUES (traslado_id, id_camino, DATE_ADD(salida, INTERVAL 2 MINUTE),
                    'Salida del vehículo', gestor_id);
        END IF;
        IF estado_actual IN (id_llego, id_retornando, id_completado) THEN
            INSERT INTO historial_estado_traslado
                (id_traslado, id_estado, fecha_hora, observacion, id_func)
            VALUES (traslado_id, id_llego, DATE_ADD(salida, INTERVAL 60 MINUTE),
                    'Llegada al destino', gestor_id);
        END IF;
        IF estado_actual IN (id_retornando, id_completado) THEN
            INSERT INTO historial_estado_traslado
                (id_traslado, id_estado, fecha_hora, observacion, id_func)
            VALUES (traslado_id, id_retornando, DATE_ADD(salida, INTERVAL 75 MINUTE),
                    'Regreso iniciado', gestor_id);
        END IF;
        IF estado_actual = id_completado THEN
            INSERT INTO historial_estado_traslado
                (id_traslado, id_estado, fecha_hora, observacion, id_func)
            VALUES (traslado_id, id_completado, DATE_ADD(salida, INTERVAL 95 MINUTE),
                    'Traslado finalizado', gestor_id);
        END IF;
        -- REGISTRAR CANCELACIÓN
        IF estado_actual = id_cancelado THEN

            INSERT INTO historial_estado_traslado (
                id_traslado,
                id_estado,
                fecha_hora,
                observacion,
                id_func
            )
            VALUES (
                traslado_id,
                id_cancelado,
                momento_baja,
                'Cancelación de demostración antes de la salida',
                admin_id
            );

        END IF;
        SET i = i + 1;
    END WHILE;

    -- 6) 30 encuestas y exactamente 200 preguntas:
    --    las primeras 20 tienen 7 preguntas; las otras 10 tienen 6.
    --    40 abiertas (sin opciones), 40 con 3 opciones y 120 con 4 = 600.
    SET num_no_abiertas = 0;
    SET i = 1;
    WHILE i <= 30 DO
        SELECT id INTO creador_id FROM tmp_seed_func WHERE seq = 58 + ((i - 1) MOD 6);
        -- Solo asociamos encuestas a categorias activas (excluimos 7 y 14).
        SET k = 1 + ((i - 1) MOD 18);
        SET k = CASE WHEN k >= 13 THEN k + 2 WHEN k >= 7 THEN k + 1 ELSE k END;
        SELECT id INTO categoria_id FROM tmp_seed_category WHERE seq = k;
        INSERT INTO encuesta (
            id_cat, id_func, titulo, descripcion, fecha_creacion, anonima, activo
        ) VALUES (
            categoria_id, creador_id,
            CONCAT('Encuesta de calidad y atención #', LPAD(i, 2, '0')),
            'Formulario ficticio para demostración de S.I.G.S.M.',
            DATE_ADD(DATE_SUB(NOW(), INTERVAL 150 DAY), INTERVAL i DAY),
            i MOD 4 <> 0,
            i MOD 9 <> 0
        );
        SET encuesta_id = LAST_INSERT_ID();
        INSERT INTO tmp_seed_survey VALUES (i, encuesta_id);
        SET num_preguntas = IF(i <= 20, 7, 6);

        SET j = 1;
        WHILE j <= num_preguntas DO
            SET es_abierta = (j = 1 OR (j = 2 AND i <= 10));
            IF es_abierta THEN
                SET tipo_pregunta = 'abierta';
                SET opciones = 0;
                SET texto_pregunta = CASE
                    WHEN j = 1 THEN '¿Qué sugerencias tiene para mejorar la atención?'
                    ELSE '¿Qué aspecto considera prioritario mejorar?'
                END;
            ELSE
                SET num_no_abiertas = num_no_abiertas + 1;
                SET opciones = IF(num_no_abiertas <= 40, 3, 4);
                SET tipo_pregunta = IF(j MOD 2 = 0, 'cerrada', 'seleccion');
                SET texto_pregunta = ELT(1 + ((j + i) MOD 8),
                    '¿Cómo califica el tiempo de espera?',
                    '¿Cómo califica la claridad de la información?',
                    '¿Cómo califica la atención del personal?',
                    '¿Cómo califica el proceso de solicitud?',
                    '¿Cómo califica la coordinación entre sectores?',
                    '¿Cómo califica el estado de las instalaciones?',
                    '¿Recomendaría este servicio?',
                    '¿Cómo califica la experiencia general?');
            END IF;
            INSERT INTO pregunta (id_encuesta, texto, tipo, obligatoria, activa, orden)
            VALUES (encuesta_id, texto_pregunta, tipo_pregunta,
                    IF(j MOD 5 = 0, FALSE, TRUE), TRUE, j);
            SET pregunta_id = LAST_INSERT_ID();
            INSERT INTO tmp_seed_question
                (survey_seq, question_seq, id, abierta, numero_opciones)
            VALUES (i, j, pregunta_id, es_abierta, opciones);
            SET k = 1;
            WHILE k <= opciones DO
                INSERT INTO opcion_respuesta (id_pregunta, texto, valor)
                VALUES (
                    pregunta_id,
                    CASE k WHEN 1 THEN 'Muy insatisfecho'
                           WHEN 2 THEN 'Insatisfecho'
                           WHEN 3 THEN 'Satisfecho'
                           ELSE 'Muy satisfecho' END,
                    k
                );
                INSERT INTO tmp_seed_option VALUES (pregunta_id, k, LAST_INSERT_ID());
                SET k = k + 1;
            END WHILE;
            SET j = j + 1;
        END WHILE;
        SET i = i + 1;
    END WHILE;

    -- 7) 5.000 formularios distribuidos entre las 30 encuestas.
    --    Se responde SIEMPRE a todas las preguntas obligatorias.
    --    Solo se omite a veces la pregunta opcional (orden 5).
    --    La distribucion depende de la ronda de respuestas, no solo de i MOD 30,
    --    para evitar que una encuesta tenga siempre las mismas omisiones/opciones.
    SET i = 1;
    WHILE i <= 5000 DO
        SET encuesta_seq = 1 + ((i - 1) MOD 30);
        SELECT id INTO encuesta_id FROM tmp_seed_survey WHERE seq = encuesta_seq;
        SET num_preguntas = IF(encuesta_seq <= 20, 7, 6);
        SET momento_respuesta = DATE_ADD(
            DATE_SUB(NOW(), INTERVAL (1 + ((i * 13) MOD 100)) DAY),
            INTERVAL ((i * 17) MOD 360) MINUTE
        );
        INSERT INTO respuesta_encuesta (id_encuesta, cedula, fecha_respuesta)
        VALUES (
            encuesta_id,
            -- Las encuestas anonimas nunca guardan cedula, ni siquiera ficticia.
            IF(encuesta_seq MOD 4 = 0, CONCAT('DEMO-R-', LPAD(i, 6, '0')), NULL),
            momento_respuesta
        );
        SET respuesta_id = LAST_INSERT_ID();

        SET j = 1;
        WHILE j <= num_preguntas DO
            -- En la seccion de preguntas j MOD 5 = 0 es la unica opcional.
            -- 1 de cada 4 rondas deja esa pregunta sin contestar.
            IF j MOD 5 <> 0
                OR ((FLOOR((i - 1) / 30) + encuesta_seq + j) MOD 4 <> 0)
            THEN
                SELECT id, abierta, numero_opciones
                INTO pregunta_id, es_abierta, opciones
                FROM tmp_seed_question
                WHERE survey_seq = encuesta_seq AND question_seq = j;

                IF es_abierta THEN
                    INSERT INTO detalle_respuesta
                        (id_pregunta, id_respuesta_encuesta, id_opcion, respuesta)
                    VALUES (
                        pregunta_id, respuesta_id, NULL,
                        ELT(1 + ((FLOOR((i - 1) / 30) + j + encuesta_seq) MOD 5),
                            'Buena atención y trato cordial.',
                            'Podría mejorar la señalización.',
                            'El proceso fue claro y sencillo.',
                            'Sería útil reducir los tiempos de espera.',
                            'El personal brindó información suficiente.')
                    );
                ELSE
                    -- Variar por ronda garantiza distribuciones reales
                    -- en preguntas de 3 o 4 opciones, sin opciones siempre a cero.
                    SELECT id INTO opcion_id FROM tmp_seed_option
                    WHERE id_pregunta = pregunta_id
                      AND seq = 1 + ((FLOOR((i - 1) / 30) + j + encuesta_seq) MOD opciones);
                    INSERT INTO detalle_respuesta
                        (id_pregunta, id_respuesta_encuesta, id_opcion, respuesta)
                    VALUES (pregunta_id, respuesta_id, opcion_id, NULL);
                END IF;
            END IF;

            SET j = j + 1;
        END WHILE;
        SET i = i + 1;
    END WHILE;

    -- Evitar encuestas publicas que apunten a categorias inactivas.
    SELECT COUNT(*) INTO contador
    FROM encuesta e
    JOIN categoria c ON c.id_cat = e.id_cat
    WHERE e.activo = TRUE AND c.activo = FALSE;
    IF contador <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Seed: encuesta activa en categoria inactiva';
    END IF;

    -- Validar integridad LOGICA antes del COMMIT. La BD no valida, por si
    -- sola, que un formulario contestado incluya todas las obligatorias.
    SELECT COUNT(*) INTO contador
    FROM respuesta_encuesta re
    JOIN pregunta p
      ON p.id_encuesta = re.id_encuesta
     AND p.activa = TRUE
     AND p.obligatoria = TRUE
    LEFT JOIN detalle_respuesta d
      ON d.id_respuesta_encuesta = re.id_respuesta_encuesta
     AND d.id_pregunta = p.id_pregunta
    WHERE d.id_detalle_respuesta IS NULL;

    IF contador <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Seed: existen preguntas obligatorias sin responder';
    END IF;

    SELECT COUNT(*) INTO contador
    FROM detalle_respuesta d
    JOIN pregunta p ON p.id_pregunta = d.id_pregunta
    WHERE (p.tipo = 'abierta' AND (d.respuesta IS NULL OR d.id_opcion IS NOT NULL))
       OR (p.tipo <> 'abierta' AND (d.id_opcion IS NULL OR d.respuesta IS NOT NULL));

    IF contador <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Seed: respuestas no compatibles con el tipo de pregunta';
    END IF;

    -- VALIDAR TAMAÑOS ESPERADOS ANTES DEL COMMIT.
    -- En una instalacion limpia cualquier diferencia aborta y hace ROLLBACK.
    SELECT COUNT(*) INTO contador FROM funcionario;
    IF contador <> 80 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seed: cantidad incorrecta de funcionarios';
    END IF;

    SELECT COUNT(*) INTO contador FROM rol_usuario;
    IF contador <> 150 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seed: cantidad incorrecta de roles asignados';
    END IF;

    SELECT COUNT(*) INTO contador FROM categoria;
    IF contador <> 20 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seed: cantidad incorrecta de categorias';
    END IF;

    SELECT COUNT(*) INTO contador FROM vehiculo;
    IF contador <> 35 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seed: cantidad incorrecta de vehiculos';
    END IF;

    SELECT COUNT(*) INTO contador FROM traslado;
    IF contador <> 2000 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seed: cantidad incorrecta de traslados';
    END IF;

    SELECT COUNT(*) INTO contador FROM encuesta;
    IF contador <> 30 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seed: cantidad incorrecta de encuestas';
    END IF;

    SELECT COUNT(*) INTO contador FROM pregunta;
    IF contador <> 200 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seed: cantidad incorrecta de preguntas';
    END IF;

    SELECT COUNT(*) INTO contador FROM opcion_respuesta;
    IF contador <> 600 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seed: cantidad incorrecta de opciones';
    END IF;

    SELECT COUNT(*) INTO contador FROM respuesta_encuesta;
    IF contador <> 5000 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seed: cantidad incorrecta de formularios';
    END IF;

    SELECT COUNT(*) INTO contador FROM detalle_respuesta;
    IF contador <> 32090 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seed: cantidad incorrecta de detalles';
    END IF;

    -- VALIDACIONES ESPECIFICAS DE TRASLADOS CANCELADOS
    SELECT COUNT(*) INTO contador
    FROM traslado t
    JOIN estado_traslado et ON et.id_estado = t.id_estado
    WHERE et.nombre = 'Cancelado';
    IF contador <> 20 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Seed: se esperaban 20 traslados cancelados';
    END IF;

    SELECT COUNT(*) INTO contador
    FROM traslado t
    JOIN estado_traslado et ON et.id_estado = t.id_estado
    WHERE et.nombre = 'Cancelado'
      AND t.id_vehiculo IS NOT NULL
      AND t.id_conductor IS NOT NULL;
    IF contador <> 10 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Seed: se esperaban 10 cancelados con recursos asignados';
    END IF;

    SELECT COUNT(*) INTO contador
    FROM traslado t
    JOIN estado_traslado et ON et.id_estado = t.id_estado
    WHERE et.nombre = 'Cancelado'
      AND t.id_vehiculo IS NULL
      AND t.id_conductor IS NULL;
    IF contador <> 10 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Seed: se esperaban 10 cancelados sin recursos asignados';
    END IF;

    -- Los cancelados deben tener baja, estar inactivos y no haber salido.
    -- Las cancelaciones asignadas deben ocurrir antes de su salida estimada
    -- y despues de haberse gestionado.
    SELECT COUNT(*) INTO contador
    FROM traslado t
    JOIN estado_traslado et ON et.id_estado = t.id_estado
    WHERE et.nombre = 'Cancelado'
      AND (
           t.activo <> FALSE
           OR t.fecha_baja IS NULL
           OR t.hora_salida_real IS NOT NULL
           OR t.hora_llegada_destino IS NOT NULL
           OR (t.hora_salida_estimada IS NOT NULL
               AND t.fecha_baja >= t.hora_salida_estimada)
           OR (t.fecha_gestion IS NOT NULL
               AND t.fecha_baja <= t.fecha_gestion)
      );
    IF contador <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Seed: datos inconsistentes en traslados cancelados';
    END IF;

    -- Cada cancelado debe tener historial de cancelacion y NO de salida.
    SELECT COUNT(*) INTO contador
    FROM traslado t
    JOIN estado_traslado et ON et.id_estado = t.id_estado
    LEFT JOIN historial_estado_traslado h
      ON h.id_traslado = t.id_traslado
     AND h.id_estado = t.id_estado
    WHERE et.nombre = 'Cancelado'
      AND h.id_historial IS NULL;
    IF contador <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Seed: traslados cancelados sin historial de cancelacion';
    END IF;

    SELECT COUNT(*) INTO contador
    FROM traslado t
    JOIN estado_traslado et ON et.id_estado = t.id_estado
    JOIN historial_estado_traslado h ON h.id_traslado = t.id_traslado
    JOIN estado_traslado eh ON eh.id_estado = h.id_estado
    WHERE et.nombre = 'Cancelado' AND eh.nombre = 'En camino';
    IF contador <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Seed: cancelados con historial de salida';
    END IF;

    COMMIT;

    DROP TEMPORARY TABLE tmp_seed_func;
    DROP TEMPORARY TABLE tmp_seed_vehicle;
    DROP TEMPORARY TABLE tmp_seed_category;
    DROP TEMPORARY TABLE tmp_seed_survey;
    DROP TEMPORARY TABLE tmp_seed_question;
    DROP TEMPORARY TABLE tmp_seed_option;
END$$

DELIMITER ;

CALL seed_sigsm_demo();

DROP PROCEDURE IF EXISTS seed_sigsm_demo;

-- VERIFICACIÓN: las consultas siguientes solo leen los datos.
SELECT 'funcionarios' entidad, COUNT(*) cantidad
FROM funcionario
UNION ALL
SELECT 'relaciones_rol', COUNT(*)
FROM rol_usuario
UNION ALL
SELECT 'vehiculos', COUNT(*)
FROM vehiculo
UNION ALL
SELECT 'categorias', COUNT(*)
FROM categoria
UNION ALL
SELECT 'traslados', COUNT(*)
FROM traslado
UNION ALL
SELECT 'historiales_traslado', COUNT(*)
FROM historial_estado_traslado
UNION ALL
SELECT 'encuestas', COUNT(*)
FROM encuesta
UNION ALL
SELECT 'preguntas', COUNT(*)
FROM pregunta
UNION ALL
SELECT 'opciones', COUNT(*)
FROM opcion_respuesta
UNION ALL
SELECT 'respuestas', COUNT(*)
FROM respuesta_encuesta
UNION ALL
SELECT 'detalles', COUNT(*)
FROM detalle_respuesta
UNION ALL
SELECT 'documentos', COUNT(*)
FROM documento;

-- Comprobaciones de coherencia (los valores de incidencia deben ser cero).
SELECT 'funcionarios_sin_rol' comprobacion, COUNT(*) incidencias
FROM funcionario f
    LEFT JOIN rol_usuario ru ON ru.id_func = f.id_func
WHERE
    ru.id_func IS NULL
UNION ALL
SELECT 'encuestas_anonimas_con_cedula', COUNT(*)
FROM
    respuesta_encuesta re
    JOIN encuesta e ON e.id_encuesta = re.id_encuesta
WHERE
    e.anonima = TRUE
    AND re.cedula IS NOT NULL
UNION ALL
SELECT 'detalles_en_otra_encuesta', COUNT(*)
FROM
    detalle_respuesta dr
    JOIN respuesta_encuesta re ON re.id_respuesta_encuesta = dr.id_respuesta_encuesta
    JOIN pregunta p ON p.id_pregunta = dr.id_pregunta
WHERE
    re.id_encuesta <> p.id_encuesta
UNION ALL
SELECT 'encuestas_activas_categoria_inactiva', COUNT(*)
FROM encuesta e
    JOIN categoria c ON c.id_cat = e.id_cat
WHERE
    e.activo = TRUE
    AND c.activo = FALSE
UNION ALL
SELECT 'obligatorias_sin_responder', COUNT(*)
FROM
    respuesta_encuesta re
    JOIN pregunta p ON p.id_encuesta = re.id_encuesta
    AND p.activa = TRUE
    AND p.obligatoria = TRUE
    LEFT JOIN detalle_respuesta d ON d.id_respuesta_encuesta = re.id_respuesta_encuesta
    AND d.id_pregunta = p.id_pregunta
WHERE
    d.id_detalle_respuesta IS NULL
UNION ALL
SELECT 'cerradas_sin_opcion_o_abiertas_con_opcion', COUNT(*)
FROM
    detalle_respuesta d
    JOIN pregunta p ON p.id_pregunta = d.id_pregunta
WHERE (
        p.tipo = 'abierta'
        AND (
            d.respuesta IS NULL
            OR d.id_opcion IS NOT NULL
        )
    )
    OR (
        p.tipo <> 'abierta'
        AND (
            d.id_opcion IS NULL
            OR d.respuesta IS NOT NULL
        )
    );

SELECT et.nombre AS estado, COUNT(*) AS traslados
FROM
    traslado t
    JOIN estado_traslado et ON et.id_estado = t.id_estado
GROUP BY
    et.id_estado,
    et.nombre
ORDER BY et.orden;

-- CANCELADOS DE PRUEBA PARA EL HISTORIAL (esperado: 20 = 10 + 10).
SELECT
    COUNT(*) AS total_cancelados,
    SUM(t.id_vehiculo IS NOT NULL AND t.id_conductor IS NOT NULL)
        AS cancelados_con_asignacion,
    SUM(t.id_vehiculo IS NULL AND t.id_conductor IS NULL)
        AS cancelados_sin_asignacion,
    SUM(t.hora_salida_real IS NOT NULL) AS cancelados_que_salieron,
    SUM(t.activo = TRUE) AS cancelados_activos
FROM traslado t
JOIN estado_traslado et ON et.id_estado = t.id_estado
WHERE et.nombre = 'Cancelado';

-- Ejemplos: TR-01981 (con recursos) y TR-01995 (sin recursos),
-- siempre que una instalacion limpia empiece con id_traslado = 1.
