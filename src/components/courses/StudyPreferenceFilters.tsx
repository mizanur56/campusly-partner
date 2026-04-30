import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useGetFilterOptionsQuery } from "../../redux/features/search/searchApi";
import { KeywordGroup } from "../common/Tabs";

interface StudyPreferenceFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  studyDestination: string;
  studyLevel: string[];
  startYear: string[];
  startMonth: string[];
  subjects: string[];
  duration: string[];
  institution: string;
  feeRange: {
    min: number;
    max: number;
  };
}

const StudyPreferenceFilters: React.FC<StudyPreferenceFiltersProps> = ({
  onFilterChange,
}) => {
  const [isStudyPreferenceExpanded, setIsStudyPreferenceExpanded] =
    useState(true);
  const [isCourseOptionsExpanded, setIsCourseOptionsExpanded] = useState(true);

  // Dropdown states
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showStudyDestinationDropdown, setShowStudyDestinationDropdown] =
    useState(false);
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false);

  // Initialize filters state first
  const [filters, setFilters] = useState<FilterState>({
    studyDestination: "",
    studyLevel: [],
    startYear: [],
    startMonth: [],
    subjects: [],
    duration: [],
    institution: "",
    feeRange: {
      min: 0,
      max: 100000,
    },
  });

  // Fetch data from single filter-options API
  const { data: filterOptionsResponse, isLoading: isLoadingFilterOptions } =
    useGetFilterOptionsQuery();

  // Extract data from filter-options API
  const studyDestinations = useMemo(() => {
    const countries = filterOptionsResponse?.data?.countries || [];
    return countries.map((country) => ({
      value: country.name,
      label: country.name,
    }));
  }, [filterOptionsResponse?.data?.countries]);

  const availableSubjects = useMemo(() => {
    const courses = filterOptionsResponse?.data?.courses || [];
    return courses.map((course) => course.name);
  }, [filterOptionsResponse?.data?.courses]);

  const institutions = useMemo(() => {
    const universities = filterOptionsResponse?.data?.universities || [];
    const selectedCountry = filters.studyDestination;
    if (!selectedCountry) return [];

    return universities
      .filter((u) => u.countryName === selectedCountry)
      .map((u) => u.name)
      .sort();
  }, [filterOptionsResponse?.data?.universities, filters.studyDestination]);

  // Extract study levels - Only show Postgraduate and Undergraduate
  const studyLevels = useMemo(() => {
    const levels = filterOptionsResponse?.data?.studyLevels || [];

    return levels
      .filter(
        (level) =>
          level.description === "Postgraduate" ||
          level.description === "Undergraduate",
      )
      .map((level) => level.description)
      .sort((a, b) => a.localeCompare(b));
  }, [filterOptionsResponse?.data?.studyLevels]);

  // Extract fee ranges from API response
  const feeRangeFromApi = useMemo(() => {
    const ranges = filterOptionsResponse?.data?.ranges?.fee;
    return {
      min: ranges?.min ?? 0,
      max: ranges?.max ?? 100000,
    };
  }, [filterOptionsResponse?.data?.ranges?.fee]);

  const [isDraggingMin, setIsDraggingMin] = useState(false);
  const [isDraggingMax, setIsDraggingMax] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Track if currently dragging any slider handle
  const isDraggingRef = useRef(false);

  // Debounce timer for filter changes to prevent infinite search loops while dragging range slider
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced callback for filter changes - only trigger when NOT dragging
  useEffect(() => {
    // Update the ref to track dragging state
    isDraggingRef.current = isDraggingMin || isDraggingMax;

    // If currently dragging, don't trigger any updates
    if (isDraggingRef.current) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      return;
    }

    // Only proceed if not dragging
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onFilterChange?.(filters);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filters, onFilterChange, isDraggingMin, isDraggingMax]);

  // Initialize fee range when API data arrives
  useEffect(() => {
    if (feeRangeFromApi.max > 0) {
      setFilters((prev) => ({
        ...prev,
        feeRange: {
          min: feeRangeFromApi.min,
          max: feeRangeFromApi.max,
        },
      }));
    }
  }, [feeRangeFromApi.min, feeRangeFromApi.max]);

  // Tabs options
  const startMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const startYears = ["Any", "2025", "2026", "2027", "2028"];
  const durations = [
    "Less than 1 year",
    "1 - 2 years",
    "2 - 3 years",
    "3 - 4 years",
    "4 - 5 years",
    "More than 5 years",
  ];

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // onFilterChange will be called by debounced useEffect
  };

  const handleSubjectRemove = (subjectToRemove: string) => {
    const newSubjects = filters.subjects.filter((s) => s !== subjectToRemove);
    updateFilter("subjects", newSubjects);
  };

  const handleSubjectSelect = (subject: string) => {
    if (filters.subjects.includes(subject)) {
      handleSubjectRemove(subject);
    } else {
      if (filters.subjects.length < 5) {
        const newSubjects = [...filters.subjects, subject];
        updateFilter("subjects", newSubjects);
      }
    }
  };

  const handleSelectChange = (key: keyof FilterState, value: string) => {
    // If changing study destination, reset subjects and institution
    if (key === "studyDestination") {
      setFilters({
        ...filters,
        studyDestination: value,
        subjects: [], // Reset subjects when country changes
        institution: "", // Reset institution when country changes
      });
      // onFilterChange will be called by debounced useEffect
      setShowStudyDestinationDropdown(false);
    } else {
      updateFilter(key, value);
      // Close dropdown after selection
      if (key === "institution") setShowInstitutionDropdown(false);
    }
  };

  const getFilteredSubjects = () => {
    return availableSubjects.filter(
      (subject) => !filters.subjects.includes(subject),
    );
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Number(e.target.value);
    if (value < 0) value = 0;
    if (value > filters.feeRange.max) value = filters.feeRange.max;

    updateFilter("feeRange", {
      ...filters.feeRange,
      min: value,
    });
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Number(e.target.value);
    if (value < filters.feeRange.min) value = filters.feeRange.min;
    if (value > 100000) value = 100000;

    updateFilter("feeRange", {
      ...filters.feeRange,
      max: value,
    });
  };

  const handleMinSliderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingMin(true);
  };

  const handleMaxSliderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingMax(true);
  };

  const calculateValueFromPosition = (clientX: number): number => {
    if (!sliderRef.current) return 0;

    const sliderRect = sliderRef.current.getBoundingClientRect();
    const position = (clientX - sliderRect.left) / sliderRect.width;
    let value = Math.round(position * 100000);

    value = Math.max(0, Math.min(100000, value));
    return value;
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!sliderRef.current) return;

      const value = calculateValueFromPosition(e.clientX);

      if (isDraggingMin) {
        const newMin = Math.min(value, filters.feeRange.max - 1000);
        updateFilter("feeRange", {
          ...filters.feeRange,
          min: newMin,
        });
      } else if (isDraggingMax) {
        const newMax = Math.max(value, filters.feeRange.min + 1000);
        updateFilter("feeRange", {
          ...filters.feeRange,
          max: newMax,
        });
      }
    },
    [isDraggingMin, isDraggingMax, filters.feeRange, updateFilter],
  );

  const handleMouseUp = useCallback(() => {
    setIsDraggingMin(false);
    setIsDraggingMax(false);
  }, []);

  useEffect(() => {
    if (isDraggingMin || isDraggingMax) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDraggingMin, isDraggingMax, handleMouseMove, handleMouseUp]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".dropdown-container")) {
        setShowSubjectDropdown(false);
        setShowStudyDestinationDropdown(false);
        setShowInstitutionDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Study Preference Card */}
      <div className="bg-white border border-neutral-100 rounded-[24px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {/* Header with toggle */}
        <div
          className="flex items-center justify-between mb-4 sm:mb-5 cursor-pointer"
          onClick={() =>
            setIsStudyPreferenceExpanded(!isStudyPreferenceExpanded)
          }
        >
          <h2 className="text-lg font-semibold text-gray-900">
            Study Preference
          </h2>
          <svg
            className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform ${
              isStudyPreferenceExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </div>

        {isStudyPreferenceExpanded && (
          <div className="space-y-4 sm:space-y-5">
            {/* Study Destination - Dropdown */}
            <div className="relative dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Destination
              </label>
              <div
                className="relative cursor-pointer"
                onClick={() => {
                  setShowStudyDestinationDropdown(
                    !showStudyDestinationDropdown,
                  );
                  setShowSubjectDropdown(false);
                }}
              >
                <div className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-white min-h-[38px]">
                  <span
                    className={`text-sm ${!filters.studyDestination ? "text-gray-400" : "text-gray-700"}`}
                  >
                    {isLoadingFilterOptions
                      ? "Loading destinations..."
                      : filters.studyDestination
                        ? studyDestinations.find(
                            (d) => d.value === filters.studyDestination,
                          )?.label || filters.studyDestination
                        : "Select a destination"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      showStudyDestinationDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* Study Destination Dropdown */}
                {showStudyDestinationDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      {isLoadingFilterOptions ? (
                        <div className="px-4 py-2.5 text-sm text-gray-500 text-center">
                          Loading destinations...
                        </div>
                      ) : studyDestinations.length === 0 ? (
                        <div className="px-4 py-2.5 text-sm text-gray-500 text-center">
                          No destinations available
                        </div>
                      ) : (
                        studyDestinations.map((destination) => (
                          <div
                            key={destination.value}
                            className={`px-4 py-2.5 hover:bg-gray-50 cursor-pointer rounded-md transition-colors ${
                              filters.studyDestination === destination.value
                                ? "bg-primary-50"
                                : ""
                            }`}
                            onClick={() =>
                              handleSelectChange(
                                "studyDestination",
                                destination.value,
                              )
                            }
                          >
                            <span
                              className={`text-sm ${
                                filters.studyDestination === destination.value
                                  ? "text-primary-700 font-medium"
                                  : "text-gray-700"
                              }`}
                            >
                              {destination.label}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Study Level - Tabs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study level
              </label>
              {isLoadingFilterOptions ? (
                <div className="text-sm text-gray-400">
                  Loading study levels...
                </div>
              ) : (
                <KeywordGroup
                  options={studyLevels.map((level) => ({
                    value: level,
                    label: level,
                  }))}
                  value={filters.studyLevel}
                  onChange={(value) => {
                    updateFilter(
                      "studyLevel",
                      Array.isArray(value) ? value : [value],
                    );
                  }}
                  multiple={true}
                />
              )}
            </div>

            {/* Start Year - Tabs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start year
              </label>
              <KeywordGroup
                options={startYears.map((year) => ({
                  value: year,
                  label: year,
                }))}
                value={filters.startYear}
                onChange={(value) => {
                  updateFilter(
                    "startYear",
                    Array.isArray(value) ? value : [value],
                  );
                }}
                multiple={false}
                className="flex-wrap"
              />
            </div>

            {/* Start Month - Tabs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Month
              </label>
              <KeywordGroup
                options={startMonths.map((month) => ({
                  value: month,
                  label: month,
                }))}
                value={filters.startMonth}
                onChange={(value) => {
                  updateFilter(
                    "startMonth",
                    Array.isArray(value) ? value : [value],
                  );
                }}
                multiple={false}
                className="flex-wrap"
              />
            </div>

            {/* Subject - Dropdown */}
            <div className="relative dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <div
                className="relative cursor-pointer"
                onClick={() => {
                  setShowSubjectDropdown(!showSubjectDropdown);
                  setShowStudyDestinationDropdown(false);
                }}
              >
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white min-h-[38px]">
                  <div className="flex flex-wrap gap-2 flex-1">
                    {filters.subjects.length > 0 ? (
                      filters.subjects.map((subject) => (
                        <div
                          key={subject}
                          className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 border border-primary-200 rounded-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-sm text-gray-700">
                            {subject}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubjectRemove(subject);
                            }}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">
                        {isLoadingFilterOptions
                          ? "Loading subjects..."
                          : !filters.studyDestination
                            ? "Select a destination first"
                            : "Select subjects..."}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        showSubjectDropdown ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Subject Dropdown */}
                {showSubjectDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      {isLoadingFilterOptions ? (
                        <div className="px-4 py-2.5 text-sm text-gray-500 text-center">
                          Loading subjects...
                        </div>
                      ) : !filters.studyDestination ? (
                        <div className="px-4 py-2.5 text-sm text-gray-500 text-center">
                          Please select a destination first
                        </div>
                      ) : getFilteredSubjects().length === 0 ? (
                        <div className="px-4 py-2.5 text-sm text-gray-500 text-center">
                          No subjects available
                        </div>
                      ) : (
                        getFilteredSubjects().map((subject) => (
                          <div
                            key={subject}
                            className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer rounded-md transition-colors"
                            onClick={() => handleSubjectSelect(subject)}
                          >
                            <span className="text-sm text-gray-700">
                              {subject}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {filters.subjects.length}/5 subjects selected
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Course Options Card */}
      <div className="bg-white border border-neutral-100 rounded-[24px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {/* Header with toggle */}
        <div
          className="flex items-center justify-between mb-4 sm:mb-5 cursor-pointer"
          onClick={() => setIsCourseOptionsExpanded(!isCourseOptionsExpanded)}
        >
          <h2 className="text-lg font-semibold text-gray-900">
            Course Options
          </h2>
          <svg
            className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform ${
              isCourseOptionsExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </div>

        {isCourseOptionsExpanded && (
          <div className="space-y-4 sm:space-y-5">
            {/* Durations - Tabs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durations
              </label>
              <KeywordGroup
                options={durations.map((duration) => ({
                  value: duration,
                  label: duration,
                }))}
                value={filters.duration}
                onChange={(value) => {
                  const newValue = Array.isArray(value) ? value : [value];
                  updateFilter("duration", newValue);
                }}
                multiple={true}
                className="flex-wrap"
              />
            </div>

            {/* Institution - Dropdown */}
            <div className="relative dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution
              </label>
              <div
                className="relative cursor-pointer"
                onClick={() =>
                  setShowInstitutionDropdown(!showInstitutionDropdown)
                }
              >
                <div className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-white min-h-[38px]">
                  <span
                    className={`text-sm ${!filters.institution ? "text-gray-400" : "text-gray-700"}`}
                  >
                    {isLoadingFilterOptions
                      ? "Loading institutions..."
                      : !filters.studyDestination
                        ? "Select a destination first"
                        : filters.institution || "Select an institution"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      showInstitutionDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* Institution Dropdown */}
                {showInstitutionDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      {isLoadingFilterOptions ? (
                        <div className="px-4 py-2.5 text-sm text-gray-500 text-center">
                          Loading institutions...
                        </div>
                      ) : !filters.studyDestination ? (
                        <div className="px-4 py-2.5 text-sm text-gray-500 text-center">
                          Please select a destination first
                        </div>
                      ) : institutions.length === 0 ? (
                        <div className="px-4 py-2.5 text-sm text-gray-500 text-center">
                          No institutions available
                        </div>
                      ) : (
                        institutions.map((institution) => (
                          <div
                            key={institution}
                            className={`px-4 py-2.5 hover:bg-gray-50 cursor-pointer rounded-md transition-colors ${
                              filters.institution === institution
                                ? "bg-primary-50"
                                : ""
                            }`}
                            onClick={() =>
                              handleSelectChange("institution", institution)
                            }
                          >
                            <span
                              className={`text-sm ${
                                filters.institution === institution
                                  ? "text-primary-700 font-medium"
                                  : "text-gray-700"
                              }`}
                            >
                              {institution}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fee Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fee range
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3">
                <div className="flex-1">
                  <label className="block text-sm text-gray-500 mb-1.5">
                    Min
                  </label>
                  <input
                    type="number"
                    value={filters.feeRange.min || ""}
                    onChange={handleMinInputChange}
                    placeholder=""
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-500 mb-1.5">
                    Max
                  </label>
                  <input
                    type="number"
                    value={filters.feeRange.max || ""}
                    onChange={handleMaxInputChange}
                    placeholder=""
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  />
                </div>
              </div>

              {/* Dual Range Slider */}
              <div className="relative pt-6 pb-4">
                {/* Value Labels */}
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>{formatCurrency(0)}</span>
                  <span>{formatCurrency(100000)}</span>
                </div>

                {/* Slider Track */}
                <div
                  ref={sliderRef}
                  className="relative h-2 bg-gray-200 rounded-full"
                >
                  {/* Selected Range Track */}
                  <div
                    className="absolute h-full bg-primary-500 rounded-full pointer-events-none"
                    style={{
                      left: `${(filters.feeRange.min / 100000) * 100}%`,
                      width: `${((filters.feeRange.max - filters.feeRange.min) / 100000) * 100}%`,
                    }}
                  />

                  {/* Min Handle */}
                  <div
                    className="absolute top-1/2 w-4 h-4 bg-white border-2 border-primary-500 rounded-full cursor-pointer -translate-y-1/2 -translate-x-1/2 shadow-md hover:scale-110 transition-transform user-select-none"
                    style={{
                      left: `${(filters.feeRange.min / 100000) * 100}%`,
                    }}
                    onMouseDown={handleMinSliderMouseDown}
                  />

                  {/* Max Handle */}
                  <div
                    className="absolute top-1/2 w-4 h-4 bg-white border-2 border-primary-500 rounded-full cursor-pointer -translate-y-1/2 -translate-x-1/2 shadow-md hover:scale-110 transition-transform user-select-none"
                    style={{
                      left: `${(filters.feeRange.max / 100000) * 100}%`,
                    }}
                    onMouseDown={handleMaxSliderMouseDown}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPreferenceFilters;
