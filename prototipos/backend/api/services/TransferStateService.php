<?php

class TransferStateService
{
    private PDO $db;

    private const TRANSITIONS = [
        "Registrado" => "En camino",
        "En camino" => "Llegó al destino",
        "Llegó al destino" => "Retornando",
        "Retornando" => "Completado"
    ];


    public function __construct(PDO $db)
    {
        $this->db = $db;
    }


    public function advanceState(
        int $idTraslado,
        int $version,
        int $idFuncionario,
        ?string $observacion = null
    ): array {
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


            // 2. Comprobar versión

            if ((int) $transfer["version"] !== $version) {
                throw new RuntimeException(
                    "El traslado fue modificado por otro usuario. Actualice la información e intente nuevamente.",
                    409
                );
            }


            $currentState = $transfer["estado"];


            // 3. Comprobar que exista transición siguiente

            if (!isset(self::TRANSITIONS[$currentState])) {
                throw new RuntimeException(
                    "El traslado ya se encuentra completado.",
                    409
                );
            }


            $nextState = self::TRANSITIONS[$currentState];


            // 4. Antes de salir, debe estar correctamente asignado

            if ($currentState === "Registrado") {
                $this->validateAssignment($transfer);
            }


            // 5. Buscar ID del nuevo estado

            $nextStateId = $this->getStateIdByName(
                $nextState
            );

            if ($nextStateId === null) {
                throw new RuntimeException(
                    "No se encontró el siguiente estado del traslado.",
                    500
                );
            }


            // 6. Actualizar traslado

            $this->updateTransferState(
                $idTraslado,
                $version,
                $nextStateId,
                $nextState
            );


            // 7. Registrar historial

            $this->insertHistory(
                $idTraslado,
                $nextStateId,
                $idFuncionario,
                $observacion
            );


            $newVersion = $version + 1;


            $this->db->commit();


            return [
                "id_traslado" => $idTraslado,

                "estado_anterior" => $currentState,

                "estado_actual" => $nextState,

                "version" => $newVersion
            ];

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

                t.id_vehiculo,
                t.id_conductor,
                t.id_enfermero,

                t.id_func_gestor,

                t.hora_salida_estimada,
                t.hora_llegada_estimada,

                t.id_tipo_elemento,
                te.nombre AS tipo_elemento,

                et.nombre AS estado

            FROM traslado t

            INNER JOIN estado_traslado et
                ON et.id_estado = t.id_estado

            INNER JOIN tipo_elemento te
                ON te.id_tipo_elemento =
                    t.id_tipo_elemento

            WHERE
                t.id_traslado = :id_traslado

            LIMIT 1

            FOR UPDATE
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            "id_traslado" => $idTraslado
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }


    private function validateAssignment(
        array $transfer
    ): void {
        if (
            $transfer["id_vehiculo"] === null
            || $transfer["id_conductor"] === null
            || $transfer["id_func_gestor"] === null
            || $transfer["hora_salida_estimada"] === null
            || $transfer["hora_llegada_estimada"] === null
        ) {
            throw new RuntimeException(
                "El traslado debe tener los recursos asignados antes de iniciar el recorrido.",
                409
            );
        }


        if (
            $transfer["tipo_elemento"] === "Paciente"
            && $transfer["id_enfermero"] === null
        ) {
            throw new RuntimeException(
                "Los traslados de pacientes requieren un enfermero antes de iniciar el recorrido.",
                409
            );
        }
    }


    private function getStateIdByName(
        string $stateName
    ): ?int {
        $sql = "
            SELECT id_estado

            FROM estado_traslado

            WHERE nombre = :nombre

            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            "nombre" => $stateName
        ]);

        $id = $stmt->fetchColumn();

        return $id !== false
            ? (int) $id
            : null;
    }


    private function updateTransferState(
        int $idTraslado,
        int $version,
        int $idEstado,
        string $stateName
    ): void {
        $extraSql = "";

        if ($stateName === "En camino") {
            $extraSql = ",
                hora_salida_real = CURRENT_TIMESTAMP
            ";
        }

        if ($stateName === "Llegó al destino") {
            $extraSql = ",
                hora_llegada_destino = CURRENT_TIMESTAMP
            ";
        }


        $sql = "
            UPDATE traslado

            SET
                id_estado = :id_estado,
                version = version + 1
                $extraSql

            WHERE
                id_traslado = :id_traslado
                AND version = :version
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            "id_estado" => $idEstado,
            "id_traslado" => $idTraslado,
            "version" => $version
        ]);


        if ($stmt->rowCount() !== 1) {
            throw new RuntimeException(
                "El traslado fue modificado por otro usuario.",
                409
            );
        }
    }


    private function insertHistory(
        int $idTraslado,
        int $idEstado,
        int $idFuncionario,
        ?string $observacion
    ): void {
        $sql = "
            INSERT INTO historial_estado_traslado (
                id_traslado,
                id_estado,
                observacion,
                id_func
            )
            VALUES (
                :id_traslado,
                :id_estado,
                :observacion,
                :id_func
            )
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            "id_traslado" => $idTraslado,
            "id_estado" => $idEstado,
            "observacion" => $observacion,
            "id_func" => $idFuncionario
        ]);
    }
}