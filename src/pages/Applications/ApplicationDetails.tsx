

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Image, Spin } from "antd";
import React, { useEffect } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { useGetApplicationByIdQuery } from "../../redux/features/application/applicationApi";


import { config } from "../../config";
import { useStudentProfile } from "../../context/StudentProfileContext";
import { useGetStudentProfileQuery } from "../../redux/features/profile/studentProfileApi";
import ApplicationRequirementsTab from "./components/ApplicationRequirementsTab";
import NotesTab from "./components/NotesTab";
import StudentRecordsTab from "./components/StudentRecordsTab";
import { useRefetchApplicationNotesOnNoteNotification } from "../../hooks/useRefetchApplicationNotesOnNoteNotification";
import { getApiImageUrl } from "../../utils/getApiImageUrl";
import { RefreshCw } from "lucide-react";

const ApplicationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [isRedirecting, setIsRedirecting] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<
    "requirements" | "records" | "notes"
  >("requirements");
  const navigate = useNavigate();
  const { setStudent } = useStudentProfile();
  const { data, isLoading, error,refetch,isFetching } = useGetApplicationByIdQuery(id, {
    skip: !id,
  });
  const applicationApiData = data?.data;

  /** Partner profile API uses student record id (see Admission.tsx), not auth userId. */
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
        // Prefer student profile photo from partner student profile API (same as StudentProfile page)
        getApiImageUrl(profileData?.image) ||
        (profileData?.imageId
          ? `${config.image_access_url}/media/${String(profileData.imageId)}`
          : "") ||
        // Fallback to auth user profile photo if present
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
  // Scroll to top when component mounts or id changes
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

 

  const steps = React.useMemo(
    () => [
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
        applicationApiData?.isReviewed &&
        applicationApiData?.isCollageSubmitted &&
        !!applicationApiData?.conditionalOfferLetter &&
        applicationApiData?.invoices?.length > 0 &&
        applicationApiData?.invoices?.every(
          (inv: any) => inv.status === "PAID" || inv.amount === 0,
        ),
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
    ],
    [applicationApiData, profileData],
  );

  // ২. 🔥 Route Guard: ইউজার ম্যানুয়ালি URL এ নাম লিখলে তাকে আটকে দিবে
  // useEffect(() => {
  //   if (!isLoading && applicationApiData) {
  //     // URL থেকে কারেন্ট স্টেপ বের করা (e.g., 'apply', 'checklist')
  //     const pathSegments = location.pathname.split("/");
  //     const currentStepId = pathSegments[pathSegments.length - 1];

  //     const currentIndex = steps.findIndex((s) => s.id === currentStepId);

  //     // যদি ইউজার অ্যাডমিশন ছাড়া অন্য কোনো ধাপে সরাসরি যেতে চায়
  //     if (currentIndex > 0) {
  //       // চেক করবে আগের ধাপটি কমপ্লিট কি না
  //       const prevStep = steps[currentIndex - 1];
  //       if (!prevStep.isCompleted) {
  //         // আগের ধাপ কমপ্লিট না থাকলে তাকে প্রথম ধাপে রিডাইরেক্ট করবে
  //         navigate(`/applications/${id}/admission`, { replace: true });
  //       }
  //     }
  //   }
  // }, [location.pathname, isLoading, applicationApiData, id]);

  // NOTE: ApplicationDetails no longer uses step-based routing (e.g. /admission, /apply).
  // It renders the full journey in-page (accordion) inside the Requirements tab.

  // ১. মেইন ডাটা লোড হওয়া বা রিডাইরেক্ট হওয়ার সময় ফুল পেজ স্পিনার দেখাবে
  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spin size="large" tip="Loading Application Details..." />
      </div>
    );
  }

  // ২. যদি কোনো এরর থাকে
  if (error) {
    return <div>Error loading application.</div>;
  }


  return (
    <div>
      {/* Program Overview */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">

        <div className="flex items-start gap-4">
          {applicationApiData?.course?.university?.UniversityLogo?.url ? (
            <Image
              src={`${config.image_access_url}${applicationApiData.course.university.UniversityLogo.url}`}
              alt={applicationData.college.name}
              width={64}
              height={64}
              preview={false}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#237D3B] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xl">
                {applicationData.college.initials}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-[18px] text-[#4B5563] mb-1">
              {applicationData.college.name}
            </h2>
            <h3 className="text-[20px] font-semibold text-[#20242A] mb-4">
              {applicationData.program}
            </h3>
          </div>
        </div>

        <div className="">
        <button
  onClick={refetch}
  className="px-4 py-3 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 transition-all disabled:opacity-70"
  disabled={isFetching}
>
  <RefreshCw 
    size={18} 
    className={`${isFetching ? "animate-spin" : ""}`} 
  />
  Refresh
</button>
    </div>

        </div>
      

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 text-[14px]">
          <div className="flex flex-col gap-2">
            <span className="text-[#4B5563] text-[14px]">Application ID</span>{" "}
            <span className="font-medium text-[14px] text-[#20242A]">
              {applicationData.applicationId}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[#4B5563] text-[14px]">Mode of Study</span>{" "}
            <span className="font-medium text-[14px] text-[#20242A]">
              {applicationData.modeOfStudy}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[#4B5563] text-[14px]">
              Main selected intake
            </span>{" "}
            <span className="font-medium text-[14px] text-[#20242A]">
              {applicationData.mainSelectedIntake}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[#4B5563] text-[14px]">Student</span>{" "}
            <span className="font-medium text-[14px] text-[#20242A]">
              {applicationData.student}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[#4B5563] text-[14px]">Study Type</span>{" "}
            <span className="font-medium text-[14px] text-[#20242A]">
              {applicationData.studyType}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-[#CFCACF] dark:border-gray-800">
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => setActiveTab("requirements")}
            className={`-mb-px pb-3 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "requirements"
                ? "border-b-2 border-[#22C55E] text-[#15803D]"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Application Requirements
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("records")}
            className={`-mb-px pb-3 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "records"
                ? "border-b-2 border-[#22C55E] text-[#15803D]"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Student Records
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`-mb-px pb-3 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "notes"
                ? "border-b-2 border-[#22C55E] text-[#15803D]"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Notes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
        {/* Left content changes with tabs */}
        <div className="lg:col-span-2">
          {activeTab === "requirements" ? (
              <ApplicationRequirementsTab
                applicationApiData={applicationApiData}
                steps={steps}
                
              />
          ) : activeTab === "records" ? (
              <StudentRecordsTab
                profileData={profileData}
                applicationApiData={applicationApiData}
              />
          ) : (
              <NotesTab applicationId={id!} />
          )}
        </div>

        {/* Right sidebar stays the same */}
        <aside className="lg:col-span-1 ">
          <div className=" rounded-lg border border-[#CFCACF] bg-white p-6 sticky top-20 card-shadow dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-[18px] font-semibold text-[#20242A] dark:text-white">
              Application journey
            </h3>

            <div className="relative mt-6">
              <div className="absolute z-10 left-[11px] top-2 bottom-2 w-0.5 bg-[#D1D5DB]" />

              <div className="space-y-10">
                {steps.map((step, index) => {
                  // Step routing removed; highlight the first incomplete step instead.
                  const firstIncompleteIndex = steps.findIndex((s) => !s.isCompleted);
                  const isActive =
                    (firstIncompleteIndex === -1 && index === steps.length - 1) ||
                    index === (firstIncompleteIndex === -1 ? 0 : firstIncompleteIndex);

                  return (
                    <div
                      key={step.id}
                      className="flex items-center gap-4 relative z-10 cursor-default"
                    >
                      <div className="relative z-50">
                        {step.isCompleted ? (
                          <FaCircleCheck
                            className="text-[#00B561] bg-white rounded-full relative z-50"
                            size={22}
                          />
                        ) : (
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-[13px] relative z-50 ${
                              isActive
                                ? "bg-[#237D3B] text-white"
                                : "bg-[#E6F4EA] text-[#237D3B]"
                            }`}
                          >
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <span
                        className="text-[14px] text-[#4B5563] dark:text-gray-300"
                      >
                        {step.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ApplicationDetails;
