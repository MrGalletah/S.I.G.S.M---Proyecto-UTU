import { useState } from "react";

import { Stack } from "@mui/material";

import TransferDetailsCard from "../../../utils/TransferDetailsCard";

import TransferEditDialog from "./TransferEditDialog";

import {
  createDummyTransfers,
  cardsData,
} from "../../../../mockData/transfers";
import StatCard from "../../../utils/StatCard";
import TransfersCard from "./TransfersCard";

export default function FollowUp() {
  const rowsPerPage = 5;

  const [transfers, setTransfers] = useState(() => createDummyTransfers());

  const [page, setPage] = useState(1);

  const [selectedTransferId, setSelectedTransferId] = useState(1);

  const [editTransferId, setEditTransferId] = useState(null);

  // TRASLADO SELECCIONADO PARA VER DETALLE

  const selectedTransfer =
    transfers.find((transfer) => transfer.id === selectedTransferId) ??
    transfers[0];

  // TRASLADO SELECCIONADO PARA EDITAR / GESTIONAR

  const editTransfer =
    transfers.find((transfer) => transfer.id === editTransferId) ?? null;

  // PAGINACIÓN

  const totalPages = Math.ceil(transfers.length / rowsPerPage);

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const visibleTransfers = transfers.slice(startIndex, endIndex);

  const showPagination = transfers.length > rowsPerPage;

  // GUARDAR CAMBIOS DEL DIÁLOGO

  const handleSaveTransfer = (updatedTransfer) => {
    setTransfers((prev) =>
      prev.map((transfer) =>
        transfer.id === updatedTransfer.id ? updatedTransfer : transfer,
      ),
    );
  };

  return (
    <>
      {/* CARDS SUPERIORES */}

      <Stack
        direction="row"
        spacing={2}
        sx={{
          flexWrap: "wrap",
          mt: 2,
          display: {
            md: "flex",
            xs: "none",
          },
        }}
      >
        {cardsData.map((item) => (
          <StatCard key={item.label} item={item} colors={item.colors} />
        ))}
      </Stack>

      {/* TABLA DE TRASLADOS */}
      <TransfersCard
        visibleTransfers={visibleTransfers}
        selectedTransferId={selectedTransferId}
        setSelectedTransferId={setSelectedTransferId}
        setEditTransferId={setEditTransferId}
        showPagination={showPagination}
        totalPages={totalPages}
        page={page}
        setPage={setPage}
      />

      {/* DETALLE DEL TRASLADO */}

      {selectedTransfer && <TransferDetailsCard transfer={selectedTransfer} />}

      {/* DIÁLOGO DE GESTIÓN */}

      {editTransfer && (
        <TransferEditDialog
          key={editTransfer.id}
          open={true}
          transfer={editTransfer}
          onClose={() => setEditTransferId(null)}
          onSave={handleSaveTransfer}
        />
      )}
    </>
  );
}
