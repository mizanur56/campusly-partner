// import React, { useEffect } from "react";
// import { useParams, Outlet, useNavigate } from "react-router-dom";
// import { Image } from "antd";
// import { FaCircleCheck } from "react-icons/fa6";
// import { useGetApplicationByIdQuery } from "../../redux/features/application/applicationApi";
// import { config } from "../../config";
// import { useStudentProfile } from "../../context/StudentProfileContext";

// const ApplicationDetails = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const { setStudent } = useStudentProfile();
//   const { data, isLoading } = useGetApplicationByIdQuery(id!, { skip: !id });
//   const applicationApiData = data?.data;

//   // Sidebar e student card dekhanor jonno context e student set
//   useEffect(() => {
//     const s = applicationApiData?.student;
//     if (s) {
//       setStudent({
//         id: s.id,
//         name: `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || "Student",
//         email: s.email ?? "",
//         phone: s.phone ?? "",
//         address: s.address ?? "—",
//         status: s.status ?? "—",
//         avatar: s.profile_photo ? (s.profile_photo.startsWith("http") ? s.profile_photo : `${config.image_access_url || ""}${s.profile_photo}`) : undefined,
//       });
//     }
//     return () => setStudent(null);
//   }, [applicationApiData?.student, setStudent]);

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [id]);

//   const toLogoSrc = (logoUrl?: string | null) => {
//     if (!logoUrl) return undefined;
//     if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
//       return logoUrl;
//     }
//     if (config.image_access_url) {
//       return `${config.image_access_url}${logoUrl}`;
//     }
//     return logoUrl;
//   };

//   const applicationData = {
//     id: applicationApiData?.id,
//     applicationId: applicationApiData?.applicationId,
//     college: {
//       name: applicationApiData?.course?.university?.name,
//       logo: toLogoSrc(applicationApiData?.course?.university?.UniversityLogo?.url || undefined),
//       initials: applicationApiData?.course?.university?.name
//         ?.split(" ")
//         .map((w: string) => w[0])
//         .join("")
//         .slice(0, 3),
//     },
//     program: applicationApiData?.course?.course?.name,
//     modeOfStudy: applicationApiData?.studyMode,
//     mainSelectedIntake: applicationApiData?.intake,
//     student: applicationApiData?.student
//       ? `${applicationApiData.student?.firstName ?? ""} ${applicationApiData.student?.lastName ?? ""}`.trim()
//       : "",
//     studyType: applicationApiData?.studyLevel ?? "Undergraduate",
//     status: applicationApiData?.status,
//   };

//   const steps = [
//     { id: "admission", name: "Admission", isCompleted: applicationApiData?.isReviewed === true },
//     { id: "apply", name: "Apply", isCompleted: applicationApiData?.isCollageSubmitted === true },
//     { id: "checklist", name: "Checklist Upload", isCompleted: !!applicationApiData?.bankStatement || !!applicationApiData?.registrationForm },
//     { id: "final-letter", name: "Final Letter", isCompleted: !!applicationApiData?.acceptanceLetter && !!applicationApiData?.moneyReceipt },
//     { id: "embassy", name: "Embassy Submission", isCompleted: !!applicationApiData?.visaSubmissionDate },
//     { id: "visa", name: "Visa Outcome", isCompleted: applicationApiData?.status === "VISA_APPROVED" || applicationApiData?.status === "VISA_REJECTED" || !!applicationApiData?.visaCopy || !!applicationApiData?.visaRejectedSlip },
//     { id: "enroll", name: "Enroll", isCompleted: applicationApiData?.status === "ENROLLED" },
//   ];

//   // Route Guard: incomplete step e direct URL dile admission e redirect
//   useEffect(() => {
//     if (!isLoading && applicationApiData) {
//       const pathSegments = location.pathname.split("/");
//       const currentStepId = pathSegments[pathSegments.length - 1];
//       const currentIndex = steps.findIndex((s) => s.id === currentStepId);
//       if (currentIndex > 0) {
//         const prevStep = steps[currentIndex - 1];
//         if (!prevStep.isCompleted) {
//           navigate(`/applications/${id}/admission`, { replace: true });
//         }
//       }
//     }
//   }, [location.pathname, isLoading, applicationApiData, id]);

//   if (isLoading || !applicationApiData) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="animate-spin h-10 w-10 border-2 border-primary-500 border-t-transparent rounded-full" />
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div className="mb-8 space-y-4">
//         <div className="flex items-start gap-4">
//           {applicationData.college.logo ? (
//             <Image src={applicationData.college.logo} alt={applicationData.college.name} width={64} height={64} preview={false} className="rounded-full object-cover" />
//           ) : (
//             <div className="w-16 h-16 rounded-full bg-[#237D3B] flex items-center justify-center shrink-0">
//               <span className="text-white font-bold text-xl">{applicationData.college.initials}</span>
//             </div>
//           )}
//           <div className="flex-1">
//             <h2 className="text-[18px] text-[#4B5563] mb-1">{applicationData.college.name}</h2>
//             <h3 className="text-[24px] font-semibold text-[#20242A] mb-4">{applicationData.program}</h3>
//           </div>
//         </div>
//         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 text-[14px]">
//           <div className="flex flex-col gap-2">
//             <span className="text-[#4B5563] text-[14px]">Application ID</span>
//             <span className="font-medium text-[14px] text-[#20242A]">{applicationData.applicationId}</span>
//           </div>
//           <div className="flex flex-col gap-2">
//             <span className="text-[#4B5563] text-[14px]">Mode of Study</span>
//             <span className="font-medium text-[14px] text-[#20242A]">{applicationData.modeOfStudy}</span>
//           </div>
//           <div className="flex flex-col gap-2">
//             <span className="text-[#4B5563] text-[14px]">Main selected intake</span>
//             <span className="font-medium text-[14px] text-[#20242A]">{applicationData.mainSelectedIntake}</span>
//           </div>
//           <div className="flex flex-col gap-2">
//             <span className="text-[#4B5563] text-[14px]">Student</span>
//             <span className="font-medium text-[14px] text-[#20242A]">{applicationData.student || "—"}</span>
//           </div>
//           <div className="flex flex-col gap-2">
//             <span className="text-[#4B5563] text-[14px]">Study Type</span>
//             <span className="font-medium text-[14px] text-[#20242A]">{applicationData.studyType}</span>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-1">
//           <div className="bg-white border border-[#C7CACF] rounded-xl p-6 h-fit sticky top-6">
//             <h3 className="text-[20px] font-semibold text-[#20242A] mb-6">Application Steps</h3>
//             <div className="relative">
//               <div className="absolute z-10 left-[12px] top-5 bottom-2 w-0.5 bg-[#D1D5DB]" />
//               <div className="space-y-14">
//                 {steps.map((step, index) => {
//                   const isActive = location.pathname.endsWith(step.id) || (location.pathname.endsWith(id!) && step.id === "admission");
//                   return (
//                     <div
//                       key={step.id}
//                       className="flex items-center gap-4 relative z-10 cursor-default"
//                     >
//                       <div className="relative z-50">
//                         {step.isCompleted ? (
//                           <FaCircleCheck className="text-[#00B561] relative z-50" size={24} />
//                         ) : (
//                           <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-[14px] relative z-50 ${isActive ? "bg-[#237D3B] text-white" : "bg-[#E6F4EA] text-[#237D3B]"}`}>
//                             {index + 1}
//                           </div>
//                         )}
//                       </div>
//                       <span className={`text-[16px] transition-colors ${isActive ? "text-[#237D3B] font-semibold" : "text-[#4B5563]"}`}>
//                         {step.name}
//                       </span>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="lg:col-span-2">
//           <Outlet context={{ applicationApiData, steps }} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ApplicationDetails;


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

const ApplicationDetails = () => {
  const { id } = useParams<{ id: string }>();
  useRefetchApplicationNotesOnNoteNotification(id);
  const [isRedirecting, setIsRedirecting] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<
    "requirements" | "records" | "notes"
  >("requirements");
  const navigate = useNavigate();
  const { setStudent } = useStudentProfile();
  const { data, isLoading, error } = useGetApplicationByIdQuery(id, {
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
    setStudent({
      id: studentIdForProfile,
      name: s
        ? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || "Student"
        : "Student",
      email: s?.email ?? "",
      phone: s?.phone ?? "",
      address: s?.address ?? "—",
      status: s?.status ?? "—",
      avatar: s?.profile_photo
        ? s.profile_photo.startsWith("http")
          ? s.profile_photo
          : `${config.image_access_url || ""}${s.profile_photo}`
        : undefined,
    });
    return () => setStudent(null);
  }, [studentIdForProfile, applicationApiData, setStudent]);
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
        isCompleted: !!applicationApiData?.conditionalOfferLetter,
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

  useEffect(() => {
    const isBaseRoute = location.pathname.endsWith(id!);

    if (!isLoading && applicationApiData) {
      if (isBaseRoute) {
        // শেষ কমপ্লিটেড স্টেপ বের করা
        let lastCompletedIndex = -1;
        for (let i = steps.length - 1; i >= 0; i--) {
          if (steps[i].isCompleted) {
            lastCompletedIndex = i;
            break;
          }
        }

        const nextStepIndex = lastCompletedIndex + 1;
        const targetStep = steps[nextStepIndex]
          ? steps[nextStepIndex].id
          : steps[steps.length - 1].id;

        // রিডাইরেক্ট করা
        navigate(`/applications/${id}/${targetStep}`, { replace: true });
      } else {
        // যদি অলরেডি কোনো সাব-রাউটে থাকে, তাহলে লোডিং বন্ধ করে দিবে
        setIsRedirecting(false);
      }
    }
  }, [isLoading, applicationApiData, id, location.pathname, steps]);

  // ১. মেইন ডাটা লোড হওয়া বা রিডাইরেক্ট হওয়ার সময় ফুল পেজ স্পিনার দেখাবে
  if (isLoading || isRedirecting) {
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
            <h3 className="text-[24px] font-semibold text-[#20242A] mb-4">
              {applicationData.program}
            </h3>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
        <aside className="lg:col-span-1">
          <div className="sticky top-6 rounded-3xl border border-[#CFCACF] bg-white p-6 card-shadow dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-[18px] font-semibold text-[#20242A] dark:text-white">
              Application journey
            </h3>

            <div className="relative mt-6">
              <div className="absolute z-10 left-[11px] top-2 bottom-2 w-0.5 bg-[#D1D5DB]" />

              <div className="space-y-10">
                {steps.map((step, index) => {
                  const isActive =
                    location.pathname.endsWith(step.id) ||
                    (location.pathname.endsWith(id!) &&
                      step.id === "admission");

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
