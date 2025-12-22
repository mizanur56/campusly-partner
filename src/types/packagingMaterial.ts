export interface IPackagingMaterial {
  id?: string;
  name: string;
  type: string;
  unitId: string;
  minStock: number;
  maxStock: number;
  currentStock: number;
  costPerUnit: number;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  unit: any
}

export interface IPackagingMaterialResponse {
  success: boolean;
  message: string;
  data: IPackagingMaterial;
}

export interface IPackagingMaterialsResponse {
  success: boolean;
  message: string;
  data: IPackagingMaterial[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IUpdateStockRequest {
  stock: number;
}

export interface IUpdateStockResponse {
  success: boolean;
  message: string;
  data: IPackagingMaterial;
}
