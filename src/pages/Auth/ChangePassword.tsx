import { LockOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { toast } from "react-toastify";
import React from "react";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { useChangePasswordMutation } from "../../redux/features/auth/authApi";
// import { useChangePasswordMutation } from "../../redux/features/auth/authApi";

interface ChangePasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePassword: React.FC = () => {
  const [form] = Form.useForm<ChangePasswordForm>();

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const onFinish = async (values: ChangePasswordForm) => {
    const payload = {
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    };


    try {
      const res = await changePassword(payload).unwrap();
      if (res.success) {
        toast.success(res.message || "Password updated successfully!");
        form.resetFields();
      }

      toast.success("Password updated successfully!");
      form.resetFields();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white p-4">
      {/* Page header */}
      <PageHeader
        title="Change Password"
        subtitle="Update your account password"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "System Settings" },
          { title: "Change Password" },
        ]}
      />

      {/* Form card */}
      <div className="w-full  mx-auto bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>

        <Form
          form={form}
          name="change-password"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          {/* Old Password */}
          <Form.Item
            label="Old Password"
            name="oldPassword"
            rules={[
              { required: true, message: "Please enter your old password!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Enter old password"
              className="w-full"
            />
          </Form.Item>

          {/* New Password */}
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please enter your new password!" },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Enter new password"
              className="w-full"
            />
          </Form.Item>

          {/* Confirm Password */}
          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Confirm new password"
              className="w-full"
            />
          </Form.Item>

          {/* Submit button (always full width) */}
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="w-fit"
          >
            Change Password
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default ChangePassword;
