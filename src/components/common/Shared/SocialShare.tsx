import { cn } from "../../../utils/cn";

interface SocialShareProps {
  url: string;
  title?: string;
  className?: string;
}

export default function SocialShare({
  url,
  title,
  className,
}: SocialShareProps) {
  const shareTitle = title || "Check this out";

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
      "width=600,height=400",
    );
  };

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareTitle)}`,
      "_blank",
      "width=600,height=400",
    );
  };

  const handleLinkedInShare = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url,
      )}`,
      "_blank",
      "width=600,height=400",
    );
  };

  const handlePinterestShare = () => {
    window.open(
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(shareTitle)}`,
      "_blank",
      "width=600,height=400",
    );
  };

  return (
    <div className={cn("border-neutral-200", className)}>
      <div className="flex items-center gap-5">
        {/* Facebook */}
        <button
          onClick={handleFacebookShare}
          className="h-7.5 w-7.5 relative cursor-pointer hover:opacity-80 transition"
          aria-label="Share on Facebook"
        >
          <img
            alt="Facebook"
            src="/social/Vector.png"
            className="h-full w-full object-contain"
          />
        </button>

        {/* X (Twitter) */}
        <button
          onClick={handleTwitterShare}
          className="h-7.5 w-7.5 relative cursor-pointer hover:opacity-80 transition"
          aria-label="Share on X"
        >
          <img
            alt="X"
            src="/social/Vector-1.png"
            className="h-full w-full object-contain"
          />
        </button>

        {/* LinkedIn */}
        <button
          onClick={handleLinkedInShare}
          className="h-7.5 w-7.5 relative cursor-pointer hover:opacity-80 transition"
          aria-label="Share on LinkedIn"
        >
          <img
            alt="LinkedIn"
            src="/social/Vector-2.png"
            className="h-full w-full object-contain"
          />
        </button>

        {/* Pinterest */}
        <button
          onClick={handlePinterestShare}
          className="h-7.5 w-7.5 relative cursor-pointer hover:opacity-80 transition"
          aria-label="Share on Pinterest"
        >
          <img
            alt="Pinterest"
            src="/social/Vector-3.png"
            className="h-full w-full object-contain"
          />
        </button>
      </div>
    </div>
  );
}
