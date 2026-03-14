import { useState, useRef, useMemo, useCallback } from "react";
import { FileTextOutlined, LoadingOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { FaCircleCheck } from "react-icons/fa6";
import { FaPlusSquare } from "react-icons/fa";
import {
  useGetStudentProfileQuery,
  useUpdateStudentProfileMutation,
  useUpdateEducationMutation,
  useGetDocumentsByCategoryQuery,
} from "../../../../redux/features/profile/studentProfileApi";
import { useCreateMediaMutation } from "../../../../redux/features/media/mediaApi";
import { config } from "../../../../config";
import PrimaryButton from "../../../../components/common/Button/PrimaryButton";

interface DocumentItem {
  id: string;
  name: string;
  status: "pending" | "submitted";
  category: string;
  educationId?: string;
  icon?: React.ReactNode;
}

interface DocumentGroup {
  label: string;
  items: DocumentItem[];
}

interface DocumentSection {
  id: string;
  title: string;
  description: string;
  items?: DocumentItem[];
  groups?: DocumentGroup[];
}

interface UploadDocumentsTabProps {
  studentId: string;
  profile: {
    imageId?: string;
    passportNo?: string;
    cv?: string;
    statementOfPurpose?: string;
    educations?: { id: string; studyLevel?: { description?: string }; marksheet?: string; certificate?: string }[];
    documents?: { documentId: string; documentRelation?: { category?: { name?: string }; name?: string } }[];
  };
  canEdit: boolean;
  onUpdated?: () => void;
}

export default function UploadDocumentsTab({
  studentId,
  profile,
  canEdit,
  onUpdated,
}: UploadDocumentsTabProps) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadItemRef = useRef<DocumentItem | null>(null);

  const { data: profileData, refetch } = useGetStudentProfileQuery(studentId);
  const { data: backgroundData } = useGetDocumentsByCategoryQuery(
    { studentId, slug: "background-information" },
    { skip: !studentId }
  );

  const [createMedia, { isLoading: createMediaLoading }] = useCreateMediaMutation();
  const [updateProfile, { isLoading: profileUpdating }] = useUpdateStudentProfileMutation();
  const [updateEducation, { isLoading: educationUpdating }] = useUpdateEducationMutation();

  const documents = (profileData as { documents?: unknown[] })?.documents ?? [];
  const backgroundInformationData = (Array.isArray(backgroundData) ? backgroundData : []) as { id: string; name?: string }[];

  const backgroundInfoItems: DocumentItem[] = useMemo(() => {
    return backgroundInformationData.map((doc: { id: string; name?: string }) => {
      const isSubmitted = (documents as { documentId?: string }[]).some(
        (d) => d.documentId === doc.id
      );
      return {
        id: doc.id,
        name: doc.name ?? "Document",
        status: isSubmitted ? "submitted" : "pending",
        category: "document",
        icon: <FileTextOutlined />,
      };
    });
  }, [backgroundInformationData, documents]);

  const submittedEnglishTestDocs = (documents as { documentRelation?: { category?: { name?: string } } }[]).filter(
    (item) => item?.documentRelation?.category?.name === "English Language Tests"
  );

  const englishTestItems: DocumentItem[] = (submittedEnglishTestDocs as { documentId: string; documentRelation?: { name?: string } }[]).map((doc) => ({
    id: doc.documentId,
    name: doc?.documentRelation?.name ?? "English Test",
    status: "submitted" as const,
    category: "english-test",
    icon: <FileTextOutlined />,
  }));

  const educations = (profileData as { educations?: { id: string; studyLevelId?: string; studyLevel?: { description?: string }; marksheet?: string; certificate?: string }[] })?.educations ?? [];
  const academicGroups: DocumentGroup[] = useMemo(() => {
    const acc: Record<string, DocumentGroup> = {};
    educations.forEach((edu) => {
      const studyLevelId = edu.studyLevelId ?? (edu.studyLevel as { id?: string })?.id ?? edu.id;
      const label = edu.studyLevel?.description ?? "Education";
      if (!acc[studyLevelId]) acc[studyLevelId] = { label, items: [] };
      acc[studyLevelId].items.push(
        {
          id: `${edu.id}_marksheet`,
          name: "Marksheet",
          status: edu.marksheet ? "submitted" : "pending",
          category: "marksheet",
          educationId: edu.id,
          icon: <FileTextOutlined />,
        },
        {
          id: `${edu.id}_certificate`,
          name: "Certificate",
          status: edu.certificate ? "submitted" : "pending",
          category: "certificate",
          educationId: edu.id,
          icon: <FileTextOutlined />,
        }
      );
    });
    return Object.values(acc);
  }, [educations]);

  const sections: DocumentSection[] = useMemo(() => {
    const s: DocumentSection[] = [];
    const p = profileData as { imageId?: string; passportNo?: string; cv?: string; statementOfPurpose?: string } | null;
    s.push({
      id: "personal",
      title: "Personal Documents",
      description: "Submit a valid ID proof to enrol in courses",
      items: [
        { id: "photo", name: "Photo", status: p?.imageId ? "submitted" : "pending", category: "profile", icon: <FileTextOutlined /> },
        { id: "passport", name: "Passport", status: p?.passportNo ? "submitted" : "pending", category: "passport", icon: <FileTextOutlined /> },
        { id: "resume", name: "Resume", status: p?.cv ? "submitted" : "pending", category: "cv", icon: <FileTextOutlined /> },
      ],
    });
    if (academicGroups.length > 0) {
      s.push({
        id: "academic",
        title: "Academic Certificates",
        description: "Upload your marksheets and certificates",
        groups: academicGroups,
      });
    }
    if (englishTestItems.length > 0) {
      s.push({
        id: "english-test",
        title: "English Language Tests",
        description: "Submitted English language proficiency tests",
        items: englishTestItems,
      });
    }
    s.push({
      id: "additional",
      title: "Additional Documents",
      description: "Upload any additional documents",
      items: [
        ...backgroundInfoItems,
        {
          id: "sop",
          name: "Statement of Purpose",
          status: (profileData as { statementOfPurpose?: string })?.statementOfPurpose ? "submitted" : "pending",
          category: "statement-of-purpose",
          icon: <FileTextOutlined />,
        },
      ],
    });
    return s;
  }, [profileData, academicGroups, englishTestItems, backgroundInfoItems]);

  const handleFileUpload = async (item: DocumentItem, file: File) => {
    if (!canEdit) return;
    try {
      setActiveItemId(item.id);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", item.category);
      const response = await createMedia(formData as FormData).unwrap();
      const documentUrl = (response as { data?: { url?: string; id?: string } })?.data?.url;
      const imageId = (response as { data?: { id?: string } })?.data?.id;
      const baseUrl = config.image_access_url ?? "";
      const fullUrl = documentUrl ? (documentUrl.startsWith("http") ? documentUrl : `${baseUrl}${documentUrl}`) : "";

      if (imageId && item.category === "profile") {
        await updateProfile({ studentId, body: { imageId } }).unwrap();
      }

      const profilePayload: Record<string, string> = {};
      if (item.category === "cv") profilePayload.cv = fullUrl;
      else if (item.category === "passport") profilePayload.passportNo = fullUrl;
      else if (item.category === "statement-of-purpose") profilePayload.statementOfPurpose = fullUrl;

      if (Object.keys(profilePayload).length > 0) {
        await updateProfile({ studentId, body: profilePayload }).unwrap();
      }

      if ((item.category === "marksheet" || item.category === "certificate") && item.educationId) {
        await updateEducation({
          studentId,
          educationId: item.educationId,
          body: { [item.category]: fullUrl },
        }).unwrap();
      }

      toast.success(`${item.name} uploaded successfully`);
      refetch();
      onUpdated?.();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message ?? "Upload failed");
    }
    setActiveItemId(null);
  };

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      const item = pendingUploadItemRef.current;
      if (file && item) handleFileUpload(item, file);
    },
    []
  );

  const DocumentItemRow = ({ item }: { item: DocumentItem }) => {
    const isLoading =
      activeItemId === item.id && (createMediaLoading || profileUpdating || educationUpdating);

    return (
      <div className="flex items-center justify-between p-4 bg-white border border-[#C7CACF] rounded-lg transition-all group">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-[#4B5563] text-xl group-hover:text-[#237D3B] transition-colors">
            {item.icon}
          </span>
          <div className="flex-1">
            <p className="text-[14px] font-medium text-[#20242A]">{item.name}</p>
            {item.status === "submitted" && (
              <p className="text-[12px] text-[#00B561] font-medium">Submitted</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {item.status === "submitted" ? (
            <FaCircleCheck className="text-[24px] text-[#00B561]" />
          ) : canEdit ? (
            <>
              {isLoading ? (
                <LoadingOutlined className="text-[22px] text-[#237D3B]" />
              ) : (
                <FaPlusSquare
                  className="text-[24px] text-[#237D3B] hover:text-primary-400 cursor-pointer"
                  onClick={() => {
                    pendingUploadItemRef.current = item;
                    fileInputRef.current?.click();
                  }}
                />
              )}
            </>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelect}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
      />
      {sections.map((section) => (
        <div key={section.id} id={section.id} className="animate-in fade-in duration-500">
          <div className="mb-4">
            <h3 className="text-[18px] font-bold text-[#20242A]">{section.title}</h3>
            <p className="text-[14px] text-gray-500">{section.description}</p>
          </div>
          <div className="space-y-6">
            {section.groups ? (
              section.groups.map((group) => (
                <div key={group.label} className="mt-4">
                  <h4 className="text-[14px] font-semibold text-[#4B5563] mb-3 uppercase tracking-wider">
                    {group.label}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.items.map((item) => (
                      <DocumentItemRow key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {section.items?.map((item) => (
                  <DocumentItemRow key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-6 border-t">
        <PrimaryButton
          text="Next"
          size="large"
          className="h-12 px-10 rounded-lg shadow-md"
          to={`/students/${studentId}/profile?tab=apply`}
        />
      </div>
    </div>
  );
}
