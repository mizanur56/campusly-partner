// import { useState, useRef, useMemo } from "react";
// import { FileTextOutlined, LoadingOutlined } from "@ant-design/icons";
// import { toast } from "react-toastify";
// import { FaCircleCheck } from "react-icons/fa6";
// import { FaPlusSquare } from "react-icons/fa";
// import {
//   useGetStudentProfileQuery,
//   useUpdateStudentProfileMutation,
//   useUpdateEducationMutation,
//   useGetDocumentsByCategoryQuery,
//   useGetEligibleStudyLevelsByCountryQuery,
// } from "../../../../redux/features/profile/studentProfileApi";
// import { useCreateMediaMutation } from "../../../../redux/features/media/mediaApi";
// import { config } from "../../../../config";
// import PrimaryButton from "../../../../components/common/Button/PrimaryButton";
// import { useGetCountriesQuery } from "../../../../redux/features/countries/countriesApi";

// interface DocumentItem {
//   id: string;
//   name: string;
//   status: "pending" | "submitted";
//   category: string;
//   educationId?: string;
//   icon?: React.ReactNode;
// }

// interface DocumentGroup {
//   label: string;
//   items: DocumentItem[];
// }

// interface DocumentSection {
//   id: string;
//   title: string;
//   description: string;
//   items?: DocumentItem[];
//   groups?: DocumentGroup[];
// }

// interface UploadDocumentsTabProps {
//   studentId: string;
//   profile: {
//     imageId?: string;
//     passportNo?: string;
//     cv?: string;
//     statementOfPurpose?: string;
//     educations?: {
//       id: string;
//       studyLevel?: { description?: string };
//       marksheet?: string;
//       certificate?: string;
//     }[];
//     documents?: {
//       documentId: string;
//       documentRelation?: { category?: { name?: string }; name?: string };
//     }[];
//   };
//   canEdit: boolean;
//   onUpdated?: () => void;
// }

// export default function UploadDocumentsTab({
//   studentId,
//   profile,
//   canEdit,
//   onUpdated,
// }: UploadDocumentsTabProps) {
//   const [activeItemId, setActiveItemId] = useState<string | null>(null);

//   const { data: profileData, refetch } = useGetStudentProfileQuery(studentId);
//   const { data: backgroundData } = useGetDocumentsByCategoryQuery(
//     { studentId, slug: "background-information" },
//     { skip: !studentId },
//   );
//   const { data: countriesData } = useGetCountriesQuery({
//     page: 1,
//     limit: 1000,
//   });

//   console.log(profileData);
//   console.log(studentId);
//   console.log(backgroundData);

//   const countryName = profileData?.country as any;

//   const selectedCountryId = useMemo(() => {
//     if (!countryName || !countriesData?.data) return null;

//     const c = (countriesData.data as { id: string; name: string }[]).find(
//       (x) => x.name.toLowerCase() === countryName.toLowerCase(),
//     );

//     return c?.id ?? null;
//   }, [countryName, countriesData?.data]);

//   const userId = profileData?.userId as string;

//   const { data: studyLevelsRes } = useGetEligibleStudyLevelsByCountryQuery(
//     {
//       countryId: selectedCountryId,
//       studentId: userId,
//     },
//     {
//       refetchOnMountOrArgChange: true,
//       skip: !selectedCountryId || !studentId,
//     },
//   );

//   const [createMedia, { isLoading: createMediaLoading }] =
//     useCreateMediaMutation();
//   const [updateProfile, { isLoading: profileUpdating }] =
//     useUpdateStudentProfileMutation();
//   const [updateEducation, { isLoading: educationUpdating }] =
//     useUpdateEducationMutation();

//   const documents = (profileData as { documents?: unknown[] })?.documents ?? [];
//   const backgroundInformationData = useMemo(() => {
//     const raw = Array.isArray(backgroundData)
//       ? backgroundData
//       : ((backgroundData as { data?: unknown[] })?.data ?? []);
//     return raw as { id: string; name?: string }[];
//   }, [backgroundData]);

//   const backgroundInfoItems: DocumentItem[] = useMemo(() => {
//     return backgroundInformationData.map(
//       (doc: { id: string; name?: string }) => {
//         const isSubmitted = (documents as { documentId?: string }[]).some(
//           (d) => d.documentId === doc.id,
//         );
//         return {
//           id: doc.id,
//           name: doc.name ?? "Document",
//           status: isSubmitted ? "submitted" : "pending",
//           category: "document",
//           icon: <FileTextOutlined />,
//         };
//       },
//     );
//   }, [backgroundInformationData, documents]);

//   const submittedEnglishTestDocs = (
//     documents as { documentRelation?: { category?: { name?: string } } }[]
//   ).filter(
//     (item) =>
//       item?.documentRelation?.category?.name === "English Language Tests",
//   );

//   const englishTestItems: DocumentItem[] = (
//     submittedEnglishTestDocs as {
//       documentId: string;
//       documentRelation?: { name?: string };
//     }[]
//   ).map((doc) => ({
//     id: doc.documentId,
//     name: doc?.documentRelation?.name ?? "English Test",
//     status: "submitted" as const,
//     category: "english-test",
//     icon: <FileTextOutlined />,
//   }));

//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   const educations =
//     (
//       profileData as {
//         educations?: {
//           id: string;
//           studyLevelId?: string;
//           studyLevel?: { description?: string };
//           marksheet?: string;
//           certificate?: string;
//         }[];
//       }
//     )?.educations ?? [];
//   const studyLevelData = studyLevelsRes?.data ?? [];
//   const academicGroups: DocumentGroup[] = useMemo(() => {
//     return studyLevelData.map((level: any) => {
//       const edu = educations?.find((e: any) => e.studyLevelId === level.id);

//       return {
//         label: level.countryStudyLevelName,
//         studyLevelId: level.id,
//         educationData: edu,
//         items: [
//           {
//             id: `${level.id}_marksheet`,
//             name: "Marksheet",
//             status: edu?.marksheet ? "submitted" : "pending",
//             category: "marksheet",
//           },
//           {
//             id: `${level.id}_certificate`,
//             name: "Certificate",
//             status: edu?.certificate ? "submitted" : "pending",
//             category: "certificate",
//           },
//         ],
//       };
//     });
//   }, [studyLevelData, educations]);

//   const sections: DocumentSection[] = useMemo(() => {
//     const s: DocumentSection[] = [];
//     const p = profileData as {
//       imageId?: string;
//       passportNo?: string;
//       cv?: string;
//       statementOfPurpose?: string;
//     } | null;
//     s.push({
//       id: "personal",
//       title: "Personal Documents",
//       description: "Submit a valid ID proof to enrol in courses",
//       items: [
//         {
//           id: "photo",
//           name: "Photo",
//           status: p?.imageId ? "submitted" : "pending",
//           category: "profile",
//           icon: <FileTextOutlined />,
//         },
//         {
//           id: "passport",
//           name: "Passport",
//           status: p?.passportNo ? "submitted" : "pending",
//           category: "passport",
//           icon: <FileTextOutlined />,
//         },
//         {
//           id: "resume",
//           name: "Resume",
//           status: p?.cv ? "submitted" : "pending",
//           category: "cv",
//           icon: <FileTextOutlined />,
//         },
//       ],
//     });
//     if (academicGroups.length > 0) {
//       s.push({
//         id: "academic",
//         title: "Academic Certificates",
//         description: "Upload your marksheets and certificates",
//         groups: academicGroups,
//       });
//     }
//     if (englishTestItems.length > 0) {
//       s.push({
//         id: "english-test",
//         title: "English Language Tests",
//         description: "Submitted English language proficiency tests",
//         items: englishTestItems,
//       });
//     }
//     s.push({
//       id: "additional",
//       title: "Additional Documents",
//       description: "Upload any additional documents",
//       items: [
//         ...backgroundInfoItems,
//         {
//           id: "sop",
//           name: "Statement of Purpose",
//           status: (profileData as { statementOfPurpose?: string })
//             ?.statementOfPurpose
//             ? "submitted"
//             : "pending",
//           category: "statement-of-purpose",
//           icon: <FileTextOutlined />,
//         },
//       ],
//     });
//     return s;
//   }, [profileData, academicGroups, englishTestItems, backgroundInfoItems]);

//   const handleFileUpload = async (item: DocumentItem, file: File) => {
//     if (!canEdit) return;
//     try {
//       setActiveItemId(item.id);
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("category", item.category);
//       const response = await createMedia(formData as FormData).unwrap();
//       const documentUrl = (response as { data?: { url?: string; id?: string } })
//         ?.data?.url;
//       const imageId = (response as { data?: { id?: string } })?.data?.id;
//       const baseUrl = config.image_access_url ?? "";
//       const fullUrl = documentUrl
//         ? documentUrl.startsWith("http")
//           ? documentUrl
//           : `${baseUrl}${documentUrl}`
//         : "";

//       if (imageId && item.category === "profile") {
//         await updateProfile({ studentId, body: { imageId } }).unwrap();
//       }

//       const profilePayload: Record<string, string> = {};
//       if (item.category === "cv") profilePayload.cv = fullUrl;
//       else if (item.category === "passport")
//         profilePayload.passportNo = fullUrl;
//       else if (item.category === "statement-of-purpose")
//         profilePayload.statementOfPurpose = fullUrl;

//       if (Object.keys(profilePayload).length > 0) {
//         await updateProfile({ studentId, body: profilePayload }).unwrap();
//       }

//       if (
//         (item.category === "marksheet" || item.category === "certificate") &&
//         item.educationId
//       ) {
//         await updateEducation({
//           studentId,
//           educationId: item.educationId,
//           body: { [item.category]: fullUrl },
//         }).unwrap();
//       }

//       toast.success(`${item.name} uploaded successfully`);
//       refetch();
//       onUpdated?.();
//     } catch (err: unknown) {
//       const e = err as { data?: { message?: string } };
//       toast.error(e?.data?.message ?? "Upload failed");
//     }
//     setActiveItemId(null);
//   };

//   const DocumentItemComponent = ({ item }: { item: DocumentItem }) => {
//     const fileInputRef = useRef<HTMLInputElement>(null);
//     const isLoading =
//       activeItemId === item.id &&
//       (createMediaLoading || profileUpdating || educationUpdating);

//     const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
//       const file = e.target.files?.[0];
//       if (file) await handleFileUpload(item, file);
//       e.target.value = "";
//     };

//     return (
//       <div className="flex items-center justify-between p-4 bg-white border border-[#C7CACF] rounded-lg hover:border-[#237D3B] transition-all group">
//         <div className="flex items-center gap-3 flex-1">
//           <span className="text-[#4B5563] text-xl group-hover:text-[#237D3B] transition-colors">
//             {item.icon}
//           </span>
//           <div className="flex-1">
//             <p className="text-[14px] font-medium text-[#20242A]">
//               {item.name}
//             </p>
//             {item.status === "submitted" && (
//               <p className="text-[12px] text-[#00B561] font-medium">
//                 Submitted
//               </p>
//             )}
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           {item.status === "submitted" ? (
//             <FaCircleCheck className="text-[24px] text-[#00B561]" />
//           ) : canEdit ? (
//             <div className="relative">
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={onFileSelect}
//                 className="hidden"
//                 accept=".pdf,.jpg,.jpeg,.png"
//               />
//               {isLoading ? (
//                 <LoadingOutlined className="text-[22px] text-[#237D3B]" />
//               ) : (
//                 <FaPlusSquare
//                   className="text-[24px] text-[#237D3B] hover:text-primary-400 cursor-pointer transition-transform"
//                   onClick={() => fileInputRef.current?.click()}
//                 />
//               )}
//             </div>
//           ) : null}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-8 pb-10">
//       {sections.map((section) => (
//         <div
//           key={section.id}
//           id={section.id}
//           className="animate-in fade-in duration-500"
//         >
//           <div className="mb-4">
//             <h3 className="text-[18px] font-bold text-[#20242A]">
//               {section.title}
//             </h3>
//             <p className="text-[14px] text-gray-500">{section.description}</p>
//           </div>
//           <div className="space-y-6">
//             {section.groups ? (
//               section.groups.map((group) => (
//                 <div key={group.label} className="mt-4">
//                   <h4 className="text-[14px] font-semibold text-[#4B5563] mb-3 uppercase tracking-wider">
//                     {group.label}
//                   </h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {group.items.map((item) => (
//                       <DocumentItemComponent key={item.id} item={item} />
//                     ))}
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="grid grid-cols-1 gap-4">
//                 {section.items?.map((item) => (
//                   <DocumentItemComponent key={item.id} item={item} />
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       ))}

//       <div className="flex justify-end pt-6 border-t">
//         <PrimaryButton
//           text="Next"
//           size="large"
//           className="h-12 px-10 rounded-lg shadow-md"
//           to={`/students/${studentId}/profile?tab=apply-now`}
//         />
//       </div>
//     </div>
//   );
// }

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef, useMemo, useEffect } from "react";
import { FaPlusSquare } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { Modal } from "antd";
import { toast } from "react-toastify";
import {
  DeleteOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileWordOutlined,
} from "@ant-design/icons";
import { RiDeleteBin5Line } from "react-icons/ri";

import ModalContent from "../utils/ModalContent";
import { FiEdit } from "react-icons/fi";
import {
  useCreateEducationMutation,
  useGetDocumentsByCategoryQuery,
  useGetEligibleStudyLevelsByCountryQuery,
  useGetStudentProfileQuery,
  useUpdateEducationMutation,
  useUpdateStudentProfileMutation,
} from "../../../../redux/features/profile/studentProfileApi";
import { useGetCountriesQuery } from "../../../../redux/features/countries/countriesApi";
import { useCreateMediaMutation } from "../../../../redux/features/media/mediaApi";
import PrimaryButton from "../../../../components/common/Button/PrimaryButton";

interface DocumentItem {
  id: string;
  name: string;
  status: "pending" | "submitted";
  category: string;
  educationId?: string;
}

interface DocumentGroup {
  label: string;
  studyLevelId: string;
  educationData?: any;
  items: DocumentItem[];
}

/** Partner student profile fields used in this tab (RTK unwraps `response.data`). */
export interface StudentProfileUploadShape {
  userId?: string;
  country?: string;
  data?: { country?: string };
  imageId?: string;
  passportNo?: string;
  cv?: string;
  statementOfPurpose?: string;
  educations?: Array<{
    id?: string;
    studyLevelId?: string;
    marksheet?: string;
    certificate?: string;
  }>;
  documents?: Array<{
    id?: string;
    documentId?: string;
    documentRelation?: { name?: string; category?: { name?: string } };
  }>;
}

interface UploadDocumentsTabProps {
  studentId: string;
  profile?: unknown;
  canEdit?: boolean;
  onUpdated?: () => void;
}

const UploadDocuments = ({
  studentId,
  profile: _profile,
  canEdit: _canEdit,
  onUpdated: _onUpdated,
}: UploadDocumentsTabProps) => {
  const { data: profileDataRaw, refetch } = useGetStudentProfileQuery(
    studentId,
    { skip: !studentId },
  );
  const profileData = profileDataRaw as StudentProfileUploadShape | null | undefined;
  const documents = profileData?.documents ?? [];

  const submittedEnglishTestDocs = documents.filter(
    (item: any) =>
      item?.documentRelation?.category?.name === "English Language Tests",
  );

  const { data: countries } = useGetCountriesQuery({ page: 1, limit: 1000 });

  const selectedCountryId = useMemo(() => {
    // ১. ডাটা এখনো লোড হচ্ছে কি না তা চেক করুন (প্রোফাইল অবজেক্টের ভেতর ডাটা আছে কি না)
    const profileCountryName =
      profileData?.data?.country || profileData?.country;
    const countryList = countries?.data;

    if (!profileCountryName || !countryList) return null;

    // ২. ট্রিম এবং লোয়ারকেস করে ম্যাচ খুঁজুন
    const matchedCountry = countryList.find(
      (c) =>
        c.name.trim().toLowerCase() === profileCountryName.trim().toLowerCase(),
    );

    return matchedCountry ? matchedCountry.id : null;
  }, [profileData, countries]);

  const userId = profileData?.userId;

  const { data: studyLevelsRes } = useGetEligibleStudyLevelsByCountryQuery(
    {
      countryId: selectedCountryId,
      studentId: userId,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !selectedCountryId || !studentId,
    },
  );
  const studyLevelData = studyLevelsRes?.data || [];

  const { data: backgroundData } = useGetDocumentsByCategoryQuery(
    { studentId, slug: "background-information" },
    { skip: !studentId },
  );

  const [createMedia, { isLoading: isCreatingMedia }] =
    useCreateMediaMutation();
  const [updateEducation, { isLoading: isUpdatingEducation }] =
    useUpdateEducationMutation();
  const [createEducation] = useCreateEducationMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateStudentProfileMutation();

  const [activeModal, setActiveModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<DocumentGroup | null>(
    null,
  );
  const [activeField, setActiveField] = useState<
    "marksheet" | "certificate" | null
  >(null);
  const [selectedStudyLevelId, setSelectedStudyLevelId] = useState<
    string | null
  >(null);

  // Hidden input ref for direct uploads
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeItem, setActiveItem] = useState<DocumentItem | null>(null);

  // /* ================= Academic Groups ================= */
  const academicGroups: DocumentGroup[] = useMemo(() => {
    return studyLevelData.map((level: any) => {
      const edu = profileData?.educations?.find(
        (e: any) => e.studyLevelId === level.id,
      );

      return {
        label: level.countryStudyLevelName,
        studyLevelId: level.id,
        educationData: edu,
        items: [
          {
            id: `${level.id}_marksheet`,
            name: "Marksheet",
            status: edu?.marksheet ? "submitted" : "pending",
            category: "marksheet",
          },
          {
            id: `${level.id}_certificate`,
            name: "Certificate",
            status: edu?.certificate ? "submitted" : "pending",
            category: "certificate",
          },
        ],
      };
    });
  }, [studyLevelData, profileData]);

  // /* ================= Section Logic ================= */
  const sections = useMemo(() => {
    const backgroundDocList = Array.isArray(backgroundData)
      ? backgroundData
      : (backgroundData as { data?: unknown[] } | null | undefined)?.data ??
        [];
    const s: any[] = [];
    s.push({
      id: "personal",
      title: "Personal Documents",
      desc: "Submit a valid ID proof to enrol in courses.",
      items: [
        {
          id: "photo",
          name: "Photo",
          status: profileData?.imageId ? "submitted" : "pending",
          category: "profile",
        },
        {
          id: "passport",
          name: "Passport",
          status: profileData?.passportNo ? "submitted" : "pending",
          category: "passport",
        },
        {
          id: "resume",
          name: "Resume",
          status: profileData?.cv ? "submitted" : "pending",
          category: "cv",
        },
      ],
    });

    if (academicGroups.length)
      s.push({
        id: "academic",
        title: "Academic Certificates",
        desc: "Secure admission to your best-matching courses by submitting accurate and comprehensive documents.",
        groups: academicGroups,
      });

    if (submittedEnglishTestDocs.length > 0) {
      s.push({
        id: "english-tests",
        title: "English Language Tests",
        desc: "Provide one of the listed certificates to determine your course eligibility.",
        items: submittedEnglishTestDocs.map((doc: any) => ({
          id: doc.id,
          // ৫-৬ লেটার দেখানোর লজিক
          name:
            doc.documentRelation?.name?.length > 8
              ? `${doc.documentRelation.name.slice(0, 6)}...`
              : doc.documentRelation?.name || "English Test",
          status: "submitted",
          category: "english-test",
        })),
      });
    }

    s.push({
      id: "additional",
      title: "Additional Documents",
      desc: "Provide one of the listed certificates to determine your course eligibility.",
      items: [
        ...backgroundDocList
          .map((doc: any) => {
            const isSubmitted = Boolean(
              profileData?.documents?.some((d: any) => d.documentId === doc.id),
            );

            // Work experience should only appear here after it has been filled/submitted.
            const isWorkExperience = String(doc?.name ?? "")
              .toLowerCase()
              .includes("work experience");
            if (isWorkExperience && !isSubmitted) return null;

            return {
              id: doc.id,
              name: doc.name,
              status: isSubmitted ? "submitted" : "pending",
              category: "document",
            };
          })
          .filter(Boolean),
        {
          id: "sop",
          name: "Statement of Purpose",
          status: profileData?.statementOfPurpose ? "submitted" : "pending",
          category: "statement-of-purpose",
        },
      ],
    });
    return s;
  }, [profileData, academicGroups, backgroundData, submittedEnglishTestDocs]);

  // /* ================= Upload Handler ================= */
  const handleFileUpload = async (file: File, item: DocumentItem) => {
    // const toastId = toast.loading(`Uploading ${item.name}...`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", item.category);

      const res = await createMedia(formData).unwrap();
      // const url = `${config.image_access_url}${res.data.url}`;
      const url = res.data.url;

      if (item.category === "profile")
        await updateProfile({
          studentId,
          body: { imageId: res.data.id },
        }).unwrap();
      else if (item.category === "cv")
        await updateProfile({ studentId, body: { cv: url } }).unwrap();
      else if (item.category === "passport")
        await updateProfile({ studentId, body: { passportNo: url } }).unwrap();
      else if (item.category === "statement-of-purpose")
        await updateProfile({
          studentId,
          body: { statementOfPurpose: url },
        }).unwrap();
      else if (
        item.category === "marksheet" ||
        item.category === "certificate"
      ) {
        await updateEducation({
          studentId,
          educationId: item.educationId!,
          body: { [item.category]: url },
        }).unwrap();
      }

      // toast.update(toastId, {
      //   render: `${item.name} uploaded!`,
      //   type: "success",
      //   isLoading: false,
      //   autoClose: 3000,
      // });
      refetch();
    } catch {
      toast.error("Upload failed");
    }
  };

  const triggerDirectUpload = (item: DocumentItem) => {
    setActiveItem(item);
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Hidden input for direct uploads */}
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files?.[0] && activeItem) {
            handleFileUpload(e.target.files[0], activeItem);
            e.target.value = ""; // reset
          }
        }}
      />

      {sections.map((section) => (
        <div
          key={section.id}
          className="bg-[#FFFFFF] p-4 rounded-lg border border-[#CFCACF] "
        >
          <div className="border-b pb-4 flex flex-col gap-2 mb-4">
            <h3 className="font-semibold text-[18px] text-[#20242A] ">
              {section.title}
            </h3>
            <p className="text-[14px] text-[#4B5563]">{section.desc}</p>
          </div>

          {section.groups ? (
            section.groups.map((group: DocumentGroup) => (
              <div key={group.studyLevelId} className="mb-6 last:mb-0 ">
                <h4 className="font-semibold text-gray-600 mb-2 uppercase text-xs tracking-wider">
                  {group.label}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border flex justify-between items-center rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-gray-700 font-medium">
                          {item.name}
                        </span>

                        {item.status === "submitted" && (
                          <span className="text-[#237D3B] text-[14px]">
                            Submitted
                          </span>
                        )}
                      </div>
                      {item.status === "submitted" ? (
                        <div className="flex items-center gap-2">
                          {/* ভিউ/এডিট আইকন */}
                          <div className=" border border-[#CFCACF]  cursor-pointer p-1 flex items-center hover:border-primary hover:text-primary rounded-lg ">
                            <FiEdit
                              className="text-primary text-xl"
                              onClick={() => {
                                setSelectedStudyLevelId(group.studyLevelId);
                                setActiveField(
                                  item.category as "marksheet" | "certificate",
                                );
                                setActiveModal(true);
                              }}
                            />
                          </div>
                          <FaCircleCheck className="text-green-500 text-xl" />
                        </div>
                      ) : (
                        <FaPlusSquare
                          className="text-primary text-xl cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => {
                            // setSelectedGroup(group);
                            // setSelectedStudyLevelId(group.studyLevelId);

                            // setActiveModal(true);

                            setSelectedStudyLevelId(group.studyLevelId);
                            setActiveField(
                              item.category as "marksheet" | "certificate",
                            ); // এখানে ক্যাটাগরি সেট হচ্ছে
                            setActiveModal(true);
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.items.map((item: DocumentItem) => (
                <div
                  key={item.id}
                  className="p-3 border flex justify-between items-center rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-gray-700 font-medium">
                      {item.name}
                    </span>

                    {item.status === "submitted" && (
                      <span className="text-[#237D3B] text-[14px]">
                        Submitted
                      </span>
                    )}
                  </div>
                  {item.status === "submitted" ? (
                    <FaCircleCheck className="text-green-500 text-xl" />
                  ) : (
                    <FaPlusSquare
                      className="text-primary text-xl cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => triggerDirectUpload(item)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <Modal
        open={activeModal}
        footer={null}
        onCancel={() => setActiveModal(false)}
        width={800}
        destroyOnClose
        centered
      >
        {selectedStudyLevelId && (
          <ModalContent
            selectedStudyLevelId={selectedStudyLevelId}
            profileData={profileData}
            refetch={refetch}
            createMedia={createMedia}
            updateEducation={updateEducation}
            isCreatingMedia={isCreatingMedia}
            isUpdatingEducation={isUpdatingEducation}
            isUpdatingProfile={isUpdatingProfile}
            // selectedStudyLevelId={selectedStudyLevelId}
            activeField={activeField}
          />
        )}
      </Modal>

      <div className="flex justify-end mt-6">
        <PrimaryButton
          text="Next"
          to={`/students/${studentId}/profile?tab=apply-now`}
        />
      </div>
    </div>
  );
};

export default UploadDocuments;
