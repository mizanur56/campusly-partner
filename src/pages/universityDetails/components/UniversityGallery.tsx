import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useGetUniversityGalleriesQuery } from "../../../redux/features/universityApi";
import { getApiImageUrl } from "../../../utils/getApiImageUrl";

type GalleryItem = { src: string; alt: string };

export default function UniversityGallery({ slug }: { slug: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { data: galleriesData, isLoading } = useGetUniversityGalleriesQuery(slug || "", { skip: !slug });

  const allImages: GalleryItem[] = useMemo(() => {
    if (!galleriesData?.data || !Array.isArray(galleriesData.data)) return [];
    return [...galleriesData.data]
      .sort((a, b) => a.priority - b.priority)
      .map((item) => ({
        src: getApiImageUrl(item.media?.url || ""),
        alt: item.altText || item.media?.altText || item.media?.name || "University gallery image",
      }))
      .filter((img) => Boolean(img.src?.trim()));
  }, [galleriesData]);

  const displayedImages = allImages.slice(0, 5);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  if (isLoading) {
    return (
      <section id="campus" className="flex w-full flex-col gap-4">
        <div className="flex h-[320px] flex-col gap-3 md:h-[380px] lg:flex-row">
          <div className="h-full overflow-hidden rounded-lg bg-gray-100 lg:w-1/2" />
          <div className="grid h-full grid-cols-2 grid-rows-2 gap-3 lg:w-1/2">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="h-full overflow-hidden rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!displayedImages.length) return null;

  return (
    <>
      <section id="campus" className="flex w-full flex-col gap-4">
        <div className="flex h-[320px] flex-col gap-3 md:h-[380px] lg:flex-row">
          <div className="group relative h-full cursor-pointer overflow-hidden rounded-lg lg:w-1/2" onClick={() => { setSelectedImageIndex(0); setIsModalOpen(true); }}>
            <img src={displayedImages[0].src} alt={displayedImages[0].alt} className="h-full w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div className="grid h-full grid-cols-2 grid-rows-2 gap-3 lg:w-1/2">
            {displayedImages.slice(1, 5).map((image, idx) => {
              const index = idx + 1;
              return (
                <div key={index} className="group relative h-full cursor-pointer overflow-hidden rounded-lg" onClick={() => { setSelectedImageIndex(index); setIsModalOpen(true); }}>
                  <img src={image.src} alt={image.alt} className="h-full w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-110" />
                  {index === 4 && allImages.length > 5 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <span className="text-2xl font-semibold text-white">+{allImages.length - 5}</span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {isModalOpen && mounted
        ? createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4" onClick={() => setIsModalOpen(false)}>
          <button onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }} className="absolute right-4 top-4 rounded-full p-2 text-white hover:bg-white/10">
            <X className="size-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length); }} className="absolute left-4 rounded-full p-2 text-white hover:bg-white/10">
            <ChevronLeft className="size-8" />
          </button>
          <img src={allImages[selectedImageIndex]?.src} alt={allImages[selectedImageIndex]?.alt} className="max-h-[90vh] max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); setSelectedImageIndex((prev) => (prev + 1) % allImages.length); }} className="absolute right-4 rounded-full p-2 text-white hover:bg-white/10">
            <ChevronRight className="size-8" />
          </button>
        </div>,
        document.body,
      )
        : null}
    </>
  );
}
