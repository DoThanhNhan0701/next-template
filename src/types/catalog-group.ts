export interface ICatalogGroup {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  asset_group_id: number;
}
