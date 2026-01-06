/**
 * Lazy Loading Image Component
 * Optimizes image loading for brochure assets and guest ID documents
 * Uses Intersection Observer API for efficient viewport detection
 */

import { useState, useRef, useEffect, type ImgHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  placeholder?: string;
  fallback?: string;
  className?: string;
}

export default function LazyImage({
  src,
  alt,
  placeholder,
  fallback = '/placeholder-image.png',
  className = '',
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Create Intersection Observer
    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // Disconnect observer once image is in view
            if (observerRef.current && imgRef.current) {
              observerRef.current.unobserve(imgRef.current);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
      observerRef.current?.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ minHeight: props.height || '200px' }}>
      {/* Placeholder/Spinner */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          {placeholder ? (
            <img src={placeholder} alt="" className="w-full h-full object-cover opacity-50" />
          ) : (
            <Loader2 className="animate-spin text-brushed-gold" size={24} />
          )}
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 border border-gray-200">
          <div className="text-center p-4">
            <p className="text-sm text-gray-500">Image not available</p>
            {fallback && fallback !== '/placeholder-image.png' && (
              <img src={fallback} alt={alt} className="mt-2 max-w-full max-h-full object-contain" />
            )}
          </div>
        </div>
      )}

      {/* Actual Image */}
      {isInView && (
        <img
          ref={imgRef}
          src={hasError ? fallback : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
}

