import { Alert } from "@mui/material";
import { Outlet, useOutletContext } from "react-router";

import { hasAccess } from "../../utils/permissions";

export default function RoleRoute({ allowedRoles }) {
  const { user } = useOutletContext();

  if (!hasAccess(user, allowedRoles)) {
    return (
      <Alert severity="warning">
        No tenés permisos para acceder a esta sección.
      </Alert>
    );
  }

  return <Outlet context={{ user }} />;
}
