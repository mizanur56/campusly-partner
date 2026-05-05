import { Headset, Mail, Phone } from "lucide-react";
import { Advisor } from "../../../../redux/features/profile/partnerProfileApi";
import { getApiImageUrl } from "../../../../utils/getApiImageUrl";
import CardShell from "./CardShell";

export default function SupportPanelCard({
  people,
  isLoading,
}: {
  people: Advisor[];
  isLoading: boolean;
}) {
  return (
    <CardShell
      title="Your Support Panel"
      titleIcon={<Headset className="h-5 w-5" aria-hidden />}
    >
      <div className="space-y-8">
        {people.length === 0 && !isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No advisor assigned yet.
          </p>
        )}

        {isLoading && people.length === 0
          ? Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="animate-pulse">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-2">
                      <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="h-4 w-48 rounded bg-gray-100 dark:bg-gray-800" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-64 rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-4 w-56 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
            ))
          : people.map((person) => {
              const initials = person.name
                .split(" ")
                .map((n) => n[0])
                .join("");

              const phoneHref = person.phone
                ? `tel:${person.phone.replace(/\s/g, "")}`
                : undefined;
              const mailHref = `mailto:${person.email}`;

              const avatarUrl = person.profile?.url
                ? getApiImageUrl(person.profile.url)
                : null;

              return (
                <div key={person.id} className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={person.name}
                          className="h-12 w-12 shrink-0 rounded-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-[#20242A] dark:text-white">
                          {person.name}
                        </p>
                        <p className="text-[12px] text-[#4B5563] whitespace-nowrap dark:text-gray-400">
                          Account manager (SRM)
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <a
                        href={mailHref}
                        aria-label="Email"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:text-primary shadow-sm transition hover:bg-gray-50 hover:border-primary dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        <Mail className="h-4 w-4 " aria-hidden />
                      </a>
                      <a
                        href={phoneHref ?? "#"}
                        aria-label="Call"
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-border bg-white text-gray-700 shadow-sm transition dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 ${
                          phoneHref
                            ? "hover:bg-gray-50 dark:hover:bg-gray-800"
                            : "pointer-events-none opacity-40"
                        }`}
                      >
                        <Phone className="h-4 w-4" aria-hidden />
                      </a>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold tracking-wide text-[#000000] dark:text-gray-200">
                      CONTACT DETAILS
                    </p>
                    <div className="mt-3 flex  items-center gap-x-10 gap-y-3 text-base text-gray-600 dark:text-gray-300">
                      {person.phone && (
                        <div className="flex items-center gap-2">
                          <Phone
                            className="h-3 w-3 text-gray-500 dark:text-gray-400"
                            aria-hidden
                          />
                          <span className="text-[11px] text-[#4B5563]">
                            {person.phone}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Mail
                          className="h-3 w-3 text-gray-500 dark:text-gray-400"
                          aria-hidden
                        />
                        <span className="text-[11px] text-[#4B5563]">
                          {person.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </CardShell>
  );
}
