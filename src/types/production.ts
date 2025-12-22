export interface ProductionRecord {
  id: string;
  productionNumber: string;
  productId?: string; // Made optional for combo products
  comboProductId?: string; // New field for combo products
  plannedQty: number;
  producedQty: number;
  wastageQty: number;
  transferredQty: number;
  productionCost: number | null;
  packagingCost: number | null;
  stockQty: number;
  startDate: string;
  endDate: string | null;
  status: string;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  requisitions?: Array<{
    id: string;
    type: string;
    status: string;
  }>;
  // Optional plan info used by ProductionCompleteModal
  plan?: {
    id: string;
    items?: any[];
  };
  product?: {
    id: string;
    slug: string;
    name: string;
    thumbnailId: string;
    categoryId: string;
    brandId: string;
    baseUnitId: string;
    shortDesc: string;
    detailedDesc: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    category: {
      id: string;
      name: string;
      description: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
    brand: {
      id: string;
      name: string;
      logoId: string | null;
      description: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
    baseUnit: {
      id: string;
      name: string;
      symbol: string;
      description: string | null;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
  comboProduct?: {
    id: string;
    name: string;
    categoryId: string;
    brandId: string;
    baseUnitId: string;
    category: {
      id: string;
      name: string;
    };
    brand: {
      id: string;
      name: string;
    };
    baseUnit: {
      id: string;
      name: string;
      symbol: string;
    };
  };
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

// for transfer modal

export interface StockRecord {
  variantId: string;
  productId: string;
  productName: string;
  variant: Variant;
  availableQty: number;
  isCombo?: boolean;
}

export interface TransferFormProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data?: StockRecord | null;
  bulkData?: StockRecord[];
  onSuccess?: () => void;
}
