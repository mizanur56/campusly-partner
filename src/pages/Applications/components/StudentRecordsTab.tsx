export default function StudentRecordsTab({
  profileData,
  applicationApiData,
}: {
  profileData: any;
  applicationApiData: any;
}) {
  const records = [
    {
      id: "opened",
      date: "06 Mar, 2024",
      title: "Application Opened",
      body:
        "As you progress through the application process, you will see documents provided by ApplyBoard here. These could come in the form of questions, documents, payments, invoices, and application statuses.",
    },
    {
      id: "evaluated",
      date: "06 Mar, 2024",
      title: "Application has been evaluated for submission",
      body: "",
    },
    {
      id: "proof",
      date: "06 Mar, 2024",
      title: "Application Package Submission Proof",
      body:
        "Please find below the application submission proof and the payment receipt.",
      attachmentLabel: "Pre-Offer Letter.pdf",
    },
    {
      id: "submitted",
      date: "06 Mar, 2024",
      title: "Application has been submitted",
      body: "",
    },
    {
      id: "congrats",
      date: "06 Mar, 2024",
      title: "Congratulations, Md Sakib has received an acceptance",
      body: "",
    },
  ];

  return (
    <div className="">
      <div className="px-6 py-6">
        <div className="relative">
          <div className="absolute left-[127px] top-2 bottom-2 w-[2px] bg-[#22C55E]/60" />

          <div className="space-y-10">
            {records.map((r, idx) => (
              <div key={r.id} className="grid grid-cols-[96px_24px_1fr] gap-5">
                <div className="pt-1 text-xs text-gray-500 dark:text-gray-400">
                  {r.date}
                </div>

                <div className="relative flex justify-center">
                  <span className="mt-1 inline-flex h-3 w-3 rounded-full bg-[#22C55E]" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {r.title}
                  </p>
                  {r.body ? (
                    <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      {r.body}
                    </p>
                  ) : null}

                  {r.id === "proof" ? (
                    <div className="mt-4 max-w-xl rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {r.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {r.body}
                      </p>
                      <button
                        type="button"
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#15803D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#166534]"
                      >
                        <span className="text-base leading-none">↓</span>
                        <span>{r.attachmentLabel}</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

