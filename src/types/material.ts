export interface IMaterial {
  id?: string;
  code: string;
  notes: any;
  createdAt: any;
  updatedAt: any;
  name?: string;
  type?: string;
  supplierId?: string;
  categoryId?: string;
  category?: any;
  unit?: any;
  rack?: any;
  room?: any;
  unitId?: string;
  minStock?: number;
  maxStock?: number;
  currentStock?: number;
  averageCost?: number;
  description?: string;
  isActive?: boolean;
  warehouseId? : any
  warehouse : any
  supplier?: any;
  costPerUnit: number;
  materialName?: string;  
  stockStatus?: string;

  // NEW fields for warehouse management
  roomId?: string;
  rackId?: string;
}


// export interface IMaterial {
//   id: string;
//   name: string;
//   code: string;
//   category: { id: string; name: string };
//   unit: string;
//   type: string;
//   price: number;
//   costPerUnit: number;
//   minStock: number;
//   maxStock: number;
//   isActive: boolean;
// }