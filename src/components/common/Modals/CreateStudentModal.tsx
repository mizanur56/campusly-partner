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





import React from "react";
import { Modal, Form, Input, Button, DatePicker, Select, Upload } from "antd";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useCreateStudentMutation } from "../../../redux/features/profile/studentProfileApi";
import type { CreateStudentPayload } from "../../../redux/features/profile/studentProfileApi";
import { useCreateMediaMutation } from "../../../redux/features/media/mediaApi";

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
      qualifications?: string[];
      passingYear?: unknown;
    }
  >();
  const [createStudent, { isLoading }] = useCreateStudentMutation();
  const [createMedia, { isLoading: isPassportUploading }] =
    useCreateMediaMutation();
  const [passportFileName, setPassportFileName] = React.useState<string | null>(
    null,
  );
  const [passportUrl, setPassportUrl] = React.useState<string | null>(null);

  const handleSubmit = async (
    values: CreateStudentPayload & {
      confirmPassword?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
    },
  ) => {
    try {
      const derivedFullName =
        `${values.firstName ?? ""} ${values.lastName ?? ""}`.trim() ||
        values.fullName?.trim() ||
        "";

      const payload: CreateStudentPayload = {
        email: values.email.trim(),
        fullName: derivedFullName,
        phone: values.phone?.trim() || undefined,
        password: values.password?.trim() && values.password.length >= 6 ? values.password : undefined,
      };
      const result = await createStudent(payload).unwrap();
      toast.success(
        result.temporaryPassword
          ? `Student created. Temporary password: ${result.temporaryPassword}`
          : "Student created successfully."
      );
      form.resetFields();
      onClose();
      onSuccess?.();
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.data?.errors?.[0]?.message || "Failed to create student.";
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
      width={600}
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
          disabled={isPassportUploading}
          beforeUpload={async (file) => {
            try {
              const fd = new FormData();
              fd.append("file", file);
              fd.append("category", "document");
              const res: any = await createMedia(fd).unwrap();
              const url = res?.data?.url || res?.data?.path || res?.url;
              if (!url) throw new Error("Upload failed");
              setPassportFileName(file.name);
              setPassportUrl(String(url));
              toast.success("Passport uploaded");
            } catch (err) {
              console.error(err);
              toast.error("Failed to upload passport");
            }
            return false; // prevent antd auto upload
          }}
        >
          <div className="rounded-lg border border-dashed border-[#E5E7EB] bg-[#FFFFFF] p-6 text-center hover:bg-[#F9FAFB] transition-all duration-300">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#E9F2EB] text-[#237D3B]">
              {isPassportUploading ? (
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
                Uploaded: <span className="font-medium">{passportFileName}</span>
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
              label={<span className="text-[12px] text-[#20242A]">First Name</span>}
              rules={[{ required: true, message: "First name is required" }]}
            >
              <Input placeholder="" className="h-9" />
            </Form.Item>
            <Form.Item
              name="lastName"
              label={<span className="text-[12px] text-[#20242A]">Last Name</span>}
              rules={[{ required: true, message: "Last name is required" }]}
            >
              <Input placeholder="" className="h-9" />
            </Form.Item>

            <Form.Item
              name="gender"
              label={<span className="text-[12px] text-[#20242A]">Gender</span>}
            >
              <Select
                placeholder="Select gender"
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="dateOfBirth"
              label={<span className="text-[12px] text-[#20242A]">Date of Birth</span>}
            >
              <DatePicker className="w-full" placeholder="dd/mm/yyyy" />
            </Form.Item>

            <Form.Item
              name="country"
              label={<span className="text-[12px] text-[#20242A]">Country</span>}
              className="md:col-span-2"
            >
              <Select placeholder="Select" options={[]} className="w-full" />
            </Form.Item>

            <Form.Item
              name="passportNo"
              label={<span className="text-[12px] text-[#20242A]">Passport No</span>}
            >
              <Input placeholder="" className="h-9" />
            </Form.Item>
            <Form.Item
              name="passportExpiryDate"
              label={<span className="text-[12px] text-[#20242A]">Passport Expiry Date</span>}
            >
              <DatePicker className="w-full" placeholder="dd/mm/yyyy" />
            </Form.Item>

            <Form.Item
              name="phone"
              label={<span className="text-[12px] text-[#20242A]">Contact Number</span>}
            >
              <PhoneInput
                country={"bd"}
                inputClass="!w-full !h-9"
                buttonClass="!h-9"
                containerClass="!w-full"
                dropdownClass="!z-[9999]"
                value={form.getFieldValue("phone")}
                onChange={(v) => form.setFieldValue("phone", `+${v}`)}
              />
            </Form.Item>
            <Form.Item
              name="email"
              label={<span className="text-[12px] text-[#20242A]">Email</span>}
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="" type="email" className="h-9" />
            </Form.Item>
          </div>

          <div className="mt-2 rounded-lg border border-[#CFCACF] bg-[#FAFAFA] p-4">
            <p className="text-[14px] font-semibold text-[#20242A] mb-3">
              Last Qualifications
            </p>
            <div className="grid grid-cols-1 gap-x-4 border border-[#CFCACF] bg-[#FFFFFF] p-4 rounded-lg">
              <Form.Item
                name="qualifications"
                label={<span className="text-[12px] text-[#20242A]">Select Qualifications</span>}
              >
                <Select placeholder="Select" options={[]} />
              </Form.Item>
              <div />
              <Form.Item
                name="passingYear"
                label={<span className="text-[12px] text-[#20242A]">Passing Year</span>}
              >
                <DatePicker picker="year" className="w-full" placeholder="dd/mm/yyyy" />
              </Form.Item>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <Button onClick={handleCancel} className="h-9 px-6 border-[#237D3B] text-[#237D3B]">
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={isLoading}
              className="h-9 px-6 bg-[#237D3B] hover:!bg-[#1E6A33]"
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
