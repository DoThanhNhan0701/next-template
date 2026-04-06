export interface IPermission {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface IRole {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  permissions?: IPermission[];
}

export interface IRoleCreate {
  name: string;
  description?: string;
  is_active: boolean;
  permission_ids?: number[];
}

export interface IRoleUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
  permission_ids?: number[];
}
