/* eslint-disable @typescript-eslint/no-unused-vars */
import { Spin } from "antd";
import React, { useEffect, useRef } from "react";
import { ArrowLeft, FileStack } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  useGetAllInvoicePaymentsQuery,
  useGetApplicationByIdQuery,
} from "../../redux/features/application/applicationApi";

import { config } from "../../config";
import { useStudentProfile } from "../../context/StudentProfileContext";
import { useGetStudentProfileQuery } from "../../redux/features/profile/studentProfileApi";
import { getApiImageUrl } from "../../utils/getApiImageUrl";
import ApplicationRequirementsTab from "./components/ApplicationRequirementsTab";
import NotesTab from "./components/NotesTab";
import StudentRecordsTab from "./components/StudentRecordsTab";
import ApplicationNextStepBanner from "./components/details/ApplicationNextStepBanner";
import ApplicationProgressPanel from "./components/details/ApplicationProgressPanel";
import {
  ImportantNotesCard,
  NeedHelpCard,
} from "./components/details/ApplicationSidebarCards";
import ApplicationSummaryHeader, {
  summaryMetaIcons,
} from "./components/details/ApplicationSummaryHeader";
import ApplicationTabBar, {
  type ApplicationTabKey,
} from "./components/details/ApplicationTabBar";
import StudentInformationCard from "./components/details/StudentInformationCard";
import UniversityCourseCard from "./components/details/UniversityCourseCard";
import {
  getApplicationStatusStyle,
  getCurrentStepInfo,
} from "./components/details/applicationDetailsUtils";

const VALID_TABS = ["requirements", "records", "notes"] as const;
type TabKey = (typeof VALID_TABS)[number];

const ApplicationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requirementsRef = useRef<HTMLDivElement>(null);

  const rawTab = searchParams.get("tab");
  const isValidTab = rawTab !== null && VALID_TABS.includes(rawTab as TabKey);
  const activeTab: TabKey = isValidTab ? (rawTab as TabKey) : "requirements";

  useEffect(() => {
    if (!isValidTab) {
      navigate(`?tab=requirements`, { replace: true });
    }
  }, [isValidTab, navigate]);

  const setActiveTab = (key: TabKey) => {
    navigate(`?tab=${key}`, { replace: true });
  };

  const { setStudent } = useStudentProfile();
  const { data, isLoading, error, refetch, isFetching } =
    useGetApplicationByIdQuery(id, {
      skip: !id,
    });
  const { refetch: paymentRefetch, isFetching: isPaymentFetching } =
    useGetAllInvoicePaymentsQuery([]);
  const applicationApiData = data?.data;

  const studentIdForProfile =
    applicationApiData?.studentId ?? applicationApiData?.student?.id;

  const { data: profileApiData, refetch: refetchProfile } =
    useGetStudentProfileQuery(studentIdForProfile!, {
      skip: !studentIdForProfile,
    });
  const profileData = profileApiData as any;

  useEffect(() => {
    if (!studentIdForProfile || !applicationApiData) return;
    const s = applicationApiData.student as
      | {
          firstName?: string;
          lastName?: string;
          email?: string;
          phone?: string;
          address?: string;
          status?: string;
          profile_photo?: string | null;
        }
      | undefined;
    const appId = applicationApiData?.applicationId
      ? String(applicationApiData.applicationId)
      : undefined;
    const universityName =
      applicationApiData?.course?.university?.name ??
      applicationApiData?.university?.name;
    const programName = applicationApiData?.course?.course?.name;
    const intake = applicationApiData?.intake;
    const level = applicationApiData?.studyLevel;
    const country =
      applicationApiData?.course?.country?.name ??
      applicationApiData?.country?.name ??
      applicationApiData?.course?.university?.country?.name;

    const applicationFeeInvoice = applicationApiData?.invoices?.find(
      (inv: any) => inv?.type === "APPLICATION_FEE",
    );
    const feeAmountText =
      applicationFeeInvoice?.amount != null && applicationFeeInvoice?.currency
        ? `${applicationFeeInvoice.amount} ${applicationFeeInvoice.currency}`
        : applicationFeeInvoice?.amount != null
          ? String(applicationFeeInvoice.amount)
          : undefined;
    const feeStatusText = applicationFeeInvoice?.status
      ? String(applicationFeeInvoice.status)
      : undefined;
    const feeDateRaw =
      applicationFeeInvoice?.paidAt ??
      applicationFeeInvoice?.paymentDate ??
      applicationFeeInvoice?.updatedAt ??
      applicationFeeInvoice?.createdAt;
    const feePaymentDateText = feeDateRaw
      ? (() => {
          try {
            return new Date(feeDateRaw).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
          } catch {
            return String(feeDateRaw);
          }
        })()
      : undefined;
    const feeReceiptUrl = applicationFeeInvoice?.invoiceFile
      ? `${config.image_access_url}${applicationFeeInvoice.invoiceFile}`
      : undefined;

    setStudent({
      id: studentIdForProfile,
      name: s
        ? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || "Student"
        : "Student",
      email: s?.email ?? "",
      phone: s?.phone ?? "",
      address: s?.address ?? "—",
      status: s?.status ?? "—",
      avatar:
        getApiImageUrl(profileData?.image) ||
        (profileData?.imageId
          ? `${config.image_access_url}/media/${String(profileData.imageId)}`
          : "") ||
        (s?.profile_photo
          ? s.profile_photo.startsWith("http")
            ? s.profile_photo
            : `${config.image_access_url || ""}${s.profile_photo}`
          : "") ||
        "/user.avif",
      applicationSidebar: {
        applicationId: appId,
        applicationStatus: applicationApiData?.status
          ? String(applicationApiData.status)
          : undefined,
        intake: intake ? String(intake) : undefined,
        program: programName ? String(programName) : undefined,
        school: universityName ? String(universityName) : undefined,
        country: country ? String(country) : undefined,
        level: level ? String(level) : undefined,
        applicationFee: applicationFeeInvoice
          ? {
              amountText: feeAmountText,
              statusText: feeStatusText,
              paymentDateText: feePaymentDateText,
              receiptUrl: feeReceiptUrl,
            }
          : undefined,
      },
    });
    return () => setStudent(null);
  }, [studentIdForProfile, applicationApiData, profileData, setStudent]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const applicationData = {
    id: applicationApiData?.id,
    applicationId: applicationApiData?.applicationId,
    college: {
      name: applicationApiData?.course?.university?.name,
      logo: applicationApiData?.university?.logoId
        ? `/uploads/${applicationApiData.university.logoId}`
        : "/images/logo/logo.svg",
      initials: applicationApiData?.university?.name
        ?.split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 3),
    },
    program: applicationApiData?.course?.course?.name,
    modeOfStudy: applicationApiData?.studyMode,
    mainSelectedIntake: applicationApiData?.intake,
    student: applicationApiData?.student
      ? `${applicationApiData.student?.firstName ?? ""} ${applicationApiData.student?.lastName ?? ""}`.trim()
      : "",
    studyType: applicationApiData?.studyLevel ?? "Undergraduate",
    status: applicationApiData?.status,
  };

  const isRejected = applicationApiData?.status === "REJECTED";

  const steps = React.useMemo(() => {
    const _invoices: any[] = applicationApiData?.invoices ?? [];
    const _appFeeInv = _invoices.find((inv) => inv.type === "APPLICATION_FEE");
    const _tuitionFeeInv = _invoices.find((inv) =>
      [
        "TUITION_FEE_HALF_BEFORE",
        "TUITION_FEE_FULL",
        "TUITION_FEE_FULL_BEFORE",
        "TUITION_FEE_FULL_AFTER_VISA",
      ].includes(inv.type),
    );
    const _appFeeComplete =
      !_appFeeInv || _appFeeInv.status === "PAID" || _appFeeInv.amount === 0;
    const _tuitionFeeComplete =
      !!_tuitionFeeInv &&
      (_tuitionFeeInv.status === "PAID" || _tuitionFeeInv.amount === 0);

    return [
      {
        id: "admission",
        name: "Admission",
        isCompleted:
          !!applicationApiData?.registrationForm &&
          !!applicationApiData?.passportFile &&
          !!applicationApiData?.student?.cv &&
          !!applicationApiData?.student?.motivationLetter &&
          profileData?.educations?.length > 0 &&
          profileData?.educations?.some(
            (edu: any) => edu.marksheet || edu.certificate,
          ),
      },
      {
        id: "apply",
        name: "Apply",
        isCompleted:
          !!applicationApiData?.isReviewed &&
          !!applicationApiData?.isCollageSubmitted &&
          !!applicationApiData?.conditionalOfferLetter &&
          _appFeeComplete &&
          _tuitionFeeComplete,
      },
      {
        id: "checklist",
        name: "Checklist Upload",
        isCompleted:
          !!applicationApiData?.bankStatement &&
          !!applicationApiData?.sponsor &&
          !!applicationApiData?.vfsAppointmentLetter &&
          !!applicationApiData?.affidavit &&
          !!applicationApiData?.internationalBankCard,
      },
      {
        id: "final-letter",
        name: "Final Letter",
        isCompleted:
          !!applicationApiData?.acceptanceLetter &&
          !!applicationApiData?.moneyReceipt,
      },
      {
        id: "embassy",
        name: "Embassy Submission",
        isCompleted: !!applicationApiData?.visaSubmissionDate,
      },
      {
        id: "visa",
        name: "Visa Outcome",
        isCompleted:
          applicationApiData?.status === "VISA_APPROVED" ||
          applicationApiData?.status === "VISA_REJECTED" ||
          applicationApiData?.visaCopy ||
          applicationApiData?.visaRejectedSlip,
      },
      {
        id: "enroll",
        name: "Enroll",
        isCompleted: applicationApiData?.status === "SUCCESS",
      },
    ];
  }, [applicationApiData, profileData]);

  const statusStyle = getApplicationStatusStyle(applicationData.status);
  const currentStepInfo = getCurrentStepInfo(steps);

  const studentAvatar =
    getApiImageUrl(profileData?.image) ||
    (profileData?.imageId
      ? `${config.image_access_url}/media/${String(profileData.imageId)}`
      : "") ||
    (applicationApiData?.student?.profile_photo
      ? applicationApiData.student.profile_photo.startsWith("http")
        ? applicationApiData.student.profile_photo
        : `${config.image_access_url || ""}${applicationApiData.student.profile_photo}`
      : "");

  const universityLogoUrl = applicationApiData?.course?.university
    ?.UniversityLogo?.url
    ? `${config.image_access_url}${applicationApiData.course.university.UniversityLogo.url}`
    : undefined;

  const universitySlug =
    applicationApiData?.course?.university?.slug ??
    applicationApiData?.course?.universitySlug;
  const courseSlug =
    applicationApiData?.course?.course?.slug ??
    applicationApiData?.course?.slug;

  const handleRefresh = () => {
    refetch();
    paymentRefetch();
    if (studentIdForProfile) refetchProfile();
  };

  const handleContinueStage = () => {
    setActiveTab("requirements");
    requestAnimationFrame(() => {
      requirementsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleViewProgram = () => {
    if (universitySlug && courseSlug) {
      navigate(
        `/programs-schools/courses/${universitySlug}/${courseSlug}`,
      );
      return;
    }
    if (universitySlug) {
      navigate(`/programs-schools/universities/${universitySlug}`);
    }
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:support@campustransfer.com";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spin size="large" tip="Loading Application Details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-8 text-red-700">
        Error loading application.
      </div>
    );
  }

  const countryName =
    applicationApiData?.course?.country?.name ??
    applicationApiData?.country?.name ??
    applicationApiData?.course?.university?.country?.name;

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5 pb-10">
      <button
        type="button"
        onClick={() => navigate("/applications")}
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-primary-600"
      >
        <ArrowLeft size={16} />
        Back to Applications
      </button>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <ApplicationSummaryHeader
            universityName={applicationData.college.name}
            universityLogoUrl={universityLogoUrl}
            programName={applicationData.program}
            statusLabel={statusStyle.label}
            statusClassName={statusStyle.className}
            onRefresh={handleRefresh}
            isRefreshing={isFetching || isPaymentFetching}
            metaItems={[
              {
                label: "Application ID",
                value: String(applicationData.applicationId ?? ""),
                icon: summaryMetaIcons.applicationId,
              },
              {
                label: "Mode of Study",
                value: String(applicationData.modeOfStudy ?? ""),
                icon: summaryMetaIcons.modeOfStudy,
              },
              {
                label: "Intake",
                value: String(applicationData.mainSelectedIntake ?? ""),
                icon: summaryMetaIcons.intake,
              },
              {
                label: "Study Type",
                value: String(applicationData.studyType ?? ""),
                icon: summaryMetaIcons.studyType,
              },
              {
                label: "Student Name",
                value: applicationData.student,
                icon: summaryMetaIcons.student,
              },
            ]}
          />

          <ApplicationNextStepBanner
            stepName={currentStepInfo.name}
            stepDescription={currentStepInfo.description}
            onContinue={handleContinueStage}
            hidden={currentStepInfo.allComplete || isRejected}
          />

          {/* <StudentInformationCard
            name={applicationData.student || "Student"}
            email={applicationApiData?.student?.email}
            phone={applicationApiData?.student?.phone}
            address={applicationApiData?.student?.address}
            status={applicationApiData?.student?.status}
            avatarUrl={studentAvatar || undefined}
            onViewProfile={
              studentIdForProfile
                ? () => navigate(`/students/${studentIdForProfile}/profile`)
                : undefined
            }
          /> */}

          <ApplicationTabBar
            activeTab={activeTab as ApplicationTabKey}
            onChange={setActiveTab}
          />

          <div
            ref={requirementsRef}
            className="rounded-2xl border border-neutral-200/80 bg-white shadow-sm"
          >
            {activeTab === "requirements" && (
              <div className="border-b border-neutral-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    <FileStack size={16} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-neutral-900">
                      Application Checklist
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Complete each stage to move your application forward.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div
              className={
                activeTab === "requirements"
                  ? "p-4 sm:p-5"
                  : activeTab === "records"
                    ? ""
                    : ""
              }
            >
              {activeTab === "requirements" ? (
                <ApplicationRequirementsTab
                  applicationApiData={applicationApiData}
                  steps={steps}
                />
              ) : activeTab === "records" ? (
                <StudentRecordsTab applicationApiData={applicationApiData} />
              ) : (
                <NotesTab applicationId={id!} />
              )}
            </div>
          </div>

          {/* <UniversityCourseCard
            fields={[
              {
                label: "Institution",
                value: applicationData.college.name,
              },
              { label: "Program", value: applicationData.program },
              {
                label: "Mode of Study",
                value: String(applicationData.modeOfStudy ?? ""),
              },
              {
                label: "Intake",
                value: String(applicationData.mainSelectedIntake ?? ""),
              },
              { label: "Study Type", value: applicationData.studyType },
              { label: "Country", value: countryName },
            ]}
            showViewProgram={Boolean(universitySlug)}
            onViewProgram={handleViewProgram}
          /> */}
        </div>

        <aside className="space-y-5 xl:sticky xl:top-20 xl:self-start">
          <ApplicationProgressPanel
            steps={steps}
            isRejected={isRejected}
            rejectionReason={applicationApiData?.rejectionReason}
          />
          <ImportantNotesCard />
          <NeedHelpCard onContactSupport={handleContactSupport} />
        </aside>
      </div>
    </div>
  );
};

export default ApplicationDetails;
