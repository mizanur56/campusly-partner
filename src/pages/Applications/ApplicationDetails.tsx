import React, { useEffect } from "react";
import { useParams, Outlet, useNavigate } from "react-router-dom";
import { Image } from "antd";
import { FaCircleCheck } from "react-icons/fa6";
import { useGetApplicationByIdQuery } from "../../redux/features/application/applicationApi";
import { config } from "../../config";
import { useStudentProfile } from "../../context/StudentProfileContext";

const ApplicationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setStudent } = useStudentProfile();
  const { data, isLoading } = useGetApplicationByIdQuery(id!, { skip: !id });
  const applicationApiData = data?.data;

  // Sidebar e student card dekhanor jonno context e student set
  useEffect(() => {
    const s = applicationApiData?.student;
    if (s) {
      setStudent({
        id: s.id,
        name: `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || "Student",
        email: s.email ?? "",
        phone: s.phone ?? "",
        address: s.address ?? "—",
        status: s.status ?? "—",
        avatar: s.profile_photo ? (s.profile_photo.startsWith("http") ? s.profile_photo : `${config.image_access_url || ""}${s.profile_photo}`) : undefined,
      });
    }
    return () => setStudent(null);
  }, [applicationApiData?.student, setStudent]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const toLogoSrc = (logoUrl?: string | null) => {
    if (!logoUrl) return undefined;
    if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
      return logoUrl;
    }
    if (config.image_access_url) {
      return `${config.image_access_url}${logoUrl}`;
    }
    return logoUrl;
  };

  const applicationData = {
    id: applicationApiData?.id,
    applicationId: applicationApiData?.applicationId,
    college: {
      name: applicationApiData?.course?.university?.name,
      logo: toLogoSrc(applicationApiData?.course?.university?.UniversityLogo?.url || undefined),
      initials: applicationApiData?.course?.university?.name
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

  const steps = [
    { id: "admission", name: "Admission", isCompleted: applicationApiData?.isReviewed === true },
    { id: "apply", name: "Apply", isCompleted: applicationApiData?.isCollageSubmitted === true },
    { id: "checklist", name: "Checklist Upload", isCompleted: !!applicationApiData?.bankStatement || !!applicationApiData?.registrationForm },
    { id: "final-letter", name: "Final Letter", isCompleted: !!applicationApiData?.acceptanceLetter && !!applicationApiData?.moneyReceipt },
    { id: "embassy", name: "Embassy Submission", isCompleted: !!applicationApiData?.visaSubmissionDate },
    { id: "visa", name: "Visa Outcome", isCompleted: applicationApiData?.status === "VISA_APPROVED" || applicationApiData?.status === "VISA_REJECTED" || !!applicationApiData?.visaCopy || !!applicationApiData?.visaRejectedSlip },
    { id: "enroll", name: "Enroll", isCompleted: applicationApiData?.status === "ENROLLED" },
  ];

  // Route Guard: incomplete step e direct URL dile admission e redirect
  useEffect(() => {
    if (!isLoading && applicationApiData) {
      const pathSegments = location.pathname.split("/");
      const currentStepId = pathSegments[pathSegments.length - 1];
      const currentIndex = steps.findIndex((s) => s.id === currentStepId);
      if (currentIndex > 0) {
        const prevStep = steps[currentIndex - 1];
        if (!prevStep.isCompleted) {
          navigate(`/applications/${id}/admission`, { replace: true });
        }
      }
    }
  }, [location.pathname, isLoading, applicationApiData, id]);

  if (isLoading || !applicationApiData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 space-y-4">
        <div className="flex items-start gap-4">
          {applicationData.college.logo ? (
            <Image src={applicationData.college.logo} alt={applicationData.college.name} width={64} height={64} preview={false} className="rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#237D3B] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xl">{applicationData.college.initials}</span>
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-[18px] text-[#4B5563] mb-1">{applicationData.college.name}</h2>
            <h3 className="text-[24px] font-semibold text-[#20242A] mb-4">{applicationData.program}</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 text-[14px]">
          <div className="flex flex-col gap-2">
            <span className="text-[#4B5563] text-[14px]">Application ID</span>
            <span className="font-medium text-[14px] text-[#20242A]">{applicationData.applicationId}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[#4B5563] text-[14px]">Mode of Study</span>
            <span className="font-medium text-[14px] text-[#20242A]">{applicationData.modeOfStudy}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[#4B5563] text-[14px]">Main selected intake</span>
            <span className="font-medium text-[14px] text-[#20242A]">{applicationData.mainSelectedIntake}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[#4B5563] text-[14px]">Student</span>
            <span className="font-medium text-[14px] text-[#20242A]">{applicationData.student || "—"}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[#4B5563] text-[14px]">Study Type</span>
            <span className="font-medium text-[14px] text-[#20242A]">{applicationData.studyType}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#C7CACF] rounded-xl p-6 h-fit sticky top-6">
            <h3 className="text-[20px] font-semibold text-[#20242A] mb-6">Application Steps</h3>
            <div className="relative">
              <div className="absolute z-10 left-[12px] top-5 bottom-2 w-0.5 bg-[#D1D5DB]" />
              <div className="space-y-14">
                {steps.map((step, index) => {
                  const isActive = location.pathname.endsWith(step.id) || (location.pathname.endsWith(id!) && step.id === "admission");
                  return (
                    <div
                      key={step.id}
                      className="flex items-center gap-4 relative z-10 cursor-default"
                    >
                      <div className="relative z-50">
                        {step.isCompleted ? (
                          <FaCircleCheck className="text-[#00B561] relative z-50" size={24} />
                        ) : (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-[14px] relative z-50 ${isActive ? "bg-[#237D3B] text-white" : "bg-[#E6F4EA] text-[#237D3B]"}`}>
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <span className={`text-[16px] transition-colors ${isActive ? "text-[#237D3B] font-semibold" : "text-[#4B5563]"}`}>
                        {step.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <Outlet context={{ applicationApiData, steps }} />
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
