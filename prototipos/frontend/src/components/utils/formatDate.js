export function formatDate(date) {
  if (!date) return "";

  const [year, month, day] = date.split(" ")[0].split("-");

  return `${day}-${month}-${year}`;
}