import { toast } from "react-toastify";

export const downloadFile = async (url: string, fileName?: string) => {
  if (!url) {
    toast.error("File URL is not available.");
    return;
  }

  const name = fileName || url.split("/").pop() || "download";

  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.setAttribute("download", name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    toast.error("Failed to download the file. Please try again.");
  }
};
