export type SubMenuItem = {
  name: string;
  path?: string;
  new?: boolean;
  subItems?: SubMenuItem[];
};

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubMenuItem[];
  action?: string;
};

export interface IPermission {
  module: string;
  actions: string[]; // ['view', 'create', 'update', 'delete']
}

export interface IDesignation {
  id: string;
  name: string;
  permissions?: IPermission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  employeeCount?: number;
}

export interface IEmployee {
  id: string;
  name: string;
  email: string;
  phone: string;
  designationId: string;
  designation?: IDesignation;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ISystemSettings {
  id: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  lowStockThreshold: number;
  autoApprovalLimit: number;
  qrCodePrefix: string;
  updatedAt: string;
}

export interface IContentManagement {
  id: string;
  page: string;
  groupId: string;
  key: string;
  content: string;
  type: string;
  updatedAt: string;
  updatedBy: string;
  updater?: IEmployee;
}

export interface IDocumentCategory {
  id: string;
  name: string;
  slug: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  documents?: IDocument[];
  documentFields?: IDocumentField[];
}

export interface IDocument {
  id: string;
  categoryId: string;
  name: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  category?: IDocumentCategory;
  fields?: IDocumentField[];
}

export interface IDocumentField {
  id: string;
  documentId: string;
  categoryId: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  document?: IDocument;
  category?: IDocumentCategory;
}
