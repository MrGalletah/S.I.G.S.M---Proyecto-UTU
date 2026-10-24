
<?php

class SurveyQuestionUpdateService
{
    private PDO $db;


    public function __construct(PDO $db)
    {
        $this->db = $db;
    }


    public function updateQuestion(
        int $idPregunta,
        array $campos
    ): void {

        $this->db->beginTransaction();

        try {

            // OBTENER ENCUESTA DE LA PREGUNTA

            $stmt = $this->db->prepare("
                SELECT id_encuesta
                FROM pregunta
                WHERE id_pregunta = :id_pregunta
            ");

            $stmt->execute([
                "id_pregunta" => $idPregunta
            ]);

            $idEncuesta = $stmt->fetchColumn();

            if ($idEncuesta === false) {
                throw new RuntimeException(
                    "La pregunta no existe.",
                    404
                );
            }


            // BLOQUEAR ENCUESTA

            $stmt = $this->db->prepare("
                SELECT activo
                FROM encuesta
                WHERE id_encuesta = :id_encuesta
                FOR UPDATE
            ");

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

            if ((bool) $encuesta["activo"]) {
                throw new RuntimeException(
                    "No se pueden editar preguntas de una encuesta activa.",
                    409
                );
            }


            // COMPROBAR RESPUESTAS EXISTENTES

            $stmt = $this->db->prepare("
                SELECT 1
                FROM respuesta_encuesta
                WHERE id_encuesta = :id_encuesta
                LIMIT 1
            ");

            $stmt->execute([
                "id_encuesta" => $idEncuesta
            ]);

            if ($stmt->fetchColumn() !== false) {
                throw new RuntimeException(
                    "No se pueden editar preguntas de una encuesta que ya tiene respuestas.",
                    409
                );
            }


            // OBTENER PREGUNTA ACTUAL

            $stmt = $this->db->prepare("
                SELECT tipo
                FROM pregunta
                WHERE id_pregunta = :id_pregunta
                FOR UPDATE
            ");

            $stmt->execute([
                "id_pregunta" => $idPregunta
            ]);

            $pregunta = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$pregunta) {
                throw new RuntimeException(
                    "La pregunta no existe.",
                    404
                );
            }


            // VALIDAR TIPO Y OPCIONES RESULTANTES

            $tipo = $campos["tipo"] ?? $pregunta["tipo"];

            if (array_key_exists("opciones", $campos)) {
                $totalOpciones = count($campos["opciones"]);
            } else {

                $stmt = $this->db->prepare("
                    SELECT COUNT(*)
                    FROM opcion_respuesta
                    WHERE id_pregunta = :id_pregunta
                ");

                $stmt->execute([
                    "id_pregunta" => $idPregunta
                ]);

                $totalOpciones = (int) $stmt->fetchColumn();
            }

            if ($tipo === "abierta" && $totalOpciones !== 0) {
                throw new RuntimeException(
                    "Las preguntas abiertas no admiten opciones.",
                    400
                );
            }

            if (
                $tipo !== "abierta" &&
                ($totalOpciones < 2 || $totalOpciones > 20)
            ) {

                throw new RuntimeException(
                    "Las preguntas cerradas y de selección deben tener entre 2 y 20 opciones.",
                    400
                );
            }


            // ACTUALIZAR CAMPOS DE LA PREGUNTA

            $columnas = [
                "texto",
                "tipo",
                "obligatoria",
                "activa",
                "orden"
            ];

            $set = [];

            foreach ($columnas as $columna) {

                if (array_key_exists($columna, $campos)) {
                    $set[] = "$columna = :$columna";
                }
            }

            if (!empty($set)) {

                $sql = "
                    UPDATE pregunta
                    SET " . implode(", ", $set) . "
                    WHERE id_pregunta = :id_pregunta
                ";

                $stmt = $this->db->prepare($sql);

                foreach ($columnas as $columna) {

                    if (!array_key_exists($columna, $campos)) {
                        continue;
                    }

                    $valor = $campos[$columna];

                    $tipoPDO = match (true) {
                        is_bool($valor) => PDO::PARAM_BOOL,
                        is_int($valor) => PDO::PARAM_INT,
                        default => PDO::PARAM_STR
                    };

                    $stmt->bindValue(
                        ":" . $columna,
                        $valor,
                        $tipoPDO
                    );
                }

                $stmt->bindValue(
                    ":id_pregunta",
                    $idPregunta,
                    PDO::PARAM_INT
                );

                $stmt->execute();
            }


            // REEMPLAZAR OPCIONES SI SE ENVIARON

            if (array_key_exists("opciones", $campos)) {

                $stmt = $this->db->prepare("
                    DELETE FROM opcion_respuesta
                    WHERE id_pregunta = :id_pregunta
                ");

                $stmt->execute([
                    "id_pregunta" => $idPregunta
                ]);


                $stmt = $this->db->prepare("
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
                ");

                foreach ($campos["opciones"] as $opcion) {

                    $stmt->execute([
                        "id_pregunta" => $idPregunta,
                        "texto" => $opcion["texto"],
                        "valor" => $opcion["valor"]
                    ]);
                }
            }


            $this->db->commit();
        } catch (Throwable $e) {

            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            throw $e;
        }
    }
}
