import { LoadingOutlined } from "@ant-design/icons";
import { Modal, Spin } from "antd";
import { useState } from "react";
import { FaPlusSquare } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { FiEye, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { useCreateMediaMutation } from "../../../redux/features/media/mediaApi";
import {
  useGetStudentProfileQuery,
  useUpdateStudentProfileMutation,
} from "../../../redux/features/profile/studentProfileApi";
import FileViewer from "../../../utils/FileViewer";
import { getApiImageUrl } from "../../../utils/getApiImageUrl";

interface PartnerStudentProfileMedium {
  mediumOfInstruction?: string | null;
}

const MediumOfInstruction = ({ studentId }: { studentId: string }) => {
  const { data: profileDataRaw, refetch } = useGetStudentProfileQuery(
    studentId,
    { skip: !studentId },
  );
  const profileData = profileDataRaw as
    | PartnerStudentProfileMedium
    | null
    | undefined;

  const mediumOfInstruction = profileData?.mediumOfInstruction ?? null;
  const isSubmitted = !!mediumOfInstruction;
  const fileUrl = isSubmitted ? getApiImageUrl(mediumOfInstruction) : "";

  const [createMedia, { isLoading: isUploading }] = useCreateMediaMutation();
  const [updateProfile] = useUpdateStudentProfileMutation();
  const [deleting, setDeleting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "medium-of-instruction");
      const response = await createMedia(formData).unwrap();
      if (response?.success && response?.data) {
        await updateProfile({
          studentId,
          body: { mediumOfInstruction: response.data.url },
        }).unwrap();
        toast.success("Medium of instruction uploaded successfully!");
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to upload file.");
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await updateProfile({
        studentId,
        body: { mediumOfInstruction: "" },
      }).unwrap();
      toast.success("File removed successfully!");
      refetch();
    } catch {
      toast.error("Failed to remove file.");
    } finally {
      setDeleting(false);
      setPendingDelete(false);
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-primary-border rounded-lg p-6 overflow-hidden">
      {/* Header — same as original */}
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-semibold text-[#20242A]">
          Medium of instruction
        </h1>
        <div className="flex items-center">
          {!isSubmitted && (
            <label
              htmlFor="medium-of-instruction-file-upload"
              className={isUploading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
            >
              {isUploading ? (
                <Spin size="small" />
              ) : (
                <FaPlusSquare size={24} color="#237D3B" title="Upload file" />
              )}
            </label>
          )}
          <input
            id="medium-of-instruction-file-upload"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Submitted row — Upload Documents style */}
      {isSubmitted && (
        <div className="mt-4 p-3 border flex justify-between items-center rounded-md hover:bg-gray-50 transition-colors">
          <div className="flex flex-col">
            <span className="text-gray-700 font-medium">
              Medium of Instruction Certificate
            </span>
            <span className="text-[#237D3B] text-[14px]">Submitted</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="border border-[#CFCACF] p-1 rounded-md hover:border-primary hover:text-primary"
              onClick={() => setFileViewerOpen(true)}
              aria-label="View file"
            >
              <FiEye className="text-primary text-base" />
            </button>
            <button
              type="button"
              disabled={deleting}
              className="border border-[#CFCACF] p-1 rounded-md hover:border-red-500 hover:text-red-500 disabled:opacity-50"
              onClick={() => setPendingDelete(true)}
              aria-label="Delete file"
            >
              {deleting ? (
                <Spin
                  size="small"
                  indicator={
                    <LoadingOutlined
                      style={{ fontSize: 16, color: "#EF4444" }}
                      spin
                    />
                  }
                />
              ) : (
                <FiTrash2 className="text-red-500 text-base" />
              )}
            </button>
            <FaCircleCheck className="text-green-500 text-base" />
          </div>
        </div>
      )}

      <Modal
        open={pendingDelete}
        title="Delete document?"
        okText="Delete"
        okButtonProps={{ danger: true, loading: deleting }}
        cancelButtonProps={{ disabled: deleting }}
        onOk={handleConfirmDelete}
        onCancel={() => (deleting ? null : setPendingDelete(false))}
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete the Medium of Instruction Certificate?
        </p>
      </Modal>

      <FileViewer
        open={fileViewerOpen}
        url={fileUrl}
        title="Medium of Instruction Certificate"
        onClose={() => setFileViewerOpen(false)}
      />
    </div>
  );
};

export default MediumOfInstruction;
