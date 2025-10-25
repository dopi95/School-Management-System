export const hasPermission = (admin, module, action = 'view') => {
  // Superadmin has access to everything
  if (admin?.role === 'superadmin') {
    return true;
  }

  if (!admin?.permissions) {
    return false;
  }

  const permission = admin.permissions[module];

  // For granular permissions (object with actions)
  if (typeof permission === 'object' && permission !== null) {
    return permission[action] === true;
  }

  // For simple boolean permissions (backwards compatibility)
  return permission === true;
};

export const canView = (admin, module) => hasPermission(admin, module, 'view');
export const canCreate = (admin, module) => hasPermission(admin, module, 'create');
export const canEdit = (admin, module) => hasPermission(admin, module, 'edit');
export const canDelete = (admin, module) => hasPermission(admin, module, 'delete');