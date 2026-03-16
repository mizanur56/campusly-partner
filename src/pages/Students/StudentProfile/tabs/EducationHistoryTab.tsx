import React, { useMemo } from "react";
import { Dropdown, Menu } from "antd";
import { DownOutlined, PlusOutlined } from "@ant-design/icons";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import {
  useGetEligibleStudyLevelsQuery,
  useGetDocumentsByCategoryQuery,
  useGetStudentProfileQuery,
} from "../../../../redux/features/profile/studentProfileApi";
import { useGetCountriesQuery } from "../../../../redux/features/countries/countriesApi";
import QualificationForm from "../../../../components/ProfileTab/EducationsTab/QualificationForm";

type EducationItem = {
  id: string;
  studyLevel?: { id?: string; name?: string };
  studyLevelId?: string;
  instituteName?: string;
  country?: string;
  startYear?: string;
  endYear?: string;
  result?: string;
  outOfGrade?: string;
  subject?: string;
};

interface EducationHistoryTabProps {
  studentId: string;
  profile: { country?: string } | null;
  educations: EducationItem[];
  canEdit: boolean;
  onUpdated?: () => void;
}

export default function EducationHistoryTab({
  studentId,
  profile,
  educations,
  canEdit,
  onUpdated,
}: EducationHistoryTabProps) {
  const { data: countriesData } = useGetCountriesQuery({ page: 1, limit: 1000 });
  const countryId = useMemo(() => {
    if (!profile?.country || !countriesData?.data) return undefined;
    const c = (countriesData.data as { id: string; name: string }[]).find(
      (x) => x.name.toLowerCase() === (profile.country ?? "").toLowerCase()
    );
    return c?.id;
  }, [profile?.country, countriesData?.data]);

  const { data: studyLevelsData, isLoading: isLoadingStudyLevels } =
    useGetEligibleStudyLevelsQuery(
      { studentId, countryId },
      { skip: !studentId }
    );

  const { data: englishTestsData } = useGetDocumentsByCategoryQuery(
    { studentId, slug: "english-language-tests" },
    { skip: !studentId }
  );

  const { data: studentProfile } = useGetStudentProfileQuery(studentId, {
    skip: !studentId,
  });

  const englishTestList = useMemo(() => {
    const raw = Array.isArray(englishTestsData)
      ? englishTestsData
      : (englishTestsData as { data?: unknown[] })?.data ?? [];
    return (raw as { id: string; name?: string }[]).map((t) => ({
      id: t.id,
      name: t.name ?? "English Test",
    }));
  }, [englishTestsData]);

  type DocItem = { documentId?: string; documentRelation?: { category?: { name?: string } } };
  const submittedEnglishTestIds = useMemo(() => {
    const docs = (studentProfile as { documents?: DocItem[] })?.documents ?? [];
    return docs
      .filter((d: DocItem) => d?.documentRelation?.category?.name === "English Language Tests")
      .map((d: DocItem) => d.documentId)
      .filter(Boolean);
  }, [studentProfile]);

  const studyLevelOptions = useMemo(() => {
    const data = Array.isArray(studyLevelsData)
      ? studyLevelsData
      : (studyLevelsData as { data?: unknown[] })?.data ?? [];
    return (data as { id?: string; countryStudyLevelName?: string; description?: string }[]).map(
      (level) => ({
        label: level.countryStudyLevelName ?? level.description ?? "Education",
        value: level.id ?? "",
      })
    );
  }, [studyLevelsData]);

  return (
    <div className="w-full space-y-4">
      {/* Last Qualifications - same as student */}
      <h2 className="text-[20px] font-semibold text-[#20242A]">
        Last Qualifications
      </h2>

      {isLoadingStudyLevels ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className="bg-[#FFFFFF] border border-[#C7CACF] rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Skeleton height={24} width={200} />
                <Skeleton height={24} width={40} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Skeleton height={40} />
                <Skeleton height={40} />
                <Skeleton height={40} />
                <Skeleton height={40} />
                <Skeleton height={40} />
                <Skeleton height={40} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {studyLevelOptions.map((level: { label: string; value: string }) => {
            const matchingEducation = educations.find(
              (edu) =>
                edu.studyLevelId === level.value ||
                edu.studyLevel?.id === level.value
            );
            return (
              <QualificationForm
                key={level.value}
                studentId={studentId}
                title={level.label}
                studyLevelId={level.value}
                educationData={matchingEducation ?? undefined}
                canEdit={canEdit}
                onUpdated={onUpdated}
              />
            );
          })}
        </div>
      )}

      {/* English Language Tests - same section as student */}
      <div className="space-y-4 pt-2">
        <h2 className="text-[20px] font-semibold text-[#20242A]">
          English Language Tests
        </h2>
        <p className="text-[14px] text-[#4B5563]">
          Submitted English language proficiency tests appear in Upload Documents.
        </p>
      </div>

      {/* Medium of instruction - same card style as student */}
      <div className="bg-[#FFFFFF] border border-[#C7CACF] rounded-lg p-6 overflow-hidden">
        <h1 className="text-[18px] font-semibold text-[#20242A]">
          Medium of instruction
        </h1>
        <p className="text-[14px] text-[#4B5563] mt-1">
          Stored in General Information / profile.
        </p>
      </div>

      {/* Standardized Tests - same as student: dropdown with test list */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-[#20242A]">
          Standardized Tests
        </h1>

        <Dropdown
          trigger={["click"]}
          overlay={
            <Menu>
              {englishTestList.length === 0 ? (
                <Menu.Item disabled key="empty">
                  <span className="text-[14px] text-[#4B5563]">
                    No test types available. Add from Upload Documents.
                  </span>
                </Menu.Item>
              ) : (
                englishTestList.map((test) => {
                  const isAdded = submittedEnglishTestIds.includes(test.id);
                  return (
                    <Menu.Item
                      key={test.id}
                      disabled={isAdded}
                      onClick={() => {
                        if (!isAdded) {
                          onUpdated?.();
                        }
                      }}
                    >
                      {test.name}
                      {isAdded && (
                        <span className="ml-2 text-gray-400">(Added)</span>
                      )}
                    </Menu.Item>
                  );
                })
              )}
            </Menu>
          }
        >
          <button
            type="button"
            className="bg-[#237D3B] hover:bg-[#19592A] cursor-pointer text-[#E7E7E7] text-[15px] py-3 px-6 rounded-lg font-semibold flex items-center gap-2 transition-all"
          >
            <PlusOutlined /> Add Standardized Test <DownOutlined />
          </button>
        </Dropdown>
      </div>
    </div>
  );
}
