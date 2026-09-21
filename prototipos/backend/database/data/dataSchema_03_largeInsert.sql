USE sigsm;


DELETE h
FROM historial_estado_traslado h
INNER JOIN traslado t
    ON t.id_traslado = h.id_traslado
WHERE t.observaciones LIKE '[DEMO-MASS]%';

DELETE FROM traslado
WHERE observaciones LIKE '[DEMO-MASS]%';


DROP PROCEDURE IF EXISTS seed_mass_transfers;

DELIMITER //

CREATE PROCEDURE seed_mass_transfers()
BEGIN

    DECLARE i INT DEFAULT 1;
    DECLARE j INT DEFAULT 1;

    DECLARE v_id_traslado INT UNSIGNED;
    DECLARE v_base DATETIME;
    DECLARE v_fecha_requerida DATE;

    DECLARE v_estado_registrado INT UNSIGNED;
    DECLARE v_estado_camino INT UNSIGNED;
    DECLARE v_estado_destino INT UNSIGNED;
    DECLARE v_estado_retornando INT UNSIGNED;
    DECLARE v_estado_completado INT UNSIGNED;

    DECLARE v_elemento_paciente INT UNSIGNED;
    DECLARE v_elemento_muestra INT UNSIGNED;
    DECLARE v_elemento_equipamiento INT UNSIGNED;
    DECLARE v_elemento_insumo INT UNSIGNED;

    DECLARE v_traslado_otro_centro INT UNSIGNED;
    DECLARE v_traslado_domicilio INT UNSIGNED;
    DECLARE v_retorno_hospital INT UNSIGNED;
    DECLARE v_traslado_otro INT UNSIGNED;

    DECLARE v_ambulancia1 INT UNSIGNED;
    DECLARE v_ambulancia2 INT UNSIGNED;
    DECLARE v_auto1 INT UNSIGNED;
    DECLARE v_otro1 INT UNSIGNED;

    DECLARE v_medico INT UNSIGNED;
    DECLARE v_solicitante2 INT UNSIGNED;
    DECLARE v_gestor INT UNSIGNED;
    DECLARE v_conductor1 INT UNSIGNED;
    DECLARE v_conductor2 INT UNSIGNED;
    DECLARE v_enfermero1 INT UNSIGNED;
    DECLARE v_enfermero2 INT UNSIGNED;

    DECLARE v_tipo_elemento INT UNSIGNED;
    DECLARE v_tipo_traslado INT UNSIGNED;
    DECLARE v_estado_actual INT UNSIGNED;

    DECLARE v_vehiculo INT UNSIGNED;
    DECLARE v_conductor INT UNSIGNED;
    DECLARE v_enfermero INT UNSIGNED;
    DECLARE v_solicitante INT UNSIGNED;

    DECLARE v_elemento VARCHAR(150);
    DECLARE v_cedula VARCHAR(20);
    DECLARE v_origen VARCHAR(150);
    DECLARE v_destino VARCHAR(150);
    DECLARE v_prioridad VARCHAR(20);

    DECLARE v_fecha_gestion DATETIME;
    DECLARE v_salida_estimada DATETIME;
    DECLARE v_llegada_estimada DATETIME;
    DECLARE v_salida_real DATETIME;
    DECLARE v_llegada_destino DATETIME;


    SELECT id_estado INTO v_estado_registrado
    FROM estado_traslado
    WHERE nombre = 'Registrado'
    LIMIT 1;

    SELECT id_estado INTO v_estado_camino
    FROM estado_traslado
    WHERE nombre = 'En camino'
    LIMIT 1;

    SELECT id_estado INTO v_estado_destino
    FROM estado_traslado
    WHERE nombre = 'Llegó al destino'
    LIMIT 1;

    SELECT id_estado INTO v_estado_retornando
    FROM estado_traslado
    WHERE nombre = 'Retornando'
    LIMIT 1;

    SELECT id_estado INTO v_estado_completado
    FROM estado_traslado
    WHERE nombre = 'Completado'
    LIMIT 1;


    SELECT id_tipo_elemento INTO v_elemento_paciente
    FROM tipo_elemento
    WHERE nombre = 'Paciente'
    LIMIT 1;

    SELECT id_tipo_elemento INTO v_elemento_muestra
    FROM tipo_elemento
    WHERE nombre = 'Muestra biológica'
    LIMIT 1;

    SELECT id_tipo_elemento INTO v_elemento_equipamiento
    FROM tipo_elemento
    WHERE nombre = 'Equipamiento'
    LIMIT 1;

    SELECT id_tipo_elemento INTO v_elemento_insumo
    FROM tipo_elemento
    WHERE nombre = 'Insumo'
    LIMIT 1;


    SELECT id_tipo_traslado INTO v_traslado_otro_centro
    FROM tipo_traslado
    WHERE nombre = 'Traslado a otro centro'
    LIMIT 1;

    SELECT id_tipo_traslado INTO v_traslado_domicilio
    FROM tipo_traslado
    WHERE nombre = 'Traslado a domicilio'
    LIMIT 1;

    SELECT id_tipo_traslado INTO v_retorno_hospital
    FROM tipo_traslado
    WHERE nombre = 'Retorno al hospital'
    LIMIT 1;

    SELECT id_tipo_traslado INTO v_traslado_otro
    FROM tipo_traslado
    WHERE nombre = 'Otro'
    LIMIT 1;


    SELECT id_vehiculo INTO v_ambulancia1
    FROM vehiculo
    WHERE matricula = 'SAB1001'
    LIMIT 1;

    SELECT id_vehiculo INTO v_ambulancia2
    FROM vehiculo
    WHERE matricula = 'SAB1002'
    LIMIT 1;

    SELECT id_vehiculo INTO v_auto1
    FROM vehiculo
    WHERE matricula = 'SAA2001'
    LIMIT 1;

    SELECT id_vehiculo INTO v_otro1
    FROM vehiculo
    WHERE matricula = 'SAT3001'
    LIMIT 1;


    SELECT id_func INTO v_medico
    FROM funcionario
    WHERE correo = 'laura.fernandez@sigsm.test'
    LIMIT 1;

    SELECT id_func INTO v_solicitante2
    FROM funcionario
    WHERE correo = 'sofia.martinez@sigsm.test'
    LIMIT 1;

    SELECT id_func INTO v_gestor
    FROM funcionario
    WHERE correo = 'diego.pereira@sigsm.test'
    LIMIT 1;

    SELECT id_func INTO v_conductor1
    FROM funcionario
    WHERE correo = 'carlos.rodriguez@sigsm.test'
    LIMIT 1;

    SELECT id_func INTO v_conductor2
    FROM funcionario
    WHERE correo = 'martin.silva@sigsm.test'
    LIMIT 1;

    SELECT id_func INTO v_enfermero1
    FROM funcionario
    WHERE correo = 'maria.lopez@sigsm.test'
    LIMIT 1;

    SELECT id_func INTO v_enfermero2
    FROM funcionario
    WHERE correo = 'valentina.gomez@sigsm.test'
    LIMIT 1;


    -- =====================================================
    -- 40 COMPLETADOS
    -- =====================================================

    WHILE i <= 40 DO

        SET v_base = TIMESTAMPADD(DAY, -(i * 7), NOW());
        SET v_fecha_requerida = DATE(v_base);

        SET v_elemento = NULL;
        SET v_cedula = NULL;
        SET v_enfermero = NULL;


        IF MOD(i, 4) = 0 THEN

            SET v_tipo_elemento = v_elemento_paciente;
            SET v_cedula = CAST(40000000 + i AS CHAR);

            IF MOD(i, 2) = 0 THEN
                SET v_vehiculo = v_ambulancia1;
                SET v_enfermero = v_enfermero1;
            ELSE
                SET v_vehiculo = v_ambulancia2;
                SET v_enfermero = v_enfermero2;
            END IF;

        ELSEIF MOD(i, 4) = 1 THEN

            SET v_tipo_elemento = v_elemento_muestra;
            SET v_elemento = CONCAT(
                'Muestra biológica demo ',
                i
            );

            SET v_vehiculo = v_auto1;

        ELSEIF MOD(i, 4) = 2 THEN

            SET v_tipo_elemento = v_elemento_equipamiento;
            SET v_elemento = CONCAT(
                'Equipamiento médico demo ',
                i
            );

            SET v_vehiculo = v_otro1;

        ELSE

            SET v_tipo_elemento = v_elemento_insumo;
            SET v_elemento = CONCAT(
                'Insumos médicos demo ',
                i
            );

            SET v_vehiculo = v_auto1;

        END IF;


        IF MOD(i, 4) = 0 THEN

            SET v_tipo_traslado = v_traslado_otro_centro;
            SET v_origen = 'Hospital de Clínicas';
            SET v_destino = 'Hospital Maciel';

        ELSEIF MOD(i, 4) = 1 THEN

            SET v_tipo_traslado = v_traslado_domicilio;
            SET v_origen = 'Hospital de Clínicas';
            SET v_destino = CONCAT(
                'Domicilio demo ',
                i
            );

        ELSEIF MOD(i, 4) = 2 THEN

            SET v_tipo_traslado = v_retorno_hospital;
            SET v_origen = 'Hospital Pasteur';
            SET v_destino = 'Hospital de Clínicas';

        ELSE

            SET v_tipo_traslado = v_traslado_otro;
            SET v_origen = 'Hospital de Clínicas';
            SET v_destino = CONCAT(
                'Centro médico demo ',
                i
            );

        END IF;


        IF MOD(i, 5) = 0 THEN
            SET v_prioridad = 'URGENTE';
        ELSE
            SET v_prioridad = 'NORMAL';
        END IF;


        IF MOD(i, 2) = 0 THEN
            SET v_conductor = v_conductor1;
            SET v_solicitante = v_medico;
        ELSE
            SET v_conductor = v_conductor2;
            SET v_solicitante = v_solicitante2;
        END IF;


        SET v_fecha_gestion =
            TIMESTAMPADD(HOUR, -5, v_base);

        SET v_salida_estimada =
            TIMESTAMPADD(HOUR, -4, v_base);

        SET v_llegada_estimada =
            TIMESTAMPADD(HOUR, -3, v_base);

        SET v_salida_real =
            TIMESTAMPADD(MINUTE, -230, v_base);

        SET v_llegada_destino =
            TIMESTAMPADD(MINUTE, -175, v_base);


        INSERT INTO traslado (
            fecha_solicitud,
            fecha_requerida,
            prioridad,
            observaciones,
            id_tipo_traslado,
            id_tipo_elemento,
            elemento,
            cedula_paciente,
            origen,
            destino,
            hora_salida_estimada,
            hora_llegada_estimada,
            hora_salida_real,
            hora_llegada_destino,
            id_vehiculo,
            id_conductor,
            id_enfermero,
            id_func_solicitante,
            id_func_gestor,
            fecha_gestion,
            id_estado
        )
        VALUES (
            TIMESTAMPADD(HOUR, -6, v_base),
            v_fecha_requerida,
            v_prioridad,
            CONCAT(
                '[DEMO-MASS] Traslado completado ',
                i
            ),
            v_tipo_traslado,
            v_tipo_elemento,
            v_elemento,
            v_cedula,
            v_origen,
            v_destino,
            v_salida_estimada,
            v_llegada_estimada,
            v_salida_real,
            v_llegada_destino,
            v_vehiculo,
            v_conductor,
            v_enfermero,
            v_solicitante,
            v_gestor,
            v_fecha_gestion,
            v_estado_completado
        );


        SET v_id_traslado = LAST_INSERT_ID();


        INSERT INTO historial_estado_traslado (
            id_traslado,
            id_estado,
            fecha_hora,
            observacion,
            id_func
        )
        VALUES
            (
                v_id_traslado,
                v_estado_registrado,
                TIMESTAMPADD(HOUR, -6, v_base),
                'Solicitud registrada',
                v_solicitante
            ),
            (
                v_id_traslado,
                v_estado_camino,
                v_salida_real,
                'Salida registrada',
                v_gestor
            ),
            (
                v_id_traslado,
                v_estado_destino,
                v_llegada_destino,
                'Llegada al destino',
                v_gestor
            ),
            (
                v_id_traslado,
                v_estado_retornando,
                TIMESTAMPADD(HOUR, -1, v_base),
                'Retorno iniciado',
                v_gestor
            ),
            (
                v_id_traslado,
                v_estado_completado,
                v_base,
                'Traslado completado',
                v_gestor
            );


        SET i = i + 1;

    END WHILE;


    -- =====================================================
    -- 10 TRASLADOS ACTIVOS
    -- =====================================================

    WHILE j <= 10 DO

        SET v_elemento = NULL;
        SET v_cedula = NULL;
        SET v_enfermero = NULL;

        SET v_fecha_gestion = NULL;
        SET v_salida_estimada = NULL;
        SET v_llegada_estimada = NULL;
        SET v_salida_real = NULL;
        SET v_llegada_destino = NULL;

        SET v_vehiculo = NULL;
        SET v_conductor = NULL;


        IF MOD(j, 2) = 1 THEN

            SET v_tipo_elemento = v_elemento_paciente;

            SET v_cedula = CAST(
                50000000 + j
                AS CHAR
            );

            SET v_tipo_traslado =
                v_traslado_otro_centro;

            SET v_origen =
                'Hospital de Clínicas';

            SET v_destino =
                'Hospital Maciel';

        ELSE

            SET v_tipo_elemento =
                v_elemento_equipamiento;

            SET v_elemento = CONCAT(
                'Equipo médico activo ',
                j
            );

            SET v_tipo_traslado =
                v_traslado_otro;

            SET v_origen =
                'Hospital de Clínicas';

            SET v_destino = CONCAT(
                'Centro asistencial ',
                j
            );

        END IF;


        IF MOD(j, 3) = 0 THEN
            SET v_prioridad = 'URGENTE';
        ELSE
            SET v_prioridad = 'NORMAL';
        END IF;


        IF MOD(j, 2) = 0 THEN
            SET v_solicitante = v_solicitante2;
        ELSE
            SET v_solicitante = v_medico;
        END IF;


        SET v_fecha_requerida =
            DATE(
                TIMESTAMPADD(
                    DAY,
                    1 + MOD(j, 2),
                    NOW()
                )
            );


        -- 1 y 2: registrados sin asignar

        IF j <= 2 THEN

            SET v_estado_actual =
                v_estado_registrado;


        -- 3 y 4: registrados asignados

        ELSEIF j <= 4 THEN

            SET v_estado_actual =
                v_estado_registrado;

            SET v_fecha_gestion =
                TIMESTAMPADD(
                    HOUR,
                    -1,
                    NOW()
                );

            SET v_salida_estimada =
                TIMESTAMPADD(
                    HOUR,
                    j,
                    NOW()
                );

            SET v_llegada_estimada =
                TIMESTAMPADD(
                    HOUR,
                    j + 1,
                    NOW()
                );


        -- 5 y 6: en camino

        ELSEIF j <= 6 THEN

            SET v_estado_actual =
                v_estado_camino;

            SET v_fecha_gestion =
                TIMESTAMPADD(
                    HOUR,
                    -2,
                    NOW()
                );

            SET v_salida_estimada =
                TIMESTAMPADD(
                    MINUTE,
                    -30,
                    NOW()
                );

            SET v_llegada_estimada =
                TIMESTAMPADD(
                    MINUTE,
                    30,
                    NOW()
                );

            SET v_salida_real =
                TIMESTAMPADD(
                    MINUTE,
                    -20,
                    NOW()
                );


        -- 7 y 8: llegaron al destino

        ELSEIF j <= 8 THEN

            SET v_estado_actual =
                v_estado_destino;

            SET v_fecha_gestion =
                TIMESTAMPADD(
                    HOUR,
                    -4,
                    NOW()
                );

            SET v_salida_estimada =
                TIMESTAMPADD(
                    HOUR,
                    -2,
                    NOW()
                );

            SET v_llegada_estimada =
                TIMESTAMPADD(
                    HOUR,
                    -1,
                    NOW()
                );

            SET v_salida_real =
                TIMESTAMPADD(
                    MINUTE,
                    -110,
                    NOW()
                );

            SET v_llegada_destino =
                TIMESTAMPADD(
                    MINUTE,
                    -55,
                    NOW()
                );


        -- 9 y 10: retornando

        ELSE

            SET v_estado_actual =
                v_estado_retornando;

            SET v_fecha_gestion =
                TIMESTAMPADD(
                    HOUR,
                    -5,
                    NOW()
                );

            SET v_salida_estimada =
                TIMESTAMPADD(
                    HOUR,
                    -3,
                    NOW()
                );

            SET v_llegada_estimada =
                TIMESTAMPADD(
                    HOUR,
                    -2,
                    NOW()
                );

            SET v_salida_real =
                TIMESTAMPADD(
                    MINUTE,
                    -170,
                    NOW()
                );

            SET v_llegada_destino =
                TIMESTAMPADD(
                    MINUTE,
                    -110,
                    NOW()
                );

        END IF;


        IF j > 2 THEN

            IF MOD(j, 2) = 0 THEN
                SET v_conductor = v_conductor1;
            ELSE
                SET v_conductor = v_conductor2;
            END IF;


            IF v_tipo_elemento = v_elemento_paciente THEN

                IF MOD(j, 2) = 0 THEN
                    SET v_enfermero = v_enfermero1;
                    SET v_vehiculo = v_ambulancia1;
                ELSE
                    SET v_enfermero = v_enfermero2;
                    SET v_vehiculo = v_ambulancia2;
                END IF;

            ELSE

                SET v_enfermero = NULL;

                IF MOD(j, 2) = 0 THEN
                    SET v_vehiculo = v_auto1;
                ELSE
                    SET v_vehiculo = v_otro1;
                END IF;

            END IF;

        END IF;


        INSERT INTO traslado (
            fecha_solicitud,
            fecha_requerida,
            prioridad,
            observaciones,
            id_tipo_traslado,
            id_tipo_elemento,
            elemento,
            cedula_paciente,
            origen,
            destino,
            hora_salida_estimada,
            hora_llegada_estimada,
            hora_salida_real,
            hora_llegada_destino,
            id_vehiculo,
            id_conductor,
            id_enfermero,
            id_func_solicitante,
            id_func_gestor,
            fecha_gestion,
            id_estado
        )
        VALUES (
            TIMESTAMPADD(
                HOUR,
                -(j + 1),
                NOW()
            ),
            v_fecha_requerida,
            v_prioridad,
            CONCAT(
                '[DEMO-MASS] Traslado activo ',
                j
            ),
            v_tipo_traslado,
            v_tipo_elemento,
            v_elemento,
            v_cedula,
            v_origen,
            v_destino,
            v_salida_estimada,
            v_llegada_estimada,
            v_salida_real,
            v_llegada_destino,
            v_vehiculo,
            v_conductor,
            v_enfermero,
            v_solicitante,

            CASE
                WHEN j > 2
                THEN v_gestor
                ELSE NULL
            END,

            v_fecha_gestion,
            v_estado_actual
        );


        SET v_id_traslado = LAST_INSERT_ID();


        INSERT INTO historial_estado_traslado (
            id_traslado,
            id_estado,
            fecha_hora,
            observacion,
            id_func
        )
        VALUES (
            v_id_traslado,
            v_estado_registrado,
            TIMESTAMPADD(
                HOUR,
                -(j + 1),
                NOW()
            ),
            'Solicitud registrada',
            v_solicitante
        );


        IF j >= 5 THEN

            INSERT INTO historial_estado_traslado (
                id_traslado,
                id_estado,
                fecha_hora,
                observacion,
                id_func
            )
            VALUES (
                v_id_traslado,
                v_estado_camino,
                v_salida_real,
                'Salida registrada',
                v_gestor
            );

        END IF;


        IF j >= 7 THEN

            INSERT INTO historial_estado_traslado (
                id_traslado,
                id_estado,
                fecha_hora,
                observacion,
                id_func
            )
            VALUES (
                v_id_traslado,
                v_estado_destino,
                v_llegada_destino,
                'Llegada al destino',
                v_gestor
            );

        END IF;


        IF j >= 9 THEN

            INSERT INTO historial_estado_traslado (
                id_traslado,
                id_estado,
                fecha_hora,
                observacion,
                id_func
            )
            VALUES (
                v_id_traslado,
                v_estado_retornando,
                TIMESTAMPADD(
                    MINUTE,
                    -95,
                    NOW()
                ),
                'Vehículo retornando',
                v_gestor
            );

        END IF;


        SET j = j + 1;

    END WHILE;

END//

DELIMITER ;


CALL seed_mass_transfers();

DROP PROCEDURE seed_mass_transfers;