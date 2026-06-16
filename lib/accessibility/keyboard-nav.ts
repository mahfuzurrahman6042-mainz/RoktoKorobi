import { useEffect, useRef } from 'react';

// Skip to main content link component
export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
};

// Focus trap hook for modals
export function useFocusTrap(isActive: boolean, containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTab);
    };
  }, [isActive, containerRef]);
}

// Auto focus hook
export function useAutoFocus(isActive: boolean, delay = 0) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(() => {
      ref.current?.focus();
    }, delay);

    return () => clearTimeout(timer);
  }, [isActive, delay]);

  return ref;
}

// Keyboard navigation hook
export function useKeyboardNavigation(
  items: any[],
  onSelect: (item: any, index: number) => void,
  options?: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical';
  }
) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const { loop = true, orientation = 'vertical' } = options || {};

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isVertical = orientation === 'vertical';
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

    switch (e.key) {
      case nextKey:
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = prev + 1;
          if (next >= items.length) {
            return loop ? 0 : prev;
          }
          return next;
        });
        break;
      case prevKey:
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = prev - 1;
          if (next < 0) {
            return loop ? items.length - 1 : prev;
          }
          return next;
        });
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(items[selectedIndex], selectedIndex);
        break;
      case 'Home':
        e.preventDefault();
        setSelectedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setSelectedIndex(items.length - 1);
        break;
    }
  };

  return { selectedIndex, setSelectedIndex, handleKeyDown };
}

// Focus visible hook
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setIsFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isFocusVisible;
}

// Announce to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Live region hook
export function useLiveRegion() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority);
  };

  return { announce };
}

// Focus management utilities
export const focusManagement = {
  // Focus first element
  focusFirst: (container: HTMLElement) => {
    const focusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    focusable?.focus();
  },

  // Focus last element
  focusLast: (container: HTMLElement) => {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const last = focusable[focusable.length - 1] as HTMLElement;
    last?.focus();
  },

  // Restore focus
  restoreFocus: (element: HTMLElement | null) => {
    element?.focus();
  },

  // Save focus
  saveFocus: (): HTMLElement | null => {
    return document.activeElement as HTMLElement;
  },
};

// Keyboard event handler utilities
export const keyboardHandlers = {
  // Escape key handler
  onEscape: (callback: () => void) => (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      callback();
    }
  },

  // Enter key handler
  onEnter: (callback: () => void) => (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      callback();
    }
  },

  // Space key handler
  onSpace: (callback: () => void) => (e: KeyboardEvent) => {
    if (e.key === ' ') {
      callback();
    }
  },

  // Arrow key handler
  onArrow: (direction: 'up' | 'down' | 'left' | 'right', callback: () => void) => (e: KeyboardEvent) => {
    if (e.key === `Arrow${direction.charAt(0).toUpperCase() + direction.slice(1)}`) {
      callback();
    }
  },
};
