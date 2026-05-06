type FaqItem = { question: string; answer: string };

export default function UniversityFaq({ faqItems }: { faqItems: FaqItem[] }) {
  if (!faqItems?.length) return null;

  return (
    <section id="faqs" className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-[26px] font-semibold text-[#20242A] md:text-[30px]">FAQS</h2>
      </div>
      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <details key={`${item.question}-${index}`} className="rounded-lg bg-primary-50/70 p-0">
            <summary className="cursor-pointer px-4 py-4 text-left text-base font-semibold text-neutral-900 md:px-6 md:py-5 md:text-lg">
              {item.question}
            </summary>
            <div className="px-4 pb-5 text-sm leading-relaxed text-neutral-600 md:px-6 md:pb-6 md:text-base">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
