import React, { ReactNode } from "react";

type ResultsGridProps = { children: ReactNode };

export default function ResultsGrid({ children }: ResultsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-4 md:gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 auto-rows-fr">
      {children}
    </div>
  );
}
