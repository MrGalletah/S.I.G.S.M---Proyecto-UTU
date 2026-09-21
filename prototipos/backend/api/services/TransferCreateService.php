<?php

class TransferCreateService
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }


    public function createTransfer(
        array $data,
        int $idSolicitante
    ): int {
        $idTipoTraslado = (int) $data["id_tipo_traslado"];
        $idTipoElemento = (int) $data["id_tipo_elemento"];

        $transferType = $this->getTransferTypeById($idTipoTraslado);
        $elementType = $this->getElementTypeById($idTipoElemento);

        if ($transferType === null) {
            throw new InvalidArgumentException(
                "El tipo de traslado no existe."
            );
        }

        if ($elementType === null) {
            throw new InvalidArgumentException(
                "El tipo de elemento no existe."
            );
        }

        if (!(bool) $transferType["activo"]) {
            throw new InvalidArgumentException(
                "El tipo de traslado seleccionado no está disponible."
            );
        }

        $element = $data["elemento"] ?? null;
        $patientId = $data["cedula_paciente"] ?? null;

        if ($elementType["nombre"] === "Paciente") {

            if (
                $patientId === null
                || trim($patientId) === ""
            ) {
                throw new InvalidArgumentException(
                    "La cédula del paciente es obligatoria."
                );
            }

            $element = null;
        } else {

            if (
                $element === null
                || trim($element) === ""
            ) {
                throw new InvalidArgumentException(
                    "La descripción del elemento es obligatoria."
                );
            }

            $patientId = null;
        }

        $this->validateRoute(
            $transferType["nombre"],
            $data["origen"],
            $data["destino"]
        );

        $initialStateId = $this->getStateIdByName(
            "Registrado"
        );

        if ($initialStateId === null) {
            throw new RuntimeException(
                "No se encontró el estado inicial del traslado."
            );
        }

        try {

            $this->db->beginTransaction();

            $sql = "
            INSERT INTO traslado (
                fecha_requerida,
                prioridad,
                observaciones,

                id_tipo_traslado,
                id_tipo_elemento,

                elemento,
                cedula_paciente,

                origen,
                destino,

                id_func_solicitante,
                id_estado
            )
            VALUES (
                :fecha_requerida,
                :prioridad,
                :observaciones,

                :id_tipo_traslado,
                :id_tipo_elemento,

                :elemento,
                :cedula_paciente,

                :origen,
                :destino,

                :id_func_solicitante,
                :id_estado
            )
        ";

            $stmt = $this->db->prepare($sql);

            $stmt->execute([
                "fecha_requerida" =>
                $data["fecha_requerida"],

                "prioridad" =>
                $data["prioridad"],

                "observaciones" =>
                $data["observaciones"],

                "id_tipo_traslado" =>
                $idTipoTraslado,

                "id_tipo_elemento" =>
                $idTipoElemento,

                "elemento" =>
                $element,

                "cedula_paciente" =>
                $patientId,

                "origen" =>
                trim($data["origen"]),

                "destino" =>
                trim($data["destino"]),

                "id_func_solicitante" =>
                $idSolicitante,

                "id_estado" =>
                $initialStateId
            ]);

            $idTransfer = (int) $this->db->lastInsertId();

            $historySql = "
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

            $historyStmt = $this->db->prepare(
                $historySql
            );

            $historyStmt->execute([
                "id_traslado" =>
                $idTransfer,

                "id_estado" =>
                $initialStateId,

                "observacion" =>
                "Solicitud registrada",

                "id_func" =>
                $idSolicitante
            ]);

            $this->db->commit();

            return $idTransfer;
        } catch (Throwable $e) {

            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            throw $e;
        }
    }

    private function getTransferTypeById(
        int $id
    ): ?array {
        $sql = "
        SELECT
            id_tipo_traslado,
            nombre,
            activo
        FROM tipo_traslado
        WHERE id_tipo_traslado = :id
        LIMIT 1
    ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            "id" => $id
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    private function getElementTypeById(
        int $id
    ): ?array {
        $sql = "
        SELECT
            id_tipo_elemento,
            nombre
        FROM tipo_elemento
        WHERE id_tipo_elemento = :id
        LIMIT 1
    ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            "id" => $id
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    private function getStateIdByName(
        string $name
    ): ?int {
        $sql = "
        SELECT id_estado
        FROM estado_traslado
        WHERE nombre = :nombre
        LIMIT 1
    ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            "nombre" => $name
        ]);

        $id = $stmt->fetchColumn();

        return $id !== false
            ? (int) $id
            : null;
    }

    private function validateRoute(
        string $transferType,
        string $origin,
        string $destination
    ): void {
        $hospital = "Hospital de Clínicas";

        $origin = trim($origin);
        $destination = trim($destination);

        if (
            $origin === ""
            || $destination === ""
        ) {
            throw new InvalidArgumentException(
                "El origen y el destino son obligatorios."
            );
        }

        switch ($transferType) {

            case "Traslado interno":

                if (
                    $origin !== $hospital
                    || $destination !== $hospital
                ) {
                    throw new InvalidArgumentException(
                        "El traslado interno debe realizarse dentro del Hospital de Clínicas."
                    );
                }

                break;


            case "Traslado a otro centro":
            case "Traslado a domicilio":

                if ($origin !== $hospital) {
                    throw new InvalidArgumentException(
                        "Este tipo de traslado debe salir desde el Hospital de Clínicas."
                    );
                }

                if ($origin === $destination) {
                    throw new InvalidArgumentException(
                        "El origen y el destino no pueden ser iguales."
                    );
                }

                break;


            case "Retorno al hospital":

                if ($destination !== $hospital) {
                    throw new InvalidArgumentException(
                        "El destino debe ser el Hospital de Clínicas."
                    );
                }

                if ($origin === $destination) {
                    throw new InvalidArgumentException(
                        "El origen y el destino no pueden ser iguales."
                    );
                }

                break;


            case "Otro":

                if ($origin === $destination) {
                    throw new InvalidArgumentException(
                        "El origen y el destino no pueden ser iguales."
                    );
                }

                break;
        }
    }
}