import { ICatalogGroup } from "./catalog-group";

export interface ICatalogType {
  id: number;
  name: string;
  code: string;
  description: string | null;
  catalog_group_id: number;
  is_active: boolean;
  management_type: string;
  has_warranty: boolean;
  catalog_group_name: string;
  catalog_group?: ICatalogGroup;
}

export interface ICatalogTypeCreate {
  name: string;
  code: string;
  description?: string | null;
  catalog_group_id: number;
  is_active: boolean;
  management_type: string;
  has_warranty: boolean;
}

export type ICatalogTypeUpdate = Partial<ICatalogTypeCreate>;
