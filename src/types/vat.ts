export interface IVat {
  id?: string;
  taxName: string;
  rate: number;
  taxNumber: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
