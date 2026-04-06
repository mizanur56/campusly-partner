/* eslint-disable @typescript-eslint/no-unused-vars */
import { FiEdit } from "react-icons/fi";
import { toast } from "react-toastify";
import { Modal } from "antd";
import { useState } from "react";
import { config } from "../../../../config";
import Uploader from "../../../../components/common/Shared/Uploader";
import FilePreviewItem from "../../../../components/common/Shared/FilePreviewItem";
import QualificationForm from "../../../../components/ProfileTab/EducationsTab/QualificationForm";
const ModalContent = ({
  selectedStudyLevelId,
  profileData,
  refetch,
  createMedia,
  updateEducation,
  activeField,
  onClose,
}: any) => {
  const selectedEducation = profileData?.educations?.find(
    (e: any) => e.studyLevelId === selectedStudyLevelId,
  );

  const [uploadedFiles, setUploadedFiles] = useState({
    marksheet: selectedEducation?.marksheet || "",
    certificate: selectedEducation?.certificate || "",
  });

  // ফাইল হ্যান্ডলার
  const handleFileUpload = async (
    file: File,
    type: "marksheet" | "certificate",
  ) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", type);
      const res = await createMedia(fd).unwrap();

      if (res?.success) {
        const url = res.data.url;
        const uploadedFile = `${config.image_access_url}${url}`;
        setUploadedFiles((prev) => ({ ...prev, [type]: url }));
      }
    } catch {
      toast.error("Failed to upload file!");
    }
  };
  const handleDelete = (field: "marksheet" | "certificate") => {
    Modal.confirm({
      title: "Are you sure you want to delete this file?",
      content:
        "This action cannot be undone. You will need to upload the file again if needed.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        try {
          // ✅ local state update (তাত্ক্ষণিক ফিডব্যাক)
          setUploadedFiles((prev: any) => ({
            ...prev,
            [field]: "",
          }));

          // ✅ backend update
          if (selectedEducation?.id) {
            await updateEducation({
              id: selectedEducation.id,
              [field]: "", // ডাটাবেজে নাল বা এম্প্টি স্ট্রিং সেট করা
            }).unwrap();
          }

          await refetch();
          toast.success(
            `${field.charAt(0).toUpperCase() + field.slice(1)} removed successfully`,
          );
        } catch (error) {
          toast.error("Failed to remove file from server");
          // এরর হলে লোকাল স্টেট আবার আগের ডাটাতে ফিরিয়ে আনতে পারেন যদি প্রয়োজন হয়
          refetch();
        }
      },
    });
  };
  return (
    <div className="bg-white">
      <div className="p-6 border-b bg-gray-50/50">
        <div className="">
          {activeField === "marksheet" && (
            <div className="space-y-2" style={{ width: "100%" }}>
              <label className="text-xs font-bold text-gray-500 uppercase italic">
                Academic Marksheet Upload
              </label>
              <div className="w-full">
                {!uploadedFiles?.marksheet ? (
                  <div className="w-full">
                    <Uploader
                      label="Upload Marksheet"
                      onChange={(f: any) => {
                        const selectedFile = Array.isArray(f) ? f[0] : f;
                        const actualFile =
                          selectedFile?.originFileObj || selectedFile;

                        handleFileUpload(actualFile, "marksheet");
                      }}
                    />
                  </div>
                ) : (
                  <FilePreviewItem
                    file={uploadedFiles.marksheet}
                    onRemove={() => handleDelete("marksheet")}
                  />
                )}
              </div>
            </div>
          )}

          {activeField === "certificate" && (
            <div className="space-y-2" style={{ width: "100%" }}>
              <label className="text-xs font-bold text-gray-500 uppercase italic">
                Academic Certificate Upload
              </label>
              <div className="w-full" style={{ width: "100%" }}>
                {!uploadedFiles?.certificate ? (
                  <Uploader
                    label="Upload Certificate"
                    onChange={(f: any) => {
                      const selectedFile = Array.isArray(f) ? f[0] : f;
                      const actualFile =
                        selectedFile?.originFileObj || selectedFile;

                      handleFileUpload(actualFile, "certificate");
                    }}
                  />
                ) : (
                  <FilePreviewItem
                    file={uploadedFiles.certificate}
                    onRemove={() => handleDelete("certificate")}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <QualificationForm
          title="Academic Details"
          studyLevelId={selectedStudyLevelId}
          studentId={profileData?.userId}
          refetch={refetch}
          hideHeader={true}
          educationData={{
            ...selectedEducation,
            marksheet: uploadedFiles.marksheet,
            certificate: uploadedFiles.certificate,
          }}
        />
      </div>
    </div>
  );
};

export default ModalContent;
