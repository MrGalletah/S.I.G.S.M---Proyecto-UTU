import { Box, Stack } from "@mui/material";
import StatCard from "../../utils/StatCard";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DescriptionIcon from "@mui/icons-material/Description";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CategoriesCard from "./CategoriesCard";
import SurveysCard from "../documents/SurveysCard";
import DocsCard from "./DocsCard";
import { useEffect, useState } from "react";
import { getAllDocuments } from "../../../apiCalls/documents/documentsApi";

export default function DocsDashboard() {
  const [categories, setCategories] = useState([]);
  const [activeDocuments, setActiveDocuments] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);


  useEffect(() => {
    const fetchData = async () => {
      try {
        //setLoading(true);

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

          setActiveDocuments(activeDocuments)
          setTotalDocuments(totalDocuments)
          setCategories(data.categorias);
        }
      } catch (e) {
        console.error(e);
        //showNotification("Error al obtener las categorías.", "error");
      } finally {
        //setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cardsData = [
    {
      label: categories.length === 1 ? "Categoría" : "Categorías",
      icon: <FolderOpenIcon />,
      value: categories.length,
      subtitle: undefined,
    },
    {
      label: totalDocuments === 1 ? "Documento" : "Documentos",
      icon: <DescriptionIcon />,
      value: totalDocuments,
      subtitle: undefined,
    },
    {
      label: "Documentos activos",
      icon: <TaskAltIcon />,
      value: activeDocuments,
      subtitle: `${Math.round((activeDocuments / totalDocuments) * 100)}% del total`,
    },
    {
      label: "Encuestas activas",
      icon: <AssignmentIcon />,
      value: 12,
      subtitle: undefined,
    },
  ];

  return (
    <>
      <Stack
        direction={"row"}
        spacing={2}
        sx={{
          flexWrap: "wrap",
          mt: 2,
          display: {
            md: "flex",
            xs: "none",
          },
          // justifyContent: "space-evenly"
        }}
      >
        {cardsData.map((item) => {
          return <StatCard key={item.label} item={item} />;
        })}
      </Stack>
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
