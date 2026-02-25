import React from "react";

interface SearchSectionHeaderProps {
  title: string;
  image: string;
  className?: string;
}

export default function SearchSectionHeader({
  title,
  image,
  className = "",
}: SearchSectionHeaderProps) {
  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 flex-wrap pb-4 md:pb-4 ${className}`}
    >
      <div className="flex items-center gap-3 sm:gap-3 text-neutral-900">
        <h2 className="text-[23px] md:text-[24px] font-semibold">{title}</h2>
      </div>
    </div>
  );
}
