
<?php

class SurveyCreateService
{
    private PDO $db;


    public function __construct(PDO $db)
    {
        $this->db = $db;
    }


    // CREAR ENCUESTA

    public function createSurvey(
        int $idFunc,
        ?int $idCat,
        string $titulo,
        ?string $descripcion,
        bool $anonima
    ): int {

        // COMPROBAR CATEGORÍA

        if ($idCat !== null) {

            $sql = "
                SELECT id_cat
                FROM categoria
                WHERE id_cat = :id_cat
            ";

            $stmt = $this->db->prepare($sql);

            $stmt->execute([
                "id_cat" => $idCat
            ]);

            if (!$stmt->fetch()) {

                throw new InvalidArgumentException(
                    "La categoría seleccionada no existe."
                );
            }
        }


        // INSERTAR ENCUESTA

        $sql = "
            INSERT INTO encuesta (
                id_cat,
                id_func,
                titulo,
                descripcion,
                anonima
            )
            VALUES (
                :id_cat,
                :id_func,
                :titulo,
                :descripcion,
                :anonima
            )
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->bindValue(
            ":id_cat",
            $idCat,
            $idCat === null
                ? PDO::PARAM_NULL
                : PDO::PARAM_INT
        );

        $stmt->bindValue(
            ":id_func",
            $idFunc,
            PDO::PARAM_INT
        );

        $stmt->bindValue(
            ":titulo",
            $titulo,
            PDO::PARAM_STR
        );

        $stmt->bindValue(
            ":descripcion",
            $descripcion,
            $descripcion === null
                ? PDO::PARAM_NULL
                : PDO::PARAM_STR
        );

        $stmt->bindValue(
            ":anonima",
            $anonima,
            PDO::PARAM_BOOL
        );

        $stmt->execute();

        return (int) $this->db->lastInsertId();
    }
}
