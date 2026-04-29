import { MenuItem } from "../../domain/models";
import { getMenuItems, getMenuItemById } from "../../infrastructure/store/store";

export function getAllItems(): MenuItem[] {
  return getMenuItems();
}

export function getItemById(id: string): MenuItem | undefined {
  return getMenuItemById(id);
}
