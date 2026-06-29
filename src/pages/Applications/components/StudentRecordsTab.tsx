
import { Download, FileText } from "lucide-react";
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
      window.open(fileUrl, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="px-5 py-6 sm:px-6">
        <div className="mb-5 flex items-center gap-2 border-b border-neutral-100 pb-4">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-neutral-100" />
          <div className="space-y-2">
            <div className="h-4 w-36 animate-pulse rounded bg-neutral-100" />
            <div className="h-3 w-52 animate-pulse rounded bg-neutral-50" />
          </div>
        </div>
        <div className="space-y-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex gap-4">
              <div className="h-3 w-16 animate-pulse rounded bg-neutral-100" />
              <div className="h-3 w-3 animate-pulse rounded-full bg-neutral-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-100" />
                <div className="h-3 w-full animate-pulse rounded bg-neutral-50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (studentRecord.length === 0) {
    return (
      <div className="px-5 py-10 text-center sm:px-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
          <FileText size={20} />
        </div>
        <p className="mt-3 text-sm font-medium text-neutral-700">
          No student records yet
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Activity and updates will appear here as the application progresses.
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 py-5 sm:px-6 sm:py-6">
      <div className="mb-5 flex items-center gap-2 border-b border-neutral-100 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <FileText size={16} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-neutral-900">
            Student Records
          </h2>
          <p className="text-xs text-neutral-500">
            Timeline of application activity and updates.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[111px] top-2 bottom-2 w-px bg-primary-200 sm:left-[127px]" />

        <div className="space-y-8">
          {studentRecord.map((r: any) => (
            <div
              key={r.id}
              className="grid grid-cols-[88px_20px_1fr] gap-4 sm:grid-cols-[104px_24px_1fr] sm:gap-5"
            >
              <div className="pt-0.5 text-xs font-medium text-neutral-500">
                {r.date}
              </div>

              <div className="relative flex justify-center">
                <span className="relative z-10 mt-1 inline-flex h-2.5 w-2.5 rounded-full border-2 border-white bg-primary-500 shadow-sm" />
              </div>

              <div className="min-w-0 rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                <p className="text-sm font-semibold text-neutral-900">
                  {r.title}
                </p>

                {r.body && (
                  <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
                    {r.body}
                  </p>
                )}

                {r.attachments && r.attachments.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
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
                        className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-primary-700"
                      >
                        <Download size={14} />
                        <span>{file.label || "Download File"}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
