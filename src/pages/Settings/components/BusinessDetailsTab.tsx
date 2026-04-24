import { Avatar } from "antd";
import ChangePhotoFileButton from "./ChangePhotoFileButton";
import type { MediaImage } from "../../../types/media";

export default function BusinessDetailsTab({
  businessLogoUrl,
  businessName,
  onChangeBusinessPhoto,
}: {
  businessLogoUrl?: string;
  businessName: string;
  onChangeBusinessPhoto: (image: MediaImage | MediaImage[] | null) => void;
}) {
  return (
    <div className="account-business">
      <div className="account-photo-block">
        <Avatar
          size={96}
          src={businessLogoUrl || "/business.png"}
          className="account-business-avatar"
        >
          {businessName?.[0] ?? "B"}
        </Avatar>
        <div className="account-photo-btn">
          <ChangePhotoFileButton
            uploadFolder="Partners/Business Logos"
            onUploaded={(img) => onChangeBusinessPhoto(img)}
          />
        </div>
      </div>

      <div className="account-business-card">
        <p className="account-field-label">Business Name</p>
        <p className="account-field-value">{businessName || "—"}</p>
      </div>
    </div>
  );
}

