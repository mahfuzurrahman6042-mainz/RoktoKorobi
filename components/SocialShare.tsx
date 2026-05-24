"use client";

import { useState } from 'react';

interface SocialShareProps {
  url: string;
  title: string;
  description: string;
}

export default function SocialShare({ url, title, description }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <button
        onClick={() => window.open(shareUrls.facebook, '_blank')}
        style={{
          background: '#1877F2',
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600
        }}
      >
        Facebook
      </button>
      <button
        onClick={() => window.open(shareUrls.twitter, '_blank')}
        style={{
          background: '#1DA1F2',
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600
        }}
      >
        Twitter
      </button>
      <button
        onClick={() => window.open(shareUrls.whatsapp, '_blank')}
        style={{
          background: '#25D366',
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600
        }}
      >
        WhatsApp
      </button>
      <button
        onClick={copyToClipboard}
        style={{
          background: copied ? '#22c55e' : '#6b7280',
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600
        }}
      >
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
}
