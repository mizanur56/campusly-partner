import { IProductData } from "./product";

export interface RequisitionSetupModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  product?: IProductData | any;
  productId?: string;
  createDropdownProduct?: boolean;
  initialBatchSize?: number;
  readOnlyBatchSize?: boolean;
  onSuccess?: () => void;
  productionId?: string;
  productionNumber?: string;
  planItems?: Array<{ variantId: string; plannedQty: number }>; // Add plan items for variant-specific quantities
}

export interface RawMaterialRequirement {
  unit: string;
  materialId: string;
  materialName: string;
  unitName: string;
  requiredQuantity: number;
  currentStock: number;
  percentage: number;
}

export interface PackagingMaterialRequirement {
  id: string;
  materialId: string;
  materialName: string;
  type: string;
  variantId: string;
  variantName: string;
  percentage: number;
  wastage: number;
  unit: string;
  unitName: string;
  category: string;
  currentStock: number;
  createdAt: string;
  updatedAt: string;
}
