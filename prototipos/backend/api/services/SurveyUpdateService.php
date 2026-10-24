
<?php

class SurveyUpdateService
{
    private PDO $db;


    public function __construct(PDO $db)
    {
        $this->db = $db;
    }


    public function updateSurvey(
        int $idEncuesta,
        array $campos
    ): void {

        $this->db->beginTransaction();

        try {

            // CONSULTAR ENCUESTA

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

            if (!$encuesta) {
                throw new RuntimeException(
                    "La encuesta no existe.",
                    404
                );
            }


            // ESTADO RESULTANTE

            $activo = array_key_exists("activo", $campos)
                ? $campos["activo"]
                : (bool) $encuesta["activo"];

            $idCat = array_key_exists("id_cat", $campos)
                ? $campos["id_cat"]
                : (
                    $encuesta["id_cat"] === null
                    ? null
                    : (int) $encuesta["id_cat"]
                );


            // COMPROBAR CATEGORÍA

            if ($idCat !== null) {

                $stmt = $this->db->prepare("
                    SELECT activo
                    FROM categoria
                    WHERE id_cat = :id_cat
                ");

                $stmt->execute([
                    "id_cat" => $idCat
                ]);

                $categoria = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$categoria) {
                    throw new RuntimeException(
                        "La categoría no existe.",
                        400
                    );
                }

                if ($activo && !(bool) $categoria["activo"]) {
                    throw new RuntimeException(
                        "No se puede publicar una encuesta en una categoría inactiva.",
                        409
                    );
                }
            }


            // PROTEGER ENCUESTAS CON RESPUESTAS

            if (
                array_key_exists("anonima", $campos) &&
                $campos["anonima"] !== (bool) $encuesta["anonima"]
            ) {

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
                        "No se puede cambiar el anonimato de una encuesta que ya tiene respuestas.",
                        409
                    );
                }
            }


            // VALIDAR PUBLICACIÓN

            if (
                $activo &&
                !(bool) $encuesta["activo"]
            ) {

                $this->validatePublication($idEncuesta);
            }


            // CONSTRUIR UPDATE

            $columnas = [
                "titulo",
                "descripcion",
                "id_cat",
                "anonima",
                "activo"
            ];

            $set = [];

            foreach ($columnas as $columna) {

                if (array_key_exists($columna, $campos)) {
                    $set[] = "$columna = :$columna";
                }
            }

            $sql = "
                UPDATE encuesta
                SET " . implode(", ", $set) . "
                WHERE id_encuesta = :id_encuesta
            ";

            $stmt = $this->db->prepare($sql);

            foreach ($columnas as $columna) {

                if (!array_key_exists($columna, $campos)) {
                    continue;
                }

                $valor = $campos[$columna];

                $tipo = match (true) {
                    $valor === null => PDO::PARAM_NULL,
                    is_bool($valor) => PDO::PARAM_BOOL,
                    is_int($valor) => PDO::PARAM_INT,
                    default => PDO::PARAM_STR
                };

                $stmt->bindValue(
                    ":" . $columna,
                    $valor,
                    $tipo
                );
            }

            $stmt->bindValue(
                ":id_encuesta",
                $idEncuesta,
                PDO::PARAM_INT
            );

            $stmt->execute();

            $this->db->commit();
        } catch (Throwable $e) {

            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            throw $e;
        }
    }


    // COMPROBAR QUE LA ENCUESTA PUEDE PUBLICARSE

    private function validatePublication(
        int $idEncuesta
    ): void {

        $stmt = $this->db->prepare("
            SELECT
                p.id_pregunta,
                p.tipo,
                COUNT(o.id_opcion) AS total_opciones

            FROM pregunta p

            LEFT JOIN opcion_respuesta o
                ON o.id_pregunta = p.id_pregunta

            WHERE
                p.id_encuesta = :id_encuesta
                AND p.activa = TRUE

            GROUP BY
                p.id_pregunta,
                p.tipo
        ");

        $stmt->execute([
            "id_encuesta" => $idEncuesta
        ]);

        $preguntas = $stmt->fetchAll(PDO::FETCH_ASSOC);


        // AL MENOS UNA PREGUNTA

        if (empty($preguntas)) {

            throw new RuntimeException(
                "La encuesta debe tener al menos una pregunta activa.",
                409
            );
        }


        // COMPROBAR OPCIONES

        foreach ($preguntas as $pregunta) {

            $total = (int) $pregunta["total_opciones"];

            if (
                $pregunta["tipo"] === "abierta" &&
                $total !== 0
            ) {

                throw new RuntimeException(
                    "Las preguntas abiertas no pueden tener opciones.",
                    409
                );
            }

            if (
                in_array(
                    $pregunta["tipo"],
                    ["cerrada", "seleccion"],
                    true
                ) &&
                $total < 2
            ) {

                throw new RuntimeException(
                    "Todas las preguntas cerradas o de selección deben tener al menos dos opciones.",
                    409
                );
            }
        }
    }
}
