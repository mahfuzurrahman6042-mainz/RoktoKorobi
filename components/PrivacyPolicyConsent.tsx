'use client';

import React, { useState } from 'react';
import PolicyText from './PolicyText';
import { privacyPolicyContent } from '../lib/privacyPolicyContent';

interface PrivacyPolicyConsentProps {
  language: 'en' | 'bn';
  onConsentChange: (consented: boolean) => void;
  required?: boolean;
  showAgeDeclaration?: boolean;
  onAgeDeclarationChange?: (declared: boolean) => void;
}

export default function PrivacyPolicyConsent({
  language,
  onConsentChange,
  required = true,
  showAgeDeclaration = false,
  onAgeDeclarationChange,
}: PrivacyPolicyConsentProps) {
  const [consented, setConsented] = useState(false);
  const [ageDeclared, setAgeDeclared] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  const handleConsentChange = (checked: boolean) => {
    setConsented(checked);
    onConsentChange(checked);
  };

  const handleAgeDeclarationChange = (checked: boolean) => {
    setAgeDeclared(checked);
    if (onAgeDeclarationChange) {
      onAgeDeclarationChange(checked);
    }
  };

  const labels = {
    en: {
      consentLabel: 'I have read, understood, and agree to the Privacy Policy',
      consentRequired: 'Consent is required to continue',
      viewPolicy: 'View Privacy Policy',
      hidePolicy: 'Hide Privacy Policy',
      ageDeclaration: 'I confirm that I am 18 years of age or older',
      ageRequired: 'Age declaration is required to continue',
    },
    bn: {
      consentLabel: 'আমি গোপনীয়তা নীতি পড়েছি, বুঝেছি এবং এতে সম্মত আছি',
      consentRequired: 'এগিয়ে যেতে সম্মতি প্রয়োজন',
      viewPolicy: 'গোপনীয়তা নীতি দেখুন',
      hidePolicy: 'গোপনীয়তা নীতি লুকান',
      ageDeclaration: 'আমি নিশ্চিত করছি যে আমার বয়স ১৮ বছর বা তার বেশি',
      ageRequired: 'এগিয়ে যেতে বয়স ঘোষণা প্রয়োজন',
    },
  };

  const t = labels[language];

  return (
    <div className="space-y-4">
      {/* Privacy Policy Toggle */}
      <button
        type="button"
        onClick={() => setShowPolicy(!showPolicy)}
        className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
      >
        {showPolicy ? t.hidePolicy : t.viewPolicy}
      </button>

      {/* Privacy Policy Text */}
      {showPolicy && (
        <PolicyText content={privacyPolicyContent[language]} />
      )}

      {/* Consent Checkbox */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="privacy-consent"
          checked={consented}
          onChange={(e) => handleConsentChange(e.target.checked)}
          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          required={required}
        />
        <label htmlFor="privacy-consent" className="text-sm text-gray-700">
          {t.consentLabel}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>

      {/* Age Declaration Checkbox (optional) */}
      {showAgeDeclaration && (
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="age-declaration"
            checked={ageDeclared}
            onChange={(e) => handleAgeDeclarationChange(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required={required}
          />
          <label htmlFor="age-declaration" className="text-sm text-gray-700">
            {t.ageDeclaration}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      )}

      {/* Validation Messages */}
      {required && !consented && (
        <p className="text-xs text-red-600">{t.consentRequired}</p>
      )}
      {required && showAgeDeclaration && !ageDeclared && (
        <p className="text-xs text-red-600">{t.ageRequired}</p>
      )}
    </div>
  );
}
