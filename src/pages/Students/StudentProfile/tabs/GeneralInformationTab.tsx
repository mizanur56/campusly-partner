import { CameraOutlined, CloseOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { Card, Spin, Upload } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import PrimaryButton from "../../../../components/common/Button/PrimaryButton";
import AntImage from "../../../../components/shared/AntImage";
import { config } from "../../../../config";
import { useGetCountriesQuery } from "../../../../redux/features/countries/countriesApi";
import { useCreateMediaMutation } from "../../../../redux/features/media/mediaApi";
import { useUpdateStudentProfileMutation } from "../../../../redux/features/profile/studentProfileApi";
import { useGetStudyLevelsByCountryQuery } from "../../../../redux/features/studyLevels/studyLevelsApi";
import { InfoField, PhoneField, QualificationSection } from "./SectionFields";
import { genderOptions } from "./constant";

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type PersonalFormShape = {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  country: string;
  passportNo: string;
  passportExpiryDate: string;
  contactNumber: string;
  email: string;
};

function validateGeneralPersonalFields(
  data: PersonalFormShape,
): Record<string, string> {
  const err: Record<string, string> = {};
  if (!data.firstName?.trim()) err.firstName = "First name is required";
  if (!data.lastName?.trim()) err.lastName = "Last name is required";
  if (!data.gender?.trim()) err.gender = "Gender is required";
  if (!data.dateOfBirth?.trim()) err.dateOfBirth = "Date of birth is required";
  if (!data.country?.trim()) err.country = "Country is required";
  if (!data.passportNo?.trim()) err.passportNo = "Passport number is required";
  if (!data.passportExpiryDate?.trim()) {
    err.passportExpiryDate = "Passport expiry date is required";
  }
  if (!data.email?.trim()) err.email = "Email is required";
  else if (!EMAIL_RE.test(data.email.trim())) {
    err.email = "Enter a valid email address";
  }
  if (!data.contactNumber?.trim()) {
    err.contactNumber = "Contact number is required";
  } else {
    const digits = data.contactNumber.replace(/\D/g, "");
    if (digits.length < 8) err.contactNumber = "Enter a valid contact number";
  }
  return err;
}

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
  const [personalFieldErrors, setPersonalFieldErrors] = useState<
    Record<string, string>
  >({});

  const [updateProfile] = useUpdateStudentProfileMutation();
  const [createMedia, { isLoading: isUploadingImage }] =
    useCreateMediaMutation();
  const { data: countriesData } = useGetCountriesQuery({
    page: 1,
    limit: 1000,
  });

  const selectedCountryId = useMemo(() => {
    if (!profileData.country || !countriesData?.data) return null;
    const list = countriesData.data as { id: string; name: string }[];
    // Backend may store either country name or country id in `profile.country`.
    const byId = list.find((x) => x.id === profileData.country);
    if (byId) return byId.id;
    const byName = list.find(
      (x) => x.name.toLowerCase() === profileData.country.toLowerCase(),
    );
    return byName?.id ?? null;
  }, [profileData.country, countriesData?.data]);

  const { data: studyLevelsData } = useGetStudyLevelsByCountryQuery(
    selectedCountryId ?? "",
    {
      skip: !selectedCountryId,
    },
  );

  const countriesOptions = useMemo(
    () =>
      (countriesData?.data ?? []).map((c: { id: string; name: string }) => ({
        label: c.name,
        value: c.id,
      })),
    [countriesData?.data],
  );

  const qualificationOptions = useMemo(() => {
    const data = Array.isArray(studyLevelsData)
      ? studyLevelsData
      : ((studyLevelsData as { data?: unknown[] })?.data ?? []);

    return (
      data as {
        studyLevel?: { id?: string; name?: string; description?: string };
        name?: string;
        description?: string;
        countryStudyLevelName?: string;
        studyLevelId?: string;
      }[]
    ).map((item) => ({
      label: item.countryStudyLevelName ?? item.name ?? "",
      value: item.studyLevel?.id ?? item.studyLevelId ?? "",
    }));
  }, [studyLevelsData]);

  useEffect(() => {
    if (!profile) return;
    const formatted = {
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      gender: profile.gender ?? "",
      dateOfBirth: profile.dateOfBirth
        ? dayjs(profile.dateOfBirth).format("DD-MM-YYYY")
        : "",
      // Store country as id (Select value). UI renders label from countriesOptions.
      country: profile.country ?? "",
      passportNo: profile.passportNo ?? "",
      passportExpiryDate: profile.passportExpDate
        ? dayjs(profile.passportExpDate).format("DD-MM-YYYY")
        : "",
      contactNumber: profile.phone
        ? profile.phone.startsWith("+")
          ? profile.phone
          : `+${profile.phone}`
        : "",
      email: profile.email ?? profile.user?.email ?? "",
      qualification: profile.lastEducationId ?? "",
      passingYear: profile.lastEducationPassingYear
        ? dayjs(profile.lastEducationPassingYear).format("YYYY")
        : "",
      image: profile.image?.url ?? "",
    };
    setProfileData(formatted);
    setEditProfileData(formatted);
  }, [profile]);

  const formatDateForApi = (
    dateValue: string,
    format: string,
  ): string | null => {
    if (!dateValue) return null;
    try {
      if (format === "YYYY") {
        return dayjs(dateValue, "YYYY").startOf("year").format("YYYY-MM-DD");
      }
      return dayjs(dateValue, format).format("YYYY-MM-DD");
    } catch {
      return null;
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditProfileData((prev) => ({ ...prev, [field]: value }));
    setPersonalFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSaveAll = async () => {
    const errors = validateGeneralPersonalFields(editProfileData);
    setPersonalFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    setUpdatingField("saving");
    try {
      const payload: Record<string, unknown> = {};
      if (editProfileData.firstName !== profileData.firstName)
        payload.firstName = editProfileData.firstName || null;
      if (editProfileData.lastName !== profileData.lastName)
        payload.lastName = editProfileData.lastName || null;
      if (editProfileData.gender !== profileData.gender)
        payload.gender = editProfileData.gender || null;
      if (editProfileData.dateOfBirth !== profileData.dateOfBirth) {
        const v = formatDateForApi(editProfileData.dateOfBirth, "DD-MM-YYYY");
        if (v) payload.dateOfBirth = v;
      }
      // if (editProfileData.country !== profileData.country) {
      //   payload.countryId = editProfileData.country || null;
      // }
      if (editProfileData.country !== profileData.country) {
        payload.country = editProfileData.country || null;
      }
      if (editProfileData.passportNo !== profileData.passportNo)
        payload.passportNo = editProfileData.passportNo || null;
      if (
        editProfileData.passportExpiryDate !== profileData.passportExpiryDate
      ) {
        const v = formatDateForApi(
          editProfileData.passportExpiryDate,
          "DD-MM-YYYY",
        );
        if (v) payload.passportExpDate = v;
      }
      if (editProfileData.contactNumber !== profileData.contactNumber)
        payload.phone = editProfileData.contactNumber
          ? editProfileData.contactNumber.replace(/^\+/, "")
          : null;
      if (editProfileData.email !== profileData.email)
        payload.email = editProfileData.email || null;
      if (editProfileData.qualification !== profileData.qualification)
        payload.lastEducationId = editProfileData.qualification || null;
      if (editProfileData.passingYear !== profileData.passingYear) {
        const v = formatDateForApi(editProfileData.passingYear, "YYYY");
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

  const handleSaveQualification = async (
    qualification: string,
    passingYear: string,
  ) => {
    setUpdatingField("qualification");
    try {
      const payload: Record<string, unknown> = {
        lastEducationId: qualification || null,
        lastEducationPassingYear: formatDateForApi(passingYear, "YYYY") ?? null,
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
    const file =
      (info.file as { originFileObj?: File })?.originFileObj ?? info.file;
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

  const rawImage = String(profileData?.image ?? "").trim();
  const imageSrc = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${config.image_access_url || ""}${rawImage}`
    : "/user.png";

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
          <div className="relative w-32 h-32 object-cover rounded-full overflow-hidden cursor-pointer group border-2 border-primary-border hover:border-primary-500 bg-gray-100 transition-all duration-300">
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
              <button
                type="button"
                onClick={() => {
                  if (isPersonalEditing) {
                    setEditProfileData(profileData);
                    setPersonalFieldErrors({});
                  }
                  setIsPersonalEditing((prev) => !prev);
                }}
                aria-label={isPersonalEditing ? "Cancel Edit" : "Edit Profile"}
                title={isPersonalEditing ? "Cancel" : "Edit"}
                className={`
    flex items-center justify-center
    w-9 h-9 rounded-lg border
    transition-all duration-200 active:scale-95

    ${
      isPersonalEditing
        ? "bg-red-50 border-red-500 text-red-500 hover:bg-red-100 hover:border-red-600"
        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-100 hover:border-primary hover:text-primary"
    }
  `}
              >
                {isPersonalEditing ? (
                  <CloseOutlined size={18} />
                ) : (
                  <FaEdit size={16} />
                )}
              </button>
            ) : null
          }
          bordered={true}
          className="rounded-2xl! shadow-none"
          style={{ borderColor: "#C7CACF", boxShadow: "none" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <InfoField
              label="First Name"
              value={editProfileData.firstName}
              isEditable={canEdit && isPersonalEditing}
              required
              error={personalFieldErrors.firstName}
              onChange={(v) => handleFieldChange("firstName", v)}
              isLoading={updatingField === "firstName"}
            />
            <InfoField
              label="Last Name"
              value={editProfileData.lastName}
              isEditable={canEdit && isPersonalEditing}
              required
              error={personalFieldErrors.lastName}
              onChange={(v) => handleFieldChange("lastName", v)}
              isLoading={updatingField === "lastName"}
            />
            <InfoField
              label="Gender"
              value={editProfileData.gender}
              type="select"
              options={genderOptions}
              isEditable={canEdit && isPersonalEditing}
              required
              error={personalFieldErrors.gender}
              onChange={(v) => handleFieldChange("gender", v)}
              isLoading={updatingField === "gender"}
            />
            <InfoField
              label="Date of Birth"
              value={editProfileData.dateOfBirth}
              type="date"
              isEditable={canEdit && isPersonalEditing}
              required
              error={personalFieldErrors.dateOfBirth}
              onChange={(v) => handleFieldChange("dateOfBirth", v)}
              isLoading={updatingField === "dateOfBirth"}
            />
            <InfoField
              label="Country"
              value={editProfileData.country}
              type="select"
              options={countriesOptions}
              isEditable={canEdit && isPersonalEditing}
              required
              error={personalFieldErrors.country}
              onChange={(v) => handleFieldChange("country", v)}
              isLoading={updatingField === "country"}
            />
            <InfoField
              label="Passport No"
              value={editProfileData.passportNo}
              isEditable={canEdit && isPersonalEditing}
              required
              error={personalFieldErrors.passportNo}
              onChange={(v) => handleFieldChange("passportNo", v)}
              isLoading={updatingField === "passportNo"}
            />
            <InfoField
              label="Passport Expiry Date"
              value={editProfileData.passportExpiryDate}
              type="date"
              isEditable={canEdit && isPersonalEditing}
              required
              error={personalFieldErrors.passportExpiryDate}
              onChange={(v) => handleFieldChange("passportExpiryDate", v)}
              isLoading={updatingField === "passportExpiryDate"}
            />
            <InfoField
              label="Email"
              value={editProfileData.email}
              type="email"
              isEditable={canEdit && isPersonalEditing}
              required
              error={personalFieldErrors.email}
              onChange={(v) => handleFieldChange("email", v)}
              isLoading={updatingField === "email"}
            />
          </div>
          <PhoneField
            label="Contact Number"
            value={editProfileData.contactNumber}
            isEditable={canEdit && isPersonalEditing}
            required
            error={personalFieldErrors.contactNumber}
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
