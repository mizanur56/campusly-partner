import { useState, useEffect, useMemo } from "react";
import { Button, Card, Spin, Upload } from "antd";
import type { UploadProps } from "antd";
import dayjs from "dayjs";
import { CameraOutlined } from "@ant-design/icons";
import { FaPencilAlt, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { useUpdateStudentProfileMutation } from "../../../../redux/features/profile/studentProfileApi";
import { useGetCountriesQuery } from "../../../../redux/features/countries/countriesApi";
import { useGetStudyLevelsByCountryQuery } from "../../../../redux/features/studyLevels/studyLevelsApi";
import { useCreateMediaMutation } from "../../../../redux/features/media/mediaApi";
import PrimaryButton from "../../../../components/common/Button/PrimaryButton";
import AntImage from "../../../../components/shared/AntImage";
import { InfoField, PhoneField, QualificationSection } from "./SectionFields";
import { genderOptions } from "./constant";
import { config } from "../../../../config";

type ProfileRecord = {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  country?: string;
  passportNo?: string;
  passportExpDate?: string;
  phone?: string;
  email?: string;
  lastEducationId?: string;
  lastEducationPassingYear?: string;
  image?: { id?: string; url?: string };
  user?: { name?: string; email?: string };
  lastEducation?: { name?: string };
};

interface GeneralInformationTabProps {
  studentId: string;
  profile: ProfileRecord;
  canEdit: boolean;
  onUpdated?: () => void;
}

const fieldMapping: Record<string, string> = {
  firstName: "firstName",
  lastName: "lastName",
  gender: "gender",
  dateOfBirth: "dateOfBirth",
  country: "country",
  passportNo: "passportNo",
  passportExpiryDate: "passportExpDate",
  contactNumber: "phone",
  email: "email",
  qualification: "lastEducationId",
  passingYear: "lastEducationPassingYear",
  image: "imageId",
};

export default function GeneralInformationTab({
  studentId,
  profile,
  canEdit,
  onUpdated,
}: GeneralInformationTabProps) {
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const [isPersonalEditing, setIsPersonalEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    country: "",
    passportNo: "",
    passportExpiryDate: "",
    contactNumber: "",
    email: "",
    qualification: "",
    passingYear: "",
    image: "",
  });
  const [editProfileData, setEditProfileData] = useState(profileData);

  const [updateProfile] = useUpdateStudentProfileMutation();
  const [createMedia, { isLoading: isUploadingImage }] = useCreateMediaMutation();
  const { data: countriesData } = useGetCountriesQuery({ page: 1, limit: 1000 });

  const selectedCountryId = useMemo(() => {
    if (!profileData.country || !countriesData?.data) return null;
    const c = (countriesData.data as { id: string; name: string }[]).find(
      (x) => x.name.toLowerCase() === profileData.country.toLowerCase()
    );
    return c?.id ?? null;
  }, [profileData.country, countriesData?.data]);

  const { data: studyLevelsData } = useGetStudyLevelsByCountryQuery(selectedCountryId ?? "", {
    skip: !selectedCountryId,
  });

  const countriesOptions = useMemo(
    () =>
      (countriesData?.data ?? []).map((c: { id: string; name: string }) => ({
        label: c.name,
        value: c.name,
      })),
    [countriesData?.data]
  );

  const qualificationOptions = useMemo(() => {
    const data = Array.isArray(studyLevelsData) ? studyLevelsData : (studyLevelsData as { data?: unknown[] })?.data ?? [];
    return (data as {
      studyLevel?: { id?: string; name?: string; description?: string };
      name?: string;
      description?: string;
      countryStudyLevelName?: string;
      studyLevelId?: string;
    }[]).map((item) => ({
      label: item.studyLevel?.description ?? item.studyLevel?.name ?? item.countryStudyLevelName ?? item.description ?? item.name ?? "",
      value: item.studyLevel?.id ?? item.studyLevelId ?? "",
    }));
  }, [studyLevelsData]);

  useEffect(() => {
    if (!profile) return;
    const formatted = {
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      gender: profile.gender ?? "",
      dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth).format("DD-MM-YYYY") : "",
      country: profile.country ? profile.country.charAt(0).toUpperCase() + profile.country.slice(1) : "",
      passportNo: profile.passportNo ?? "",
      passportExpiryDate: profile.passportExpDate ? dayjs(profile.passportExpDate).format("DD-MM-YYYY") : "",
      contactNumber: profile.phone ? (profile.phone.startsWith("+") ? profile.phone : `+${profile.phone}`) : "",
      email: profile.email ?? (profile.user?.email ?? ""),
      qualification: profile.lastEducationId ?? "",
      passingYear: profile.lastEducationPassingYear ? dayjs(profile.lastEducationPassingYear).format("DD/MM/YYYY") : "",
      image: profile.image?.url ?? "",
    };
    setProfileData(formatted);
    setEditProfileData(formatted);
  }, [profile]);

  const formatDateForApi = (dateValue: string, format: string): string | null => {
    if (!dateValue) return null;
    try {
      return dayjs(dateValue, format).format("YYYY-MM-DD");
    } catch {
      return null;
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = async () => {
    setUpdatingField("saving");
    try {
      const payload: Record<string, unknown> = {};
      if (editProfileData.firstName !== profileData.firstName) payload.firstName = editProfileData.firstName || null;
      if (editProfileData.lastName !== profileData.lastName) payload.lastName = editProfileData.lastName || null;
      if (editProfileData.gender !== profileData.gender) payload.gender = editProfileData.gender || null;
      if (editProfileData.dateOfBirth !== profileData.dateOfBirth) {
        const v = formatDateForApi(editProfileData.dateOfBirth, "DD-MM-YYYY");
        if (v) payload.dateOfBirth = v;
      }
      if (editProfileData.country !== profileData.country) payload.country = editProfileData.country ? editProfileData.country.toLowerCase() : null;
      if (editProfileData.passportNo !== profileData.passportNo) payload.passportNo = editProfileData.passportNo || null;
      if (editProfileData.passportExpiryDate !== profileData.passportExpiryDate) {
        const v = formatDateForApi(editProfileData.passportExpiryDate, "DD-MM-YYYY");
        if (v) payload.passportExpDate = v;
      }
      if (editProfileData.contactNumber !== profileData.contactNumber) payload.phone = editProfileData.contactNumber ? editProfileData.contactNumber.replace(/^\+/, "") : null;
      if (editProfileData.email !== profileData.email) payload.email = editProfileData.email || null;
      if (editProfileData.qualification !== profileData.qualification) payload.lastEducationId = editProfileData.qualification || null;
      if (editProfileData.passingYear !== profileData.passingYear) {
        const v = formatDateForApi(editProfileData.passingYear, "DD/MM/YYYY");
        payload.lastEducationPassingYear = v ?? null;
      }
      if (Object.keys(payload).length === 0) {
        toast.info("No changes to save");
        setIsPersonalEditing(false);
        setUpdatingField(null);
        return;
      }
      await updateProfile({ studentId, body: payload }).unwrap();
      setProfileData(editProfileData);
      toast.success("Profile updated successfully!");
      setIsPersonalEditing(false);
      onUpdated?.();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message ?? "Failed to update profile");
    } finally {
      setUpdatingField(null);
    }
  };

  const handleSaveQualification = async (qualification: string, passingYear: string) => {
    setUpdatingField("qualification");
    try {
      const payload: Record<string, unknown> = {
        lastEducationId: qualification || null,
        lastEducationPassingYear: formatDateForApi(passingYear, "DD/MM/YYYY") ?? null,
      };
      await updateProfile({ studentId, body: payload }).unwrap();
      setProfileData((prev) => ({ ...prev, qualification, passingYear }));
      toast.success("Qualification updated successfully!");
      onUpdated?.();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message ?? "Failed to update qualification");
    } finally {
      setUpdatingField(null);
    }
  };

  const handleImageChange: UploadProps["onChange"] = async (info) => {
    const file = (info.file as { originFileObj?: File })?.originFileObj ?? info.file;
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file as Blob);
      formData.append("category", "profile");
      const res = await createMedia(formData as FormData).unwrap();
      const imageId = (res as { data?: { id?: string } })?.data?.id;
      if (imageId) {
        await updateProfile({ studentId, body: { imageId } }).unwrap();
        setProfileData((prev) => ({ ...prev, image: imageId }));
        toast.success("Profile image uploaded successfully!");
        onUpdated?.();
      }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message ?? "Failed to upload image");
    }
  };

  const getQualificationDisplayName = (qualificationId: string) => {
    const opt = qualificationOptions.find((o) => o.value === qualificationId);
    return opt?.label ?? qualificationId;
  };

  const imageSrc = profileData?.image
    ? (profileData.image.startsWith("http") ? profileData.image : `${config.image_access_url || ""}${profileData.image}`)
    : "/images/user.jpg";

  return (
    <div className="space-y-4">
      {/* Profile Picture - same as student */}
      <div className="flex flex-col items-start gap-y-2">
        <Upload
          showUploadList={false}
          accept="image/*"
          beforeUpload={() => false}
          onChange={handleImageChange}
          disabled={!canEdit || isUploadingImage}
        >
          <div className="relative w-32 h-32 object-cover rounded-full overflow-hidden cursor-pointer group border-2 border-[#C7CACF] hover:border-primary-500 bg-gray-100 transition-all duration-300">
            <AntImage
              src={imageSrc}
              alt="Profile"
              preview={false}
              className="w-full h-full object-cover"
            />
            {canEdit && !isUploadingImage && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                <CameraOutlined
                  className=" text-2xl"
                  style={{ color: "white" }}
                />
              </div>
            )}
            {isUploadingImage && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Spin size="large" />
              </div>
            )}
          </div>
        </Upload>
      </div>

      {/* Personal Details Card - same structure as student */}
      <div>
        <Card
          title={
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[20px]">
                Personal Details
              </span>
            </div>
          }
          extra={
            canEdit ? (
              <Button
                type="text"
                onClick={() => {
                  if (isPersonalEditing) {
                    setEditProfileData(profileData);
                  }
                  setIsPersonalEditing(!isPersonalEditing);
                }}
                className="p-0 group"
              >
                {isPersonalEditing ? (
                  <FaTimes className="text-red-500 hover:text-red-600 transition-colors" style={{ fontSize: 20 }} aria-label="Close" />
                ) : (
                  <FaPencilAlt className="text-[#237D3B] hover:opacity-80 transition-opacity" style={{ fontSize: 18 }} aria-label="Edit" />
                )}
              </Button>
            ) : null
          }
          bordered={true}
          className="rounded-lg shadow-none"
          style={{ borderColor: "#C7CACF", boxShadow: "none" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <InfoField
            label="First Name"
            value={editProfileData.firstName}
            isEditable={canEdit && isPersonalEditing}
            onChange={(v) => handleFieldChange("firstName", v)}
            isLoading={updatingField === "firstName"}
          />
          <InfoField
            label="Last Name"
            value={editProfileData.lastName}
            isEditable={canEdit && isPersonalEditing}
            onChange={(v) => handleFieldChange("lastName", v)}
            isLoading={updatingField === "lastName"}
          />
          <InfoField
            label="Gender"
            value={editProfileData.gender}
            type="select"
            options={genderOptions}
            isEditable={canEdit && isPersonalEditing}
            onChange={(v) => handleFieldChange("gender", v)}
            isLoading={updatingField === "gender"}
          />
          <InfoField
            label="Date of Birth"
            value={editProfileData.dateOfBirth}
            type="date"
            isEditable={canEdit && isPersonalEditing}
            onChange={(v) => handleFieldChange("dateOfBirth", v)}
            isLoading={updatingField === "dateOfBirth"}
          />
          <InfoField
            label="Country"
            value={editProfileData.country}
            type="select"
            options={countriesOptions}
            isEditable={canEdit && isPersonalEditing}
            onChange={(v) => handleFieldChange("country", v)}
            isLoading={updatingField === "country"}
          />
          <InfoField
            label="Passport No"
            value={editProfileData.passportNo}
            isEditable={canEdit && isPersonalEditing}
            onChange={(v) => handleFieldChange("passportNo", v)}
            isLoading={updatingField === "passportNo"}
          />
          <InfoField
            label="Passport Expiry Date"
            value={editProfileData.passportExpiryDate}
            type="date"
            isEditable={canEdit && isPersonalEditing}
            onChange={(v) => handleFieldChange("passportExpiryDate", v)}
            isLoading={updatingField === "passportExpiryDate"}
          />
          <InfoField
            label="Email"
            value={editProfileData.email}
            type="email"
            isEditable={canEdit && isPersonalEditing}
            onChange={(v) => handleFieldChange("email", v)}
            isLoading={updatingField === "email"}
          />
        </div>
        <PhoneField
          label="Contact Number"
          value={editProfileData.contactNumber}
          isEditable={canEdit && isPersonalEditing}
          onChange={(v) => handleFieldChange("contactNumber", v)}
          isLoading={updatingField === "contactNumber"}
        />
        {canEdit && isPersonalEditing && (
            <div className="mt-6">
              <PrimaryButton
                text="Save Changes"
                onClick={handleSaveAll}
                className="px-8"
                loading={updatingField === "saving"}
                disabled={updatingField === "saving"}
              />
            </div>
          )}
        </Card>
      </div>
      {/* Qualification Section - same as student */}
      <div>
        <QualificationSection
        qualification={getQualificationDisplayName(profileData.qualification)}
        passingYear={profileData.passingYear}
        qualificationOptions={qualificationOptions}
        onSave={handleSaveQualification}
        editable={canEdit}
      />
      </div>
    </div>
  );
}
