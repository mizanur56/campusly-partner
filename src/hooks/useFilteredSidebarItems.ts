import { useCallback, useMemo } from "react";
import { usePermissions } from "./usePermissions";
import { NavItem, SubMenuItem } from "../types/interfaces";

// Define permissions required for each sidebar item
const sidebarPermissions: Record<
  string,
  {
    roles?: string[];
    employeePermissions?: { module: string; action: string };
  }
> = {
  // Dashboard - accessible to all authenticated users
  Dashboard: { employeePermissions: { module: "Dashboard", action: "view" } },

  // User Management - only for admins and super admins
  "User Management": { roles: ["SUPER_ADMIN", "ADMIN", "EMPLOYEE"] },

  Employees: { employeePermissions: { module: "Employees", action: "view" } },
  Designations: {
    employeePermissions: { module: "Designations", action: "view" },
  },

  // Media Library
  "Media Library": {
    employeePermissions: { module: "Media Library", action: "view" },
  },

  // Content Management
  "Content Management": {
    employeePermissions: { module: "Content Management", action: "view" },
  },

  // Articles
  Articles: {
    employeePermissions: { module: "Articles", action: "view" },
  },
  "Create Articles": {
    employeePermissions: { module: "Articles", action: "create" },
  },

  // Document Management
  "Document Management": { roles: ["SUPER_ADMIN", "ADMIN"] },
  Categories: {
    employeePermissions: { module: "Document Category", action: "view" },
  },
  Documents: { employeePermissions: { module: "Document", action: "view" } },
  Fields: { employeePermissions: { module: "Document Field", action: "view" } },

  // Settings
  Settings: { employeePermissions: { module: "Profile", action: "view" } },
};

export const useFilteredSidebarItems = (items: NavItem[]): NavItem[] => {
  const { hasPermission, hasRole } = usePermissions();

  // DISABLED: This old check is replaced by useRoutePermission hook in MainLayout
  // useCheckPath(items, user);

  const filterSubMenuItem = useCallback(
    (item: SubMenuItem): SubMenuItem | null => {
      // Check sub-item permissions
      const itemPermissions = sidebarPermissions[item.name];
      if (itemPermissions) {
        // Check roles
        if (itemPermissions.roles && !hasRole(itemPermissions.roles)) {
          return null;
        }

        // Check employee permissions
        if (itemPermissions.employeePermissions) {
          const { module, action } = itemPermissions.employeePermissions;
          if (!hasPermission(module, action)) {
            return null;
          }
        }
      }

      // If item has subItems, filter them recursively
      if (item.subItems) {
        const filteredSubItems = item.subItems
          .map(filterSubMenuItem)
          .filter((subItem): subItem is SubMenuItem => subItem !== null);

        // If no subItems remain after filtering, hide the parent item
        if (filteredSubItems.length === 0) {
          return null;
        }

        // Return item with filtered subItems
        return {
          ...item,
          subItems: filteredSubItems,
        };
      }

      // Item has no subItems or passed all checks
      return item;
    },
    [hasPermission, hasRole]
  );

  const filterItem = useCallback(
    (item: NavItem): NavItem | null => {
      // Check main item permissions
      const itemPermissions = sidebarPermissions[item.name];
      if (itemPermissions) {
        // Check roles
        if (itemPermissions.roles && !hasRole(itemPermissions.roles)) {
          return null;
        }

        // Check employee permissions
        if (itemPermissions.employeePermissions) {
          const { module, action } = itemPermissions.employeePermissions;
          if (!hasPermission(module, action)) {
            return null;
          }
        }
      }

      // If item has subItems, filter them recursively
      if (item.subItems) {
        const filteredSubItems = item.subItems
          .map(filterSubMenuItem)
          .filter((subItem): subItem is SubMenuItem => subItem !== null);

        // If no subItems remain after filtering, hide the parent item
        if (filteredSubItems.length === 0) {
          return null;
        }

        // Return item with filtered subItems
        return {
          ...item,
          subItems: filteredSubItems,
        };
      }

      // Item has no subItems or passed all checks
      return item;
    },
    [hasPermission, hasRole, filterSubMenuItem]
  );

  const filterItems = useMemo(() => {
    return items
      .map(filterItem)
      .filter((item): item is NavItem => item !== null);
  }, [filterItem, items]);

  return filterItems;
};
