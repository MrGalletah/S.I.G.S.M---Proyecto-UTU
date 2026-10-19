<?php

declare(strict_types=1);

class UserQueryService
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function getUsers(
        int $page,
        int $limit,
        ?string $search = null,
        string $estado = "all",
        ?int $idRol = null
    ): array {

        $offset = ($page - 1) * $limit;

        $baseWhere = "(
            f.activo = TRUE
            OR EXISTS (
                SELECT 1
                FROM rol_usuario AS x
                WHERE x.id_func = f.id_func
            )
        )";

        $where = [$baseWhere];
        $params = [];

        if ($search !== null && $search !== "") {
            $where[] = "(
                f.nombre LIKE :search_nombre
                OR f.correo LIKE :search_correo
                OR EXISTS (
                    SELECT 1
                    FROM rol_usuario AS sru
                    INNER JOIN rol AS sr
                        ON sr.id_rol = sru.id_rol
                    WHERE sru.id_func = f.id_func
                    AND sr.nombre LIKE :search_rol
                )
            )";

            $searchValue = "%" . $search . "%";

            $params["search_nombre"] = $searchValue;
            $params["search_correo"] = $searchValue;
            $params["search_rol"] = $searchValue;
        }

        if ($estado === "active") {
            $where[] = "f.activo = TRUE";
        } elseif ($estado === "inactive") {
            $where[] = "f.activo = FALSE";
        }

        if ($idRol !== null) {
            $where[] = "EXISTS (
                SELECT 1
                FROM rol_usuario AS fru
                WHERE fru.id_func = f.id_func
                AND fru.id_rol = :id_rol
            )";

            $params["id_rol"] = $idRol;
        }

        $whereSql = implode(" AND ", $where);

        $countStmt = $this->db->prepare(
            "SELECT COUNT(*)
             FROM funcionario AS f
             WHERE $whereSql"
        );

        $this->bindQueryParams($countStmt, $params);
        $countStmt->execute();

        $total = (int) $countStmt->fetchColumn();

        $activeStmt = $this->db->prepare(
            "SELECT COUNT(*)
             FROM funcionario AS f
             WHERE $baseWhere
             AND f.activo = TRUE"
        );
        $activeStmt->execute();

        $totalActivos = (int) $activeStmt->fetchColumn();

        $stmt = $this->db->prepare(
            "SELECT
                f.id_func,
                f.nombre,
                f.correo,
                f.activo
             FROM funcionario AS f
             WHERE $whereSql
             ORDER BY f.nombre ASC, f.id_func ASC
             LIMIT :limit
             OFFSET :offset"
        );

        $this->bindQueryParams($stmt, $params);
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();

        $users = [];

        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $id = (int) $row["id_func"];

            $users[$id] = [
                "id_func" => $id,
                "nombre" => $row["nombre"],
                "correo" => $row["correo"],
                "activo" => (bool) $row["activo"],
                "roles" => [],
            ];
        }

        if (count($users) > 0) {
            $ids = array_keys($users);
            $placeholders = implode(",", array_fill(0, count($ids), "?"));

            $rolesStmt = $this->db->prepare(
                "SELECT
                    ru.id_func,
                    r.id_rol,
                    r.nombre
                 FROM rol_usuario AS ru
                 INNER JOIN rol AS r
                    ON r.id_rol = ru.id_rol
                 WHERE ru.id_func IN ($placeholders)
                 ORDER BY r.id_rol ASC"
            );
            $rolesStmt->execute($ids);

            foreach ($rolesStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
                $users[(int) $row["id_func"]]["roles"][] = [
                    "id_rol" => (int) $row["id_rol"],
                    "nombre" => $row["nombre"],
                ];
            }
        }

        return [
            "usuarios" => array_values($users),
            "total_activos" => $totalActivos,
            "paginacion" => [
                "pagina" => $page,
                "limite" => $limit,
                "total" => $total,
                "total_paginas" => $total === 0
                    ? 0
                    : (int) ceil($total / $limit),
            ],
            "filtros" => [
                "search" => $search,
                "estado" => $estado,
                "id_rol" => $idRol,
            ],
        ];
    }

    private function bindQueryParams(
        PDOStatement $stmt,
        array $params
    ): void {
        foreach ($params as $key => $value) {
            $type = is_int($value)
                ? PDO::PARAM_INT
                : PDO::PARAM_STR;

            $stmt->bindValue(":" . $key, $value, $type);
        }
    }
}