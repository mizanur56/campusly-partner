import { MediaImage } from "./media";

export interface IBrand {
  id: string;
  name: string;
  logoId?: string; // Using URL for demo purposes
  description?: string;
  isActive: boolean;
  logo: MediaImage;
  createdAt?: string;


}
export interface ICreateBrand {
  name?: string;
  logoId?: string; // Using URL for demo purposes
  description?: string;
  isActive?: boolean;
}