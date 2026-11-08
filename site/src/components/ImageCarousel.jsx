import { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiImage } from "react-icons/fi";

function ImageCarousel({
  images,
  alt = "Item image",
  imageClassName = "",
  className = "",
  fallback,
  activeIndex,
  onIndexChange,
}) {
  const imageSources = (Array.isArray(images) ? images : [images])
    .map((image) =>
      typeof image === "string" ? image : image?.url || image?.imageUrl
    )
    .filter(Boolean);
  const [internalIndex, setInternalIndex] = useState(0);
  const selectedIndex = Math.min(
    activeIndex ?? internalIndex,
    Math.max(imageSources.length - 1, 0)
  );
  const selectedImage = imageSources[selectedIndex];
  const [failedImage, setFailedImage] = useState(null);

  const changeImage = (nextIndex, event) => {
    event.stopPropagation();
    setFailedImage(null);
    if (onIndexChange) {
      onIndexChange(nextIndex);
    } else {
      setInternalIndex(nextIndex);
    }
  };

  return (
    <div
      className={`flex shrink-0 flex-col ${className}`}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <div
        className={`flex items-center justify-center overflow-hidden bg-gray-100 ${imageClassName}`}
      >
        {selectedImage && failedImage !== selectedImage ? (
          <img
            src={selectedImage}
            alt={alt}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={() => setFailedImage(selectedImage)}
          />
        ) : (
          fallback || <FiImage size={28} className="text-gray-400" />
        )}
      </div>

      {imageSources.length > 1 && (
        <div className="mt-1 flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={(event) =>
              changeImage(
                (selectedIndex - 1 + imageSources.length) %
                  imageSources.length,
                event
              )
            }
            aria-label="Previous image"
            className="rounded-full p-0.5 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
          >
            <FiChevronLeft size={14} />
          </button>
          <span className="min-w-6 text-center text-[10px] font-medium text-slate-500">
            {selectedIndex + 1} / {imageSources.length}
          </span>
          <button
            type="button"
            onClick={(event) =>
              changeImage((selectedIndex + 1) % imageSources.length, event)
            }
            aria-label="Next image"
            className="rounded-full p-0.5 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
          >
            <FiChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageCarousel;
