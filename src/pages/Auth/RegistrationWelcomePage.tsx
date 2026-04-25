import {
  FaBookOpen,
  FaBrain,
  FaCoins,
  FaFileLines,
  FaGraduationCap,
} from "react-icons/fa6";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/Meta/PageMeta";
import {
  POST_REGISTER_WELCOME_FLAG,
  REGISTRATION_WELCOME_NAME_KEY,
} from "../../lib/registrationWelcomeSession";

const FEATURES = [
  {
    icon: FaGraduationCap,
    title: "Student Profiles",
    description:
      "Manage your academic and personal information in one place.",
  },
  {
    icon: FaFileLines,
    title: "Applications",
    description:
      "Track and manage your university applications easily and efficiently.",
  },
  {
    icon: FaBrain,
    title: "Genie",
    description:
      "Access your personal assistant to get help and guidance throughout your journey.",
  },
  {
    icon: FaCoins,
    title: "Funds & Stays",
    description:
      "Handle your accommodation preferences and financial planning securely.",
  },
  {
    icon: FaBookOpen,
    title: "Academy",
    description:
      "Access educational resources and updates tailored to your academic path.",
  },
] as const;

export default function RegistrationWelcomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = (location.state as { name?: string } | null)?.name?.trim();
  const [name, setName] = useState(fromState ?? "");

  useEffect(() => {
    sessionStorage.removeItem(POST_REGISTER_WELCOME_FLAG);
  }, []);

  useEffect(() => {
    if (name) return;
    const stored = sessionStorage.getItem(REGISTRATION_WELCOME_NAME_KEY)?.trim();
    if (stored) {
      setName(stored);
      sessionStorage.removeItem(REGISTRATION_WELCOME_NAME_KEY);
    }
  }, [name]);

  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6 sm:py-14">
      <PageMeta
        title="Welcome | Campus Transfer Partner"
        description="Thanks for choosing Campus Transfer. Continue to onboarding."
      />
      <div className="mx-auto flex max-w-xl flex-col items-center">
        <h1 className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-[28px] sm:leading-snug">
          Hi{name ? ` ${name},` : ""} thanks for choosing Campus Transfer
        </h1>

        <ul className="mt-10 w-full space-y-8 text-left">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="font-semibold text-neutral-900 dark:text-white">
                  {title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="mt-12 cursor-pointer h-12 w-full max-w-md rounded-lg bg-[#2d7d46] text-base font-semibold text-white transition-colors hover:bg-[#256d3c] sm:max-w-sm"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
