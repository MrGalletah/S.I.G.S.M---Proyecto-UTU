
<?php

class SurveyQuestionCreateService
{
    private PDO $db;


    public function __construct(PDO $db)
    {
        $this->db = $db;
    }


    // CREAR PREGUNTA CON SUS OPCIONES

    public function createQuestion(
        int $idEncuesta,
        string $texto,
        string $tipo,
        bool $obligatoria,
        int $orden,
        array $opciones
    ): int {

        $this->db->beginTransaction();

        try {

            // COMPROBAR ENCUESTA

            $sql = "
                SELECT activo
                FROM encuesta
                WHERE id_encuesta = :id_encuesta
                FOR UPDATE
            ";

            $stmt = $this->db->prepare($sql);

            $stmt->execute([
                "id_encuesta" => $idEncuesta
            ]);

            $encuesta = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$encuesta) {

                throw new RuntimeException(
                    "La encuesta no existe.",
                    404
                );
            }


            // NO MODIFICAR ENCUESTAS PUBLICADAS

            if ((bool) $encuesta["activo"]) {

                throw new RuntimeException(
                    "No se pueden agregar preguntas a una encuesta activa.",
                    409
                );
            }


            // COMPROBAR SI EXISTEN RESPUESTAS

            $sql = "
                SELECT 1
                FROM respuesta_encuesta
                WHERE id_encuesta = :id_encuesta
                LIMIT 1
            ";

            $stmt = $this->db->prepare($sql);

            $stmt->execute([
                "id_encuesta" => $idEncuesta
            ]);

            if ($stmt->fetchColumn() !== false) {

                throw new RuntimeException(
                    "No se pueden modificar encuestas que ya tienen respuestas.",
                    409
                );
            }


            // INSERTAR PREGUNTA

            $sql = "
                INSERT INTO pregunta (
                    id_encuesta,
                    texto,
                    tipo,
                    obligatoria,
                    orden
                )
                VALUES (
                    :id_encuesta,
                    :texto,
                    :tipo,
                    :obligatoria,
                    :orden
                )
            ";

            $stmt = $this->db->prepare($sql);

            $stmt->execute([
                "id_encuesta" => $idEncuesta,
                "texto" => $texto,
                "tipo" => $tipo,
                "obligatoria" => $obligatoria ? 1 : 0,
                "orden" => $orden
            ]);

            $idPregunta = (int) $this->db->lastInsertId();


            // INSERTAR OPCIONES

            if (!empty($opciones)) {

                $sql = "
                    INSERT INTO opcion_respuesta (
                        id_pregunta,
                        texto,
                        valor
                    )
                    VALUES (
                        :id_pregunta,
                        :texto,
                        :valor
                    )
                ";

                $stmt = $this->db->prepare($sql);

                foreach ($opciones as $opcion) {

                    $stmt->execute([
                        "id_pregunta" => $idPregunta,
                        "texto" => $opcion["texto"],
                        "valor" => $opcion["valor"]
                    ]);
                }
            }


            // CONFIRMAR TRANSACCIÓN

            $this->db->commit();

            return $idPregunta;
        } catch (Throwable $e) {

            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            throw $e;
        }
    }
}
