// import React from "react";
// import { Modal, Form, Input, Button } from "antd";
// import { toast } from "react-toastify";
// import { useCreateStudentMutation } from "../../../redux/features/profile/studentProfileApi";
// import type { CreateStudentPayload } from "../../../redux/features/profile/studentProfileApi";

// interface CreateStudentModalProps {
//   open: boolean;
//   onClose: () => void;
//   onSuccess?: () => void;
// }

// const CreateStudentModal: React.FC<CreateStudentModalProps> = ({
//   open,
//   onClose,
//   onSuccess,
// }) => {
//   const [form] = Form.useForm<CreateStudentPayload & { confirmPassword?: string }>();
//   const [createStudent, { isLoading }] = useCreateStudentMutation();

//   const handleSubmit = async (values: CreateStudentPayload & { confirmPassword?: string }) => {
//     try {
//       const payload: CreateStudentPayload = {
//         email: values.email.trim(),
//         fullName: values.fullName.trim(),
//         phone: values.phone?.trim() || undefined,
//         password: values.password?.trim() && values.password.length >= 6 ? values.password : undefined,
//       };
//       const result = await createStudent(payload).unwrap();
//       toast.success(
//         result.temporaryPassword
//           ? `Student created. Temporary password: ${result.temporaryPassword}`
//           : "Student created successfully."
//       );
//       form.resetFields();
//       onClose();
//       onSuccess?.();
//     } catch (err: any) {
//       const msg =
//         err?.data?.message || err?.data?.errors?.[0]?.message || "Failed to create student.";
//       toast.error(msg);
//     }
//   };

//   const handleCancel = () => {
//     form.resetFields();
//     onClose();
//   };

//   return (
//     <Modal
//       title="Add Student"
//       open={open}
//       onCancel={handleCancel}
//       footer={
//         <div className="flex justify-end gap-2">
//           <Button onClick={handleCancel}>Cancel</Button>
//           <Button type="primary" onClick={() => form.submit()} loading={isLoading}>
//             Create Student
//           </Button>
//         </div>
//       }
//       destroyOnHidden
//     >
//       <Form
//         form={form}
//         layout="vertical"
//         onFinish={handleSubmit}
//         initialValues={{ email: "", fullName: "", password: "", phone: "" }}
//       >
//         <Form.Item
//           name="fullName"
//           label="Full name"
//           rules={[{ required: true, message: "Please enter full name" }]}
//         >
//           <Input placeholder="e.g. John Doe" />
//         </Form.Item>
//         <Form.Item
//           name="email"
//           label="Email"
//           rules={[
//             { required: true, message: "Please enter email" },
//             { type: "email", message: "Please enter a valid email" },
//           ]}
//         >
//           <Input placeholder="e.g. student@example.com" type="email" />
//         </Form.Item>
//         <Form.Item name="phone" label="Phone (optional)">
//           <Input placeholder="e.g. +8801700000000" />
//         </Form.Item>
//         <Form.Item
//           name="password"
//           label="Password (optional, min 6 characters)"
//           help="If left empty, a temporary password will be generated."
//         >
//           <Input.Password placeholder="Password" minLength={6} />
//         </Form.Item>
//         <Form.Item
//           name="confirmPassword"
//           label="Confirm password"
//           dependencies={["password"]}
//           rules={[
//             ({ getFieldValue }) => ({
//               validator(_, value) {
//                 const pwd = getFieldValue("password");
//                 if (!pwd || !value) return Promise.resolve();
//                 if (pwd !== value) return Promise.reject(new Error("Passwords do not match"));
//                 return Promise.resolve();
//               },
//             }),
//           ]}
//         >
//           <Input.Password placeholder="Confirm password" />
//         </Form.Item>
//       </Form>
//     </Modal>
//   );
// };

// export default CreateStudentModal;

import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Upload,
} from "antd";
import dayjs from "dayjs";
import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useGetCountriesQuery } from "../../../redux/features/countries/countriesApi";
import { useCreateMediaMutation } from "../../../redux/features/media/mediaApi";
import type { CreateStudentPayload } from "../../../redux/features/profile/studentProfileApi";
import {
  useCreateStudentMutation,
  useLazyGetDocumentsByCategoryQuery,
  useUpsertDocumentMutation,
  useUpdateStudentProfileMutation,
  useValidateDocumentWithAIMutation,
} from "../../../redux/features/profile/studentProfileApi";
import { useGetStudyLevelsByCountryQuery } from "../../../redux/features/studyLevels/studyLevelsApi";
import { toBase64WithoutPrefix } from "../../../pages/Students/StudentProfile/utils/academicDocumentValidation";
import { resolvePassportDocumentTemplateId } from "../../../pages/Students/StudentProfile/profileUploadShared";

interface CreateStudentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateStudentModal: React.FC<CreateStudentModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [form] = Form.useForm<
    CreateStudentPayload & {
      confirmPassword?: string;
      firstName?: string;
      lastName?: string;
      gender?: string;
      dateOfBirth?: unknown;
      country?: string;
      passportNo?: string;
      passportExpiryDate?: unknown;
      qualifications?: string;
      passingYear?: unknown;
    }
  >();
  const [createStudent, { isLoading }] = useCreateStudentMutation();
  const [updateStudentProfile] = useUpdateStudentProfileMutation();
  const [upsertStudentDocument] = useUpsertDocumentMutation();
  const [getDocumentsByCategory] = useLazyGetDocumentsByCategoryQuery();
  const [createMedia, { isLoading: isPassportUploading }] =
    useCreateMediaMutation();
  const [validateDocumentWithAI, { isLoading: isPassportExtracting }] =
    useValidateDocumentWithAIMutation();
  const [passportFileName, setPassportFileName] = React.useState<string | null>(
    null,
  );
  const [passportUrl, setPassportUrl] = React.useState<string | null>(null);
  const isPassportProcessing = isPassportUploading || isPassportExtracting;

  const { data: countriesData } = useGetCountriesQuery({
    page: 1,
    limit: 1000,
  });
  const selectedCountryName = Form.useWatch("country", form) as
    | string
    | undefined;
  const selectedQualificationId = Form.useWatch("qualifications", form) as
    | string
    | undefined;
  const hasSelectedQualification = Boolean(
    String(selectedQualificationId ?? "").trim(),
  );

  const selectedCountryId = React.useMemo(() => {
    if (!selectedCountryName || !countriesData?.data) return null;
    const c = (countriesData.data as { id: string; name: string }[]).find(
      (x) => x.name.toLowerCase() === selectedCountryName.toLowerCase(),
    );
    return c?.id ?? null;
  }, [selectedCountryName, countriesData?.data]);

  const { data: studyLevelsData } = useGetStudyLevelsByCountryQuery(
    selectedCountryId ?? "",
    { skip: !selectedCountryId },
  );

  const countriesOptions = React.useMemo(
    () =>
      (countriesData?.data ?? []).map((c: { id: string; name: string }) => ({
        label: c.name,
        value: c.name, // send country name from modal
      })),
    [countriesData?.data],
  );

  const qualificationOptions = React.useMemo(() => {
    const data = Array.isArray(studyLevelsData)
      ? studyLevelsData
      : ((studyLevelsData as { data?: unknown[] } | undefined)?.data ?? []);

    return (
      data as {
        studyLevel?: { id?: string; name?: string; description?: string };
        name?: string;
        countryStudyLevelName?: string;
        studyLevelId?: string;
      }[]
    ).map((item) => ({
      label: item.countryStudyLevelName ?? item.name ?? "",
      value: item.studyLevel?.id ?? item.studyLevelId ?? "",
    }));
  }, [studyLevelsData]);

  React.useEffect(() => {
    if (!hasSelectedQualification) {
      form.setFieldValue("passingYear", undefined);
    }
  }, [form, hasSelectedQualification]);

  const normalizeExtractedValue = (value: unknown): string | null => {
    if (value === undefined || value === null) return null;
    if (typeof value === "object" && "extracted" in (value as any)) {
      return normalizeExtractedValue((value as any).extracted);
    }
    const normalized = String(value).trim();
    if (!normalized || normalized.toLowerCase() === "null") return null;
    return normalized;
  };

  const pickExtracted = (
    extracted: Record<string, unknown>,
    keys: string[],
  ): string | null => {
    for (const key of keys) {
      const value = normalizeExtractedValue(extracted[key]);
      if (value) return value;
    }
    return null;
  };

  const parsePassportDate = (value: string | null) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    const isoMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    const dayFirstMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);

    const parsed = isoMatch
      ? dayjs(
          `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`,
        )
      : dayFirstMatch
        ? dayjs(
            `${dayFirstMatch[3]}-${dayFirstMatch[2].padStart(2, "0")}-${dayFirstMatch[1].padStart(2, "0")}`,
          )
        : dayjs(trimmed);

    return parsed.isValid() ? parsed : undefined;
  };

  const splitFullName = (fullName: string | null) => {
    if (!fullName) return { firstName: null, lastName: null };
    const parts = fullName.split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] ?? null,
      lastName: parts.slice(1).join(" ") || null,
    };
  };

  const applyPassportExtractedData = (
    extracted: Record<string, unknown>,
  ): boolean => {
    const givenNames = pickExtracted(extracted, [
      "given_names",
      "given_name",
      "first_name",
      "forenames",
    ]);
    const surname = pickExtracted(extracted, [
      "surname",
      "last_name",
      "family_name",
    ]);
    const fullName = pickExtracted(extracted, [
      "full_name",
      "name",
      "student_name",
      "holder_name",
    ]);
    const splitName = splitFullName(fullName);
    const gender = pickExtracted(extracted, ["gender", "sex"]);
    const country = pickExtracted(extracted, [
      "country",
      "nationality",
      "issuing_country",
      "country_of_issue",
    ]);
    const passportNo = pickExtracted(extracted, [
      "passport_no",
      "passport_number",
      "document_number",
      "passport",
    ]);
    const dateOfBirth = parsePassportDate(
      pickExtracted(extracted, ["date_of_birth", "dob", "birth_date"]),
    );
    const passportExpiryDate = parsePassportDate(
      pickExtracted(extracted, [
        "passport_expiry_date",
        "expiry_date",
        "date_of_expiry",
        "expiration_date",
      ]),
    );

    const normalizedGender = gender?.toLowerCase();
    const matchedCountry = country
      ? countriesOptions.find(
          (item) => item.label.toLowerCase() === country.toLowerCase(),
        )?.value
      : undefined;

    const nextValues: Record<string, unknown> = {};
    if (givenNames || splitName.firstName) {
      nextValues.firstName = givenNames || splitName.firstName;
    }
    if (surname || splitName.lastName) {
      nextValues.lastName = surname || splitName.lastName;
    }
    if (normalizedGender) {
      nextValues.gender = normalizedGender === "f" ||
        normalizedGender === "female"
        ? "female"
        : normalizedGender === "m" || normalizedGender === "male"
          ? "male"
          : "other";
    }
    if (matchedCountry || country) nextValues.country = matchedCountry || country;
    if (passportNo) nextValues.passportNo = passportNo;
    if (dateOfBirth) nextValues.dateOfBirth = dateOfBirth;
    if (passportExpiryDate) nextValues.passportExpiryDate = passportExpiryDate;

    if (!Object.keys(nextValues).length) return false;
    form.setFieldsValue(nextValues as any);
    return true;
  };

  const handlePassportAutofill = async (file: File) => {
    try {
      const base64 = await toBase64WithoutPrefix(file);
      const validationRes: any = await validateDocumentWithAI({
        documentBase64: base64,
        mimeType: file.type || "image/jpeg",
        expectedDocumentType: "passport",
        fields: [
          "full_name",
          "given_names",
          "surname",
          "country",
          "gender",
          "passport_no",
          "date_of_birth",
          "passport_expiry_date",
        ],
        matchSource: {},
        matchFields: [],
      }).unwrap();

      const aiPayload = validationRes?.data || {};
      const typeMatched = aiPayload?.data?.isDocumentTypeMatch !== false;
      if (!typeMatched) {
        toast.error("Please upload a valid passport document.");
        return;
      }

      const extracted =
        (aiPayload?.data?.extractedData as Record<string, unknown>) || {};
      const hasAutofilled = applyPassportExtractedData(extracted);

      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", "document");
      const res: any = await createMedia(fd).unwrap();
      const url = res?.data?.url || res?.data?.path || res?.url;
      if (!url) throw new Error("Upload failed");

      setPassportFileName(file.name);
      setPassportUrl(String(url));
      toast.success(
        hasAutofilled
          ? "Passport info extracted and filled."
          : "Passport uploaded. No readable info found to autofill.",
      );
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message ||
          err?.data?.error?.message ||
          "Failed to process passport",
      );
    }
  };

  const attachPassportToStudentDocuments = async (studentId?: string) => {
    if (!studentId || !passportUrl) return true;

    try {
      const [passportCategory, identityCategory] = await Promise.all([
        getDocumentsByCategory({ studentId, slug: "passport" }).unwrap(),
        getDocumentsByCategory({ studentId, slug: "identity" }).unwrap(),
      ]);
      const passportTemplateId = resolvePassportDocumentTemplateId(
        passportCategory,
        identityCategory,
      );

      if (!passportTemplateId) {
        throw new Error("Passport document setup was not found.");
      }

      await upsertStudentDocument({
        studentId,
        body: { documentId: passportTemplateId, document: passportUrl },
      }).unwrap();
      return true;
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          err?.message ||
          "Student created, but passport document could not be attached.",
      );
      return false;
    }
  };

  const handleSubmit = async (
    values: CreateStudentPayload & {
      confirmPassword?: string;
      firstName?: string;
      lastName?: string;
      gender?: string;
      dateOfBirth?: any;
      country?: string;
      passportNo?: string;
      passportExpiryDate?: any;
      phone?: string;
      qualifications?: string;
      passingYear?: any;
    },
  ) => {
    try {
      const email = String(values.email ?? "").trim();
      const firstName = String(values.firstName ?? "").trim();
      const lastName = String(values.lastName ?? "").trim();
      const derivedFullName = `${firstName} ${lastName}`.trim();

      // 1) Create auth user
      const profilePayload: Record<string, unknown> = {
        firstName: firstName || "",
        lastName: lastName || "",
        gender: String(values.gender ?? "").trim() || "",
        country: String(values.country ?? "").trim() || "",
        passportNo: String(values.passportNo ?? "").trim() || "",
        phone: String(values.phone ?? "").trim() || "",
        email: email || "",
        lastEducationId: String(values.qualifications ?? "").trim() || null,
        // Dates: always standard YYYY-MM-DD (except passing year: YYYY only)
        lastEducationPassingYear: null,
        dateOfBirth: null,
        passportExpDate: null,
        imageId: null,
      };

      // Passing year: YYYY only
      try {
        profilePayload.lastEducationPassingYear = values.passingYear
          ? dayjs(values.passingYear).format("YYYY")
          : null;
      } catch {
        profilePayload.lastEducationPassingYear = null;
      }

      // Date of birth: YYYY-MM-DD
      try {
        profilePayload.dateOfBirth = values.dateOfBirth
          ? dayjs(values.dateOfBirth).format("YYYY-MM-DD")
          : null;
      } catch {
        profilePayload.dateOfBirth = null;
      }

      // Passport expiry date: YYYY-MM-DD
      try {
        profilePayload.passportExpDate = values.passportExpiryDate
          ? dayjs(values.passportExpiryDate).format("YYYY-MM-DD")
          : null;
      } catch {
        profilePayload.passportExpDate = null;
      }

      const result = await createStudent(profilePayload as any).unwrap();

      // 2) Update profile: countryId + qualificationId + other form fields
      const studentId = result?.studentId;
      if (studentId) {
        const profileBody: Record<string, unknown> = {
          firstName: firstName || null,
          lastName: lastName || null,
          gender: String(values.gender ?? "").trim() || null,
          countryId: String(values.country ?? "").trim() || null,
          passportNo: String(values.passportNo ?? "").trim() || null,
          phone: String(values.phone ?? "").trim() || null,
          email: email || null,
          lastEducationId: String(values.qualifications ?? "").trim() || null,
        };

        try {
          profileBody.dateOfBirth = values.dateOfBirth
            ? dayjs(values.dateOfBirth).format("YYYY-MM-DD")
            : null;
        } catch {
          profileBody.dateOfBirth = null;
        }

        try {
          profileBody.passportExpDate = values.passportExpiryDate
            ? dayjs(values.passportExpiryDate).format("YYYY-MM-DD")
            : null;
        } catch {
          profileBody.passportExpDate = null;
        }

        try {
          profileBody.lastEducationPassingYear = values.passingYear
            ? dayjs(values.passingYear).startOf("year").format("YYYY-MM-DD")
            : null;
        } catch {
          profileBody.lastEducationPassingYear = null;
        }

        await updateStudentProfile({ studentId, body: profileBody }).unwrap();
      }

      const passportAttached = await attachPassportToStudentDocuments(studentId);
      if (!passportAttached) {
        return;
      }

      toast.success(
        result.temporaryPassword
          ? `Student created. Temporary password: ${result.temporaryPassword}`
          : "Student created successfully.",
      );
      form.resetFields();
      setPassportFileName(null);
      setPassportUrl(null);
      onClose();
      onSuccess?.();
      if (studentId) {
        // Navigate to the newly created student's profile page immediately
        navigate(`/students/${studentId}/profile`);
      }
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.data?.errors?.[0]?.message ||
        "Failed to create student.";
      toast.error(msg);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setPassportFileName(null);
    setPassportUrl(null);
    onClose();
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnHidden
      closable
      className="create-student-modal"
      centered
    >
      <div className="px-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold text-[#20242A]">
            Create Student
          </h3>
        </div>

        <Upload.Dragger
          multiple={false}
          showUploadList={false}
          accept=".pdf,.jpg,.jpeg,.png"
          disabled={isPassportProcessing}
          beforeUpload={async (file) => {
            await handlePassportAutofill(file);
            return false; // prevent antd auto upload
          }}
        >
          <div className="rounded-lg border border-dashed border-[#E5E7EB] bg-[#FFFFFF] p-6 text-center hover:bg-[#F9FAFB] transition-all duration-300">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#E9F2EB] text-[#237D3B]">
              {isPassportProcessing ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#237D3B] border-t-transparent" />
              ) : (
                <i className="fa-solid fa-cloud-arrow-up" />
              )}
            </div>
            <p className="text-[14px] font-semibold text-[#237D3B]">
              Autofill with passport
            </p>
            <p className="mt-1 text-[12px] text-[#6B7280]">
              Auto-complete this section by uploading the student’s passport.
              <br />
              This is optional, but strongly recommended.
            </p>
            {passportFileName && (
              <p className="mt-3 text-[12px] text-[#20242A]">
                Uploaded:{" "}
                <span className="font-medium">{passportFileName}</span>
              </p>
            )}
          </div>
        </Upload.Dragger>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ email: "", password: "", phone: "" }}
          className="mt-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 mt-4">
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: "First name is required" }]}
            >
              <Input placeholder="e.g. John" />
            </Form.Item>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: "Last name is required" }]}
            >
              <Input placeholder="e.g. Doe" />
            </Form.Item>

            <Form.Item name="gender" label="Gender">
              <Select
                placeholder="Select gender"
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
              />
            </Form.Item>
            <Form.Item name="dateOfBirth" label="Date of Birth">
              <DatePicker className="w-full" placeholder="dd/mm/yyyy" />
            </Form.Item>

            <Form.Item name="country" label="Country" className="md:col-span-2">
              <Select
                placeholder="Select"
                options={countriesOptions}
                className="w-full"
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>

            <Form.Item name="passportNo" label="Passport No">
              <Input placeholder="e.g. 1234567890" />
            </Form.Item>
            <Form.Item name="passportExpiryDate" label="Passport Expiry Date">
              <DatePicker className="w-full" placeholder="dd/mm/yyyy" />
            </Form.Item>

            <Form.Item name="phone" label="Contact Number">
              <PhoneInput
                country={"bd"}
                inputClass="!w-full !h-12 rounded-lg!"
                buttonClass="!h-12 rounded-lg!"
                containerClass="!w-full rounded-lg!"
                dropdownClass="!z-[9999]"
                value={form.getFieldValue("phone")}
                onChange={(v) => form.setFieldValue("phone", `+${v}`)}
              />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="e.g. john.doe@example.com" type="email" />
            </Form.Item>
          </div>

          <Card
            className="mt-2 rounded-lg border border-primary-border bg-[#FAFAFA] p-4"
            title="Last Qualifications"
          >
            <Form.Item name="qualifications" label="Select Qualifications">
              <Select
                placeholder="Select"
                options={qualificationOptions}
                className="w-full"
                showSearch
                optionFilterProp="label"
                disabled={!selectedCountryId}
              />
            </Form.Item>
            <Form.Item name="passingYear" label="Passing Year">
              <DatePicker
                picker="year"
                className="w-full"
                placeholder="dd/mm/yyyy"
                disabled={!hasSelectedQualification}
              />
            </Form.Item>
          </Card>

          <div className="mt-5 flex items-center justify-end gap-3">
            <Button onClick={handleCancel} danger>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={isLoading}
            >
              Confirm
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateStudentModal;
