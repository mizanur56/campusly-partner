import { Avatar, Button, Form, Input } from "antd";
import type { FormInstance } from "antd";
import MediaPicker from "../../../components/shared/MediaPicker";
import { getApiImageUrl } from "../../../utils/getApiImageUrl";
import type { MediaImage } from "../../../types/media";

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function GeneralTab({
  user,
  passwordForm,
  isChangingPassword,
  onSubmitPassword,
  onChangeProfilePhoto,
}: {
  user: any;
  passwordForm: FormInstance<ChangePasswordFormValues>;
  isChangingPassword: boolean;
  onSubmitPassword: (values: ChangePasswordFormValues) => void;
  onChangeProfilePhoto: (image: MediaImage | MediaImage[] | null) => void;
}) {
  return (
    <div className="account-general">
      <div className="account-photo-block">
        <Avatar
          size={96}
          src={user?.profile_photo ? getApiImageUrl(user.profile_photo) : undefined}
        >
          {user?.name?.[0] ?? "P"}
        </Avatar>
        <div className="account-photo-btn">
          <MediaPicker
            label=""
            description=""
            buttonLabel="Change Photo"
            helperText=""
            multiple={false}
            compact
            onChange={onChangeProfilePhoto}
            initialFolder="Partners/Profile Photos"
          />
        </div>
      </div>

      <div className="account-password-card">
        <h3 className="account-card-title">Change Your Password</h3>
        <p className="account-card-subtitle">
          Enter a new secure password for your Campus Transfer account. Your
          secure password should meet the following criteria:
        </p>

        <ul className="account-criteria">
          <li>Minimum of 8 characters</li>
          <li>Mix of upper and lowercase letters</li>
          <li>At least one number</li>
          <li>At least one symbol</li>
        </ul>

        <Form
          form={passwordForm}
          name="change-password"
          onFinish={onSubmitPassword}
          layout="vertical"
          className="account-form"
        >
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[{ required: true, message: "Please enter your current password!" }]}
          >
            <Input.Password placeholder="" size="large" />
          </Form.Item>

          <Form.Item
            label="Enter New Password"
            name="newPassword"
            rules={[{ required: true, message: "Please enter your new password!" }]}
          >
            <Input.Password placeholder="" size="large" />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("The two passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="" size="large" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={isChangingPassword}
            className="account-save-btn"
          >
            Save Changes
          </Button>
        </Form>
      </div>
    </div>
  );
}

