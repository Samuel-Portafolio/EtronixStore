// frontend/src/components/OptimizedImage.jsx
import { useState, useEffect, useRef } from "react";

/**
 * Componente de imagen optimizada con:
 * - <picture> (WebP + JPG)
 * - Soporte para srcSet y sizes (responsive)
 * - Lazy loading nativo + IntersectionObserver
 * - Placeholder blur
 * - Optimización especial para Unsplash
 * - Manejo de error con fallback
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
  const imgRef = useRef(null);

  // ---------------------------
  // Intersection Observer (lazy)
  // ---------------------------
  useEffect(() => {
    if (!imgRef.current || priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
            }
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: "50px" }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority]);

  const isUnsplash = src && src.includes("unsplash");

  // ---------------------------
  // Helpers para Unsplash
  // ---------------------------
  const addFormatToUrl = (url, format) => {
    if (!url) return "";

    // Manejo de query string simple sin usar URL()
    const hasQuery = url.includes("?");
    let newUrl = url;

    if (newUrl.includes("fm=")) {
      newUrl = newUrl.replace(/fm=[^&]+/, `fm=${format}`);
    } else {
      newUrl += (hasQuery ? "&" : "?") + `fm=${format}`;
    }

    // Comprimir un poquito si no tiene `q=`
    if (!/[\?&]q=/.test(newUrl)) {
      newUrl += "&q=85";
    }

    return newUrl;
  };

  const transformSrcSet = (rawSrcSet, format) => {
    if (!rawSrcSet) return "";

    return rawSrcSet
      .split(",")
      .map((part) => {
        const trimmed = part.trim();
        if (!trimmed) return "";
        const [urlPart, descriptor] = trimmed.split(/\s+/);
        if (!urlPart) return "";
        const newUrl = addFormatToUrl(urlPart, format);
        return descriptor ? `${newUrl} ${descriptor}` : newUrl;
      })
      .filter(Boolean)
      .join(", ");
  };

  // ---------------------------
  // Construir URLs optimizadas
  // ---------------------------
  const webpSrc = isUnsplash ? addFormatToUrl(src, "webp") : src;
  const jpgSrc = isUnsplash ? addFormatToUrl(src, "jpg") : src;

  const webpSrcSet = isUnsplash && srcSet ? transformSrcSet(srcSet, "webp") : srcSet;
  const jpgSrcSet = isUnsplash && srcSet ? transformSrcSet(srcSet, "jpg") : srcSet;

  // Para lazy: si NO es priority, dejamos src/srcSet en data-*
  const imgSrc = priority ? jpgSrc : undefined;
  const imgSrcSet = priority ? jpgSrcSet : undefined;

  const dataSrc = !priority ? jpgSrc : undefined;
  const dataSrcSet = !priority ? jpgSrcSet : undefined;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder blur mientras carga */}
      {!isLoaded && !hasError && placeholder === "blur" && (
        <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300 animate-pulse" />
      )}

      {/* Imagen con picture + formatos */}
      <picture className="block w-full h-full">
        {/* Fuentes para navegadores que soportan WebP */}
        {webpSrc && (
          <source
            srcSet={priority ? webpSrcSet || webpSrc : undefined}
            data-srcset={!priority && webpSrcSet ? webpSrcSet : undefined}
            type="image/webp"
            sizes={sizes}
          />
        )}

        {/* Fallback JPEG */}
        {jpgSrc && (
          <source
            srcSet={priority ? jpgSrcSet || jpgSrc : undefined}
            data-srcset={!priority && jpgSrcSet ? jpgSrcSet : undefined}
            type="image/jpeg"
            sizes={sizes}
          />
        )}

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
          className={`
            w-full h-full object-cover transition-opacity duration-500
            ${isLoaded ? "opacity-100" : "opacity-0"}
            ${hasError ? "hidden" : ""}
          `}
          sizes={sizes}
          {...props}
        />
      </picture>

      {/* Fallback si falla la imagen */}
      {hasError && (
        <div className="absolute inset-0 bg-linear-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
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
      )}
    </div>
  );
}
