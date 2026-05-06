import { Collapse } from "antd";
import { ChevronDown } from "lucide-react";

type FaqItem = { question: string; answer: string };

export default function UniversityFaq({ faqItems }: { faqItems: FaqItem[] }) {
  if (!faqItems?.length) return null;

  const items = faqItems.map((item, index) => ({
    key: String(index),
    label: item.question,
    children: (
      <div className="px-4 pb-5 text-left text-sm leading-relaxed text-neutral-600 md:px-6 md:pb-6 md:text-base">
        {item.answer}
      </div>
    ),
    className: "border-none rounded-lg bg-primary-50/70",
  }));

  return (
    <section id="faqs" className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-[26px] font-semibold text-[#20242A] md:text-[30px]">FAQS</h2>
      </div>
      <Collapse
        accordion
        defaultActiveKey={["0"]}
        expandIconPosition="end"
        expandIcon={({ isActive }) => (
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isActive ? "rotate-180" : ""}`} />
        )}
        className="space-y-4 bg-transparent"
        bordered={false}
        items={items}
      />
    </section>
  );
}
