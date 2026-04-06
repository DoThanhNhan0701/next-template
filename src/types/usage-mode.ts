export interface IUsageMode {
  id: number;
  code: string;
  name: string;
  color: string;
  description: string;
  is_active: boolean;
}

export interface IUsageModeCreate {
  code: string;
  name: string;
  color: string;
  description: string;
  is_active: boolean;
}

export type IUsageModeUpdate = Partial<IUsageModeCreate>;
