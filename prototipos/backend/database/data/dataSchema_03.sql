USE sigsm;


-- =========================================================
-- LIMPIAR DATOS DEMO ANTERIORES
-- =========================================================

DELETE h
FROM historial_estado_traslado h
INNER JOIN traslado t
    ON t.id_traslado = h.id_traslado
WHERE t.observaciones LIKE '[DEMO]%';

DELETE FROM traslado
WHERE observaciones LIKE '[DEMO]%';


-- =========================================================
-- ROLES
-- =========================================================

INSERT IGNORE INTO rol (nombre, descripcion)
VALUES
    (
        'Administrador',
        'Puede administrar funcionarios, roles y acceder a las distintas secciones del sistema'
    ),
    (
        'Gestor de documentación',
        'Puede administrar categorías, documentos y encuestas'
    ),
    (
        'Solicitante de traslado',
        'Puede registrar nuevas solicitudes de traslado'
    ),
    (
        'Gestor de traslados',
        'Puede gestionar solicitudes, asignar recursos y actualizar estados'
    ),
    (
        'Conductor',
        'Funcionario habilitado para conducir vehículos institucionales'
    ),
    (
        'Enfermero',
        'Funcionario de enfermería que puede acompañar traslados'
    ),
    (
        'Médico',
        'Funcionario médico del hospital'
    ),
    (
        'Administrativo',
        'Funcionario administrativo del hospital'
    );


-- =========================================================
-- FUNCIONARIOS DEMO
-- =========================================================

INSERT IGNORE INTO funcionario (
    nombre,
    correo,
    pwd_hash,
    activo
)
VALUES
    (
        'Administrador Demo',
        'admin.demo@sigsm.test',
        '$2y$12$m2m.fthpTYju0XBAp4FUwuTq7xH427gnLfmNELOElFvbRhtVI77ce',
        TRUE
    ),
    (
        'Laura Fernández',
        'laura.fernandez@sigsm.test',
        '$2y$12$m2m.fthpTYju0XBAp4FUwuTq7xH427gnLfmNELOElFvbRhtVI77ce',
        TRUE
    ),
    (
        'Sofía Martínez',
        'sofia.martinez@sigsm.test',
        '$2y$12$m2m.fthpTYju0XBAp4FUwuTq7xH427gnLfmNELOElFvbRhtVI77ce',
        TRUE
    ),
    (
        'Diego Pereira',
        'diego.pereira@sigsm.test',
        '$2y$12$m2m.fthpTYju0XBAp4FUwuTq7xH427gnLfmNELOElFvbRhtVI77ce',
        TRUE
    ),
    (
        'Carlos Rodríguez',
        'carlos.rodriguez@sigsm.test',
        '$2y$12$m2m.fthpTYju0XBAp4FUwuTq7xH427gnLfmNELOElFvbRhtVI77ce',
        TRUE
    ),
    (
        'Martín Silva',
        'martin.silva@sigsm.test',
        '$2y$12$m2m.fthpTYju0XBAp4FUwuTq7xH427gnLfmNELOElFvbRhtVI77ce',
        TRUE
    ),
    (
        'María López',
        'maria.lopez@sigsm.test',
        '$2y$12$m2m.fthpTYju0XBAp4FUwuTq7xH427gnLfmNELOElFvbRhtVI77ce',
        TRUE
    ),
    (
        'Valentina Gómez',
        'valentina.gomez@sigsm.test',
        '$2y$12$m2m.fthpTYju0XBAp4FUwuTq7xH427gnLfmNELOElFvbRhtVI77ce',
        TRUE
    );


-- =========================================================
-- IDS FUNCIONARIOS
-- =========================================================

SET @admin = (
    SELECT id_func
    FROM funcionario
    WHERE correo = 'admin.demo@sigsm.test'
);

SET @medico = (
    SELECT id_func
    FROM funcionario
    WHERE correo = 'laura.fernandez@sigsm.test'
);

SET @enfermero_solicitante = (
    SELECT id_func
    FROM funcionario
    WHERE correo = 'sofia.martinez@sigsm.test'
);

SET @gestor = (
    SELECT id_func
    FROM funcionario
    WHERE correo = 'diego.pereira@sigsm.test'
);

SET @conductor1 = (
    SELECT id_func
    FROM funcionario
    WHERE correo = 'carlos.rodriguez@sigsm.test'
);

SET @conductor2 = (
    SELECT id_func
    FROM funcionario
    WHERE correo = 'martin.silva@sigsm.test'
);

SET @enfermero1 = (
    SELECT id_func
    FROM funcionario
    WHERE correo = 'maria.lopez@sigsm.test'
);

SET @enfermero2 = (
    SELECT id_func
    FROM funcionario
    WHERE correo = 'valentina.gomez@sigsm.test'
);


-- =========================================================
-- IDS ROLES
-- =========================================================

SET @rol_admin = (
    SELECT id_rol
    FROM rol
    WHERE nombre = 'Administrador'
);

SET @rol_solicitante = (
    SELECT id_rol
    FROM rol
    WHERE nombre = 'Solicitante de traslado'
);

SET @rol_gestor = (
    SELECT id_rol
    FROM rol
    WHERE nombre = 'Gestor de traslados'
);

SET @rol_conductor = (
    SELECT id_rol
    FROM rol
    WHERE nombre = 'Conductor'
);

SET @rol_enfermero = (
    SELECT id_rol
    FROM rol
    WHERE nombre = 'Enfermero'
);

SET @rol_medico = (
    SELECT id_rol
    FROM rol
    WHERE nombre = 'Médico'
);

SET @rol_administrativo = (
    SELECT id_rol
    FROM rol
    WHERE nombre = 'Administrativo'
);


-- =========================================================
-- ASIGNACIÓN DE ROLES
-- =========================================================

INSERT IGNORE INTO rol_usuario (id_func, id_rol)
VALUES
    (@admin, @rol_admin),
    (@admin, @rol_gestor),
    (@admin, @rol_administrativo),

    (@medico, @rol_medico),
    (@medico, @rol_solicitante),

    (@enfermero_solicitante, @rol_enfermero),
    (@enfermero_solicitante, @rol_solicitante),

    (@gestor, @rol_gestor),
    (@gestor, @rol_administrativo),

    (@conductor1, @rol_conductor),
    (@conductor2, @rol_conductor),

    (@enfermero1, @rol_enfermero),
    (@enfermero2, @rol_enfermero);


-- =========================================================
-- TIPOS DE VEHÍCULO
-- =========================================================

SET @tipo_ambulancia = (
    SELECT id_tipo_vehiculo
    FROM tipo_vehiculo
    WHERE nombre = 'Ambulancia'
);

SET @tipo_auto = (
    SELECT id_tipo_vehiculo
    FROM tipo_vehiculo
    WHERE nombre = 'Auto'
);

SET @tipo_otro = (
    SELECT id_tipo_vehiculo
    FROM tipo_vehiculo
    WHERE nombre = 'Otro'
);


-- =========================================================
-- VEHÍCULOS
-- =========================================================

INSERT IGNORE INTO vehiculo (
    matricula,
    modelo,
    id_tipo_vehiculo,
    estado
)
VALUES
    (
        'SAB1001',
        'Mercedes-Benz Sprinter',
        @tipo_ambulancia,
        'OPERATIVO'
    ),
    (
        'SAB1002',
        'Renault Master',
        @tipo_ambulancia,
        'OPERATIVO'
    ),
    (
        'SAA2001',
        'Renault Logan',
        @tipo_auto,
        'OPERATIVO'
    ),
    (
        'SAA2002',
        'Fiat Cronos',
        @tipo_auto,
        'MANTENIMIENTO'
    ),
    (
        'SAT3001',
        'Fiat Fiorino',
        @tipo_otro,
        'OPERATIVO'
    );


SET @ambulancia1 = (
    SELECT id_vehiculo
    FROM vehiculo
    WHERE matricula = 'SAB1001'
);

SET @ambulancia2 = (
    SELECT id_vehiculo
    FROM vehiculo
    WHERE matricula = 'SAB1002'
);

SET @auto1 = (
    SELECT id_vehiculo
    FROM vehiculo
    WHERE matricula = 'SAA2001'
);

SET @otro1 = (
    SELECT id_vehiculo
    FROM vehiculo
    WHERE matricula = 'SAT3001'
);


-- =========================================================
-- TIPOS DE ELEMENTO
-- =========================================================

SET @elemento_paciente = (
    SELECT id_tipo_elemento
    FROM tipo_elemento
    WHERE nombre = 'Paciente'
);

SET @elemento_muestra = (
    SELECT id_tipo_elemento
    FROM tipo_elemento
    WHERE nombre = 'Muestra biológica'
);

SET @elemento_equipamiento = (
    SELECT id_tipo_elemento
    FROM tipo_elemento
    WHERE nombre = 'Equipamiento'
);

SET @elemento_insumo = (
    SELECT id_tipo_elemento
    FROM tipo_elemento
    WHERE nombre = 'Insumo'
);

SET @elemento_otro = (
    SELECT id_tipo_elemento
    FROM tipo_elemento
    WHERE nombre = 'Otro'
);


-- =========================================================
-- COMPATIBILIDADES
-- =========================================================

INSERT IGNORE INTO compatibilidad_transporte (
    id_tipo_elemento,
    id_tipo_vehiculo
)
VALUES
    (@elemento_paciente, @tipo_ambulancia),

    (@elemento_muestra, @tipo_ambulancia),
    (@elemento_muestra, @tipo_auto),

    (@elemento_equipamiento, @tipo_ambulancia),
    (@elemento_equipamiento, @tipo_auto),
    (@elemento_equipamiento, @tipo_otro),

    (@elemento_insumo, @tipo_ambulancia),
    (@elemento_insumo, @tipo_auto),
    (@elemento_insumo, @tipo_otro),

    (@elemento_otro, @tipo_ambulancia),
    (@elemento_otro, @tipo_auto),
    (@elemento_otro, @tipo_otro);


-- =========================================================
-- TIPOS DE TRASLADO
-- =========================================================

SET @traslado_interno = (
    SELECT id_tipo_traslado
    FROM tipo_traslado
    WHERE nombre = 'Traslado interno'
);

SET @traslado_otro_centro = (
    SELECT id_tipo_traslado
    FROM tipo_traslado
    WHERE nombre = 'Traslado a otro centro'
);

SET @traslado_domicilio = (
    SELECT id_tipo_traslado
    FROM tipo_traslado
    WHERE nombre = 'Traslado a domicilio'
);

SET @retorno_hospital = (
    SELECT id_tipo_traslado
    FROM tipo_traslado
    WHERE nombre = 'Retorno al hospital'
);

SET @traslado_otro = (
    SELECT id_tipo_traslado
    FROM tipo_traslado
    WHERE nombre = 'Otro'
);


-- =========================================================
-- ESTADOS
-- =========================================================

SET @estado_registrado = (
    SELECT id_estado
    FROM estado_traslado
    WHERE nombre = 'Registrado'
);

SET @estado_camino = (
    SELECT id_estado
    FROM estado_traslado
    WHERE nombre = 'En camino'
);

SET @estado_destino = (
    SELECT id_estado
    FROM estado_traslado
    WHERE nombre = 'Llegó al destino'
);

SET @estado_retornando = (
    SELECT id_estado
    FROM estado_traslado
    WHERE nombre = 'Retornando'
);

SET @estado_completado = (
    SELECT id_estado
    FROM estado_traslado
    WHERE nombre = 'Completado'
);


-- =========================================================
-- TRASLADO 1
-- REGISTRADO SIN ASIGNAR
-- =========================================================

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
    id_func_solicitante,
    id_estado
)
VALUES (
    NOW() - INTERVAL 30 MINUTE,
    CURDATE() + INTERVAL 1 DAY,
    'URGENTE',
    '[DEMO] Paciente requiere oxígeno durante el traslado.',
    @traslado_otro_centro,
    @elemento_paciente,
    NULL,
    '41234567',
    'Hospital de Clínicas',
    'Hospital Maciel',
    @medico,
    @estado_registrado
);

SET @traslado1 = LAST_INSERT_ID();

INSERT INTO historial_estado_traslado (
    id_traslado,
    id_estado,
    fecha_hora,
    observacion,
    id_func
)
VALUES (
    @traslado1,
    @estado_registrado,
    NOW() - INTERVAL 30 MINUTE,
    'Solicitud registrada',
    @medico
);


-- =========================================================
-- TRASLADO 2
-- ASIGNADO PERO TODAVÍA REGISTRADO
-- =========================================================

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
    id_vehiculo,
    id_conductor,
    id_enfermero,
    id_func_solicitante,
    id_func_gestor,
    fecha_gestion,
    id_estado
)
VALUES (
    NOW() - INTERVAL 3 HOUR,
    CURDATE() + INTERVAL 1 DAY,
    'NORMAL',
    '[DEMO] Traslado de monitor multiparamétrico.',
    @traslado_domicilio,
    @elemento_equipamiento,
    'Monitor multiparamétrico',
    NULL,
    'Hospital de Clínicas',
    'Av. Italia 2870',
    NOW() + INTERVAL 2 HOUR,
    NOW() + INTERVAL 3 HOUR,
    @auto1,
    @conductor1,
    NULL,
    @enfermero_solicitante,
    @gestor,
    NOW() - INTERVAL 1 HOUR,
    @estado_registrado
);

SET @traslado2 = LAST_INSERT_ID();

INSERT INTO historial_estado_traslado (
    id_traslado,
    id_estado,
    fecha_hora,
    observacion,
    id_func
)
VALUES (
    @traslado2,
    @estado_registrado,
    NOW() - INTERVAL 3 HOUR,
    'Solicitud registrada',
    @enfermero_solicitante
);


-- =========================================================
-- TRASLADO 3
-- EN CAMINO
-- =========================================================

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
    id_vehiculo,
    id_conductor,
    id_enfermero,
    id_func_solicitante,
    id_func_gestor,
    fecha_gestion,
    id_estado
)
VALUES (
    NOW() - INTERVAL 6 HOUR,
    CURDATE(),
    'URGENTE',
    '[DEMO] Paciente derivado a otro centro asistencial.',
    @traslado_otro_centro,
    @elemento_paciente,
    NULL,
    '39876543',
    'Hospital de Clínicas',
    'Hospital Pasteur',
    NOW() - INTERVAL 30 MINUTE,
    NOW() + INTERVAL 30 MINUTE,
    NOW() - INTERVAL 20 MINUTE,
    @ambulancia1,
    @conductor1,
    @enfermero1,
    @medico,
    @gestor,
    NOW() - INTERVAL 2 HOUR,
    @estado_camino
);

SET @traslado3 = LAST_INSERT_ID();

INSERT INTO historial_estado_traslado (
    id_traslado,
    id_estado,
    fecha_hora,
    observacion,
    id_func
)
VALUES
    (
        @traslado3,
        @estado_registrado,
        NOW() - INTERVAL 6 HOUR,
        'Solicitud registrada',
        @medico
    ),
    (
        @traslado3,
        @estado_camino,
        NOW() - INTERVAL 20 MINUTE,
        'El vehículo salió del Hospital de Clínicas',
        @gestor
    );


-- =========================================================
-- TRASLADO 4
-- LLEGÓ AL DESTINO
-- =========================================================

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
    NOW() - INTERVAL 8 HOUR,
    CURDATE(),
    'NORMAL',
    '[DEMO] Envío de muestra biológica al laboratorio.',
    @traslado_otro_centro,
    @elemento_muestra,
    'Muestra de sangre',
    NULL,
    'Hospital de Clínicas',
    'Laboratorio Central',
    NOW() - INTERVAL 2 HOUR,
    NOW() - INTERVAL 1 HOUR,
    NOW() - INTERVAL 110 MINUTE,
    NOW() - INTERVAL 55 MINUTE,
    @auto1,
    @conductor2,
    NULL,
    @enfermero_solicitante,
    @gestor,
    NOW() - INTERVAL 4 HOUR,
    @estado_destino
);

SET @traslado4 = LAST_INSERT_ID();

INSERT INTO historial_estado_traslado (
    id_traslado,
    id_estado,
    fecha_hora,
    observacion,
    id_func
)
VALUES
    (
        @traslado4,
        @estado_registrado,
        NOW() - INTERVAL 8 HOUR,
        'Solicitud registrada',
        @enfermero_solicitante
    ),
    (
        @traslado4,
        @estado_camino,
        NOW() - INTERVAL 110 MINUTE,
        'Salida registrada',
        @gestor
    ),
    (
        @traslado4,
        @estado_destino,
        NOW() - INTERVAL 55 MINUTE,
        'Elemento entregado en destino',
        @gestor
    );


-- =========================================================
-- TRASLADO 5
-- RETORNANDO
-- =========================================================

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
    NOW() - INTERVAL 10 HOUR,
    CURDATE(),
    'NORMAL',
    '[DEMO] Traslado de paciente a domicilio.',
    @traslado_domicilio,
    @elemento_paciente,
    NULL,
    '45678901',
    'Hospital de Clínicas',
    'Bulevar Artigas 1825',
    NOW() - INTERVAL 3 HOUR,
    NOW() - INTERVAL 2 HOUR,
    NOW() - INTERVAL 170 MINUTE,
    NOW() - INTERVAL 110 MINUTE,
    @ambulancia2,
    @conductor2,
    @enfermero2,
    @medico,
    @gestor,
    NOW() - INTERVAL 5 HOUR,
    @estado_retornando
);

SET @traslado5 = LAST_INSERT_ID();

INSERT INTO historial_estado_traslado (
    id_traslado,
    id_estado,
    fecha_hora,
    observacion,
    id_func
)
VALUES
    (
        @traslado5,
        @estado_registrado,
        NOW() - INTERVAL 10 HOUR,
        'Solicitud registrada',
        @medico
    ),
    (
        @traslado5,
        @estado_camino,
        NOW() - INTERVAL 170 MINUTE,
        'Salida hacia domicilio',
        @gestor
    ),
    (
        @traslado5,
        @estado_destino,
        NOW() - INTERVAL 110 MINUTE,
        'Paciente llegó al destino',
        @gestor
    ),
    (
        @traslado5,
        @estado_retornando,
        NOW() - INTERVAL 95 MINUTE,
        'Vehículo retornando al hospital',
        @gestor
    );


-- =========================================================
-- TRASLADO 6
-- COMPLETADO
-- =========================================================

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
    NOW() - INTERVAL 1 DAY,
    CURDATE() - INTERVAL 1 DAY,
    'NORMAL',
    '[DEMO] Traslado de insumos médicos.',
    @traslado_otro,
    @elemento_insumo,
    'Cajas de insumos médicos',
    NULL,
    'Hospital de Clínicas',
    'Depósito central',
    NOW() - INTERVAL 20 HOUR,
    NOW() - INTERVAL 19 HOUR,
    NOW() - INTERVAL 1190 MINUTE,
    NOW() - INTERVAL 19 HOUR,
    @otro1,
    @conductor1,
    NULL,
    @enfermero_solicitante,
    @gestor,
    NOW() - INTERVAL 22 HOUR,
    @estado_completado
);

SET @traslado6 = LAST_INSERT_ID();

INSERT INTO historial_estado_traslado (
    id_traslado,
    id_estado,
    fecha_hora,
    observacion,
    id_func
)
VALUES
    (
        @traslado6,
        @estado_registrado,
        NOW() - INTERVAL 1 DAY,
        'Solicitud registrada',
        @enfermero_solicitante
    ),
    (
        @traslado6,
        @estado_camino,
        NOW() - INTERVAL 1190 MINUTE,
        'Salida registrada',
        @gestor
    ),
    (
        @traslado6,
        @estado_destino,
        NOW() - INTERVAL 19 HOUR,
        'Insumos entregados',
        @gestor
    ),
    (
        @traslado6,
        @estado_retornando,
        NOW() - INTERVAL 1125 MINUTE,
        'Retorno iniciado',
        @gestor
    ),
    (
        @traslado6,
        @estado_completado,
        NOW() - INTERVAL 18 HOUR,
        'Traslado finalizado',
        @gestor
    );
