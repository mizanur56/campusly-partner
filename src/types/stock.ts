// Category Type
export interface ICategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  averageCost?: number;
}

// Unit Type
export interface IUnit {
  id: string;
  name: string;
  symbol?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product Variant Type
export interface IProductVariant {
  id: string;
  productId: string;
  unitId: string;
  conversionFactor?: number;
  sellingPrice?: number;
  averageCost?: number;
  minStock?: number;
  maxStock?: number;
  currentStock?: number;
  stockStatus?: "low" | "over" | "normal";
  type?: string;
  createdAt: string;
  updatedAt: string;
  unit?: IUnit;
  category?: ICategory;
}

// Main Product Type
export interface IStock {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  brandId?: string;
  baseUnitId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stockStatus: string;
  category?: ICategory;
  baseUnit: IUnit;
  brand?: {
    id: string;
    name: string;
    description?: string;
    logo?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  unit?: IUnit;
  variants?: IProductVariant[];
  currentStock: number;
  minStock: number;
  maxStock: number;
  averageCost: number;
  costPerUnit: number;
  type: string;
}
