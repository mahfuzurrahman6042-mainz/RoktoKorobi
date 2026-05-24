import Link from 'next/link';
import type { Language } from '@/types/testimonial';

interface TestimonialButtonProps {
  language: Language;
  className?: string;
}

export const TestimonialButton = ({ language, className = '' }: TestimonialButtonProps) => {
  const buttonText = language === 'bn' ? 'সাক্ষ্য দিন' : 'Share Your Story';
  const ariaLabel = language === 'bn' ? 'সাক্ষ্য পৃষ্ঠায় যান' : 'Navigate to testimonial page';

  return (
    <Link
      href="/share-testimonial"
      className={`
        inline-flex items-center justify-center px-6 py-3
        bg-amber-500 hover:bg-amber-600 
        text-white font-semibold text-sm
        rounded-full
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:-translate-y-0.5
        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
        motion-safe:hover:scale-105
        ${className}
      `}
      aria-label={ariaLabel}
      role="button"
    >
      {buttonText}
    </Link>
  );
};
