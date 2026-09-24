<?php

class TransferAssignmentService
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }


    public function assignTransfer(
        int $idTraslado,
        int $version,
        int $idVehiculo,
        int $idConductor,
        ?int $idEnfermero,
        string $horaSalida,
        string $horaLlegada,
        int $idGestor
    ): int {
        if ($horaLlegada <= $horaSalida) {
            throw new InvalidArgumentException(
                "La hora de llegada debe ser posterior a la hora de salida."
            );
        }

        if (
            $idEnfermero !== null
            && $idEnfermero === $idConductor
        ) {
            throw new InvalidArgumentException(
                "El conductor y el enfermero deben ser funcionarios diferentes."
            );
        }

        try {

            $this->db->beginTransaction();


            // 1. Bloquear traslado

            $transfer = $this->lockTransfer(
                $idTraslado
            );

            if ($transfer === null) {
                throw new RuntimeException(
                    "El traslado no existe.",
                    404
                );
            }

            if (!(bool) $transfer["activo"]) {
                throw new RuntimeException(
                    "El traslado no se encuentra activo.",
                    409
                );
            }

            if ($transfer["estado"] !== "Registrado") {
                throw new RuntimeException(
                    "Solo se pueden asignar recursos a traslados en estado Registrado.",
                    409
                );
            }

            if ($this->isAlreadyAssigned($transfer)) {
                throw new RuntimeException(
                    "El traslado ya fue asignado.",
                    409
                );
            }

            if ((int) $transfer["version"] !== $version) {
                throw new RuntimeException(
                    "El traslado fue modificado por otro usuario. Actualice la información e intente nuevamente.",
                    409
                );
            }


            // 2. Validar enfermero

            $requiresNurse =
                $transfer["tipo_elemento"] === "Paciente";

            if ($requiresNurse && $idEnfermero === null) {
                throw new InvalidArgumentException(
                    "Los traslados de pacientes requieren un enfermero."
                );
            }


            // 3. Bloquear y validar vehículo

            $vehicle = $this->lockVehicle(
                $idVehiculo
            );

            if ($vehicle === null) {
                throw new InvalidArgumentException(
                    "El vehículo seleccionado no existe."
                );
            }

            if ($vehicle["estado"] !== "OPERATIVO") {
                throw new RuntimeException(
                    "El vehículo seleccionado ya no se encuentra disponible.",
                    409
                );
            }

            if (!$this->isVehicleCompatible(
                (int) $transfer["id_tipo_elemento"],
                (int) $vehicle["id_tipo_vehiculo"]
            )) {
                throw new InvalidArgumentException(
                    "El vehículo seleccionado no es compatible con el elemento trasladado."
                );
            }


            // 4. Bloquear funcionarios

            $employeeIds = [$idConductor];

            if ($idEnfermero !== null) {
                $employeeIds[] = $idEnfermero;
            }

            $employeeIds = array_unique(
                $employeeIds
            );

            sort($employeeIds);

            $employees = [];

            foreach ($employeeIds as $idFuncionario) {

                $employee = $this->lockEmployee(
                    $idFuncionario
                );

                if ($employee === null) {
                    throw new InvalidArgumentException(
                        "Uno de los funcionarios seleccionados no existe."
                    );
                }

                if (!(bool) $employee["activo"]) {
                    throw new RuntimeException(
                        "Uno de los funcionarios seleccionados ya no se encuentra disponible.",
                        409
                    );
                }

                $employees[$idFuncionario] =
                    $employee;
            }


            // 5. Validar roles

            if (!$this->employeeHasRole(
                $idConductor,
                "Conductor"
            )) {
                throw new InvalidArgumentException(
                    "El funcionario seleccionado como conductor no tiene el rol Conductor."
                );
            }

            if (
                $idEnfermero !== null
                && !$this->employeeHasRole(
                    $idEnfermero,
                    "Enfermero"
                )
            ) {
                throw new InvalidArgumentException(
                    "El funcionario seleccionado como enfermero no tiene el rol Enfermero."
                );
            }


            // 6. Volver a comprobar disponibilidad

            if ($this->hasOverlap(
                "id_vehiculo",
                $idVehiculo,
                $idTraslado,
                $horaSalida,
                $horaLlegada
            )) {
                throw new RuntimeException(
                    "El vehículo seleccionado ya no está disponible en ese horario.",
                    409
                );
            }

            if ($this->hasOverlap(
                "id_conductor",
                $idConductor,
                $idTraslado,
                $horaSalida,
                $horaLlegada
            )) {
                throw new RuntimeException(
                    "El conductor seleccionado ya no está disponible en ese horario.",
                    409
                );
            }

            if (
                $idEnfermero !== null
                && $this->hasOverlap(
                    "id_enfermero",
                    $idEnfermero,
                    $idTraslado,
                    $horaSalida,
                    $horaLlegada
                )
            ) {
                throw new RuntimeException(
                    "El enfermero seleccionado ya no está disponible en ese horario.",
                    409
                );
            }


            // 7. Asignar

            $sql = "
                UPDATE traslado

                SET
                    id_vehiculo = :id_vehiculo,
                    id_conductor = :id_conductor,
                    id_enfermero = :id_enfermero,

                    hora_salida_estimada =
                        :hora_salida_estimada,

                    hora_llegada_estimada =
                        :hora_llegada_estimada,

                    id_func_gestor =
                        :id_func_gestor,

                    fecha_gestion =
                        CURRENT_TIMESTAMP,

                    version = version + 1

                WHERE
                    id_traslado = :id_traslado
                    AND version = :version
                    AND id_func_gestor IS NULL
            ";

            $stmt = $this->db->prepare($sql);

            $stmt->execute([
                "id_vehiculo" => $idVehiculo,
                "id_conductor" => $idConductor,
                "id_enfermero" => $idEnfermero,
                "hora_salida_estimada" => $horaSalida,
                "hora_llegada_estimada" => $horaLlegada,
                "id_func_gestor" => $idGestor,
                "id_traslado" => $idTraslado,
                "version" => $version
            ]);

            if ($stmt->rowCount() !== 1) {
                throw new RuntimeException(
                    "El traslado fue modificado por otro usuario.",
                    409
                );
            }


            $newVersion =
                (int) $transfer["version"] + 1;


            $this->db->commit();

            return $newVersion;
        } catch (Throwable $e) {

            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            throw $e;
        }
    }


    private function lockTransfer(
        int $idTraslado
    ): ?array {
        $sql = "
            SELECT
                t.id_traslado,
                t.version,
                t.activo,

                t.id_tipo_elemento,
                te.nombre AS tipo_elemento,

                t.id_vehiculo,
                t.id_conductor,
                t.id_enfermero,

                t.id_func_gestor,
                t.fecha_gestion,

                t.hora_salida_estimada,
                t.hora_llegada_estimada,

                et.nombre AS estado

            FROM traslado t

            INNER JOIN tipo_elemento te
                ON te.id_tipo_elemento =
                    t.id_tipo_elemento

            INNER JOIN estado_traslado et
                ON et.id_estado =
                    t.id_estado

            WHERE t.id_traslado =
                :id_traslado

            LIMIT 1

            FOR UPDATE
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->bindValue(
            ":id_traslado",
            $idTraslado,
            PDO::PARAM_INT
        );

        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }


    private function isAlreadyAssigned(
        array $transfer
    ): bool {
        return
            $transfer["id_func_gestor"] !== null
            || $transfer["fecha_gestion"] !== null
            || $transfer["id_vehiculo"] !== null
            || $transfer["id_conductor"] !== null
            || $transfer["hora_salida_estimada"] !== null
            || $transfer["hora_llegada_estimada"] !== null;
    }


    private function lockVehicle(
        int $idVehiculo
    ): ?array {
        $sql = "
            SELECT
                id_vehiculo,
                id_tipo_vehiculo,
                estado

            FROM vehiculo

            WHERE id_vehiculo = :id_vehiculo

            LIMIT 1

            FOR UPDATE
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->bindValue(
            ":id_vehiculo",
            $idVehiculo,
            PDO::PARAM_INT
        );

        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }


    private function lockEmployee(
        int $idFuncionario
    ): ?array {
        $sql = "
            SELECT
                id_func,
                activo

            FROM funcionario

            WHERE id_func = :id_func

            LIMIT 1

            FOR UPDATE
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->bindValue(
            ":id_func",
            $idFuncionario,
            PDO::PARAM_INT
        );

        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }


    private function isVehicleCompatible(
        int $idTipoElemento,
        int $idTipoVehiculo
    ): bool {
        $sql = "
            SELECT 1

            FROM compatibilidad_transporte

            WHERE
                id_tipo_elemento =
                    :id_tipo_elemento

                AND id_tipo_vehiculo =
                    :id_tipo_vehiculo

            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            "id_tipo_elemento" =>
            $idTipoElemento,

            "id_tipo_vehiculo" =>
            $idTipoVehiculo
        ]);

        return $stmt->fetchColumn() !== false;
    }


    private function employeeHasRole(
        int $idFuncionario,
        string $role
    ): bool {
        $sql = "
            SELECT 1

            FROM rol_usuario ru

            INNER JOIN rol r
                ON r.id_rol = ru.id_rol

            WHERE
                ru.id_func = :id_func
                AND r.nombre = :rol

            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            "id_func" =>
            $idFuncionario,

            "rol" =>
            $role
        ]);

        return $stmt->fetchColumn() !== false;
    }


    private function hasOverlap(
        string $column,
        int $resourceId,
        int $idTraslado,
        string $inicio,
        string $fin
    ): bool {
        $allowedColumns = [
            "id_vehiculo",
            "id_conductor",
            "id_enfermero"
        ];

        if (!in_array(
            $column,
            $allowedColumns,
            true
        )) {
            throw new InvalidArgumentException(
                "Recurso no válido."
            );
        }

        $sql = "
    SELECT 1

    FROM traslado t

    INNER JOIN estado_traslado et
        ON et.id_estado = t.id_estado

    WHERE
        t.$column = :resource_id

        AND t.id_traslado <> :id_traslado

        AND t.activo = TRUE

        AND et.nombre <> 'Completado'

        AND t.hora_salida_estimada IS NOT NULL
        AND t.hora_llegada_estimada IS NOT NULL

        AND t.hora_salida_estimada < :fin
        AND t.hora_llegada_estimada > :inicio

    LIMIT 1

    FOR UPDATE
";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            "resource_id" =>
            $resourceId,

            "id_traslado" =>
            $idTraslado,

            "inicio" =>
            $inicio,

            "fin" =>
            $fin
        ]);

        return $stmt->fetchColumn() !== false;
    }
}
