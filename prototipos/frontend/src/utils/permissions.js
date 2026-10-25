export const ROLES = {
  ADMIN: "Administrador",
  DOCUMENTS: "Gestor de documentación",
  REQUEST_TRANSFER: "Solicitante de traslado",
  MANAGE_TRANSFERS: "Gestor de traslados",
};

export const ACCESS = {
  documentation: [
    ROLES.ADMIN,
    ROLES.DOCUMENTS,
  ],

  newTransfer: [
    ROLES.ADMIN,
    ROLES.REQUEST_TRANSFER,
  ],

  manageTransfers: [
    ROLES.ADMIN,
    ROLES.MANAGE_TRANSFERS,
  ],

  administration: [
    ROLES.ADMIN,
  ],
};

export function hasAccess(user, allowedRoles) {
  return (
    Array.isArray(user?.roles) &&
    user.roles.some((role) => allowedRoles.includes(role))
  );
}

export function getHomeRoute(user) {
  if (hasAccess(user, ACCESS.documentation)) {
    return "/documents/dashboard";
  }

  if (hasAccess(user, ACCESS.newTransfer)) {
    return "/ambulances/new";
  }

  if (hasAccess(user, ACCESS.manageTransfers)) {
    return "/ambulances/follow-up";
  }

  return "/no-access";
}