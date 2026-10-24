import { useState } from "react";

import {
  Box,
  ButtonBase,
  Chip,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const isTrue = (value) => value === true || Number(value) === 1;

const typeLabels = {
  abierta: "Abierta",
  cerrada: "Cerrada",
  seleccion: "Selección",
};

export default function SortableQuestionAccordion({
  pregunta,
  position,
  disabled,
  onEdit,
}) {
  const [expanded, setExpanded] = useState(false);

  const panelId = `question-panel-${pregunta.id_pregunta}`;
  const headingId = `question-heading-${pregunta.id_pregunta}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: Number(pregunta.id_pregunta),
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative",
    zIndex: isDragging ? 10 : "auto",
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        border: "1px solid",
        borderColor: isDragging ? "primary.main" : "divider",
        borderRadius: 3,
        bgcolor: "background.paper",
        overflow: "hidden",
        boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,0.15)" : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",

        "&:hover": {
          borderColor: "primary.main",
        },
      }}
    >
      {/* CABECERA: TRES COLUMNAS */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "40px minmax(0, 1fr) 40px",
          alignItems: "center",
          columnGap: 1,
          px: 1.5,
          py: 1.5,
        }}
      >
        {/* ARRASTRAR */}

        <IconButton
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          disabled={disabled}
          size="small"
          aria-label={`Arrastrar pregunta ${position + 1}`}
          title="Arrastrar para ordenar"
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            justifySelf: "center",
            color: "text.secondary",
            cursor: disabled ? "default" : "grab",
            touchAction: "none",

            "&:active": {
              cursor: disabled ? "default" : "grabbing",
            },
          }}
        >
          <DragIndicatorIcon fontSize="small" />
        </IconButton>

        {/* PREGUNTA Y FLECHA */}

        <ButtonBase
          id={headingId}
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-controls={panelId}
          sx={{
            width: "100%",
            minWidth: 0,
            borderRadius: 1.5,
            textAlign: "left",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            px: 0.5,
            py: 1,
          }}
        >
          <Stack
            spacing={0.75}
            sx={{
              flex: 1,
              minWidth: 0,
              alignItems: "flex-start",
            }}
          >
            <Typography
              variant="body1"
              fontWeight={500}
              sx={{
                overflowWrap: "anywhere",
              }}
            >
              {position + 1}. {pregunta.texto}
            </Typography>

            {/* ETIQUETAS */}

            <Stack direction="row" gap={0.75} flexWrap="wrap">
              <Chip
                label={typeLabels[pregunta.tipo] ?? pregunta.tipo}
                size="small"
                variant="outlined"
              />

              {isTrue(pregunta.obligatoria) && (
                <Chip
                  label="Obligatoria"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ ml: 1}}
                />
              )}

              {!isTrue(pregunta.activa) && (
                <Chip label="Inactiva" size="small" />
              )}
            </Stack>
          </Stack>

          {/* FLECHA DESPLEGABLE */}

          <ExpandMoreIcon
            sx={{
              color: "text.secondary",
              flexShrink: 0,
              transition: "transform 0.2s ease",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </ButtonBase>

        {/* EDITAR */}

        <IconButton
          size="small"
          disabled={disabled}
          onClick={() => onEdit(pregunta)}
          aria-label={`Editar pregunta ${position + 1}`}
          title="Editar pregunta"
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            justifySelf: "center",

            "&:hover": {
              bgcolor: "action.selected",
            },
          }}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* RESPUESTAS DESPLEGABLES */}

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box
          id={panelId}
          role="region"
          aria-labelledby={headingId}
          sx={{
            px: 3,
            pt: 2,
            pb: 2.5,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {pregunta.tipo === "abierta" ? (
            <Typography variant="body2" color="text.secondary">
              El paciente podrá escribir una respuesta libre.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                Opciones de respuesta
              </Typography>

              <Stack spacing={1}>
                {(pregunta.opciones ?? []).map((opcion) => (
                  <Box
                    key={opcion.id_opcion}
                    sx={{
                      px: 2,
                      py: 1.25,
                      borderRadius: 2,
                      bgcolor: "action.hover",
                    }}
                  >
                    <Typography variant="body2">{opcion.texto}</Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
