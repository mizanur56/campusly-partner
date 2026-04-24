// import React, { useState, useEffect } from "react";
// import { Form, Button, Tooltip } from "antd";
// import dayjs from "dayjs";
// import { toast } from "react-toastify";
// import {
//   useCreateEducationMutation,
//   useUpdateEducationMutation,
//   useDeleteEducationMutation,
// } from "../../../redux/features/profile/studentProfileApi";
// import { useGetCountriesQuery } from "../../../redux/features/countries/countriesApi";
// import { FormDatePicker, FormInput, FormSelect } from "../../common/Forms";
// import PrimaryButton from "../../common/Button/PrimaryButton";
// import { FaRegEdit } from "react-icons/fa";
// import { FiChevronUp } from "react-icons/fi";
// import DeleteModal from "../../shared/DeleteModal";

// interface QualificationFormProps {
//   studentId: string;
//   title: string;
//   studyLevelId: string;
//   educationData?: {
//     id: string;
//     instituteName?: string;
//     country?: string;
//     startYear?: string;
//     endYear?: string;
//     outOfGrade?: string;
//     result?: string;
//     subject?: string;
//   } | null;
//   canEdit: boolean;
//   onUpdated?: () => void;
// }

// const QualificationForm: React.FC<QualificationFormProps> = ({
//   studentId,
//   title,
//   studyLevelId,
//   educationData,
//   canEdit,
//   onUpdated,
// }) => {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [form] = Form.useForm();
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);

//   const [createEducation, { isLoading: isCreating }] = useCreateEducationMutation();
//   const [updateEducation, { isLoading: isUpdating }] = useUpdateEducationMutation();
//   const [deleteEducation, { isLoading: isDeleting }] = useDeleteEducationMutation();
//   const { data: countriesData } = useGetCountriesQuery({ page: 1, limit: 1000 });

//   const countriesOptions =
//     (countriesData?.data as { id: string; name: string }[])?.map((c) => ({
//       label: c.name,
//       value: c.name,
//     })) ?? [];

//   const isSaving = isCreating || isUpdating;

//   useEffect(() => {
//     if (educationData) {
//       form.setFieldsValue({
//         instituteName: educationData.instituteName ?? "",
//         country: educationData.country ?? undefined,
//         outOfGrade: educationData.outOfGrade ?? "",
//         result: educationData.result ?? "",
//         subject: educationData.subject ?? "",
//         startYear: educationData.startYear ? dayjs(educationData.startYear) : null,
//         endYear: educationData.endYear ? dayjs(educationData.endYear) : null,
//       });
//       setIsEditing(false);
//     } else {
//       form.resetFields();
//       if (canEdit) setIsEditing(true);
//     }
//   }, [educationData, form, canEdit]);

//   const handleSave = async () => {
//     try {
//       const values = await form.validateFields();
//       const payload = {
//         studyLevelId,
//         instituteName: values.instituteName,
//         country: values.country || undefined,
//         startYear: values.startYear
//           ? dayjs(values.startYear).startOf("year").format("YYYY-MM-DD")
//           : undefined,
//         endYear: values.endYear
//           ? dayjs(values.endYear).endOf("year").format("YYYY-MM-DD")
//           : undefined,
//         outOfGrade: values.outOfGrade || undefined,
//         result: values.result || undefined,
//         subject: values.subject || undefined,
//       };

//       if (educationData?.id) {
//         await updateEducation({ studentId, educationId: educationData.id, body: payload }).unwrap();
//         toast.success("Education updated successfully!");
//       } else {
//         await createEducation({ studentId, body: payload }).unwrap();
//         toast.success("Education saved successfully!");
//       }
//       setIsEditing(false);
//       onUpdated?.();
//     } catch (err: unknown) {
//       const e = err as { data?: { message?: string } };
//       toast.error(e?.data?.message ?? "Failed to save education.");
//     }
//   };

//   const handleDiscard = () => {
//     form.resetFields();
//     if (educationData) {
//       form.setFieldsValue({
//         instituteName: educationData.instituteName ?? "",
//         country: educationData.country ?? undefined,
//         outOfGrade: educationData.outOfGrade ?? "",
//         result: educationData.result ?? "",
//         subject: educationData.subject ?? "",
//         startYear: educationData.startYear ? dayjs(educationData.startYear) : null,
//         endYear: educationData.endYear ? dayjs(educationData.endYear) : null,
//       });
//       setIsEditing(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!educationData?.id) return;
//     try {
//       await deleteEducation({ studentId, educationId: educationData.id }).unwrap();
//       toast.success("Education deleted");
//       setDeleteModalOpen(false);
//       onUpdated?.();
//     } catch (err: unknown) {
//       const e = err as { data?: { message?: string } };
//       toast.error(e?.data?.message ?? "Failed to delete");
//     }
//   };

//   return (
//     <>
//       <div className="bg-white border border-[#C7CACF] rounded-lg p-6 mb-4">
//         <div className="flex items-center justify-between">
//           <h3 className="text-[18px] font-semibold text-[#20242A]">{title}</h3>

//           <div className="flex items-center gap-2">
//             {canEdit && educationData && !isEditing && (
//               <Tooltip title="Edit Qualification">
//                 <button
//                   type="button"
//                   className="cursor-pointer"
//                   onClick={() => {
//                     setIsEditing(true);
//                     setIsExpanded(true);
//                   }}
//                 >
//                   <FaRegEdit size={20} color="#237D3B" />
//                 </button>
//               </Tooltip>
//             )}

//             <button
//               type="button"
//               onClick={() => setIsExpanded((prev) => !prev)}
//               className="bg-transparent cursor-pointer border-none flex items-center"
//             >
//               <FiChevronUp
//                 size={26}
//                 className={`transition-transform duration-300 ${
//                   isExpanded ? "rotate-0" : "rotate-180"
//                 }`}
//               />
//             </button>
//           </div>
//         </div>

//         <div
//           className={`
//           transition-all duration-500 ease-in-out overflow-hidden
//           ${isExpanded ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"}
//         `}
//         >
//           <Form form={form} layout="vertical" disabled={!isEditing} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
//               <FormInput
//                 name="instituteName"
//                 label="Institute Name"
//                 placeholder="Enter institute name"
//                 rules={[{ required: true, message: "Required" }]}
//               />
//               <FormSelect
//                 name="country"
//                 label="Country"
//                 placeholder="Select country"
//                 options={countriesOptions}
//               />
//               <FormDatePicker
//                 name="startYear"
//                 label="Start Year"
//                 picker="year"
//                 format="YYYY"
//               />
//               <FormDatePicker
//                 name="endYear"
//                 label="End Year"
//                 picker="year"
//                 format="YYYY"
//               />
//               <FormInput
//                 name="subject"
//                 label="Subject / Group"
//                 placeholder="Enter subject or group name"
//               />
//               <FormInput
//                 name="outOfGrade"
//                 label="Out of Grade"
//                 placeholder="e.g. 4.0"
//               />
//               <FormInput
//                 name="result"
//                 label="Result"
//                 placeholder="e.g. 3.75"
//               />
//             </div>

//             {canEdit && isEditing && (
//               <div className="flex justify-end gap-3 flex-wrap">
//                 {educationData?.id && (
//                   <Button
//                     size="large"
//                     danger
//                     loading={isDeleting}
//                     onClick={() => setDeleteModalOpen(true)}
//                   >
//                     Delete
//                   </Button>
//                 )}
//                 <Button
//                   size="large"
//                   className="px-8 border-[#237D3B] text-[#237D3B] rounded-lg hover:bg-green-50"
//                   onClick={handleDiscard}
//                 >
//                   Discard
//                 </Button>
//                 <PrimaryButton
//                   text={isSaving ? "Saving..." : "Save"}
//                   onClick={handleSave}
//                   loading={isSaving}
//                   disabled={isSaving}
//                 />
//               </div>
//             )}
//           </Form>
//         </div>
//       </div>

//       <DeleteModal
//         open={deleteModalOpen}
//         onCancel={() => setDeleteModalOpen(false)}
//         onConfirm={handleDelete}
//         itemName="this education record"
//         loading={isDeleting}
//       />
//     </>
//   );
// };

// export default QualificationForm;

// import React, { useState, useEffect } from "react";
// import { Form, Button, Tooltip } from "antd";
// import dayjs from "dayjs";
// import { toast } from "react-toastify";

// import {
//   useCreateEducationMutation,
//   useUpdateEducationMutation,
// } from "../../../redux/features/profle/educationsHistoryApi";
// import { useGetCountriesQuery } from "../../../redux/features/commonApi";
// import { FormDatePicker, FormInput, FormSelect } from "../../common/Forms";
// import PrimaryButton from "../../common/Button/PrimaryButton";
// import { FaRegEdit } from "react-icons/fa";
// import { FiChevronUp } from "react-icons/fi";

// interface QualificationFormProps {
//   title: string;
//   studyLevelId: string;
//   educationData?: any;
//   refetch: () => void;
//   hideHeader?: boolean;
// }

// const gradeOptions = [
//   { label: "CGPA 4 (1-4)", value: 4 },
//   { label: "CGPA 5 (1-5)", value: 5 },
//   { label: "CGPA 7 (1-7)", value: 7 },
//   { label: "CGPA 10 (1-10)", value: 10 },
//   { label: "CGPA 20 (1-20)", value: 20 },
//   { label: "Percentage (1-100)", value: 100 },
// ];

// const QualificationForm: React.FC<QualificationFormProps> = ({
//   title,
//   studyLevelId,
//   educationData,
//   refetch,
//   hideHeader = false,
// }) => {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);

//   const [form] = Form.useForm();
//   const selectedGrade = Form.useWatch("outOfGrade", form);

//   const [createEducation] = useCreateEducationMutation();
//   const [updateEducation] = useUpdateEducationMutation();
//   const { data: countries } = useGetCountriesQuery({ page: 1, limit: 1000 });

//   const countriesOptions =
//     countries?.data?.map((country: any) => ({
//       id: country.id,
//       label: country.name,
//       value: country.name,
//     })) || [];

//   useEffect(() => {
//     if (educationData) {
//       const formValues: Record<string, any> = {
//         instituteName: educationData.instituteName || "",
//         country: educationData.country || "",
//         outOfGrade: educationData.outOfGrade
//           ? Number(educationData.outOfGrade)
//           : "",
//         result: educationData.result || "",
//         subject: educationData.subject || "",
//       };

//       if (educationData.startYear)
//         formValues.startYear = dayjs(educationData.startYear);

//       if (educationData.endYear)
//         formValues.endYear = dayjs(educationData.endYear);

//       form.setFieldsValue(formValues);
//       // setIsEditing(false);
//     } else {
//       setIsEditing(true);
//       setIsExpanded(false); // নতুন ডেটার জন্য ফর্ম অটো ওপেন রাখা ভালো
//     }
//   }, [educationData, form]);

//   const handleSave = async () => {
//     try {
//       setIsSaving(true);
//       const values = await form.validateFields();

//       const payload: Record<string, any> = {
//         studyLevelId,
//         instituteName: values.instituteName,
//         country: values.country,
//         startYear: values.startYear
//           ? dayjs(values.startYear).startOf("year").format("YYYY-MM-DD")
//           : null,
//         endYear: values.endYear
//           ? dayjs(values.endYear).endOf("year").format("YYYY-MM-DD")
//           : null,
//         outOfGrade: values.outOfGrade ? String(values.outOfGrade) : null,
//         result: values.result ? String(values.result) : null,
//         subject: values.subject || null,
//       };

//       console.log(payload);

//       let response;

//       if (educationData?.id) {
//         response = await updateEducation({
//           id: educationData.id,
//           ...payload,
//         }).unwrap();

//         await refetch();

//         console.log(response);
//       } else {
//         response = await createEducation(payload).unwrap();
//       }

//       if (response.success) {
//         toast.success(
//           educationData?.id
//             ? "Education updated successfully!"
//             : "Education saved successfully!",
//         );
//         setIsEditing(false);
//       }
//     } catch (error: any) {
//       toast.error(error?.data?.message || "Failed to process request.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDiscard = () => {
//     if (educationData) {
//       // আগের ডেটা ফিরিয়ে আনা
//       const resetValues: Record<string, any> = {
//         instituteName: educationData.instituteName,
//         country: educationData.country,
//         outOfGrade: educationData.outOfGrade
//           ? Number(educationData.outOfGrade)
//           : "",
//         result: educationData.result,
//         subject: educationData.subject,
//         startYear: educationData.startYear
//           ? dayjs(educationData.startYear)
//           : null,
//         endYear: educationData.endYear ? dayjs(educationData.endYear) : null,
//       };
//       form.setFieldsValue(resetValues);
//       setIsEditing(false);
//       setIsExpanded(false);
//     } else {
//       form.resetFields();
//     }
//   };

//   // বাটন টেক্সট কন্ডিশনাল করা হলো
//   const getButtonText = () => {
//     if (isSaving) return "Saving...";
//     return educationData?.id ? "Save Changes" : "Save";
//   };

//   return (
//     <div className="bg-white border border-[#C7CACF] rounded-lg p-6 mb-4">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <h3 className="text-[18px] font-semibold text-[#20242A]">{title}</h3>

//         <div className="flex items-center gap-2">
//           {educationData && !isEditing && (
//             <Tooltip title="Edit Qualification">
//               <button
//                 type="button"
//                 className="cursor-pointer p-2 hover:bg-green-50 rounded-full transition-colors"
//                 onClick={() => {
//                   setIsEditing(true);
//                   setIsExpanded(true);
//                 }}
//               >
//                 <FaRegEdit size={20} color="#237D3B" />
//               </button>
//             </Tooltip>
//           )}

//           <button
//             type="button"
//             onClick={() => setIsExpanded((prev) => !prev)}
//             className="bg-transparent cursor-pointer border-none flex items-center p-1"
//           >
//             <FiChevronUp
//               size={26}
//               className={`transition-transform duration-300 ${
//                 isExpanded ? "rotate-0" : "rotate-180"
//               }`}
//             />
//           </button>
//         </div>
//       </div>

//       {/* Expandable Content */}
//       <div
//         className={`transition-all duration-500 ease-in-out overflow-hidden ${
//           isExpanded ? "max-h-250 opacity-100 mt-4" : "max-h-0 opacity-0"
//         }`}
//       >
//         <Form
//           form={form}
//           layout="vertical"
//           disabled={!isEditing}
//           className="space-y-4"
//         >
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
//             <FormInput
//               name="instituteName"
//               label="Institute Name"
//               placeholder="Enter institute name"
//               required
//             />

//             <FormSelect
//               name="country"
//               label="Country"
//               placeholder="Select country"
//               options={countriesOptions}
//             />

//             <FormDatePicker name="startYear" label="Start Year" picker="year" />

//             <FormDatePicker name="endYear" label="End Year" picker="year" />

//             <FormInput
//               name="subject"
//               label="Subject / Group"
//               placeholder="Enter subject or group name"
//             />

//             <FormSelect
//               name="outOfGrade"
//               label="Out of Grade"
//               placeholder="Select grading scale"
//               options={gradeOptions}
//             />

//             <FormInput
//               name="result"
//               label="Result"
//               placeholder="Enter result"
//               type="number"
//               step="any"
//               disabled={!selectedGrade || !isEditing}
//               rules={[
//                 {
//                   validator: (_: any, value: any) => {
//                     if (!value || !selectedGrade) return Promise.resolve();

//                     const numericValue = parseFloat(value);
//                     const maxGrade = parseFloat(selectedGrade);

//                     if (isNaN(numericValue)) {
//                       return Promise.reject(
//                         new Error("Please enter a valid number"),
//                       );
//                     }

//                     if (numericValue < 1 || numericValue > maxGrade) {
//                       return Promise.reject(
//                         new Error(
//                           `Result must be between 1 and ${selectedGrade}`,
//                         ),
//                       );
//                     }
//                     return Promise.resolve();
//                   },
//                 },
//               ]}
//             />
//           </div>

//           {isEditing && (
//             <div className="flex justify-end gap-3 mt-6">
//               <Button
//                 size="large"
//                 className="px-8 border-[#237D3B] text-[#237D3B] hover:bg-green-50"
//                 onClick={handleDiscard}
//               >
//                 Discard
//               </Button>

//               <PrimaryButton
//                 text={getButtonText()}
//                 onClick={handleSave}
//                 loading={isSaving}
//                 disabled={isSaving}
//               />
//             </div>
//           )}
//         </Form>
//       </div>
//     </div>
//   );
// };

// export default QualificationForm;

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Form, Button, Tooltip } from "antd";
import dayjs from "dayjs";
import { toast } from "react-toastify";

import { FormDatePicker, FormInput, FormSelect } from "../../common/Forms";
import PrimaryButton from "../../common/Button/PrimaryButton";
import { FaRegEdit } from "react-icons/fa";
import { FiChevronUp } from "react-icons/fi";
import {
  useCreateEducationMutation,
  useUpdateEducationMutation,
} from "../../../redux/features/profile/studentProfileApi";
import { useGetCountriesQuery } from "../../../redux/features/countries/countriesApi";

interface QualificationFormProps {
  profileData?: any;
  title: string;
  studyLevelId: string;
  educationData?: any;
  refetch: () => void;
  studentId?: any;
  onUpdated?: () => void;
  canEdit?: boolean;
  hideHeader?: boolean; // এই প্রপসটি দিয়ে আমরা কন্ট্রোল করব
}

const gradeOptions = [
  { label: "CGPA 4 (1-4)", value: 4 },
  { label: "CGPA 5 (1-5)", value: 5 },
  { label: "CGPA 7 (1-7)", value: 7 },
  { label: "CGPA 10 (1-10)", value: 10 },
  { label: "CGPA 20 (1-20)", value: 20 },
  { label: "Percentage (1-100)", value: 100 },
];

const QualificationForm: React.FC<QualificationFormProps> = ({
  profileData,
  title,
  studyLevelId,
  educationData,
  refetch,
  studentId,
  onUpdated,
  canEdit,
  hideHeader = false, // ডিফল্টভাবে false যাতে অন্য জায়গায় ব্রেক না করে
}) => {
  // যদি hideHeader true হয়, তবে সবসময় expanded এবং editing true থাকবে
  const [isExpanded, setIsExpanded] = useState(hideHeader);
  const [isEditing, setIsEditing] = useState(hideHeader);
  const [isSaving, setIsSaving] = useState(false);

  const [form] = Form.useForm();
  const selectedGrade = Form.useWatch("outOfGrade", form);


  const [createEducation] = useCreateEducationMutation();
  const [updateEducation] = useUpdateEducationMutation();
  const {
    data: countries,
    isLoading,
    isError,
  } = useGetCountriesQuery({ page: 1, limit: 1000 });

 

  const countriesOptions =
    countries?.data?.map((country: any) => ({
      id: country.id,
      label: country.name,
      value: country.name,
    })) || [];

  useEffect(() => {
    if (educationData) {
      const formValues: Record<string, any> = {
        instituteName: educationData.instituteName || "",
        country: educationData.country || "",
        outOfGrade: educationData.outOfGrade
          ? Number(educationData.outOfGrade)
          : "",
        result: educationData.result || "",
        subject: educationData.subject || "",
      };

      if (educationData.startYear)
        formValues.startYear = dayjs(educationData.startYear);
      if (educationData.endYear)
        formValues.endYear = dayjs(educationData.endYear);

      form.setFieldsValue(formValues);

      // শুধুমাত্র যদি হেডার থাকে (লিস্ট ভিউ), তবেই এডিট মোড অফ থাকবে
      if (!hideHeader) setIsEditing(false);
    } else {
      setIsEditing(true);
      // List view: stay collapsed until user expands (with or without saved data).
      if (!hideHeader) setIsExpanded(false);
    }
  }, [educationData, form, hideHeader]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const values = await form.validateFields();
      const payload: Record<string, any> = {
        studyLevelId,
        instituteName: values.instituteName,
        country: values.country,
        startYear: values.startYear
          ? dayjs(values.startYear).format("YYYY-MM-DD")
          : null,
        endYear: values.endYear
          ? dayjs(values.endYear).format("YYYY-MM-DD")
          : null,
        outOfGrade: values.outOfGrade ? String(values.outOfGrade) : null,
        result: values.result ? String(values.result) : null,
        subject: values.subject || "",
        // ফাইল ইউআরএলগুলো পেলোডে যোগ করা হচ্ছে (যা প্রপস থেকে আসছে)
        marksheet: educationData?.marksheet || "",
        certificate: educationData?.certificate || "",
      };

      let response: { success?: boolean } | undefined;
      if (educationData?.id) {
        response = await updateEducation({
          studentId,
          educationId: educationData.id as string,
          body: payload,
        }).unwrap();
        await refetch();
      } else {
        // Same normalized body as update — raw `values` keeps outOfGrade as number from Select.
        response = await createEducation({
          studentId,
          body: payload,
        }).unwrap();
        await refetch();
      }

      if (response?.success !== false) {
        toast.success(
          educationData?.id ? "Education updated!" : "Education saved!",
        );
        if (!hideHeader) setIsEditing(false);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (educationData) {
      form.resetFields();
      if (!hideHeader) {
        setIsEditing(false);
        setIsExpanded(false);
      }
    } else {
      form.resetFields();
    }
  };

  return (
    <div
      className={`bg-white transition-all ${hideHeader ? "border-none p-0" : "border border-[#C7CACF] rounded-lg px-5 py-4 mb-4 shadow-sm"}`}
    >
      {/* --- Conditional Header Section --- */}
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-[#20242A]">{title}</h3>
          <div className="flex items-center gap-2">
            {educationData && !isEditing && (
              <Tooltip title="Edit Qualification">
                <button
                  type="button"
                  className="cursor-pointer p-2 hover:bg-green-50 rounded-full"
                  onClick={() => {
                    setIsEditing(true);
                    setIsExpanded(true);
                  }}
                >
                  <FaRegEdit size={20} color="#237D3B" />
                </button>
              </Tooltip>
            )}
            {/* Arrow Icon and Expand functionality is conditional here */}
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="bg-transparent cursor-pointer border-none flex items-center p-1"
            >
              <FiChevronUp
                size={26}
                className={`transition-transform duration-300 ${isExpanded ? "rotate-0" : "rotate-180"}`}
              />
            </button>
          </div>
        </div>
      )}

      {/* --- Form Content --- */}
      <div
        className={`transition-all duration-500 overflow-hidden ${isExpanded ? "max-h-250 opacity-100 mt-4" : "max-h-0 opacity-0"}`}
      >
        <Form
          form={form}
          layout="vertical"
          disabled={!isEditing}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <FormInput
              name="instituteName"
              label="Institute Name"
              placeholder="Enter institute name"
              rules={[{ required: true, message: "Institute name is required" }]}
            />
            <FormSelect
              name="country"
              label="Country"
              placeholder="Select country"
              options={countriesOptions}
              rules={[{ required: true, message: "Country is required" }]}
            />
            <FormDatePicker
              name="startYear"
              label="Start Date"
              // picker="year"
              placeholder="Select start Date"
              rules={[{ required: true, message: "Start Date is required" }]}
            />
            <FormDatePicker
              name="endYear"
              label="End Date"
              // picker="year"
              placeholder="Select end Date"
              rules={[{ required: true, message: "End Date is required" }]}
            />
            <FormInput
              name="subject"
              label="Subject / Group"
              placeholder="Enter subject or group"
              rules={[{ required: true, message: "Subject / group is required" }]}
            />
            <FormSelect
              name="outOfGrade"
              label="Out of Grade"
              placeholder="Select grading scale"
              options={gradeOptions}
              rules={[{ required: true, message: "Grading scale is required" }]}
            />
            <FormInput
              name="result"
              label="Result"
              placeholder="Enter result"
              type="number"
              step="any"
              disabled={!selectedGrade || !isEditing}
              rules={[
                {
                  validator: (_: any, value: any) => {
                    if (!selectedGrade) {
                      return Promise.reject(
                        new Error("Please select grading scale first"),
                      );
                    }
                    if (value === undefined || value === null || value === "") {
                      return Promise.reject(new Error("Result is required"));
                    }

                    const numericValue = parseFloat(value);
                    const maxGrade = parseFloat(String(selectedGrade));

                    if (Number.isNaN(numericValue)) {
                      return Promise.reject(
                        new Error("Please enter a valid number"),
                      );
                    }
                    if (numericValue < 1 || numericValue > maxGrade) {
                      return Promise.reject(
                        new Error(
                          `Result must be between 1 and ${selectedGrade}`,
                        ),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            />
          </div>

          {isEditing && (
            <div className="flex justify-end gap-3 mt-6">
              {/* Discard button looks better in list view, but can stay in modal too */}
              <Button
                size="large"
                className="px-8 border-[#237D3B] text-[#237D3B]"
                onClick={handleDiscard}
              >
                Discard
              </Button>
              <PrimaryButton
                text={
                  isSaving
                    ? "Saving..."
                    : educationData?.id
                      ? "Save Changes"
                      : "Save"
                }
                onClick={handleSave}
                loading={isSaving}
              />
            </div>
          )}
        </Form>
      </div>
    </div>
  );
};

export default QualificationForm;
