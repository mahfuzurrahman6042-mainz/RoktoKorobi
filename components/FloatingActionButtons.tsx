"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface FABContainerProps {
  showSOS?: boolean;
  showShare?: boolean;
}

export default function FloatingActionButtons({ showSOS = true, showShare = true }: FABContainerProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSOS = () => {
    router.push('/request');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'RoktoKorobi - Blood Donation',
          text: 'Join our blood donation network and save lives!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div 
      className="fixed right-0 bottom-0 flex flex-col items-end gap-3 p-4 sm:p-6 pointer-events-none z-40"
      style={{
        paddingBottom: `calc(1.5rem + env(safe-area-inset-bottom))`,
        paddingRight: `calc(1.5rem + env(safe-area-inset-right))`,
      }}
    >
      {/* SOS Button */}
      {showSOS && (
        <button
          onClick={handleSOS}
          className="pointer-events-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl active:shadow-md hover:bg-red-700 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 flex items-center justify-center"
          aria-label="Emergency SOS - Request Blood"
          title="Emergency SOS"
        >
          SOS
        </button>
      )}

      {/* Share Button */}
      {showShare && (
        <button
          onClick={handleShare}
          className="pointer-events-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-gray-600 shadow-md hover:shadow-lg active:shadow-sm hover:text-gray-700 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 flex items-center justify-center"
          aria-label="Share this page"
          title="Share"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
        </button>
      )}
    </div>
  );
}
