import { useState, useEffect, useRef } from 'react';

/**
 * Componente de imagen optimizada con:
 * - Lazy loading nativo
 * - Placeholder blur
 * - WebP con fallback
 * - Intersection Observer
 * - Error handling
 */
export default function OptimizedImage({
  src,
  alt,
  className = '',
  placeholder = 'blur',
  priority = false,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imgRef.current || priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              observer.unobserve(img);
            }
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority]);

  // Generar URL WebP si es Unsplash
  const getOptimizedSrc = (url) => {
    if (!url) return '';
    
    // Si es Unsplash, optimizar
    if (url.includes('unsplash.com')) {
      // Añadir parámetros de optimización
      const params = new URLSearchParams({
        w: 800, // Width máximo
        q: 85,  // Calidad
        fm: 'webp', // Formato WebP
        fit: 'crop',
        auto: 'format,compress'
      });
      return `${url.split('?')[0]}?${params.toString()}`;
    }
    
    return url;
  };

  const optimizedSrc = getOptimizedSrc(src);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder mientras carga */}
      {!isLoaded && !hasError && placeholder === 'blur' && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      )}

      {/* Imagen principal */}
      <img
        ref={imgRef}
        src={priority ? optimizedSrc : undefined}
        data-src={!priority ? optimizedSrc : undefined}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={`
          w-full h-full object-cover transition-opacity duration-500
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${hasError ? 'hidden' : ''}
        `}
        {...props}
      />

      {/* Fallback si falla la imagen */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
}

/**
 * HOW TO USE:
 * 
 * // En Shop.jsx, ProductDetail.jsx, Home.jsx - reemplazar:
 * <img src={product.image} alt={product.title} />
 * 
 * // Por:
 * <OptimizedImage 
 *   src={product.image} 
 *   alt={product.title}
 *   priority={false} // true solo para hero images
 * />
 */