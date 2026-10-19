import { Box, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DescriptionIcon from "@mui/icons-material/Description";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";

import StatCard from "../../utils/StatCard";
import CategoriesCard from "./CategoriesCard";
import SurveysCard from "./SurveysCard";
import DocsCard from "./DocsCard";

import { getAllDocuments } from "../../../apiCalls/documents/documentsApi";

export default function DocsDashboard() {
  const { t } = useTranslation("documents");

  const [categories, setCategories] = useState([]);
  const [activeDocuments, setActiveDocuments] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllDocuments();

        if (data.ok) {
          const { totalDocuments, activeDocuments } = data.categorias.reduce(
            (acc, category) => {
              acc.totalDocuments += category.documentos.length;

              acc.activeDocuments += category.documentos.filter(
                (document) => document.activo,
              ).length;

              return acc;
            },
            {
              totalDocuments: 0,
              activeDocuments: 0,
            },
          );

          setActiveDocuments(activeDocuments);
          setTotalDocuments(totalDocuments);
          setCategories(data.categorias);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, []);

  const cardsData = [
    {
      label: t("dashboard.category", {
        count: categories.length,
      }),
      icon: <FolderOpenIcon />,
      value: categories.length,
      subtitle: undefined,
    },
    {
      label: t("dashboard.document", {
        count: totalDocuments,
      }),
      icon: <DescriptionIcon />,
      value: totalDocuments,
      subtitle: undefined,
    },
    {
      label: t("dashboard.activeDocuments"),
      icon: <TaskAltIcon />,
      value: activeDocuments,
      subtitle:
        activeDocuments === 0 && totalDocuments === 0
          ? ""
          : t("dashboard.percentageOfTotal", {
              percentage: Math.round((activeDocuments / totalDocuments) * 100),
            }),
    },
    {
      label: t("dashboard.activeSurveys"),
      icon: <AssignmentIcon />,
      value: 12,
      subtitle: undefined,
    },
  ];

  return (
    <>
      {/* Estadísticas */}
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
          <StatCard key={item.label} item={item} />
        ))}
      </Stack>

      {/* Tarjetas de gestión */}
      <Box
        sx={{
          display: "grid",
          mt: 2,
          gridTemplateColumns: {
            xs: "1fr",
            xl: "repeat(2, minmax(0, 1fr))",
          },
          gap: 3,
          width: "100%",
          minWidth: 0,
          overflow: "hidden",

          "& > *": {
            minWidth: 0,
          },
        }}
      >
        <CategoriesCard />

        <SurveysCard />

        <Box
          sx={{
            minWidth: 0,
            gridColumn: {
              xs: "1",
              md: "1 / -1",
            },
          }}
        >
          <DocsCard />
        </Box>
      </Box>
    </>
  );
}
