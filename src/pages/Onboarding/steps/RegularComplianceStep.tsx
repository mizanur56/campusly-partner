import { Button } from "antd";

const UPLOAD_ITEMS = [
  { label: "Your ID", key: "yourId" },
  { label: "Business registration certificate", key: "businessCert" },
  { label: "Tax Certificate (Optional)", key: "taxCert" },
];

interface Props {
  onPrev: () => void;
  onNext: () => void;
}

export default function RegularComplianceStep({ onPrev, onNext }: Props) {
  return (
    <div className="space-y-4">
      <Button type="primary" size="large" className="border-0 bg-primary-500 hover:!bg-primary-600">
        + Add Qualifications
      </Button>
      <div className="space-y-3">
        {UPLOAD_ITEMS.map((item) => (
          <div
            key={item.key}
            className="group flex cursor-pointer items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-primary-500"
          >
            <span className="text-base font-medium text-neutral-800">{item.label}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 transition-colors group-hover:bg-primary-200">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-end gap-3">
        <Button size="large" className="border-primary-500 bg-primary-50 px-6 text-primary-600 hover:!border-primary-500 hover:!bg-primary-100 hover:!text-primary-700" onClick={onPrev}>
          ← Previous
        </Button>
        <Button type="primary" size="large" className="border-0 bg-primary-500 px-6 text-white hover:!bg-primary-600" onClick={onNext}>
          Next →
        </Button>
      </div>
    </div>
  );
}
