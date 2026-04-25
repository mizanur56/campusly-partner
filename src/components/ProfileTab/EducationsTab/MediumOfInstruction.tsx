
import React, { useEffect, useState } from "react";
import {
  FaRegEdit,
  FaFileAlt,
  FaPlusSquare,
  FaRegTrashAlt,
} from "react-icons/fa"; // FaRegTrashAlt add kora hoyeche
import { FiEye } from "react-icons/fi"; // View icon er jonno
import { config } from "../../../config";
import { toast } from "react-toastify";

import { Modal, Spin, Tooltip } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useGetStudentProfileQuery, useUpdateStudentProfileMutation } from "../../../redux/features/profile/studentProfileApi";
import { useCreateMediaMutation } from "../../../redux/features/media/mediaApi";

interface PartnerStudentProfileMedium {
  mediumOfInstruction?: string | null;
}

const MediumOfInstruction = ({ studentId }: { studentId: string }) => {
  const { data: profileDataRaw, refetch } = useGetStudentProfileQuery(
    studentId,
    { skip: !studentId },
  );
  const profileData = profileDataRaw as PartnerStudentProfileMedium | null | undefined;

  const mediumOfInstruction = profileData?.mediumOfInstruction ?? null;

  const [mediumOfInstructionFile, setMediumOfInstructionFile] = useState<
    string | null
  >(mediumOfInstruction || null);

  useEffect(() => {
    setMediumOfInstructionFile(mediumOfInstruction || null);
  }, [mediumOfInstruction]);

  const [createMedia, { isLoading: isUploadingMediumOfInstruction }] =
    useCreateMediaMutation();
  const [updateProfile] = useUpdateStudentProfileMutation();

  const handleMediumOfInstructionUpload = async (file: File) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "medium-of-instruction");

      const response = await createMedia(formData).unwrap();

      if (response?.success && response?.data) {
        const imagePath = response.data.url;
        await updateProfile({ studentId, body: { mediumOfInstruction: imagePath } }).unwrap();
        setMediumOfInstructionFile(imagePath);
        toast.success(
          "Medium of instruction certificate uploaded successfully!",
        );
        refetch(); // Latest data fetch korar jonno
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to upload file.");
    }
  };

  // Delete handler
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    Modal.confirm({
      title: "Are you sure you want to delete this file?",
      icon: <ExclamationCircleFilled />,
      content: "Once deleted, you will need to upload it again if required.",
      okText: "Yes, Delete",
      // okType: "danger",
      okButtonProps: {
        className: "!bg-[#237D3B] !border-[#237D3B] hover:!bg-[#19592a]",
      },

      // Cancel Button Style
      cancelText: "No, Cancel",
      cancelButtonProps: {
        className: "hover:!text-[#237D3B] hover:!border-[#237D3B]",
      },
      onOk: async () => {
        try {
          // Backend jodi null reject kore, tobe "" (empty string) pathaben
          await updateProfile({ studentId, body: { mediumOfInstruction: "" } }).unwrap();
          setMediumOfInstructionFile(null);
          toast.success("File removed successfully!");
          refetch();
        } catch (error: any) {
          toast.error("Failed to remove file.");
        }
      },
    });
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fileUrl = mediumOfInstructionFile?.startsWith("http")
      ? mediumOfInstructionFile
      : `${config.image_access_url}${mediumOfInstructionFile}`;
    window.open(fileUrl, "_blank");
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#C7CACF] rounded-lg p-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-semibold text-[#20242A]">
          Medium of instruction
        </h1>
        <div className="flex items-center">
          {!mediumOfInstructionFile && (
            <label
              htmlFor="medium-of-instruction-file-upload"
              className={
                isUploadingMediumOfInstruction
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              }
            >
              {isUploadingMediumOfInstruction ? (
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
              if (file) handleMediumOfInstructionUpload(file);
              e.target.value = "";
            }}
            disabled={isUploadingMediumOfInstruction}
          />
        </div>
      </div>

      {mediumOfInstructionFile && !isUploadingMediumOfInstruction && (
        <div className="mt-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 group">
            <div className="flex items-center gap-3">
              <FaFileAlt className="w-6 h-6 text-[#4B5563]" />
              <p className="text-[16px] font-medium text-[#111827]">
                Medium of Instruction Certificate
              </p>
            </div>

            {/* Action Icons Section */}
            <div className="flex items-center gap-3">
              <Tooltip title="View File">
                <button
                  onClick={handleView}
                  className="cursor-pointer text-gray-500 hover:text-[#237D3B] transition-colors"
                >
                  <FiEye size={20} />
                </button>
              </Tooltip>

              {/* <label
                htmlFor="medium-of-instruction-file-upload"
                className="cursor-pointer text-gray-500 hover:text-[#237D3B] transition-colors"
              >
                <Tooltip title="Edit File">
                  <FaRegEdit size={18} />
                </Tooltip>
              </label> */}

              <Tooltip title="Delete File">
                <button
                  onClick={handleDelete}
                  className="cursor-pointer text-gray-500 hover:text-red-500 transition-colors"
                >
                  <FaRegTrashAlt size={18} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediumOfInstruction;
