import { Navigate, Route, Routes } from "react-router";
import { Alert } from "@mui/material";

// AUTENTICACIÓN
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleRoute from "./components/auth/RoleRoute";

// PERMISOS
import { ACCESS } from "./utils/permissions";

// DOCUMENTACIÓN
import DocsDashboard from "./components/admin/documents/DocsDashboard";
import CategoriesCard from "./components/admin/documents/CategoriesCard";
import DocsCard from "./components/admin/documents/DocsCard";
import SurveysCard from "./components/admin/documents/SurveysCard";

// VISTA PÚBLICA
import UserView from "./components/admin/general/UserView";

// TRASLADOS
import NewTransfer from "./components/admin/ambulances/transfer/NewTansfer";
import FollowUp from "./components/admin/ambulances/followUp/FollowUp";
import TransferHistory from "./components/admin/ambulances/history/TransferHistory";

// VEHÍCULOS
import VehiclesPage from "./components/admin/vehicles/VehiclesPage";

// ADMINISTRACIÓN
import UsersCard from "./components/admin/users/UsersCard";
import AccessRequestsCard from "./components/admin/access/AccessRequestsCard";

function App() {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/login" element={<Login />} />
      <Route path="/documents/view" element={<UserView />} />

      {/* RUTAS PRIVADAS */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminDashboard />}>
          {/* DOCUMENTACIÓN */}
          <Route element={<RoleRoute allowedRoles={ACCESS.documentation} />}>
            <Route path="documents/dashboard" element={<DocsDashboard />} />
            <Route
              path="documents/categories"
              element={<CategoriesCard variant="full" />}
            />
            <Route
              path="documents/files"
              element={<DocsCard variant="full" />}
            />
            <Route
              path="documents/surveys"
              element={<SurveysCard variant="full" />}
            />
          </Route>

          {/* SOLICITUD DE TRASLADOS */}
          <Route element={<RoleRoute allowedRoles={ACCESS.newTransfer} />}>
            <Route path="ambulances/new" element={<NewTransfer />} />
          </Route>

          {/* GESTIÓN DE TRASLADOS */}
          <Route element={<RoleRoute allowedRoles={ACCESS.manageTransfers} />}>
            <Route path="ambulances/follow-up" element={<FollowUp />} />
            <Route path="ambulances/history" element={<TransferHistory />} />
            <Route path="ambulances/vehicles" element={<VehiclesPage />} />
          </Route>

          {/* ADMINISTRACIÓN GENERAL */}
          <Route element={<RoleRoute allowedRoles={ACCESS.administration} />}>
            <Route path="admin/users" element={<UsersCard variant="full" />} />
            <Route
              path="admin/access"
              element={<AccessRequestsCard variant="full" />}
            />
          </Route>

          {/* USUARIO SIN ACCESO A MÓDULOS */}
          <Route
            path="no-access"
            element={
              <Alert severity="info">
                No tenés ningún módulo asignado. Contactá con un administrador
                para solicitar permisos.
              </Alert>
            }
          />
        </Route>
      </Route>

      {/* REDIRECCIONES */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
