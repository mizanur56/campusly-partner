import { FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "../../../utils/cn";

type DocumentGroup = {
  levelId: string;
  levelName: string;
  levelPriority: number;
  categories: Array<{
    title: string;
    documents: Array<{ id: string; name: string; submitted: boolean }>;
  }>;
};

export default function UniversityRequiredDocuments({ documents }: { documents: DocumentGroup[] }) {
  const studyLevels = useMemo(() => documents.map((doc) => ({ id: doc.levelId, name: doc.levelName })), [documents]);
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    if (studyLevels.length > 0 && !activeTab) setActiveTab(studyLevels[0].id);
  }, [studyLevels, activeTab]);

  const filteredDocuments = useMemo(() => documents.find((doc) => doc.levelId === activeTab)?.categories || [], [documents, activeTab]);

  return (
    <section id="required-document" className="flex w-full flex-col gap-8">
      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full flex-col gap-4">
          <h2 className="text-[24px] font-semibold text-[#20242A] md:text-[30px]">Required documents</h2>
          <p className="text-[16px] text-[#4B5563] md:text-[18px]">Listed below are the documents required to apply.</p>
        </div>
        {studyLevels.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {studyLevels.map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => setActiveTab(level.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-normal transition-colors",
                  activeTab === level.id
                    ? "border-primary-200 bg-primary-100 text-primary-700"
                    : "border-transparent bg-neutral-50 text-neutral-500 hover:bg-primary-50",
                )}
              >
                {level.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex w-full flex-col gap-6">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((category, categoryIndex) => (
            <div key={categoryIndex} className="flex w-full flex-col gap-2">
              <h3 className="text-[14px] font-semibold text-[#292F36]">{category.title}</h3>
              {category.documents.map((doc, docIndex) => (
                <div key={doc.id || docIndex} className="flex w-full items-center justify-between rounded-lg border border-primary-border bg-white p-4 shadow-none md:p-[18px]">
                  <div className="flex items-center gap-4">
                    {doc.submitted ? <FileText className="h-5 w-5 md:h-6 md:w-6" /> : null}
                    <div className="flex flex-col">
                      <p className="text-[15px] font-medium text-[#20242A] md:text-[16px]">{doc.name}</p>
                      {doc.submitted ? <p className="text-[13px] text-[#237D3B] md:text-[14px]">Submitted</p> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="text-[15px] text-[#4B5563]">No documents found for this study level.</p>
        )}
      </div>
    </section>
  );
}
