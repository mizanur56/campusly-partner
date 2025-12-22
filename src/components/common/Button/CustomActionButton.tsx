// import React from "react";
// import { Button as AntButton } from "antd";

// interface CustomButtonProps {
//   type?: "primary" | "default" | "dashed" | "link" | "text";
//   text: string;
//   icon?: React.ReactNode;
//   icon2?: React.ReactNode;
//   iconSize?: number;
//   onClick?: () => void;
//   disabled?: boolean;
//   loading?: boolean; // ✅ add loading
// }

// const CustomActionButton: React.FC<CustomButtonProps> = ({
//   type = "default",
//   text,
//   icon,
//   icon2,
//   iconSize = 16,
//   disabled = false,
//   onClick,
//   loading = false, // default false
// }) => {
//   return (
//     <AntButton
//       type={type}
//       loading={loading}
//       onClick={onClick}
//       disabled={disabled}
//       style={{
//         display: "flex",
//         alignItems: "center",
//         gap: "8px",
//         opacity: disabled ? 0.6 : 1, // ✅ make disabled visible
//         cursor: disabled ? "not-allowed" : "pointer", // ✅ prevent click cursor
//       }}
//     >
//       {icon && (
//         <span
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             width: `${iconSize}px`,
//             height: `${iconSize}px`,
//             fontSize: `${iconSize}px`,
//             lineHeight: `${iconSize}px`,
//           }}
//         >
//           {icon}
//         </span>
//       )}
//       {text}
//       {icon2 && (
//         <span
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             width: `${iconSize}px`,
//             height: `${iconSize}px`,
//             fontSize: `${iconSize}px`,
//             lineHeight: `${iconSize}px`,
//             marginLeft: "8px",
//           }}
//         >
//           {icon2}
//         </span>
//       )}
//     </AntButton>
//   );
// };

// export default CustomActionButton;

import React from "react";
import { Button as AntButton } from "antd";

interface CustomButtonProps {
  type?: "primary" | "default" | "dashed" | "link" | "text";
  text?: string;
  icon?: React.ReactNode;
  icon2?: React.ReactNode;
  iconSize?: number;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: "small" | "middle" | "large";
  fontSize?: number;
  width?: number | string;
}

const CustomActionButton = React.forwardRef<
  HTMLButtonElement,
  CustomButtonProps
>(
  (
    {
      type = "default",
      text,
      icon,
      icon2,
      iconSize = 16,
      disabled = false,
      onClick,
      loading = false,
      size = "middle",
      fontSize,
      width
    },
    ref
  ) => {
    return (
      <AntButton
        ref={ref}
        type={type}
        loading={loading}
        onClick={onClick}
        disabled={disabled}
        size={size}
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: fontSize ? `${fontSize}px` : "14px", // default font size 14px
          gap: "8px",
          opacity: disabled ? 0.6 : 1,
          width: width && (width === "number" ? `${width}` : width),
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {icon && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: `${iconSize ?? 20}px`, // যদি iconSize না থাকে, default 20px use হবে
              height: `${iconSize ?? 20}px`,
              fontSize: `${iconSize ?? 20}px`,
              lineHeight: `${iconSize ?? 20}px`,
            }}
          >
            {icon}
          </span>
        )}
        {text && text}
        {icon2 && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: `${iconSize}px`,
              height: `${iconSize}px`,
              fontSize: `${iconSize}px`,
              lineHeight: `${iconSize}px`,
              marginLeft: "8px",
            }}
          >
            {icon2}{" "}
          </span>
        )}{" "}
      </AntButton>
    );
  }
);

export default CustomActionButton;
