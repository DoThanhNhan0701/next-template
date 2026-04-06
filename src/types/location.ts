export interface ILocation {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
}

export interface ILocationCreate {
  name: string;
  code: string;
  description?: string | null;
  is_active: boolean;
}

export type ILocationUpdate = Partial<ILocationCreate>;
