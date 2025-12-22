export interface IProductVariant {
  variantName: string;
  images: any;
  id: number;
  name: string;
  conversionFactor: number;
  sellingPrice: number;
  minStock: number;
  maxStock: number;
  thumbnail?: any;
  currentStock?: number;
  discountedPrice?: number;
  thumbnailImage?: any;
  sku: string;
  productName?:string
  productId?:string
}
export interface IProduct {
  id: number ;
  name: string;
  categoryId: string;
  brandId: string;
  baseUnitId: string;
  description?: string;
  variants: IProductVariant[];
  isActive: boolean;
}

//  get or get product

// types/units.ts
export interface IUnit {
  id: string;
  name: string;
  symbol?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// types/category.ts
export interface ICategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// types/brands.ts
export interface IBrand {
  id: string;
  name: string;
  logo?: string | null;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProductVariantData {
  id: string;
  productId: string;
  unitId: string;
  conversionFactor: number;
  sellingPrice: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  createdAt: string;
  updatedAt: string;
  unit?: IUnit; // nested unit object
}

export interface IProductData {
  hasBOM: any;
  id: string;
  bomCount: number;
  name: string;
  category?: ICategory; // nested category object
  brand?: IBrand; // nested brand object
  baseUnit?: IUnit; // nested base unit object
  variants?: IProductVariantData[];
  description: string;
  isActive: boolean;
  createdAt?: Date | string | undefined;
  updatedAt?: Date | string | undefined;
  bomItems?: any[]; // Add BOM items if needed
  
}

// update

export interface IUpdateProductVariant {
  id?: string; // optional, for existing variants
  unitId: string;
  conversionFactor: number;
  sellingPrice: number;
  discountedPrice?: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  thumbnailId?: string;
  imageIds?: string[];
  images?: any;
}
export interface IUpdateProduct {
  id: string; // product id for update
  name: string;
  categoryId: ICategory;
  brandId?: string;
  baseUnitId: string;
  shortDesc?: string;
  detailedDesc?: string;
  thumbnailId?: string;
  imageIds?: string[];
  variants?: IUpdateProductVariant[];
  isActive: boolean;
}
