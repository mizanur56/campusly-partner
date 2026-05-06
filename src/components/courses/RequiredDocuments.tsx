import { useState } from "react";
import { cn } from "../../utils/cn";
import type { DocumentCategory } from "../../types/course";

interface RequiredDocumentsProps {
  documents: DocumentCategory[];
  className?: string;
}

export default function RequiredDocuments({
  documents,
  className,
}: RequiredDocumentsProps) {
  if (!documents?.length) return null;

  const tabs =
    documents.map((doc) => ({
      id: doc.id,
      label: doc.title,
    })) || [];
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");
  const activeCategory = documents.find((doc) => doc.id === activeTab);

  return (
    <section className={cn("space-y-6", className)}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[22px] font-semibold text-neutral-900 md:text-[30px]">
            Basic requirements
          </h2>
        </div>
        <p className="text-[15px] text-neutral-500 md:text-[17px]">
          Listed below are the documents required to apply for this study level.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-lg border px-5 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-transparent bg-[#EDEEEF] text-[#4B5563] hover:bg-primary-50",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeCategory ? (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">
            {activeCategory.title}
          </h3>
          <div className="space-y-3">
            {activeCategory.items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-neutral-200 bg-white px-5 py-6"
              >
                <span className="text-sm font-normal uppercase text-neutral-900">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
