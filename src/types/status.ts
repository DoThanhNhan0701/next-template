export interface IStatus {
  id: number;
  category: string;
  code: string;
  name: string;
  color: string;
  is_system: boolean;
}

export interface IStatusCreate {
  category: string;
  code: string;
  name: string;
  color: string;
}

export type IStatusUpdate = Partial<IStatusCreate>;
