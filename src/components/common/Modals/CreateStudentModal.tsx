import React from "react";
import { Modal, Form, Input, Button } from "antd";
import { toast } from "react-toastify";
import { useCreateStudentMutation } from "../../../redux/features/profile/studentProfileApi";
import type { CreateStudentPayload } from "../../../redux/features/profile/studentProfileApi";

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
  const [form] = Form.useForm<CreateStudentPayload & { confirmPassword?: string }>();
  const [createStudent, { isLoading }] = useCreateStudentMutation();

  const handleSubmit = async (values: CreateStudentPayload & { confirmPassword?: string }) => {
    try {
      const payload: CreateStudentPayload = {
        email: values.email.trim(),
        fullName: values.fullName.trim(),
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
    onClose();
  };

  return (
    <Modal
      title="Add Student"
      open={open}
      onCancel={handleCancel}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" onClick={() => form.submit()} loading={isLoading}>
            Create Student
          </Button>
        </div>
      }
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ email: "", fullName: "", password: "", phone: "" }}
      >
        <Form.Item
          name="fullName"
          label="Full name"
          rules={[{ required: true, message: "Please enter full name" }]}
        >
          <Input placeholder="e.g. John Doe" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="e.g. student@example.com" type="email" />
        </Form.Item>
        <Form.Item name="phone" label="Phone (optional)">
          <Input placeholder="e.g. +8801700000000" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password (optional, min 6 characters)"
          help="If left empty, a temporary password will be generated."
        >
          <Input.Password placeholder="Password" minLength={6} />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm password"
          dependencies={["password"]}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                const pwd = getFieldValue("password");
                if (!pwd || !value) return Promise.resolve();
                if (pwd !== value) return Promise.reject(new Error("Passwords do not match"));
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm password" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateStudentModal;
