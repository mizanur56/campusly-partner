import { Image } from "antd";
import { Mail, MapPin, Phone, User } from "lucide-react";

type StudentInformationCardProps = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
  avatarUrl?: string;
  onViewProfile?: () => void;
};

const StudentInformationCard = ({
  name,
  email,
  phone,
  address,
  status,
  avatarUrl,
  onViewProfile,
}: StudentInformationCardProps) => {
  const fields = [
    { label: "Email", value: email, icon: <Mail size={15} /> },
    { label: "Phone", value: phone, icon: <Phone size={15} /> },
    { label: "Address", value: address, icon: <MapPin size={15} /> },
  ];

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <User size={16} />
          </div>
          <h2 className="text-base font-semibold text-neutral-900">
            Student Information
          </h2>
        </div>
        {status && (
          <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
            {status}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={48}
              height={48}
              preview={false}
              className="!h-12 !w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              {name
                .split(/\s+/)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase())
                .join("") || "S"}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-neutral-900">{name}</p>
            <p className="text-xs text-neutral-500">Applicant</p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
          {fields.map((field) => (
            <div
              key={field.label}
              className="rounded-xl border border-neutral-100 bg-neutral-50/60 px-3.5 py-3"
            >
              <div className="flex items-center gap-1.5 text-neutral-500">
                {field.icon}
                <span className="text-xs font-medium">{field.label}</span>
              </div>
              <p className="mt-1 truncate text-sm font-medium text-neutral-800">
                {field.value || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {onViewProfile && (
        <div className="mt-4 flex justify-end border-t border-neutral-100 pt-4">
          <button
            type="button"
            onClick={onViewProfile}
            className="text-sm font-semibold text-primary-600 transition hover:text-primary-700"
          >
            View full profile →
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentInformationCard;
