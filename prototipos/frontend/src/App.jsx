import { Navigate, Route, Routes } from "react-router";

import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import DocsDashboard from "./components/admin/documents/DocsDashboard";
import CategoriesCard from "./components/admin/documents/CategoriesCard";
import DocsCard from "./components/admin/documents/DocsCard";
import SurveysCard from "./components/admin/documents/SurveysCard";

import NewTransfer from "./components/admin/ambulances/NewTansfer";
import FollowUp from "./components/admin/ambulances/FollowUp";
import UserView from "./components/admin/general/UserView";

function App() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<Login />} />

      {/* Privadas TODO: implementar bien el login/logout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminDashboard />}>
          <Route path="documents/dashboard" element={<DocsDashboard />} />
          <Route
            path="documents/categories"
            element={<CategoriesCard variant="full" />}
          />
          <Route path="documents/files" element={<DocsCard variant="full" />} />
          <Route
            path="documents/surveys"
            element={<SurveysCard variant="full" />}
          />

          <Route path="ambulances/new" element={<NewTransfer />} />
          <Route path="ambulances/follow-up" element={<FollowUp />} />

          <Route path="admin/users/view" element={<UserView />} />
          <Route
            path="admin/users"
            element={<div> Gestión de usuarios - En construcción</div>}
          />
          <Route
            path="admin/access"
            element={<div> Conceder acceso - En construcción</div>}
          />
        </Route>
      </Route>

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;
