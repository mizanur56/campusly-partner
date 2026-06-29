import { Headphones, Info } from "lucide-react";

const IMPORTANT_NOTES = [
  "Ensure all uploaded documents are clear, valid, and not expired.",
  "Use PDF format where possible for faster review.",
  "You will receive email notifications when your application status changes.",
  "Contact support if any document is rejected or needs re-upload.",
];

export const ImportantNotesCard = () => (
  <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-5 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
        <Info size={16} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-sky-900">Important Notes</h3>
        <ul className="mt-2.5 space-y-2">
          {IMPORTANT_NOTES.map((note) => (
            <li
              key={note}
              className="flex gap-2 text-xs leading-relaxed text-sky-800/90"
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sky-500" />
              {note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

type NeedHelpCardProps = {
  onContactSupport: () => void;
};

export const NeedHelpCard = ({ onContactSupport }: NeedHelpCardProps) => (
  <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
        <Headphones size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-neutral-900">Need Help?</h3>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">
          Our support team is available to assist with application queries and
          document uploads.
        </p>
        <button
          type="button"
          onClick={onContactSupport}
          className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-primary-600 transition hover:border-primary-200 hover:bg-primary-50"
        >
          Contact Support
        </button>
      </div>
    </div>
  </div>
);
