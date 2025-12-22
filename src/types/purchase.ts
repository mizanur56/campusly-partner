export interface IIncomingPurchaseItem {
  materialId: string;
  materialType: string;
  quantity: number;
  unitId: string;
  unitPrice: number;
  totalPrice: number;
}

export interface IPurchaseItem {
  id: string;
  purchaseId: string;
  materialId: string;
  quantity: number;
  discount?: number;
  unitPrice: number;
  totalPrice: number;
  material?: {
    id: string;
    name: string;
    type: string;
  };
  unit?: {
    id: string;
    name: string;
    symbol: string;
  };
}

export interface IPurchase {
  id: string;
  purchaseId: string; // Auto-generated PUR-0001
  supplierId: string;
  supplierName?: string;
  purchaseDate: string; // ISO date string
  purchaseType?: string;
  invoiceNo?: string;
  purchaseBy: string; // User ID or name
  warehouseId?: string;
  warehouseName?: string;
  referenceNo?: string;
  voucherImageId?: string;
  voucherImage?: {
    id: string;
    url: string;
    type: string;
  };
  subTotal: number;
  discount: number;
  discountType?: "Fixed" | "Percentage";
  discountValue?: number;
  vatPercentage?: number;
  vatAmount?: number;
  otherCharges?: number;
  totalAmount: number;
  grandTotal?: number;
  paidAmount?: number;
  dueAmount?: number;
  returnAmount?: number;
  netAmount?: number;
  paymentStatus?: "Paid" | "Due" | "Partial";
  invoiceImage?: string;
  notes?: string;
  status: "Active" | "Cancel" | "Return";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  supplier?: {
    id: string;
    supplierCode?: string;
    name: string;
    contactPerson?: string;
    phone1?: string;
    phone2?: string;
    email?: string;
    type?: string;
    status?: string;
    address?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    district?: string;
    country?: string;
    postalCode?: string;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    branchName?: string;
    routingCode?: string;
    isActive?: boolean;
    totalPurchases?: number;
    totalPaid?: number;
    totalDue?: number;
    creditBalance?: number;
    lastPurchaseDate?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  items: IPurchaseItem[];
  returns?: IPurchaseReturn[];
  payments?: IPurchasePayment[];
}

export interface IPurchaseReturnItem {
  materialId: string;
  materialName: string;
  purchaseQty: number;
  returnQty: number;
  unitPrice: number;
  totalPrice: number;
  remark?: string;
}

export interface IPurchaseReturn {
  id: string;
  returnId: string; // Auto-generated RET-0001
  purchaseId: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  category: "Production" | "Packaging";
  returnReason: string;
  returnDate: string;
  items: IPurchaseReturnItem[];
  totalItems: number;
  totalQty: number;
  totalAmount: number;
  purchaseAmount: number;
  discountGiven: number;
  returnAmount: number;
  discountAdjustment: number;
  netPurchaseAfterReturn: number;
  paidAmount: number;
  dueSupplierBalance: number;
  createdBy: string;
  createdAt: string;
}

export interface IPurchasePayment {
  id: string;
  purchaseId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface IPurchaseNeedItem {
  materialId: string;
  materialName: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  quantity: number; // Required quantity to reach max stock
  unitPrice: number;
  totalPrice: number;
  unit: string;
  supplierId: string;
  supplierName: string;
}

export interface IPurchaseNeed {
  id: string;
  needId: string; // Auto-generated PN-0001
  supplierId: string;
  supplierName: string;
  supplierContactPerson?: string;
  supplierAddress?: string;
  items: IPurchaseNeedItem[];
  totalMaterials: number;
  totalQty: number;
  totalPrice: number;
  status: "pending" | "approved" | "ordered" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
