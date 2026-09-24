<?php

class TransferDeleteService
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }


    public function deleteTransfer(
        int $idTraslado,
        int $version
    ): int {
        try {

            $this->db->beginTransaction();


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
                    "El traslado ya fue dado de baja.",
                    409
                );
            }


            if ($transfer["estado"] !== "Registrado") {
                throw new RuntimeException(
                    "Solo se pueden dar de baja traslados en estado Registrado.",
                    409
                );
            }


            if ($this->isAlreadyAssigned($transfer)) {
                throw new RuntimeException(
                    "No se puede dar de baja un traslado que ya fue asignado.",
                    409
                );
            }


            if ((int) $transfer["version"] !== $version) {
                throw new RuntimeException(
                    "El traslado fue modificado por otro usuario. Actualice la información e intente nuevamente.",
                    409
                );
            }


            $sql = "
                UPDATE traslado

                SET
                    activo = FALSE,
                    fecha_baja = CURRENT_TIMESTAMP,
                    version = version + 1

                WHERE
                    id_traslado = :id_traslado
                    AND version = :version
                    AND activo = TRUE
            ";

            $stmt = $this->db->prepare($sql);

            $stmt->execute([
                "id_traslado" => $idTraslado,
                "version" => $version
            ]);


            if ($stmt->rowCount() !== 1) {
                throw new RuntimeException(
                    "El traslado fue modificado por otro usuario.",
                    409
                );
            }


            $newVersion = $version + 1;


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

                t.id_vehiculo,
                t.id_conductor,
                t.id_enfermero,

                t.id_func_gestor,
                t.fecha_gestion,

                t.hora_salida_estimada,
                t.hora_llegada_estimada,

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


    private function isAlreadyAssigned(
        array $transfer
    ): bool {
        return
            $transfer["id_vehiculo"] !== null
            || $transfer["id_conductor"] !== null
            || $transfer["id_enfermero"] !== null
            || $transfer["id_func_gestor"] !== null
            || $transfer["fecha_gestion"] !== null
            || $transfer["hora_salida_estimada"] !== null
            || $transfer["hora_llegada_estimada"] !== null;
    }
}