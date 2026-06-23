import { useState } from "react";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  const [page, setPage] = useState("login");

  return (
    <>
      {page === "login" ? <Login setPage={setPage} /> : <AdminDashboard />}
    </>
  );
}

export default App;
