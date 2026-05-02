// import { useApplicationRecordQuery } from "../../../redux/features/application/applicationApi";

// export default function StudentRecordsTab({
//   profileData,
//   applicationApiData,
// }: {
//   profileData: any;
//   applicationApiData: any;
// }) {
//   const applicationId = applicationApiData?.id;
//   const { data } = useApplicationRecordQuery(applicationId, {
//     skip: !applicationId,
//   });
//   const studentRecord = data?.data;
//   console.log(studentRecord);
//   const records = [
//     {
//       id: "opened",
//       date: "06 Mar, 2024",
//       title: "Application Opened",
//       body: "As you progress through the application process, you will see documents provided by ApplyBoard here. These could come in the form of questions, documents, payments, invoices, and application statuses.",
//     },
//     {
//       id: "evaluated",
//       date: "06 Mar, 2024",
//       title: "Application has been evaluated for submission",
//       body: "",
//     },
//     {
//       id: "proof",
//       date: "06 Mar, 2024",
//       title: "Application Package Submission Proof",
//       body: "Please find below the application submission proof and the payment receipt.",
//       attachmentLabel: "Pre-Offer Letter.pdf",
//     },
//     {
//       id: "submitted",
//       date: "06 Mar, 2024",
//       title: "Application has been submitted",
//       body: "",
//     },
//     {
//       id: "congrats",
//       date: "06 Mar, 2024",
//       title: "Congratulations, Md Sakib has received an acceptance",
//       body: "",
//     },
//   ];

//   return (
//     <div className="">
//       <div className="px-6 py-6">
//         <div className="relative">
//           <div className="absolute left-[127px] top-2 bottom-2 w-[2px] bg-[#22C55E]/60" />

//           <div className="space-y-10">
//             {records.map((r, idx) => (
//               <div key={r.id} className="grid grid-cols-[96px_24px_1fr] gap-5">
//                 <div className="pt-1 text-xs text-gray-500 dark:text-gray-400">
//                   {r.date}
//                 </div>

//                 <div className="relative flex justify-center">
//                   <span className="mt-1 inline-flex h-3 w-3 rounded-full bg-[#22C55E]" />
//                 </div>

//                 <div className="min-w-0">
//                   <p className="text-sm font-semibold text-gray-900 dark:text-white">
//                     {r.title}
//                   </p>
//                   {r.body ? (
//                     <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
//                       {r.body}
//                     </p>
//                   ) : null}

//                   {r.id === "proof" ? (
//                     <div className="mt-4 max-w-xl rounded-xl border border-primary-border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
//                       <p className="text-sm font-semibold text-gray-900 dark:text-white">
//                         {r.title}
//                       </p>
//                       <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//                         {r.body}
//                       </p>
//                       <button
//                         type="button"
//                         className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#15803D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#166534]"
//                       >
//                         <span className="text-base leading-none">↓</span>
//                         <span>{r.attachmentLabel}</span>
//                       </button>
//                     </div>
//                   ) : null}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { config } from "../../../config";
import { useApplicationRecordQuery } from "../../../redux/features/application/applicationApi";

export default function StudentRecordsTab({
  applicationApiData,
}: {
  applicationApiData: any;
}) {
  const applicationId = applicationApiData?.id;
  const { data, isLoading } = useApplicationRecordQuery(applicationId, {
    skip: !applicationId,
  });

  const studentRecord = data?.data || [];

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      // যদি fetch ফেইল করে তবে বিকল্প হিসেবে নতুন ট্যাবে ওপেন হবে
      window.open(fileUrl, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="px-6 py-6 animate-pulse">
        <div className="relative">
          {/* Skeleton Vertical Line */}
          <div className="absolute left-[127px] top-2 bottom-2 w-[2px] bg-gray-200 dark:bg-gray-800" />

          <div className="space-y-10">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="grid grid-cols-[96px_24px_1fr] gap-5">
                {/* Date Skeleton */}
                <div className="pt-1">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>

                {/* Dot Skeleton */}
                <div className="relative flex justify-center">
                  <div className="mt-1 h-3 w-3 rounded-full bg-gray-200 dark:bg-gray-800" />
                </div>

                {/* Content Skeleton */}
                <div className="space-y-3">
                  <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-100 dark:bg-gray-900 rounded" />
                    <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-900 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="px-6 py-6">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[127px] top-2 bottom-2 w-[2px] bg-[#22C55E]/60" />

          <div className="space-y-10">
            {studentRecord.map((r: any) => (
              <div key={r.id} className="grid grid-cols-[96px_24px_1fr] gap-5">
                {/* Date */}
                <div className="pt-1 text-xs text-gray-500 dark:text-gray-400">
                  {r.date}
                </div>

                {/* Status Dot */}
                <div className="relative flex justify-center">
                  <span className="mt-1 inline-flex h-3 w-3 rounded-full bg-[#22C55E]" />
                </div>

                {/* Content */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {r.title}
                  </p>

                  {r.body && (
                    <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      {r.body}
                    </p>
                  )}

                  {/* Attachments Section */}
                  {r.attachments && r.attachments.length > 0 && (
                    <div className="mt-4 max-w-xl rounded-lg border border-[#CFC7C4] bg-[#FFFFFF] p-5 dark:border-gray-800 dark:bg-gray-900">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {r.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {r.body}
                      </p>

                      <div className="flex flex-wrap gap-3">
                        {r.attachments.map((file: any, index: number) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() =>
                              handleDownload(
                                `${config.image_access_url}${file.url}`,
                                file.label,
                              )
                            }
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#15803D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#166534] transition-colors"
                          >
                            <span className="text-base leading-none">↓</span>
                            <span>{file.label || "Download File"}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
