export interface ICustomer {
  id?: string;            // optional if created by backend
  name: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  createdAt?: string;     // optional, for read-only fields from backend
  updatedAt?: string;     // optional, if available
}
