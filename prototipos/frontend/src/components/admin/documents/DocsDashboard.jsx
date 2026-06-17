import { Box, Stack } from "@mui/material";
import StatCard from "../../utils/StatCard";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DescriptionIcon from "@mui/icons-material/Description";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CategoriesCard from "./CategoriesCard";
import SurveysCard from "../documents/SurveysCard";
import DocsCard from "./DocsCard";

const cardsData = [
  {
    label: "Categorías",
    icon: <FolderOpenIcon />,
    value: 24,
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

export default function DocsDashboard() {
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
            xl: "repeat(2, minmax(0,1fr))",
          },
          gap: 3,
          width: "100%",
        }}
      >
        <CategoriesCard />
        <SurveysCard />

        <Box
          sx={{
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
