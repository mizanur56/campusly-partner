import { Button, Form } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import PageHeader from "../../components/common/Navigation/PageHeader";
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
import GeneralTab from "./components/GeneralTab";
import BusinessDetailsTab from "./components/BusinessDetailsTab";
import TeamMemberTab from "./components/TeamMemberTab";
import InviteTeamModal from "./components/InviteTeamModal";

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfileSettings: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const { data: partnerProfile } = useGetPartnerProfileQuery();
  const [updateProfile] = useUpdatePartnerProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();
  const [passwordForm] = Form.useForm<ChangePasswordFormValues>();
  const [activeTab, setActiveTab] = useState<
    "general" | "business" | "teamMember"
  >("general");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

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

  const partnerIdText =
    partnerProfile?.id != null ? String(partnerProfile.id) : "—";

  const pageHeaderExtra =
    activeTab === "teamMember" ? (
      <div className="account-pageheader-extra account-pageheader-extra--stack">
        <p className="account-partner-id">
          Recruitment Partner ID: <span>001112</span>
        </p>
        <Button
          type="primary"
          className="account-invite-btn"
          onClick={() => setIsInviteModalOpen(true)}
        >
          Invite Members
        </Button>
      </div>
    ) : (
      <p className="account-partner-id account-partner-id--solo">
        Recruitment Partner ID: <span>001112</span>
      </p>
    );

  return (
    <div className="">
      <PageHeader
        title="My Account"
        subtitle="Manage your personal information, update your password, and control your account settings securely."
        breadcrumbs={[
          { title: "Home", path: "/" },
          { title: "Settings", path: "/settings/profile" },
          { title: "Profile" },
        ]}
        extra={pageHeaderExtra}
      />

      <div className="account-tabs">
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
        <button
          type="button"
          className={
            activeTab === "teamMember"
              ? "settings-tab settings-tab--active"
              : "settings-tab"
          }
          onClick={() => setActiveTab("teamMember")}
        >
          Team Member
        </button>
      </div>

      <section className="account-content">
        {activeTab === "general" ? (
          <GeneralTab
            user={user}
            passwordForm={passwordForm}
            isChangingPassword={isChangingPassword}
            onSubmitPassword={handlePasswordSubmit}
            onChangeProfilePhoto={handleProfilePhotoChange}
          />
        ) : activeTab === "business" ? (
          <BusinessDetailsTab
            businessLogoUrl={businessLogoUrl}
            businessName={
              (partnerProfile?.businessName ||
                partnerProfile?.registeredCompanyName ||
                "") as string
            }
            onChangeBusinessPhoto={handleBusinessPhotoChange}
          />
        ) : (
          <TeamMemberTab />
        )}
      </section>

      <InviteTeamModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};

export default ProfileSettings;

