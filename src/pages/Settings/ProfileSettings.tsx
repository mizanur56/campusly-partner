import { LockOutlined } from "@ant-design/icons";
import { Avatar, Button, Form, Input } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import PageHeader from "../../components/common/Navigation/PageHeader";
import MediaPicker from "../../components/shared/MediaPicker";
import {
  useGetPartnerProfileQuery,
  useUpdatePartnerProfileMutation,
} from "../../redux/features/profile/partnerProfileApi";
import { useChangePasswordMutation } from "../../redux/features/auth/authApi";
import { selectCurrentUser, setProfile } from "../../redux/features/auth/authSlice";
import { getApiImageUrl } from "../../utils/getApiImageUrl";
import type { MediaImage } from "../../types/media";
import React, { useState } from "react";
import "./ProfileSettings.css";

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfileSettings: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const { data: partnerProfile } = useGetPartnerProfileQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdatePartnerProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();
  const [passwordForm] = Form.useForm<ChangePasswordFormValues>();
  const [activeTab, setActiveTab] = useState<"general" | "business">("general");

  const businessLogoUrl = partnerProfile?.businessPhoto
    ? getApiImageUrl(partnerProfile.businessPhoto as string)
    : undefined;

  const handleProfilePhotoChange = async (image: MediaImage | MediaImage[] | null) => {
    const selected = Array.isArray(image) ? image[0] : image;
    if (!selected) return;
    try {
      await updateProfile({ profilePhotoId: selected.id }).unwrap();
      dispatch(setProfile(selected.url));
      toast.success("Profile photo updated successfully.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update profile photo.");
    }
  };

  const handleBusinessPhotoChange = async (image: MediaImage | MediaImage[] | null) => {
    const selected = Array.isArray(image) ? image[0] : image;
    if (!selected) return;
    try {
      await updateProfile({ businessPhoto: selected.url }).unwrap();
      toast.success("Business photo updated successfully.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update business photo.");
    }
  };

  const handlePasswordSubmit = async (values: ChangePasswordFormValues) => {
    const payload = {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    };

    try {
      const res: any = await changePassword(payload).unwrap();
      toast.success(res?.message || "Password updated successfully!");
      passwordForm.resetFields();
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          err?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  const renderGeneralTab = () => (
        <div className="space-y-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <Avatar
                size={80}
                src={user?.profile_photo ? getApiImageUrl(user.profile_photo) : undefined}
              >
                {user?.name?.[0] ?? "P"}
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900">Profile photo</p>
                <p className="text-xs text-gray-500">
                  This photo will be used across your partner account.
                </p>
              </div>
            </div>
            <div className="max-w-md">
              <MediaPicker
                label="Change your profile photo"
                description="Upload or choose a photo from your media library."
                buttonLabel="Change Photo"
                helperText=""
                multiple={false}
                onChange={handleProfilePhotoChange}
                initialFolder="Partners/Profile Photos"
              />
            </div>
          </div>

          <div className="max-w-xl rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900">
              Change Your Password
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Enter a new secure password for your Campus Transfer account.
            </p>

            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-gray-600">
              <li>Minimum of 8 characters</li>
              <li>Mix of upper and lowercase letters</li>
              <li>At least one number</li>
              <li>At least one symbol</li>
            </ul>

            <Form
              form={passwordForm}
              name="change-password"
              onFinish={handlePasswordSubmit}
              layout="vertical"
              size="large"
              className="mt-6"
            >
              <Form.Item
                label="Current Password"
                name="currentPassword"
                rules={[
                  {
                    required: true,
                    message: "Please enter your current password!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Enter current password"
                />
              </Form.Item>

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
                />
              </Form.Item>

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
                        new Error("The two passwords do not match!"),
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Confirm new password"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={isChangingPassword}
              >
                Save Changes
              </Button>
            </Form>
          </div>
        </div>
  );

  const renderBusinessTab = () => (
        <div className="space-y-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <Avatar
                size={80}
                src={businessLogoUrl}
                className="bg-white shadow-sm ring-1 ring-neutral-200"
              >
                {partnerProfile?.businessName?.[0] ?? "B"}
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900">Business logo</p>
                <p className="text-xs text-gray-500">
                  This logo appears in your partner portal and communications.
                </p>
              </div>
            </div>
            <div className="max-w-md">
              <MediaPicker
                label="Change your business logo"
                description="Upload or choose your business logo from media library."
                buttonLabel="Change Photo"
                helperText=""
                multiple={false}
                onChange={handleBusinessPhotoChange}
                initialFolder="Partners/Business Logos"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm max-w-xl">
            <p className="text-sm font-medium text-gray-900">Business Name</p>
            <p className="mt-1 text-sm text-gray-700">
              {partnerProfile?.businessName ?? "Your business name"}
            </p>
          </div>
        </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] -mx-4 px-4 pb-8 pt-0 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
      <PageHeader
        title={partnerProfile?.businessName || "My Account"}
        subtitle="Manage your personal information, update your password, and control your account settings securely."
        breadcrumbs={[
          { title: "Home", path: "/" },
          { title: "Settings" },
          { title: "Profile" },
        ]}
      />

      <div className="mt-4">
        <div className="settings-tabs">
          <button
            type="button"
            className={
              activeTab === "general"
                ? "settings-tab settings-tab--active"
                : "settings-tab"
            }
            onClick={() => setActiveTab("general")}
          >
            General
          </button>
          <button
            type="button"
            className={
              activeTab === "business"
                ? "settings-tab settings-tab--active"
                : "settings-tab"
            }
            onClick={() => setActiveTab("business")}
          >
            Business Details
          </button>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "general" ? renderGeneralTab() : renderBusinessTab()}
      </div>
    </div>
  );
};

export default ProfileSettings;

