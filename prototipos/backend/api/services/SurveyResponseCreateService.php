<?php

class SurveyResponseCreateService
{
    private PDO $db;


    public function __construct(PDO $db)
    {
        $this->db = $db;
    }


    public function createResponse(
        int $idEncuesta,
        ?string $cedula,
        array $respuestas
    ): int {

        $this->db->beginTransaction();

        try {

            // CONSULTAR Y BLOQUEAR ENCUESTA

            $stmt = $this->db->prepare("
                SELECT
                    id_encuesta,
                    id_cat,
                    anonima,
                    activo
                FROM encuesta
                WHERE id_encuesta = :id_encuesta
                FOR UPDATE
            ");

            $stmt->execute([
                "id_encuesta" => $idEncuesta
            ]);

            $encuesta = $stmt->fetch(PDO::FETCH_ASSOC);


            if (!$encuesta || !(bool) $encuesta["activo"]) {

                throw new RuntimeException(
                    "La encuesta no existe o no está disponible.",
                    404
                );
            }


            // COMPROBAR CATEGORÍA

            if ($encuesta["id_cat"] !== null) {

                $stmt = $this->db->prepare("
                    SELECT activo
                    FROM categoria
                    WHERE id_cat = :id_cat
                ");

                $stmt->execute([
                    "id_cat" => $encuesta["id_cat"]
                ]);

                if (!(bool) $stmt->fetchColumn()) {

                    throw new RuntimeException(
                        "La encuesta no está disponible.",
                        404
                    );
                }
            }


            // ANONIMATO

            if ((bool) $encuesta["anonima"]) {

                if ($cedula !== null) {

                    throw new InvalidArgumentException(
                        "Las encuestas anónimas no admiten cédula."
                    );
                }

                $cedula = null;
            } elseif ($cedula === null) {

                throw new InvalidArgumentException(
                    "La cédula es obligatoria para esta encuesta."
                );
            }


            // OBTENER PREGUNTAS ACTIVAS Y OPCIONES

            $stmt = $this->db->prepare("
                SELECT
                    p.id_pregunta,
                    p.tipo,
                    p.obligatoria,
                    o.id_opcion

                FROM pregunta p

                LEFT JOIN opcion_respuesta o
                    ON o.id_pregunta = p.id_pregunta

                WHERE
                    p.id_encuesta = :id_encuesta
                    AND p.activa = TRUE

                ORDER BY
                    p.orden ASC,
                    o.id_opcion ASC
            ");

            $stmt->execute([
                "id_encuesta" => $idEncuesta
            ]);

            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $preguntas = [];


            foreach ($rows as $row) {

                $idPregunta = (int) $row["id_pregunta"];

                if (!isset($preguntas[$idPregunta])) {

                    $preguntas[$idPregunta] = [
                        "tipo" => $row["tipo"],
                        "obligatoria" => (bool) $row["obligatoria"],
                        "opciones" => []
                    ];
                }

                if ($row["id_opcion"] !== null) {

                    $idOpcion = (int) $row["id_opcion"];

                    $preguntas[$idPregunta]["opciones"][$idOpcion] = true;
                }
            }


            if (empty($preguntas)) {

                throw new RuntimeException(
                    "La encuesta no tiene preguntas disponibles.",
                    409
                );
            }


            // VALIDAR RESPUESTAS RECIBIDAS

            $respondidas = [];

            foreach ($respuestas as $respuesta) {

                $idPregunta = $respuesta["id_pregunta"];

                if (!isset($preguntas[$idPregunta])) {

                    throw new InvalidArgumentException(
                        "La pregunta $idPregunta no pertenece a la encuesta o está inactiva."
                    );
                }

                if (isset($respondidas[$idPregunta])) {

                    throw new InvalidArgumentException(
                        "La pregunta $idPregunta está repetida."
                    );
                }

                $pregunta = $preguntas[$idPregunta];

                $tipo = $pregunta["tipo"];

                $idOpcion = $respuesta["id_opcion"];
                $texto = $respuesta["respuesta"];


                // PREGUNTA ABIERTA

                if ($tipo === "abierta") {

                    if (
                        $texto === null
                        || $idOpcion !== null
                    ) {

                        throw new InvalidArgumentException(
                            "La pregunta $idPregunta requiere una respuesta escrita."
                        );
                    }
                } else {

                    // CERRADA O SELECCIÓN

                    if (
                        $idOpcion === null
                        || $texto !== null
                    ) {

                        throw new InvalidArgumentException(
                            "La pregunta $idPregunta requiere seleccionar una opción."
                        );
                    }

                    if (!isset($pregunta["opciones"][$idOpcion])) {

                        throw new InvalidArgumentException(
                            "La opción seleccionada no pertenece a la pregunta $idPregunta."
                        );
                    }
                }

                $respondidas[$idPregunta] = true;
            }


            // COMPROBAR PREGUNTAS OBLIGATORIAS

            foreach ($preguntas as $idPregunta => $pregunta) {

                if (
                    $pregunta["obligatoria"]
                    && !isset($respondidas[$idPregunta])
                ) {

                    throw new InvalidArgumentException(
                        "Falta responder la pregunta obligatoria $idPregunta."
                    );
                }
            }


            // INSERTAR RESPUESTA GENERAL

            $stmt = $this->db->prepare("
                INSERT INTO respuesta_encuesta (
                    id_encuesta,
                    cedula
                )
                VALUES (
                    :id_encuesta,
                    :cedula
                )
            ");

            $stmt->bindValue(
                ":id_encuesta",
                $idEncuesta,
                PDO::PARAM_INT
            );

            $stmt->bindValue(
                ":cedula",
                $cedula,
                $cedula === null
                    ? PDO::PARAM_NULL
                    : PDO::PARAM_STR
            );

            $stmt->execute();

            $idRespuesta = (int) $this->db->lastInsertId();


            // INSERTAR DETALLES

            $stmt = $this->db->prepare("
                INSERT INTO detalle_respuesta (
                    id_pregunta,
                    id_respuesta_encuesta,
                    id_opcion,
                    respuesta
                )
                VALUES (
                    :id_pregunta,
                    :id_respuesta_encuesta,
                    :id_opcion,
                    :respuesta
                )
            ");


            foreach ($respuestas as $respuesta) {

                $idOpcion = $respuesta["id_opcion"];
                $texto = $respuesta["respuesta"];

                $stmt->bindValue(
                    ":id_pregunta",
                    $respuesta["id_pregunta"],
                    PDO::PARAM_INT
                );

                $stmt->bindValue(
                    ":id_respuesta_encuesta",
                    $idRespuesta,
                    PDO::PARAM_INT
                );

                $stmt->bindValue(
                    ":id_opcion",
                    $idOpcion,
                    $idOpcion === null
                        ? PDO::PARAM_NULL
                        : PDO::PARAM_INT
                );

                $stmt->bindValue(
                    ":respuesta",
                    $texto,
                    $texto === null
                        ? PDO::PARAM_NULL
                        : PDO::PARAM_STR
                );

                $stmt->execute();
            }


            // CONFIRMAR TRANSACCIÓN

            $this->db->commit();

            return $idRespuesta;
        } catch (Throwable $e) {

            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            throw $e;
        }
    }
}
