import { Box, Stack } from "@mui/material";
import StatCard from "../../utils/StatCard";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DescriptionIcon from "@mui/icons-material/Description";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CategoriesCard from "./CategoriesCard";
import SurveysCard from "../documents/SurveysCard";
import DocsCard from "./DocsCard";
import { getAllCategories } from "../../../apiCalls/categories/categoriesApi";
import { useEffect, useState } from "react";

export default function DocsDashboard() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        //setLoading(true);

        const data = await getAllCategories();
        if (data.ok) {
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
      label: "Categorías",
      icon: <FolderOpenIcon />,
      value: categories.length,
      subtitle: undefined,
    },
    {
      label: "Documentos",
      icon: <DescriptionIcon />,
      value: 152,
      subtitle: undefined,
    },
    {
      label: "Documentos activos",
      icon: <TaskAltIcon />,
      value: 128,
      subtitle: "84% del total",
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
