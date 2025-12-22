export interface IUnit {
  id: string | undefined
  name: string;
  symbol: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUpdateUnit {
  name: string;
  symbol: string;
  description?: string;
  isActive: boolean;
}