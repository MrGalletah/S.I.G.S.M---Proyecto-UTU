USE sigsm;

START TRANSACTION;

-- CATEGORÍAS

-- Se utiliza documentacion@sigsm.test como funcionario creador.
-- Las categorías principales quedan activas para que aparezcan
-- directamente en el frontend.

INSERT INTO categoria (id_func, nombre, descripcion, activo)
SELECT
    f.id_func,
    'Nefrología y trasplante',
    'Documentación e indicaciones destinadas a pacientes de nefrología y trasplante.',
    TRUE
FROM funcionario AS f
WHERE f.correo = 'documentacion@sigsm.test'
ON DUPLICATE KEY UPDATE
    id_func = VALUES(id_func),
    descripcion = VALUES(descripcion),
    activo = VALUES(activo);

INSERT INTO categoria (id_func, nombre, descripcion, activo)
SELECT
    f.id_func,
    'Estudios diagnósticos',
    'Preparación e indicaciones para estudios diagnósticos e imagenológicos.',
    TRUE
FROM funcionario AS f
WHERE f.correo = 'documentacion@sigsm.test'
ON DUPLICATE KEY UPDATE
    id_func = VALUES(id_func),
    descripcion = VALUES(descripcion),
    activo = VALUES(activo);

INSERT INTO categoria (id_func, nombre, descripcion, activo)
SELECT
    f.id_func,
    'Tratamientos y medicación',
    'Indicaciones relacionadas con tratamientos, medicamentos y cuidados asociados.',
    TRUE
FROM funcionario AS f
WHERE f.correo = 'documentacion@sigsm.test'
ON DUPLICATE KEY UPDATE
    id_func = VALUES(id_func),
    descripcion = VALUES(descripcion),
    activo = VALUES(activo);

INSERT INTO categoria (id_func, nombre, descripcion, activo)
SELECT
    f.id_func,
    'Procedimientos médicos',
    'Información y preparación previa para procedimientos médicos y quirúrgicos.',
    TRUE
FROM funcionario AS f
WHERE f.correo = 'documentacion@sigsm.test'
ON DUPLICATE KEY UPDATE
    id_func = VALUES(id_func),
    descripcion = VALUES(descripcion),
    activo = VALUES(activo);

INSERT INTO categoria (id_func, nombre, descripcion, activo)
SELECT
    f.id_func,
    'Cuidados y prevención',
    'Material informativo sobre cuidados generales, prevención y recomendaciones para pacientes.',
    TRUE
FROM funcionario AS f
WHERE f.correo = 'documentacion@sigsm.test'
ON DUPLICATE KEY UPDATE
    id_func = VALUES(id_func),
    descripcion = VALUES(descripcion),
    activo = VALUES(activo);

-- Categoría inactiva para probar filtros administrativos
INSERT INTO categoria (id_func, nombre, descripcion, activo)
SELECT
    f.id_func,
    'Material en revisión',
    'Categoría de prueba utilizada para verificar el manejo de categorías inactivas.',
    FALSE
FROM funcionario AS f
WHERE f.correo = 'documentacion@sigsm.test'
ON DUPLICATE KEY UPDATE
    id_func = VALUES(id_func),
    descripcion = VALUES(descripcion),
    activo = VALUES(activo);


-- DOCUMENTOS

-- IMPORTANTE:
-- Las rutas son datos de prueba. Para abrir o descargar realmente
-- estos archivos deberán existir en la ubicación usada por el backend.

-- Nefrología y trasplante

INSERT INTO documento
    (id_cat, id_func, ruta, titulo, activo, descripcion)
SELECT
    c.id_cat,
    f.id_func,
    'uploads/indicaciones_ingreso_nefrologia.pdf',
    'Indicaciones para ingreso a Nefrología',
    TRUE,
    'Información e indicaciones generales para pacientes que ingresan al servicio de nefrología.'
FROM categoria AS c
JOIN funcionario AS f
    ON f.correo = 'documentacion@sigsm.test'
WHERE c.nombre = 'Nefrología y trasplante'
  AND NOT EXISTS (
      SELECT 1
      FROM documento AS d
      WHERE d.id_cat = c.id_cat
        AND d.titulo = 'Indicaciones para ingreso a Nefrología'
  );

INSERT INTO documento
    (id_cat, id_func, ruta, titulo, activo, descripcion)
SELECT
    c.id_cat,
    f.id_func,
    'uploads/plan_alta_enfermeria_nefrologia.pdf',
    'Plan de alta de Enfermería - Nefrología',
    TRUE,
    'Recomendaciones de enfermería para pacientes al momento del alta.'
FROM categoria AS c
JOIN funcionario AS f
    ON f.correo = 'documentacion@sigsm.test'
WHERE c.nombre = 'Nefrología y trasplante'
  AND NOT EXISTS (
      SELECT 1
      FROM documento AS d
      WHERE d.id_cat = c.id_cat
        AND d.titulo = 'Plan de alta de Enfermería - Nefrología'
  );

INSERT INTO documento
    (id_cat, id_func, ruta, titulo, activo, descripcion)
SELECT
    c.id_cat,
    f.id_func,
    'uploads/cuidados_usuario_trasplantado.pdf',
    'Indicaciones de enfermería para usuarios trasplantados',
    TRUE,
    'Cuidados y recomendaciones posteriores al trasplante.'
FROM categoria AS c
JOIN funcionario AS f
    ON f.correo = 'documentacion@sigsm.test'
WHERE c.nombre = 'Nefrología y trasplante'
  AND NOT EXISTS (
      SELECT 1
      FROM documento AS d
      WHERE d.id_cat = c.id_cat
        AND d.titulo = 'Indicaciones de enfermería para usuarios trasplantados'
  );


-- Estudios diagnósticos

INSERT INTO documento
    (id_cat, id_func, ruta, titulo, activo, descripcion)
SELECT
    c.id_cat,
    f.id_func,
    'uploads/preparacion_estudios_imagenologicos.pdf',
    'Preparación para estudios imagenológicos',
    TRUE,
    'Indicaciones previas necesarias para la realización de estudios imagenológicos.'
FROM categoria AS c
JOIN funcionario AS f
    ON f.correo = 'documentacion@sigsm.test'
WHERE c.nombre = 'Estudios diagnósticos'
  AND NOT EXISTS (
      SELECT 1
      FROM documento AS d
      WHERE d.id_cat = c.id_cat
        AND d.titulo = 'Preparación para estudios imagenológicos'
  );

INSERT INTO documento
    (id_cat, id_func, ruta, titulo, activo, descripcion)
SELECT
    c.id_cat,
    f.id_func,
    'uploads/centellograma_perfusion_miocardica.pdf',
    'Centellograma de perfusión miocárdica',
    TRUE,
    'Información para pacientes que deben realizarse un centellograma de perfusión miocárdica.'
FROM categoria AS c
JOIN funcionario AS f
    ON f.correo = 'documentacion@sigsm.test'
WHERE c.nombre = 'Estudios diagnósticos'
  AND NOT EXISTS (
      SELECT 1
      FROM documento AS d
      WHERE d.id_cat = c.id_cat
        AND d.titulo = 'Centellograma de perfusión miocárdica'
  );

INSERT INTO documento
    (id_cat, id_func, ruta, titulo, activo, descripcion)
SELECT
    c.id_cat,
    f.id_func,
    'uploads/ecocardiograma_dobutamina.pdf',
    'Indicaciones para ecocardiograma con dobutamina',
    TRUE,
    'Preparación e indicaciones para la realización de un ecocardiograma con dobutamina.'
FROM categoria AS c
JOIN funcionario AS f
    ON f.correo = 'documentacion@sigsm.test'
WHERE c.nombre = 'Estudios diagnósticos'
  AND NOT EXISTS (
      SELECT 1
      FROM documento AS d
      WHERE d.id_cat = c.id_cat
        AND d.titulo = 'Indicaciones para ecocardiograma con dobutamina'
  );


-- Tratamientos y medicación

INSERT INTO documento
    (id_cat, id_func, ruta, titulo, activo, descripcion)
SELECT
    c.id_cat,
    f.id_func,
    'uploads/tratamiento_warfarina.pdf',
    'Indicaciones para pacientes en tratamiento con warfarina',
    TRUE,
    'Recomendaciones generales para pacientes que se encuentran en tratamiento con warfarina.'
FROM categoria AS c
JOIN funcionario AS f
    ON f.correo = 'documentacion@sigsm.test'
WHERE c.nombre = 'Tratamientos y medicación'
  AND NOT EXISTS (
      SELECT 1
      FROM documento AS d
      WHERE d.id_cat = c.id_cat
        AND d.titulo = 'Indicaciones para pacientes en tratamiento con warfarina'
  );


-- Procedimientos médicos

INSERT INTO documento
    (id_cat, id_func, ruta, titulo, activo, descripcion)
SELECT
    c.id_cat,
    f.id_func,
    'uploads/prostatectomia_radical.pdf',
    'Prostatectomía radical',
    TRUE,
    'Información e indicaciones destinadas a pacientes que serán sometidos a una prostatectomía radical.'
FROM categoria AS c
JOIN funcionario AS f
    ON f.correo = 'documentacion@sigsm.test'
WHERE c.nombre = 'Procedimientos médicos'
  AND NOT EXISTS (
      SELECT 1
      FROM documento AS d
      WHERE d.id_cat = c.id_cat
        AND d.titulo = 'Prostatectomía radical'
  );

INSERT INTO documento
    (id_cat, id_func, ruta, titulo, activo, descripcion)
SELECT
    c.id_cat,
    f.id_func,
    'uploads/ecocardiograma_transesofagico.pdf',
    'Indicaciones para ecocardiograma transesofágico',
    TRUE,
    'Preparación necesaria antes de realizar un ecocardiograma transesofágico.'
FROM categoria AS c
JOIN funcionario AS f
    ON f.correo = 'documentacion@sigsm.test'
WHERE c.nombre = 'Procedimientos médicos'
  AND NOT EXISTS (
      SELECT 1
      FROM documento AS d
      WHERE d.id_cat = c.id_cat
        AND d.titulo = 'Indicaciones para ecocardiograma transesofágico'
  );


-- Cuidados y prevención

INSERT INTO documento
    (id_cat, id_func, ruta, titulo, activo, descripcion)
SELECT
    c.id_cat,
    f.id_func,
    'uploads/prevencion_infecciones.pdf',
    'Prevención de infecciones',
    TRUE,
    'Material informativo con recomendaciones generales para la prevención de infecciones.'
FROM categoria AS c
JOIN funcionario AS f
    ON f.correo = 'documentacion@sigsm.test'
WHERE c.nombre = 'Cuidados y prevención'
  AND NOT EXISTS (
      SELECT 1
      FROM documento AS d
      WHERE d.id_cat = c.id_cat
        AND d.titulo = 'Prevención de infecciones'
  );

INSERT INTO documento
    (id_cat, id_func, ruta, titulo, activo, descripcion)
SELECT
    c.id_cat,
    f.id_func,
    'uploads/pacientes_ostomizados.pdf',
    'Pauta para pacientes ostomizados',
    TRUE,
    'Información y recomendaciones de cuidado para pacientes ostomizados.'
FROM categoria AS c
JOIN funcionario AS f
    ON f.correo = 'documentacion@sigsm.test'
WHERE c.nombre = 'Cuidados y prevención'
  AND NOT EXISTS (
      SELECT 1
      FROM documento AS d
      WHERE d.id_cat = c.id_cat
        AND d.titulo = 'Pauta para pacientes ostomizados'
  );



COMMIT;