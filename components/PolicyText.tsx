'use client';

import React from 'react';

interface PolicyTextProps {
  content: string;
  className?: string;
}

export default function PolicyText({ content, className = '' }: PolicyTextProps) {
  return (
    <div className={`policy-text-container ${className}`}>
      <div className="policy-text-content whitespace-pre-wrap text-sm leading-relaxed max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200">
        {content}
      </div>
    </div>
  );
}
