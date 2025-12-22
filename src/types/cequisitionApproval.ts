// Single item in a requisition
export interface IRequisitionItem {
  materialId: string;
  materialType?: "raw" | "finished" | string;
  quantity: number;
  unitId: string;
  purpose?: string;
}

// Main requisition structure
export interface ICreateRequisition {
  requisitionNumber: string;
  requestedBy: string;
  type: "raw_material" | "finished_goods" | string;
  items: IRequisitionItem[];
  purpose?: string;
  notes?: string;
}
