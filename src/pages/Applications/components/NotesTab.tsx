import { useState } from "react";

function NotesHeader({
  onTakeAction,
  showForm,
}: {
  onTakeAction: () => void;
  showForm: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-gray-700 dark:text-gray-200" aria-hidden>
          ✎
        </span>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Notes
        </h3>
      </div>
      {!showForm && (
        <button
          type="button"
          onClick={onTakeAction}
          className="rounded-lg bg-[#15803D] px-4 py-2 text-sm font-medium text-white hover:bg-[#166534]"
        >
          Take Action
        </button>
      )}
    </div>
  );
}

function RichToolbar() {
  const btn =
    "inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100";
  return (
    <div className="flex items-center gap-1 border-b border-gray-200 px-2 py-1 dark:border-gray-800">
      <button type="button" className={btn}>
        <span className="font-bold">B</span>
      </button>
      <button type="button" className={btn}>
        <span className="italic">I</span>
      </button>
      <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-800" />
      <button type="button" className={btn} aria-label="Bullet list">
        ≡
      </button>
      <button type="button" className={btn} aria-label="Numbered list">
        1.
      </button>
      <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-800" />
      <button type="button" className={btn} aria-label="Link">
        ⛓
      </button>
    </div>
  );
}

function NoteForm({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="p-4">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">
          Title
        </label>
        <input
          className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#22C55E] dark:border-gray-700 dark:bg-gray-950/40 dark:text-white"
          placeholder=""
        />
      </div>

      <div className="mx-4 mb-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
        <RichToolbar />
        <textarea
          className="min-h-28 w-full resize-none bg-transparent px-3 py-2 text-sm outline-none dark:text-white"
          placeholder=""
        />
      </div>

      <div className="flex justify-end gap-3 px-4 pb-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#22C55E] bg-white px-5 py-2 text-sm font-medium text-[#15803D] hover:bg-emerald-50 dark:bg-transparent dark:hover:bg-emerald-950/20"
        >
          Cancel
        </button>
        <button
          type="button"
          className="rounded-lg bg-[#15803D] px-6 py-2 text-sm font-medium text-white hover:bg-[#166534]"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function NoteItem() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Rutuja Nakate
          </p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-200">
              Application Withdrawn: Deadlines have Passed
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              April 17, 2024 at 3:44 PM
            </p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
            Hi Student,
            <br />
            <br />
            This application has been withdrawn because the requirement deadlines
            have passed.
            <br />
            <br />
            Kindly let us know if the applicant completed the conditions by
            leaving a note on this application.
            <br />
            <br />
            Regards,
            <br />
            Rutuja
          </p>
        </div>
      </div>
    </div>
  );
}

export default function NotesTab() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 card-shadow dark:border-gray-800 dark:bg-gray-900">
      <NotesHeader
        showForm={showForm}
        onTakeAction={() => setShowForm(true)}
      />

      <div className="mt-5 space-y-4">
        {showForm ? <NoteForm onCancel={() => setShowForm(false)} /> : null}

        {!showForm ? <NoteItem /> : null}
      </div>
    </div>
  );
}

