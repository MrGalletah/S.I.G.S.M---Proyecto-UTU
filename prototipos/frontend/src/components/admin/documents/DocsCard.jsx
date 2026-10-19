import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  createOrUpdateDocument,
  deleteDocument,
  getAllDocuments,
  updateDocument,
} from "../../../apiCalls/documents/documentsApi";

import PdfSvg from "../../utils/PdfSvg";
import { useNotification } from "../../../hooks/useNotification";
import NotificationSnackbar from "../../utils/NotificationSnackbar";
import { formatDate } from "../../utils/formatDate";
import DocumentModal from "../../modals/DocumentDialog";
import DeleteConfirmDialog from "../../modals/DeleteConfirmDialog";

// ADAPTACIÓN DE DATOS
function formatDocuments(categories) {
  return categories.flatMap((category) =>
    category.documentos.map((document) => ({
      id: document.id_doc,
      category: category.nombre,
      idUser: document.id_func,
      idCat: category.id_cat,
      document: document.titulo,
      uploadedAt: formatDate(document.fecha_subida),
      active: document.activo === true || Number(document.activo) === 1,
      description: document.descripcion,
      path: document.ruta,
    })),
  );
}

export default function DocsCard({ variant }) {
  const { t } = useTranslation("documents");

  const { notification, showNotification, closeNotification } =
    useNotification();

  // DOCUMENTOS
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // CREACIÓN Y EDICIÓN
  const [openDocumentModal, setOpenDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [saving, setSaving] = useState(false);

  // ELIMINACIÓN
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // FILTROS Y PAGINACIÓN
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const isFull = variant === "full";
  const rowsPerPage = isFull ? 15 : 4;

  // REFERENCIA ESTABLE PARA NOTIFICACIONES
  const notificationRef = useRef(showNotification);

  useEffect(() => {
    notificationRef.current = showNotification;
  }, [showNotification]);

  // RECARGA MANUAL
  const fetchData = async () => {
    try {
      setLoading(true);

      const data = await getAllDocuments();

      if (data.ok) {
        setDocuments(formatDocuments(data.categorias));
      }
    } catch (error) {
      console.error(error);

      showNotification(t("files.loadError"), "error");
    } finally {
      setLoading(false);
    }
  };

  // CARGA INICIAL
  useEffect(() => {
    let cancelled = false;

    getAllDocuments()
      .then((data) => {
        if (!cancelled && data.ok) {
          setDocuments(formatDocuments(data.categorias));
        }
      })
      .catch((error) => {
        if (cancelled) return;

        console.error(error);

        notificationRef.current(t("files.loadError"), "error");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [t]);

  // CREAR O ACTUALIZAR DOCUMENTO
  const handleDocumentSubmit = async (data) => {
    try {
      setSaving(true);

      let response;

      if (!selectedDocument) {
        // Crear documento.
        response = await createOrUpdateDocument(data);
      } else if (data.archivo) {
        // Editar y reemplazar archivo.
        response = await createOrUpdateDocument(data, selectedDocument.id);
      } else {
        // Modificar solo los metadatos.
        response = await updateDocument(data, selectedDocument.id);
      }

      if (response.ok) {
        showNotification(
          selectedDocument
            ? t("files.updateSuccess")
            : t("files.createSuccess"),
          "success",
        );

        setOpenDocumentModal(false);
        setSelectedDocument(null);

        await fetchData();
      }
    } catch (error) {
      console.error(error);

      showNotification(
        selectedDocument ? t("files.updateError") : t("files.createError"),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  // ELIMINAR DOCUMENTO
  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      setDeleting(true);

      await deleteDocument(documentToDelete.id);

      showNotification(t("files.deleteSuccess"), "success");

      setDocumentToDelete(null);

      await fetchData();
    } catch (error) {
      console.error(error);

      showNotification(error.message || t("files.deleteError"), "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateDocument = () => {
    setSelectedDocument(null);
    setOpenDocumentModal(true);
  };

  const handleEditDocument = (document) => {
    setSelectedDocument(document);
    setOpenDocumentModal(true);
  };

  // FILTROS
  const filteredDocuments = documents.filter((documentItem) => {
    const searchText = search.toLowerCase();

    const stateLabel = documentItem.active
      ? t("files.active")
      : t("files.inactive");

    const matchesSearch =
      documentItem.document.toLowerCase().includes(searchText) ||
      documentItem.category.toLowerCase().includes(searchText) ||
      documentItem.uploadedAt.toLowerCase().includes(searchText) ||
      stateLabel.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? documentItem.active : !documentItem.active);

    return matchesSearch && matchesStatus;
  });

  // PAGINACIÓN
  const totalPages = Math.ceil(filteredDocuments.length / rowsPerPage);

  const currentPage = Math.min(page, Math.max(totalPages, 1));

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const visibleDocuments = filteredDocuments.slice(startIndex, endIndex);

  const showPagination = totalPages > 1;

  return (
    <>
      <Card
        sx={{
          borderRadius: 4,
          p: 3,
          boxShadow: "var(--card-shadow)",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {/* ENCABEZADO */}
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t("files.title")}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "var(--text-muted-color)",
              }}
            >
              {t("files.description")}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateDocument}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              bgcolor: "var(--primary-color)",
              whiteSpace: "nowrap",
              "&:hover": {
                bgcolor: "var(--primary-hover-color)",
              },
            }}
          >
            {t("files.add")}
          </Button>
        </Stack>

        {/* BÚSQUEDA Y FILTROS */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            mb: 2,
            gap: 2,
            alignItems: {
              xs: "stretch",
              sm: "center",
            },
          }}
        >
          <TextField
            size="small"
            placeholder={t("files.search")}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            slotProps={{
              htmlInput: {
                "aria-label": t("files.search"),
              },
            }}
            sx={{
              width: {
                xs: "100%",
                sm: "250px",
              },
            }}
          />

          <TextField
            select
            size="small"
            label={t("files.status")}
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            sx={{
              width: {
                xs: "100%",
                sm: "160px",
              },
            }}
          >
            <MenuItem value="all">{t("files.all")}</MenuItem>

            <MenuItem value="active">{t("files.activePlural")}</MenuItem>

            <MenuItem value="inactive">{t("files.inactivePlural")}</MenuItem>
          </TextField>
        </Stack>

        {/* CONTENIDO */}
        {loading ? (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer
            sx={{
              minWidth: "100%",
              overflowX: "auto",
            }}
          >
            <Table
              size="small"
              sx={{
                minWidth: {
                  xs: "650px",
                  md: "100%",
                },
                tableLayout: "fixed",
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      width: isFull ? "30%" : "35%",
                    }}
                  >
                    {t("files.name")}
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      width: "20%",
                    }}
                  >
                    {t("files.category")}
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      width: "15%",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("files.uploadedAt")}
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      width: isFull ? "12%" : "13%",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("files.status")}
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      width: isFull ? "12%" : "15%",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("files.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {visibleDocuments.map((documentItem) => (
                  <TableRow key={documentItem.id}>
                    {/* DOCUMENTO */}
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <PdfSvg />

                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {documentItem.document}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* CATEGORÍA */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {documentItem.category}
                      </Typography>
                    </TableCell>

                    {/* FECHA */}
                    <TableCell align="center">
                      {documentItem.uploadedAt}
                    </TableCell>

                    {/* ESTADO */}
                    <TableCell align="center">
                      <Chip
                        label={
                          documentItem.active
                            ? t("files.active")
                            : t("files.inactive")
                        }
                        size="small"
                        sx={{
                          bgcolor: documentItem.active
                            ? "var(--primary-color)"
                            : "var(--inactive-chip)",

                          color: documentItem.active
                            ? "var(--white-color)"
                            : "var(--text-main-color)",

                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          minWidth: documentItem.active ? 64 : 78,
                          justifyContent: "center",
                        }}
                      />
                    </TableCell>

                    {/* ACCIONES */}
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          justifyContent: "center",
                        }}
                      >
                        {/* VER PDF */}
                        <IconButton
                          size="small"
                          href={`/api/documents/view.php?id=${documentItem.id}&includeInactive=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t("files.view", {
                            name: documentItem.document,
                          })}
                        >
                          <RemoveRedEyeIcon fontSize="small" />
                        </IconButton>

                        {/* EDITAR */}
                        <IconButton
                          size="small"
                          onClick={() => handleEditDocument(documentItem)}
                          aria-label={t("files.edit", {
                            name: documentItem.document,
                          })}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>

                        {/* ELIMINAR */}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDocumentToDelete(documentItem)}
                          aria-label={t("files.delete", {
                            name: documentItem.document,
                          })}
                        >
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* PAGINACIÓN */}
        {!loading && showPagination && (
          <Stack
            direction="row"
            sx={{
              justifyContent: "center",
              mt: 2,
            }}
          >
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, value) => setPage(value)}
              size="small"
              shape="rounded"
            />
          </Stack>
        )}
      </Card>

      {/* NOTIFICACIONES */}
      <NotificationSnackbar
        notification={notification}
        onClose={closeNotification}
      />

      {/* CREAR O EDITAR DOCUMENTO */}
      {openDocumentModal && (
        <DocumentModal
          key={selectedDocument?.id ?? "new"}
          open={openDocumentModal}
          onClose={() => {
            setOpenDocumentModal(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
          loading={saving}
          onSubmit={handleDocumentSubmit}
        />
      )}

      {/* CONFIRMACIÓN DE ELIMINACIÓN */}
      <DeleteConfirmDialog
        open={Boolean(documentToDelete)}
        documentTitle={documentToDelete?.document}
        loading={deleting}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={handleDeleteDocument}
      />
    </>
  );
}
