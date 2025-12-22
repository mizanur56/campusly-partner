export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  totalPurchases: number;
  lastPurchaseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  logoId: string | null;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BaseUnit {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  thumbnailId: string | null;
  categoryId: string;
  brandId: string;
  baseUnitId: string;
  shortDesc: string;
  detailedDesc: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: Category;
  brand: Brand;
  baseUnit: BaseUnit;
}

export interface Variant {
  id: string;
  productId: string;
  thumbnailId: string | null;
  sku: string;
  name: string;
  discountedPrice: number | null;
  conversionFactor: number;
  sellingPrice: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  saleId: string;
  productId: string;
  variantId: string;
  comboProductId: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
  variant: Variant;
  comboProduct: any | null;
}

export interface ISales {
  id: string;
  invoiceNumber: string;
  customerId: string;
  paymentMethod: string;
  totalAmount: number;
  discount: number;
  deliveryCharge: number;
  otherCharge: number;
  otherChargeDescription: string;
  finalAmount: number;
  paid: number;
  notes: string;
  status: "completed" | "quotation";
  soldBy: string;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  items: Item[];
}
