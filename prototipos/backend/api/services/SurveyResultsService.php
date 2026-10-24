
<?php

class SurveyResultsService
{
    private PDO $db;


    public function __construct(PDO $db)
    {
        $this->db = $db;
    }


    public function getResults(int $idEncuesta): ?array
    {
        // OBTENER ENCUESTA

        $stmt = $this->db->prepare("
            SELECT
                e.id_encuesta,
                e.id_cat,
                c.nombre AS categoria,
                e.titulo,
                e.descripcion,
                e.activo

            FROM encuesta e

            LEFT JOIN categoria c
                ON c.id_cat = e.id_cat

            WHERE e.id_encuesta = :id_encuesta
        ");

        $stmt->execute([
            "id_encuesta" => $idEncuesta
        ]);

        $encuesta = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$encuesta) {
            return null;
        }


        // CONTAR FORMULARIOS RECIBIDOS

        $stmt = $this->db->prepare("
            SELECT COUNT(*)
            FROM respuesta_encuesta
            WHERE id_encuesta = :id_encuesta
        ");

        $stmt->execute([
            "id_encuesta" => $idEncuesta
        ]);

        $totalRespuestas = (int) $stmt->fetchColumn();


        // OBTENER PREGUNTAS Y CANTIDAD DE RESPUESTAS

        $stmt = $this->db->prepare("
            SELECT
                p.id_pregunta,
                p.texto,
                p.tipo,
                p.obligatoria,
                p.activa,
                p.orden,

                COUNT(r.id_respuesta_encuesta)
                    AS total_respuestas

            FROM pregunta p

            LEFT JOIN detalle_respuesta d
                ON d.id_pregunta = p.id_pregunta

            LEFT JOIN respuesta_encuesta r
                ON r.id_respuesta_encuesta =
                    d.id_respuesta_encuesta
                AND r.id_encuesta = p.id_encuesta

            WHERE p.id_encuesta = :id_encuesta

            GROUP BY
                p.id_pregunta,
                p.texto,
                p.tipo,
                p.obligatoria,
                p.activa,
                p.orden

            ORDER BY p.orden ASC
        ");

        $stmt->execute([
            "id_encuesta" => $idEncuesta
        ]);

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $preguntas = [];


        foreach ($rows as $row) {

            $idPregunta = (int) $row["id_pregunta"];
            $respondidas = (int) $row["total_respuestas"];

            $preguntas[$idPregunta] = [
                "id_pregunta" => $idPregunta,
                "texto" => $row["texto"],
                "tipo" => $row["tipo"],
                "obligatoria" => (bool) $row["obligatoria"],
                "activa" => (bool) $row["activa"],
                "orden" => (int) $row["orden"],

                "respondidas" => $respondidas,

                "sin_responder" => max(
                    0,
                    $totalRespuestas - $respondidas
                ),

                "opciones" => [],
                "comentarios" => []
            ];
        }


        // CONTAR VOTOS POR OPCIÓN

        $stmt = $this->db->prepare("
            SELECT
                o.id_pregunta,
                o.id_opcion,
                o.texto,
                o.valor,

                COUNT(r.id_respuesta_encuesta)
                    AS cantidad

            FROM opcion_respuesta o

            INNER JOIN pregunta p
                ON p.id_pregunta = o.id_pregunta

            LEFT JOIN detalle_respuesta d
                ON d.id_pregunta = o.id_pregunta
                AND d.id_opcion = o.id_opcion

            LEFT JOIN respuesta_encuesta r
                ON r.id_respuesta_encuesta =
                    d.id_respuesta_encuesta
                AND r.id_encuesta = p.id_encuesta

            WHERE p.id_encuesta = :id_encuesta

            GROUP BY
                o.id_pregunta,
                o.id_opcion,
                o.texto,
                o.valor,
                p.orden

            ORDER BY
                p.orden ASC,
                o.valor ASC,
                o.id_opcion ASC
        ");

        $stmt->execute([
            "id_encuesta" => $idEncuesta
        ]);

        $opciones = $stmt->fetchAll(PDO::FETCH_ASSOC);


        foreach ($opciones as $opcion) {

            $idPregunta = (int) $opcion["id_pregunta"];

            $cantidad = (int) $opcion["cantidad"];

            $respondidas = $preguntas[$idPregunta]["respondidas"];


            // PORCENTAJE SOBRE QUIENES RESPONDIERON
            // ESTA PREGUNTA, NO SOBRE EL TOTAL GENERAL.

            $porcentaje = $respondidas > 0
                ? round(
                    ($cantidad / $respondidas) * 100,
                    2
                )
                : 0;


            $preguntas[$idPregunta]["opciones"][] = [
                "id_opcion" => (int) $opcion["id_opcion"],
                "texto" => $opcion["texto"],
                "valor" => (int) $opcion["valor"],
                "cantidad" => $cantidad,
                "porcentaje" => $porcentaje
            ];
        }


        // RECUPERAR COMENTARIOS DE PREGUNTAS ABIERTAS
        // MÁXIMO 100 COMENTARIOS RECIENTES POR ENCUESTA.

        $stmt = $this->db->prepare("
            SELECT
                d.id_pregunta,
                d.respuesta

            FROM detalle_respuesta d

            INNER JOIN pregunta p
                ON p.id_pregunta = d.id_pregunta

            INNER JOIN respuesta_encuesta r
                ON r.id_respuesta_encuesta =
                    d.id_respuesta_encuesta

            WHERE
                p.id_encuesta = :id_encuesta
                AND r.id_encuesta = :id_encuesta_respuesta
                AND p.tipo = 'abierta'
                AND d.respuesta IS NOT NULL

            ORDER BY
                r.fecha_respuesta DESC,
                d.id_detalle_respuesta DESC

            LIMIT 100
        ");

        $stmt->execute([
            "id_encuesta" => $idEncuesta,
            "id_encuesta_respuesta" => $idEncuesta
        ]);

        $comentarios = $stmt->fetchAll(PDO::FETCH_ASSOC);


        foreach ($comentarios as $comentario) {

            $idPregunta = (int) $comentario["id_pregunta"];

            $preguntas[$idPregunta]["comentarios"][] =
                $comentario["respuesta"];
        }


        // RESULTADO FINAL

        return [
            "id_encuesta" => (int) $encuesta["id_encuesta"],

            "titulo" => $encuesta["titulo"],
            "descripcion" => $encuesta["descripcion"],

            "id_cat" => $encuesta["id_cat"] === null
                ? null
                : (int) $encuesta["id_cat"],

            "categoria" => $encuesta["categoria"],

            "activo" => (bool) $encuesta["activo"],

            "total_respuestas" => $totalRespuestas,

            "limite_comentarios" => 100,

            "preguntas" => array_values($preguntas)
        ];
    }
}
