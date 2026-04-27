

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { Form, Dropdown, Menu, Spin } from "antd";
import { DownOutlined, PlusOutlined } from "@ant-design/icons";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useDeleteDocumentMutation, useGetDocumentsByCategoryQuery, useGetEligibleStudyLevelsByCountryQuery, useGetStudentProfileQuery } from "../../../../redux/features/profile/studentProfileApi";
import { useGetCountriesQuery } from "../../../../redux/features/countries/countriesApi";
import { toast } from "react-toastify";
import QualificationForm from "../../../../components/ProfileTab/EducationsTab/QualificationForm";
import DeleteModal from "../../../../components/shared/DeleteModal";
import MediumOfInstruction from "../../../../components/ProfileTab/EducationsTab/MediumOfInstruction";
import LanguageTestCard from "../../../../components/ProfileTab/EducationsTab/LanguageTestCard";

interface EducationHistoryTabProps {
  studentId: string;
  profile: { country?: string } | null;
  educations: any[];
  canEdit: boolean;
  onUpdated?: () => void;
}

/** RTK unwraps `response.data` — narrow fields used in this tab. */
interface StudentProfileEducationShape {
  userId?: string;
  country?: string;
  data?: { country?: string };
  educations?: any[];
  documents?: Array<{
    documentId?: string;
    documentRelation?: { name?: string; category?: { name?: string } };
  }>;
}

// --- Main EducationHistory Component ---
const EducationHistory = ({
  studentId,
  profile,
  educations: _educations,
  canEdit,
  onUpdated,
}: EducationHistoryTabProps) => {
  const { data: profileDataRaw, refetch } = useGetStudentProfileQuery(
    studentId,
    { skip: !studentId },
  );
  const profileData = profileDataRaw as
    | StudentProfileEducationShape
    | null
    | undefined;
  const { data: countries } = useGetCountriesQuery({ page: 1, limit: 1000 });

  const selectedCountryId = useMemo(() => {
    const profileCountryName =
      profileData?.data?.country || profileData?.country || profile?.country;
    const countryList = countries?.data;

    if (!profileCountryName || !countryList) return null;

    const raw = String(profileCountryName).trim();
    // Backend may store either the country id or the country name.
    const byId = countryList.find((c) => c.id === raw);
    if (byId) return byId.id;

    const matchedCountry = countryList.find(
      (c) => c.name.trim().toLowerCase() === raw.toLowerCase(),
    );

    return matchedCountry ? matchedCountry.id : null;
  }, [profileData, countries, profile?.country]);

  const userId = profileData?.userId;
  const { data: studyLevels, isLoading: isLoadingStudyLevels } =
    useGetEligibleStudyLevelsByCountryQuery(
      {
        countryId: selectedCountryId,
        studentId: userId,
      },
      {
        refetchOnMountOrArgChange: true,
        skip: !selectedCountryId || !studentId || !userId,
      },
    );
  const studyLevelData = studyLevels?.data || [];
  const studyLevelOptions = studyLevelData.map((level: any) => ({
    label: level.countryStudyLevelName || level.description,
    value: level.id,
  }));

  const educationData = useMemo(
    () => profileData?.educations || [],
    [profileData],
  );
  const documents = useMemo(
    () => profileData?.documents || [],
    [profileData],
  );


  // Memoize submittedEnglishTestDocs to prevent infinite loops
  const submittedEnglishTestDocs = useMemo(() => {
    return (documents || []).filter(
      (item: any) =>
        item?.documentRelation?.category?.name === "English Language Tests",
    );
  }, [documents]);

  const [form] = Form.useForm();

  const { data: englishTests, isLoading: isLoadingEnglishTests } =
    useGetDocumentsByCategoryQuery({
      studentId: studentId,
      slug: "english-language-tests",
    });
  const englishTestData = useMemo(
    () => englishTests as any || [],
    [englishTests],
  );



  // Initialize activeTests with submitted tests
  const [activeTests, setActiveTests] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTestId, setDeletingTestId] = useState<string | null>(null);

  const [deleteDocument, { isLoading: isDeleting }] =
    useDeleteDocumentMutation();

  // Memoize submitted test IDs string for stable comparison
  const submittedTestIdsString = useMemo(() => {
    return submittedEnglishTestDocs
      .map((doc: any) => doc.documentId)
      .sort()
      .join(",");
  }, [submittedEnglishTestDocs]);

  // Update activeTests when submittedEnglishTestDocs changes
  useEffect(() => {
    if (submittedEnglishTestDocs.length === 0) {
      return;
    }

    const submittedTestIds = submittedEnglishTestDocs.map(
      (doc: any) => doc.documentId,
    );
    const submittedTests = submittedEnglishTestDocs.map((doc: any) => ({
      id: doc.documentId,
      type: doc.documentRelation?.name || "English Test",
    }));

    // Keep existing tests that are not submitted, and add submitted tests
    setActiveTests((prevTests) => {
      // Check if submitted tests are already in the list with same IDs
      const existingSubmittedIds = prevTests
        .filter((test) => submittedTestIds.includes(test.id))
        .map((test) => test.id)
        .sort()
        .join(",");

      // Check if arrays are equal
      const currentSubmittedIdsString = submittedTestIds.sort().join(",");

      if (existingSubmittedIds === currentSubmittedIdsString) {
        // Submitted tests haven't changed, check if we need to update
        const nonSubmittedCount = prevTests.filter(
          (test) => !submittedTestIds.includes(test.id),
        ).length;

        if (prevTests.length === submittedTests.length + nonSubmittedCount) {
          return prevTests; // No changes needed
        }
      }

      const nonSubmittedTests = prevTests.filter(
        (test) => !submittedTestIds.includes(test.id),
      );
      return [...submittedTests, ...nonSubmittedTests];
    });
  }, [submittedTestIdsString, submittedEnglishTestDocs]); // Use stable string dependency

  // useEffect(() => {
  //   if (activeTests.length === 0 && englishTestData.length > 0) {
  //     setActiveTests(
  //       englishTestData
  //         .slice(0, 2)
  //         .map((test: any) => ({ id: test.id, type: test.name })),
  //     );
  //   }
  // }, [englishTestData, activeTests]);

  // Get submitted test types (testTypeId) to filter from dropdown
  // const submittedTestTypeIds = useMemo(() => {
  //   return submittedEnglishTestDocs.map((doc: any) => doc.documentId);
  // }, [submittedEnglishTestDocs]);

  // Filter out submitted tests from dropdown options
  // const availableTests = useMemo(() => {
  //   return englishTestData.filter(
  //     (test: any) => !submittedTestTypeIds.includes(test.id)
  //   );
  // }, [englishTestData, submittedTestTypeIds]);

  // Filter out tests that are already in activeTests (added or submitted)
  const availableTests = useMemo(() => {
    const activeIds = activeTests.map((t) => t.id);
    return englishTestData.filter((test: any) => !activeIds.includes(test.id));
  }, [englishTestData, activeTests]);



  const clearLanguageTestFields = (testId: string) => {
    const fieldsToClear: string[] = [];

    // certificate field
    fieldsToClear.push(`${testId}_certificateId`);

    // dynamic fields (listening, reading etc.)
    const test = englishTestData.find((t: any) => t.id === testId);

    test?.fields?.forEach((field: any) => {
      fieldsToClear.push(
        `${testId}_${field.name.toLowerCase().replace(/\s+/g, "_")}`,
      );
    });

    // 🔥 clear form values
    form.setFieldsValue(
      fieldsToClear.reduce(
        (acc, key) => {
          acc[key] = undefined;
          return acc;
        },
        {} as Record<string, any>,
      ),
    );
  };
  const handleDeleteClick = (identifier: string) => {
    const isSubmitted = submittedEnglishTestDocs.some(
      (doc: any) => doc.documentId === identifier,
    );

    if (isSubmitted) {
      setDeletingTestId(identifier);
      setIsDeleteModalOpen(true);
    } else {
      // 🔥 clear form fields immediately
      clearLanguageTestFields(identifier);

      // remove card
      setActiveTests((prev) => prev.filter((test) => test.id !== identifier));

      toast.success("Test removed from UI");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTestId) return;

    try {
      await deleteDocument({
        studentId,
        documentId: deletingTestId,
      }).unwrap();

      // 🔥 clear form fields immediately
      clearLanguageTestFields(deletingTestId);

      // UI remove
      setActiveTests((prev) =>
        prev.filter((test) => test.id !== deletingTestId),
      );

      toast.success("Document deleted successfully");

      // close modal
      setIsDeleteModalOpen(false);
      setDeletingTestId(null);

      // optional refetch
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete document");
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingTestId(null);
  };

  return (
    <div className="w-full space-y-4">
      {/* Qualifications */}

      <h2 className="text-[18px] font-semibold text-[#20242A]">
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
          {studyLevelOptions.map(
            (level: { label: string; value: string }, index: number) => {
              // Find matching education data for this study level
              const matchingEducation = educationData.find(
                (edu: any) => edu.studyLevelId === level.value,
              );

              return (
                <QualificationForm
                  studentId={studentId}
                  key={level.value}
                  title={level.label}
                  refetch={refetch}
                  canEdit={canEdit}
                  onUpdated={onUpdated}
                  studyLevelId={level.value}
                  educationData={matchingEducation}
                />
              );
            },
          )}
        </div>
      )}

      {/* Language test */}

      {isLoadingEnglishTests ? (
        <div className="space-y-4 pt-2">
          <Skeleton height={28} width={250} className="mb-4" />
          {[1, 2].map((index) => (
            <div
              key={index}
              className="bg-[#FFFFFF] border border-[#C7CACF] rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Skeleton height={24} width={200} />
                <div className="flex gap-2">
                  <Skeleton height={24} width={24} circle />
                  <Skeleton height={24} width={24} circle />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Skeleton height={40} />
                <Skeleton height={40} />
                <Skeleton height={100} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold text-[#20242A]">
              English Language Tests
            </h2>

            <Dropdown
              trigger={["click"]}
              overlay={
                <Menu>
                  {availableTests.map((test: any) => {
                    const isAdded = activeTests.some((t) => t.id === test.id);

                    return (
                      <Menu.Item
                        key={test.id}
                        disabled={isAdded}
                        onClick={() => {
                          setActiveTests((prev) => [
                            ...prev,
                            { id: test.id, type: test.name },
                          ]);
                        }}
                      >
                        {test.name}
                        {isAdded && (
                          <span className="ml-2 text-gray-400">(Added)</span>
                        )}
                      </Menu.Item>
                    );
                  })}
                </Menu>
              }
            >
              <button className="bg-[#237D3B] hover:bg-[#19592A] cursor-pointer text-[#E7E7E7] text-[15px] py-3 px-6 rounded-lg font-semibold flex items-center gap-2 transition-all">
                <PlusOutlined /> Add Language Test <DownOutlined />
              </button>
            </Dropdown>
          </div>
          <Form form={form} layout="vertical">
            <div className="space-y-4">
              {activeTests.map((test) => {
                const testData = englishTestData.find(
                  (t: any) => t.id === test.id,
                );
                const submittedTestData = submittedEnglishTestDocs.find(
                  (doc: any) => doc.documentId === test.id,
                );

                return (
                  <LanguageTestCard
                    studentId={studentId}
                    key={test.id}
                    id={test.id}
                    type={test.type}
                    onDelete={(record: any) => handleDeleteClick(record)}
                    fields={testData?.fields}
                    form={form}
                    record={submittedTestData}
                    submittedTestData={submittedTestData}
                    onSaved={() => {
                      refetch(); // 🔥 save হলেই সাথে সাথে latest data আসবে
                    }}
                  />
                );
              })}
            </div>
          </Form>
        </div>
      )}

      {/* Medium of instructions */}
      <MediumOfInstruction studentId={studentId} />

      {/*   Standardized Tests */}
      {/* <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-[#20242A]">
          Standardized Tests
        </h1>

        <Dropdown
          trigger={["click"]}
          overlay={
            <Menu>
              {availableTests.map((test: any) => {
                const isAdded = activeTests.some((t) => t.id === test.id);

                return (
                  <Menu.Item
                    key={test.id}
                    disabled={isAdded}
                    onClick={() => {
                      setActiveTests((prev) => [
                        ...prev,
                        { id: test.id, type: test.name },
                      ]);
                    }}
                  >
                    {test.name}
                    {isAdded && (
                      <span className="ml-2 text-gray-400">(Added)</span>
                    )}
                  </Menu.Item>
                );
              })}
            </Menu>
          }
        >
          <button className="bg-[#237D3B] hover:bg-[#19592A] cursor-pointer text-[#E7E7E7] text-[15px] py-3 px-6 rounded-lg font-semibold flex items-center gap-2 transition-all">
            <PlusOutlined /> Add Standardized Test <DownOutlined />
          </button>
        </Dropdown>
      </div> */}

      {isDeleteModalOpen && (
        <DeleteModal
          open={isDeleteModalOpen}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemName="English Test Document"
          loading={isDeleting}
        />
      )}
    </div>
  );
};

export default EducationHistory;
