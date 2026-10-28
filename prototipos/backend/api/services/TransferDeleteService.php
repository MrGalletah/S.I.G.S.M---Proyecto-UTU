<?php

class TransferDeleteService
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    // CANCELAR TRASLADO

    public function deleteTransfer(
        int $idTraslado,
        int $version,
        int $idFuncionario
    ): int {
        try {
            $this->db->beginTransaction();

            // BLOQUEAR EL REGISTRO

            $transfer = $this->lockTransfer($idTraslado);

            if ($transfer === null) {
                throw new RuntimeException(
                    "El traslado no existe.",
                    404
                );
            }

            // COMPROBAR ESTADO Y VERSIÓN

            if (!(bool) $transfer["activo"]) {
                throw new RuntimeException(
                    "El traslado ya no se encuentra activo.",
                    409
                );
            }

            if ((int) $transfer["version"] !== $version) {
                throw new RuntimeException(
                    "El traslado fue modificado por otro usuario. Actualice la información e intente nuevamente.",
                    409
                );
            }

            if ($transfer["estado"] !== "Registrado") {
                throw new RuntimeException(
                    "Solo se pueden cancelar traslados en estado Registrado.",
                    409
                );
            }

            // NO SE PERMITE CANCELAR SI YA SALIÓ

            if ($transfer["hora_salida_real"] !== null) {
                throw new RuntimeException(
                    "No se puede cancelar un traslado que ya inició su recorrido.",
                    409
                );
            }

            // LOS RECURSOS ASIGNADOS NO IMPIDEN CANCELAR

            // OBTENER ESTADO CANCELADO

            $stmt = $this->db->prepare(
                "SELECT id_estado
                 FROM estado_traslado
                 WHERE nombre = 'Cancelado'
                 LIMIT 1"
            );

            $stmt->execute();

            $idCancelado = $stmt->fetchColumn();

            if ($idCancelado === false) {
                throw new RuntimeException(
                    "No existe el estado Cancelado. Ejecute la migración de base de datos.",
                    500
                );
            }

            // ACTUALIZAR TRASLADO

            $sql = "
                UPDATE traslado
                SET
                    id_estado = :id_estado,
                    activo = FALSE,
                    fecha_baja = CURRENT_TIMESTAMP,
                    version = version + 1
                WHERE
                    id_traslado = :id_traslado
                    AND version = :version
                    AND activo = TRUE
                    AND hora_salida_real IS NULL
            ";

            $stmt = $this->db->prepare($sql);

            $stmt->execute([
                "id_estado" => (int) $idCancelado,
                "id_traslado" => $idTraslado,
                "version" => $version
            ]);

            if ($stmt->rowCount() !== 1) {
                throw new RuntimeException(
                    "El traslado fue modificado por otro usuario.",
                    409
                );
            }

            // REGISTRAR LA CANCELACIÓN EN EL HISTORIAL

            $stmt = $this->db->prepare(
                "INSERT INTO historial_estado_traslado (
                    id_traslado,
                    id_estado,
                    fecha_hora,
                    observacion,
                    id_func
                )
                VALUES (
                    :id_traslado,
                    :id_estado,
                    CURRENT_TIMESTAMP,
                    :observacion,
                    :id_func
                )"
            );

            $stmt->execute([
                "id_traslado" => $idTraslado,
                "id_estado" => (int) $idCancelado,
                "observacion" => "Traslado cancelado antes de su salida.",
                "id_func" => $idFuncionario
            ]);

            $newVersion = $version + 1;

            // CONFIRMAR AMBAS OPERACIONES

            $this->db->commit();

            return $newVersion;
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            throw $e;
        }
    }

    // BLOQUEAR TRASLADO PARA EVITAR CONFLICTOS

    private function lockTransfer(
        int $idTraslado
    ): ?array {
        $sql = "
            SELECT
                t.id_traslado,
                t.version,
                t.activo,
                t.hora_salida_real,
                et.nombre AS estado

            FROM traslado t

            INNER JOIN estado_traslado et
                ON et.id_estado = t.id_estado

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
}
