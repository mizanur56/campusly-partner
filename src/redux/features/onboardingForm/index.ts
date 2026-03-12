export {
  useGetOnboardingStatusQuery,
  useGetStepDataQuery,
  useLazyGetStepDataQuery,
  usePatchStep1Mutation,
  usePatchStep2Mutation,
  usePatchStep3Mutation,
  usePatchStep4Mutation,
  usePatchStep5Mutation,
  useSubmitOnboardingMutation,
} from "./onboardingFormApi";
export type {
  Step1Payload,
  Step2Payload,
  Step3Payload,
  Step4Payload,
  Step5Payload,
  CustomDocument,
  OnboardingStatusResponse,
  StepDataResponse,
} from "./onboardingFormApi";
