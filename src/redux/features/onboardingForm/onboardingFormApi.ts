import { baseApi } from "../../api/baseApi";

/** Step 1–5 payloads match Partner Onboarding API (Postman). */
export interface Step1Payload {
  registeredCompanyName?: string;
  companyRegistrationNumber?: string;
  countryOfRegistration?: string;
  mobileNumber?: string;
  email?: string;
  website?: string;
  companyAddress?: string;
  facebook?: string;
  instagram?: string;
}

export interface Step2Payload {
  fullName?: string;
  whatsappNumber?: string;
  email?: string;
  mobileNumber?: string;
}

export interface Step3Payload {
  fullName?: string;
  position?: string;
  email?: string;
  telephoneNumber?: string;
  whatsappNumber?: string;
}

export interface CustomDocument {
  label: string;
  fileUrl: string;
}

export interface Step4Payload {
  yourId?: string;
  businessRegistrationCertificate?: string;
  taxCertificate?: string;
  customDocuments?: CustomDocument[];
}

export interface Step5Payload {
  verifyInformation?: boolean;
  agreePrivacyPolicy?: boolean;
  agreeCommunicationUpdates?: boolean;
}

export type OnboardingStepPayload =
  | Step1Payload
  | Step2Payload
  | Step3Payload
  | Step4Payload
  | Step5Payload;

export interface OnboardingStatusResponse {
  status: string;
  statusLabel?: string;
  onboardingStep?: number;
  businessName?: string;
  rejectionReason?: string;
  contractDocumentUrl?: string;
  advisor?: unknown;
}

export interface ContractResponse {
  contractDocumentUrl: string;
}

export interface StepDataResponse {
  step: number;
  currentStep?: number;
  status?: string;
  data?: Record<string, unknown>;
}

const onboardingFormApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Get current onboarding status (filling form, awaiting contract, etc.). */
    getOnboardingStatus: builder.query<OnboardingStatusResponse, void>({
      query: () => ({
        url: "/partners/onboarding/form-status",
        method: "GET",
      }),
      // API shape: { success, status, message, data: { onboardingStep, status, statusLabel, ... } }
      transformResponse: (response: any) =>
        (response?.data || {}) as OnboardingStatusResponse,
      providesTags: ["partnerOnboarding"],
    }),

    /** Get saved data for a step (1–5). Use to pre-fill form. */
    getStepData: builder.query<StepDataResponse, number>({
      query: (step) => ({
        url: `/partners/onboarding/step/${step}`,
        method: "GET",
      }),
      providesTags: (_result, _err, step) => [
        { type: "partnerOnboarding", id: `step-${step}` },
      ],
    }),

    /** Save Step 1 — Company / Agency details. */
    patchStep1: builder.mutation<unknown, Step1Payload>({
      query: (body) => ({
        url: "/partners/onboarding/step/1",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["partnerOnboarding"],
    }),

    /** Save Step 2 — Owner / Director. */
    patchStep2: builder.mutation<unknown, Step2Payload>({
      query: (body) => ({
        url: "/partners/onboarding/step/2",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["partnerOnboarding"],
    }),

    /** Save Step 3 — Main contact. */
    patchStep3: builder.mutation<unknown, Step3Payload>({
      query: (body) => ({
        url: "/partners/onboarding/step/3",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["partnerOnboarding"],
    }),

    /** Save Step 4 — Compliance documents. */
    patchStep4: builder.mutation<unknown, Step4Payload>({
      query: (body) => ({
        url: "/partners/onboarding/step/4",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["partnerOnboarding"],
    }),

    /** Save Step 5 — Declaration. */
    patchStep5: builder.mutation<unknown, Step5Payload>({
      query: (body) => ({
        url: "/partners/onboarding/step/5",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["partnerOnboarding"],
    }),

    /** Submit onboarding (call after all 5 steps filled). */
    submitOnboarding: builder.mutation<unknown, void>({
      query: () => ({
        url: "/partners/onboarding/submit",
        method: "POST",
      }),
      invalidatesTags: ["partnerOnboarding"],
    }),

    /** Resubmit onboarding (only for rejected partners - resets all steps). */
    resubmitOnboarding: builder.mutation<unknown, void>({
      query: () => ({
        url: "/partners/onboarding/resubmit",
        method: "POST",
      }),
      // Invalidate all step data caches to ensure fresh data is fetched
      invalidatesTags: [
        "partnerOnboarding",
        { type: "partnerOnboarding", id: "step-1" },
        { type: "partnerOnboarding", id: "step-2" },
        { type: "partnerOnboarding", id: "step-3" },
        { type: "partnerOnboarding", id: "step-4" },
        { type: "partnerOnboarding", id: "step-5" },
      ],
    }),

    /** Get contract document URL. */
    getContract: builder.query<ContractResponse, void>({
      query: () => ({
        url: "/partners/contract",
        method: "GET",
      }),
      transformResponse: (response: any) =>
        (response?.data || {}) as ContractResponse,
      providesTags: ["partnerContract"],
    }),
  }),
});

export const {
  useGetOnboardingStatusQuery,
  useGetStepDataQuery,
  useLazyGetStepDataQuery,
  usePatchStep1Mutation,
  usePatchStep2Mutation,
  usePatchStep3Mutation,
  usePatchStep4Mutation,
  usePatchStep5Mutation,
  useSubmitOnboardingMutation,
  useResubmitOnboardingMutation,
  useGetContractQuery,
  useLazyGetContractQuery,
} = onboardingFormApi;
