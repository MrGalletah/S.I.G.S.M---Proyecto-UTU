<?php

class SurveyQueryService
{
    private PDO $db;


    public function __construct(PDO $db)
    {
        $this->db = $db;
    }


    // LISTADO DE ENCUESTAS

    public function getSurveys(
        bool $includeInactive = false,
        ?int $idCat = null
    ): array {

        $sql = "
            SELECT
                e.id_encuesta,
                e.id_cat,
                c.nombre AS categoria,
                e.id_func,
                e.titulo,
                e.descripcion,
                e.fecha_creacion,
                e.anonima,
                e.activo,

                (
                    SELECT COUNT(*)
                    FROM respuesta_encuesta r
                    WHERE r.id_encuesta = e.id_encuesta
                ) AS total_respuestas

            FROM encuesta e

            LEFT JOIN categoria c
                ON c.id_cat = e.id_cat
        ";


        // FILTROS

        $where = [];
        $params = [];


        // ENCUESTAS ACTIVAS

        if (!$includeInactive) {

            $where[] = "e.activo = TRUE";

            $where[] = "
                (
                    e.id_cat IS NULL
                    OR c.activo = TRUE
                )
            ";
        }


        // CATEGORÍA

        if ($idCat !== null) {

            $where[] = "e.id_cat = :id_cat";

            $params["id_cat"] = $idCat;
        }


        // CONSTRUIR WHERE

        if (!empty($where)) {

            $sql .= " WHERE "
                . implode(" AND ", $where);
        }


        // ORDEN

        $sql .= "
            ORDER BY
                e.fecha_creacion DESC,
                e.id_encuesta DESC
        ";


        // EJECUTAR CONSULTA

        $stmt = $this->db->prepare($sql);

        $stmt->execute($params);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function getSurveyById(
        int $idEncuesta,
        bool $includeInactive = false
    ): ?array {

        // ENCUESTA

        $sql = "
        SELECT
            e.id_encuesta,
            e.id_cat,
            c.nombre AS categoria,
            e.titulo,
            e.descripcion,
            e.fecha_creacion,
            e.anonima,
            e.activo

        FROM encuesta e

        LEFT JOIN categoria c
            ON c.id_cat = e.id_cat

        WHERE e.id_encuesta = :id_encuesta
    ";

        if (!$includeInactive) {

            $sql .= "
            AND e.activo = TRUE
            AND (
                e.id_cat IS NULL
                OR c.activo = TRUE
            )
        ";
        }

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            "id_encuesta" => $idEncuesta
        ]);

        $encuesta = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$encuesta) {
            return null;
        }


        // PREGUNTAS Y OPCIONES

        $sql = "
        SELECT
            p.id_pregunta,
            p.texto,
            p.tipo,
            p.obligatoria,
            p.activa,
            p.orden,

            o.id_opcion,
            o.texto AS opcion_texto,
            o.valor AS opcion_valor

        FROM pregunta p

        LEFT JOIN opcion_respuesta o
            ON o.id_pregunta = p.id_pregunta

        WHERE p.id_encuesta = :id_encuesta
    ";

        if (!$includeInactive) {
            $sql .= " AND p.activa = TRUE";
        }

        $sql .= "
        ORDER BY
            p.orden ASC,
            o.valor ASC,
            o.id_opcion ASC
    ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            "id_encuesta" => $idEncuesta
        ]);

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);


        // AGRUPAR OPCIONES POR PREGUNTA

        $preguntas = [];

        foreach ($rows as $row) {

            $idPregunta = (int) $row["id_pregunta"];

            if (!isset($preguntas[$idPregunta])) {

                $preguntas[$idPregunta] = [
                    "id_pregunta" => $idPregunta,
                    "texto" => $row["texto"],
                    "tipo" => $row["tipo"],
                    "obligatoria" => (bool) $row["obligatoria"],
                    "activa" => (bool) $row["activa"],
                    "orden" => (int) $row["orden"],
                    "opciones" => []
                ];
            }


            // LAS PREGUNTAS ABIERTAS NO TIENEN OPCIONES

            if ($row["id_opcion"] !== null) {

                $preguntas[$idPregunta]["opciones"][] = [
                    "id_opcion" => (int) $row["id_opcion"],
                    "texto" => $row["opcion_texto"],
                    "valor" => (int) $row["opcion_valor"]
                ];
            }
        }


        // FORMATEAR ENCUESTA

        $encuesta["id_encuesta"] = (int) $encuesta["id_encuesta"];

        $encuesta["id_cat"] = $encuesta["id_cat"] === null
            ? null
            : (int) $encuesta["id_cat"];

        $encuesta["anonima"] = (bool) $encuesta["anonima"];

        $encuesta["activo"] = (bool) $encuesta["activo"];

        $encuesta["preguntas"] = array_values($preguntas);

        return $encuesta;
    }
}
