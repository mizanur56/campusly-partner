declare module "react-phone-input-2" {
  import { Component } from "react";

  interface PhoneInputProps {
    country?: string;
    value?: string;
    onChange?: (value: string, country: any) => void;
    enableSearch?: boolean;
    inputStyle?: React.CSSProperties;
    buttonStyle?: React.CSSProperties;
    containerStyle?: React.CSSProperties;
    dropdownStyle?: React.CSSProperties;
    searchStyle?: React.CSSProperties;
    placeholder?: string;
    disabled?: boolean;
    autoFormat?: boolean;
    defaultCountry?: string;
    preferredCountries?: string[];
    excludeCountries?: string[];
    onlyCountries?: string[];
    [key: string]: any;
  }

  export default class PhoneInput extends Component<PhoneInputProps> {}
}

