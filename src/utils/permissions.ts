type Permission = {
  module: string;
  actions: string[];
};

type ModulePermissions = {
  hasCreate: boolean;
  hasUpdate: boolean;
  hasDelete: boolean;
  allActions: string[];
};

/**
 * Get permissions for any module dynamically
 * If role is SUPER_ADMIN, return all actions as true
 */
export function getModulePermissions(
  permissions: Permission[] | undefined,
  role: string,
  moduleName: string
): ModulePermissions {

  
  if (role === "SUPER_ADMIN") {
    return {
      hasCreate: true,
      hasUpdate: true,
      hasDelete: true,
      allActions: ["create", "update", "delete"],
    };
  }

  const module = permissions?.find((p) => p.module === moduleName);

  return {
    hasCreate: module?.actions.includes("create") ?? false,
    hasUpdate: module?.actions.includes("update") ?? false,
    hasDelete: module?.actions.includes("delete") ?? false,
    allActions: module?.actions ?? [],
  };
}
