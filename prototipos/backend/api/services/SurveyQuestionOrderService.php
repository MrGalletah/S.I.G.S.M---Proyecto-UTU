
<?php

class SurveyQuestionOrderService
{
    public function __construct(
        private PDO $db
    ) {}


    public function reorder(
        int $idEncuesta,
        array $nuevoOrden
    ): void {

        $this->db->beginTransaction();

        try {

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
                    "No se pueden ordenar preguntas de una encuesta publicada.",
                    409
                );
            }


            // COMPROBAR RESPUESTAS

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
                    "No se pueden ordenar preguntas de una encuesta con respuestas.",
                    409
                );
            }


            // CONSULTAR TODAS LAS PREGUNTAS

            $stmt = $this->db->prepare("
                SELECT id_pregunta, orden
                FROM pregunta
                WHERE id_encuesta = :id_encuesta
                ORDER BY orden
                FOR UPDATE
            ");

            $stmt->execute([
                "id_encuesta" => $idEncuesta
            ]);

            $filas = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $idsActuales = array_map(
                fn($fila) => (int) $fila["id_pregunta"],
                $filas
            );

            $idsEnviados = $nuevoOrden;

            sort($idsActuales, SORT_NUMERIC);
            sort($idsEnviados, SORT_NUMERIC);

            // EVITAR PÉRDIDAS O IDS AJENOS

            if ($idsActuales !== $idsEnviados) {
                throw new RuntimeException(
                    "Las preguntas enviadas no coinciden con la encuesta.",
                    409
                );
            }


            // BUSCAR EL MAYOR ORDEN ACTUAL

            $maxOrden = 0;

            foreach ($filas as $fila) {
                $maxOrden = max(
                    $maxOrden,
                    (int) $fila["orden"]
                );
            }


            $update = $this->db->prepare("
                UPDATE pregunta
                SET orden = :orden
                WHERE
                    id_pregunta = :id_pregunta
                    AND id_encuesta = :id_encuesta
            ");


            // 1. ASIGNAR POSICIONES TEMPORALES

            foreach ($nuevoOrden as $index => $idPregunta) {

                $update->execute([
                    "orden" => $maxOrden + $index + 1,
                    "id_pregunta" => $idPregunta,
                    "id_encuesta" => $idEncuesta
                ]);
            }


            // 2. ASIGNAR POSICIONES DEFINITIVAS

            foreach ($nuevoOrden as $index => $idPregunta) {

                $update->execute([
                    "orden" => $index + 1,
                    "id_pregunta" => $idPregunta,
                    "id_encuesta" => $idEncuesta
                ]);
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
