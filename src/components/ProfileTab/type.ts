export interface BackgroundField {
  id: string;
  name: string;
  type?: string;
}

export interface BackgroundDocument {
  id: string;
  name: string;
  status?: boolean;
  fields: BackgroundField[];
}
