// frontend/src/components/OptimizedImage.jsx
import { useState, useEffect, useRef } from "react";

/**
 * Imagen optimizada con:
 * - Lazy Loading
 * - Soporte para WebP/JPG
 * - object-contain (imagen completa siempre visible)
 * - Fondo borroso que elimina los espacios grises
 */
export default function OptimizedImage({
  src,
  alt,
  className = "",
  placeholder = "blur",
  priority = false,
  srcSet,
  sizes,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const imgRef = useRef(null);

  // Normalizar URL de imagen
  useEffect(() => {
    if (!src) {
      setHasError(true);
      return;
    }

    let normalizedSrc = src;

    if (src.startsWith("/uploads")) {
      const backendUrl =
        import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
        "http://localhost:3000";
      normalizedSrc = `${backendUrl}${src}`;
    } else if (
      !src.startsWith("http://") &&
      !src.startsWith("https://") &&
      !src.startsWith("/")
    ) {
      normalizedSrc = `/${src}`;
    }

    setImageSrc(normalizedSrc);
  }, [src]);

  // Lazy loading con IntersectionObserver
  useEffect(() => {
    if (!imgRef.current || priority || !imageSrc) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) img.src = img.dataset.src;
            if (img.dataset.srcset) img.srcset = img.dataset.srcset;
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: "50px" }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) observer.unobserve(imgRef.current);
    };
  }, [priority, imageSrc]);

  const isUnsplash = imageSrc.includes("unsplash");

  const addFormatToUrl = (url, format) => {
    if (!url) return "";
    const hasQuery = url.includes("?");
    let newUrl = url;

    if (newUrl.includes("fm=")) {
      newUrl = newUrl.replace(/fm=[^&]+/, `fm=${format}`);
    } else {
      newUrl += (hasQuery ? "&" : "?") + `fm=${format}`;
    }

    if (!/[\?&]q=/.test(newUrl)) newUrl += "&q=85";

    return newUrl;
  };

  const transformSrcSet = (rawSrcSet, format) => {
    if (!rawSrcSet) return "";
    return rawSrcSet
      .split(",")
      .map((part) => {
        const [urlPart, descriptor] = part.trim().split(/\s+/);
        if (!urlPart) return "";
        const newUrl = addFormatToUrl(urlPart, format);
        return descriptor ? `${newUrl} ${descriptor}` : newUrl;
      })
      .filter(Boolean)
      .join(", ");
  };

  const webpSrc = isUnsplash ? addFormatToUrl(imageSrc, "webp") : imageSrc;
  const jpgSrc = isUnsplash ? addFormatToUrl(imageSrc, "jpg") : imageSrc;

  const webpSrcSet =
    isUnsplash && srcSet ? transformSrcSet(srcSet, "webp") : srcSet;
  const jpgSrcSet =
    isUnsplash && srcSet ? transformSrcSet(srcSet, "jpg") : srcSet;

  const imgSrc = priority ? jpgSrc : undefined;
  const imgSrcSet = priority ? jpgSrcSet : undefined;
  const dataSrc = !priority ? jpgSrc : undefined;
  const dataSrcSet = !priority ? jpgSrcSet : undefined;

  if (!imageSrc || hasError) {
    return (
      <div
        className={`relative overflow-hidden bg-gray-200 flex items-center justify-center ${className}`}
      >
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>

      {/* 🔥 Fondo borroso que elimina los espacios grises */}
      <img
        src={imageSrc}
        alt=""
        aria-hidden="true"
        className="
          absolute inset-0 w-full h-full 
          object-cover 
          blur-xl 
          scale-110 
          opacity-40 
        "
      />

      {/* Imagen principal completa */}
      <picture className="relative z-10 flex items-center justify-center w-full h-full">
        <source
          srcSet={priority ? webpSrcSet || webpSrc : undefined}
          data-srcset={!priority && webpSrcSet ? webpSrcSet : undefined}
          type="image/webp"
          sizes={sizes}
        />

        <source
          srcSet={priority ? jpgSrcSet || jpgSrc : undefined}
          data-srcset={!priority && jpgSrcSet ? jpgSrcSet : undefined}
          type="image/jpeg"
          sizes={sizes}
        />

        <img
          ref={imgRef}
          src={imgSrc}
          data-src={dataSrc}
          srcSet={imgSrcSet}
          data-srcset={dataSrcSet}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          className={
            `max-w-full max-h-full object-contain transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"} ${hasError ? "hidden" : ""}` + (className ? ` ${className}` : "")
          }
          sizes={sizes}
          {...props}
        />
      </picture>
    </div>
  );
}
