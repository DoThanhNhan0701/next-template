export interface IAssetGroup {
  id: number;
  code: string;
  name: string;
  color: string;
  description: string | null;
  is_active: boolean;
}

export interface IAssetGroupCreate {
  code: string;
  name: string;
  color: string;
  description?: string | null;
  is_active: boolean;
}

export type IAssetGroupUpdate = Partial<IAssetGroupCreate>;
