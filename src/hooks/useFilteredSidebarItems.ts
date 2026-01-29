import { NavItem } from "../types/interfaces";

export const useFilteredSidebarItems = (items: NavItem[]): NavItem[] => {
  // In the partner panel redesign without API, we simply return the items as-is
  // Permissions are ignored for the design migration
  return items;
};
