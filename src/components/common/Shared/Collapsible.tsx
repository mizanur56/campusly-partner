import React from "react";

const Collapsible: React.FC<{
  open: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ open, children, className = "" }) => (
  <div
    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
    } ${className}`}
  >
    <div className="overflow-hidden">{children}</div>
  </div>
);

export default Collapsible;
