# Onboarding Module

সব অনবোর্ডিং কম্পোনেন্ট এই ফোল্ডারে এক জায়গায় আছে। অন্য প্রজেক্টে বা অন্য পেজে **পুরো `Onboarding` ফোল্ডার কপি** করে পেস্ট করতে পারবেন এবং সেখানে ডিজাইন ইমপ্রুভ করতে পারবেন।

## কপি করার সময় যা নেবেন

- `Onboarding/` ফোল্ডার সম্পূর্ণ (steps, onboardingSteps.ts, sharedFormProps.tsx, OnboardingPage.tsx, OnboardingFormLayout.tsx, OnboardingStepper.tsx, index.ts)
- ডিপেন্ডেন্সি: `antd`, `react-phone-input-2`, `react-router-dom`
- কম্পোনেন্টগুলো `FormInput` এর জন্য আপনার প্রজেক্টের `FormInput` পাথ ঠিক করে নেবেন (অথবা sharedFormProps এ থাকা লজিক ব্যবহার করবেন)

## এক জায়গা থেকে ইমপোর্ট

```ts
import { OnboardingPage, OnboardingFormLayout, OnboardingStepper } from "@/pages/Onboarding";
```

## স্ট্রাকচার

| ফাইল | কাজ |
|------|-----|
| `index.ts` | সব পাবলিক এক্সপোর্ট – এক জায়গা থেকে ইমপোর্টের জন্য |
| `OnboardingPage.tsx` | রুট পেজ – স্টেপ স্টেট ধরে, সব স্টেপ এক পেজে দেখায় |
| `OnboardingFormLayout.tsx` | স্টেপার + টাইটেল + কন্টেন্ট এর লেআউট |
| `OnboardingStepper.tsx` | বাম পাশের স্টেপ লিস্ট |
| `onboardingSteps.ts` | স্টেপ লেবেল, টাইটেল, সাবটাইটেল কনফিগ |
| `sharedFormProps.tsx` | FormInput, PhoneInput ও কমন স্টাইল |
| `steps/*.tsx` | প্রতিটি স্টেপের শুধু ফর্ম/কন্টেন্ট (Owner, Director, Contact, Compliance, Declaration, Submitted, Verified) |

## ডিজাইন বদলানোর জন্য

- স্টাইল বদলাতে: `OnboardingFormLayout.tsx`, `OnboardingStepper.tsx` এবং `steps/*.tsx` এর ক্লাস/স্টাইল এডিট করুন।
- নতুন স্টেপ যোগ: `onboardingSteps.ts` এ লেবেল যোগ করুন, `steps/` এ নতুন কম্পোনেন্ট বানান, `OnboardingPage.tsx` এ স্টেপ রেন্ডার যোগ করুন।
