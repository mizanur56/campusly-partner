import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import Select from "./Select";
import { FilterChips } from "./FilterChips";
import RangeSlider from "./RangeSlider";
import { cn } from "../../lib/utils";
import { useGetCountriesQuery } from "../../redux/features/countries/countriesApi";
import { useGetCitiesQuery } from "../../redux/features/cities/citiesApi";
import { useGetUniversityCoursesQuery } from "../../redux/features/universityCourses/universityCoursesApi";
import {
  hasActiveFilters,
  calculateActiveFilterCount,
  extractCountryNames,
  extractCityNames,
  extractSubjectNames,
  extractInstitutionNames,
  type FilterFormData,
} from "../../utils/filterHelpers";
import {
  DEFAULT_FILTER_VALUES,
  STUDY_LEVELS,
  DURATIONS,
  START_YEARS,
  FEE_MIN,
  FEE_MAX,
  FEE_STEP,
  MAX_SELECTIONS,
} from "../../utils/filterConstants";

interface SearchFilterProps {
  className?: string;
  onSearch?: (data: FilterFormData) => void;
  onReset?: () => void;
}

export default function SearchFilter({
  className = "",
  onSearch,
  onReset,
}: SearchFilterProps) {
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [formData, setFormData] = useState<FilterFormData>(() => {
    const destination = searchParams.get("destination");
    return {
      ...DEFAULT_FILTER_VALUES,
      destination: destination
        ? [destination]
        : DEFAULT_FILTER_VALUES.destination,
    };
  });

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const { data: countriesResponse, isLoading: isLoadingCountries } =
    useGetCountriesQuery({ page: 1, limit: 100000 });
  const { data: citiesResponse, isLoading: isLoadingCities } =
    useGetCitiesQuery({ page: 1, limit: 10000000 });
  const { data: coursesResponse, isLoading: isLoadingCourses } =
    useGetUniversityCoursesQuery({ page: 1, limit: 10000000 });

  const destinations = useMemo(
    () => extractCountryNames(countriesResponse),
    [countriesResponse]
  );
  const cities = useMemo(
    () => extractCityNames(citiesResponse, formData.destination),
    [citiesResponse, formData.destination]
  );
  const subjects = useMemo(
    () =>
      extractSubjectNames(
        coursesResponse,
        formData.destination,
        formData.city
      ),
    [coursesResponse, formData.destination, formData.city]
  );
  const institutions = useMemo(
    () =>
      extractInstitutionNames(
        coursesResponse,
        formData.destination,
        formData.city
      ),
    [coursesResponse, formData.destination, formData.city]
  );
  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(formData),
    [formData]
  );

  const updateField = <K extends keyof FilterFormData>(
    field: K,
    value: FilterFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasActiveFilters(formData)) onSearch?.(formData);
    else onReset?.();
    setIsOpen(false);
  };

  const handleReset = () => {
    setFormData(DEFAULT_FILTER_VALUES);
    onReset?.();
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "relative flex items-center gap-2.5 h-11 rounded-full border border-neutral-200 bg-neutral-50 px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300 transition-all duration-200",
          className
        )}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span className="font-[600] text-[16px] text-neutral-900 block">
          Filter
        </span>
        {activeFilterCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[11px] font-semibold text-white">
            {activeFilterCount > 99 ? "99+" : activeFilterCount}
          </span>
        )}
      </button>

      {isMounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div className="fixed inset-0 z-[1000000]">
                <motion.div
                  className="absolute inset-0 bg-black/30 z-[1000000]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  aria-hidden
                  onClick={() => setIsOpen(false)}
                />
                <motion.aside
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{
                    type: "spring",
                    damping: 25,
                    stiffness: 200,
                    duration: 0.4,
                  }}
                  className="absolute right-0 top-0 z-[1000001] flex h-full w-full max-w-full sm:max-w-[420px] flex-col bg-white shadow-2xl overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 shrink-0 bg-neutral-50/50">
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-900">
                        Filters
                      </h2>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        Refine your search results
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-700"
                      aria-label="Close filter"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col flex-1 min-h-0"
                  >
                    <div className="flex-1 overflow-y-auto px-5 py-5 min-h-0">
                      <div className="space-y-5">
                        <Select
                          label="Destination"
                          placeholder={
                            isLoadingCountries
                              ? "Loading destinations..."
                              : "Select an Item"
                          }
                          options={destinations}
                          selected={formData.destination}
                          onChange={(value) => updateField("destination", value)}
                        />
                        <Select
                          label="City"
                          placeholder={
                            isLoadingCities
                              ? "Loading cities..."
                              : formData.destination.length > 0
                                ? "Select cities"
                                : "Select destinations first"
                          }
                          selected={formData.city}
                          helperText={`You can select up to ${MAX_SELECTIONS.city}`}
                          options={cities}
                          onChange={(value) => updateField("city", value)}
                        />
                        <FilterChips
                          label="Study level"
                          options={STUDY_LEVELS}
                          allowMultiple={false}
                          value={formData.studyLevel}
                          onChange={(value) =>
                            updateField("studyLevel", value)
                          }
                        />
                        <Select
                          label="Subject"
                          placeholder={
                            isLoadingCourses
                              ? "Loading subjects..."
                              : "Select subjects"
                          }
                          selected={formData.subject}
                          helperText={`You can select up to ${MAX_SELECTIONS.subject}`}
                          options={subjects}
                          onChange={(value) => updateField("subject", value)}
                        />
                        <FilterChips
                          label="Duration"
                          options={DURATIONS}
                          allowMultiple={true}
                          value={formData.duration}
                          onChange={(value) =>
                            updateField("duration", value)
                          }
                        />
                        <Select
                          label="Institution"
                          placeholder={
                            isLoadingCourses
                              ? "Loading institutions..."
                              : "Select institutions"
                          }
                          selected={formData.institution}
                          helperText={`You can select up to ${MAX_SELECTIONS.institution}`}
                          options={institutions}
                          onChange={(value) =>
                            updateField("institution", value)
                          }
                        />
                        <FilterChips
                          label="Start year"
                          options={START_YEARS}
                          allowMultiple={false}
                          value={formData.startYear}
                          onChange={(value) =>
                            updateField("startYear", value)
                          }
                        />
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-neutral-700">
                            Fee range
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-medium text-neutral-600">
                                Min
                              </label>
                              <input
                                type="text"
                                placeholder="0"
                                value={formData.minFee}
                                onChange={(e) =>
                                  updateField("minFee", e.target.value)
                                }
                                className="h-10 rounded-lg border border-neutral-200 px-3 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-colors outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-medium text-neutral-600">
                                Max
                              </label>
                              <input
                                type="text"
                                placeholder={FEE_MAX.toString()}
                                value={formData.maxFee}
                                onChange={(e) =>
                                  updateField("maxFee", e.target.value)
                                }
                                className="h-10 rounded-lg border border-neutral-200 px-3 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-colors outline-none"
                              />
                            </div>
                          </div>
                          <RangeSlider
                            min={FEE_MIN}
                            max={FEE_MAX}
                            step={FEE_STEP}
                            value={[
                              formData.minFee
                                ? Number(formData.minFee) || FEE_MIN
                                : FEE_MIN,
                              formData.maxFee
                                ? Number(formData.maxFee) || FEE_MAX
                                : FEE_MAX,
                            ]}
                            onChange={(range) => {
                              updateField("minFee", range[0].toString());
                              updateField("maxFee", range[1].toString());
                            }}
                            className="mt-4"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-neutral-200 px-5 py-4 bg-white shrink-0">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:border-neutral-400"
                      >
                        Reset
                      </button>
                      <button
                        type="submit"
                        className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 shadow-sm"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </form>
                </motion.aside>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
