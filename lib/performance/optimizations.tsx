import React, { memo, useMemo, useCallback, lazy, Suspense, useEffect } from 'react';

// React.memo wrapper for component memoization
export function memoize<P extends object>(
  component: React.ComponentType<P>,
  arePropsEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return memo(component, arePropsEqual);
}

// useMemo wrapper for expensive computations
export function useComputation<T>(factory: () => T, deps: React.DependencyList): T {
  return useMemo(factory, deps);
}

// useCallback wrapper for function memoization
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

// Dynamic import wrapper for code splitting
export function dynamicImport<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Image lazy loading component
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
}> = ({ src, alt, width, height, className, loading = 'lazy' }) => {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading}
      decoding="async"
    />
  );
};

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  target: React.RefObject<Element>,
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) {
  React.useEffect(() => {
    const observer = new IntersectionObserver(callback, options);
    const current = target.current;
    
    if (current) {
      observer.observe(current);
    }
    
    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [target, callback, options]);
}

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = React.useState(value);
  const lastRan = React.useRef(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

// Virtual list hook for large lists
export function useVirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleEnd = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const offsetY = visibleStart * itemHeight;

  return {
    visibleItems,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
  };
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const mark = `${componentName}-mount`;
      performance.mark(mark);
      
      return () => {
        const measure = `${componentName}-render`;
        performance.measure(measure, mark);
        const entry = performance.getEntriesByName(measure)[0];
        console.log(`${componentName} render time: ${entry.duration}ms`);
        performance.clearMarks();
        performance.clearMeasures();
      };
    }
  }, [componentName]);
}

// CLS prevention utilities
export function preventCLS() {
  // Reserve space for images
  const reserveImageSpace = (width: number, height: number) => ({
    aspectRatio: `${width} / ${height}`,
    paddingBottom: `${(height / width) * 100}%`,
  });

  // Reserve space for dynamic content
  const reserveContentSpace = (minHeight: number) => ({
    minHeight: `${minHeight}px`,
  });

  return {
    reserveImageSpace,
    reserveContentSpace,
  };
}

// Font loading optimization
export function optimizeFontLoading(fonts: string[]) {
  if (typeof window !== 'undefined' && 'fonts' in document) {
    fonts.forEach(font => {
      document.fonts.load(font);
    });
  }
}

// Preload critical resources
export function preloadResource(href: string, as: string) {
  if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }
}

// Prefetch resources for future navigation
export function prefetchResource(href: string, as: string) {
  if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }
}
