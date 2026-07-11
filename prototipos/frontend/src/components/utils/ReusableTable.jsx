import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

export default function ReusableTable({
  rows = [],
  columns = [],
  minWidth = 650,
}) {
  return (
    <TableContainer
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "auto",
      }}
    >
      <Table
        size="small"
        sx={{
          width: "100%",
          minWidth,
          tableLayout: "auto",
        }}
      >
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                align={column.align ?? "left"}
                sx={{
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align ?? "left"}
                >
                  {column.render
                    ? column.render(row)
                    : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}