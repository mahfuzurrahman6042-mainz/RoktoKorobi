'use client';

import { useState } from 'react';
import { setSuperAdmin } from '@/lib/firebase';
import { Crown, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SuperAdminSetup() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSetSuperAdmin = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await setSuperAdmin('mahfuzurrahman6042@gmail.com');
      
      if (result.success) {
        setSuccess(true);
        setMessage('Successfully set mahfuzurrahman6042@gmail.com as Super Admin! You can now login to access the admin dashboard.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setSuccess(false);
        setMessage('Failed to set Super Admin. Please try again.');
      }
    } catch (error) {
      setSuccess(false);
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Crown size={40} className="text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Super Admin Setup
          </h2>
          <p className="mt-2 text-gray-600">
            Set up the Super Admin for RoktoKorobi Foundation
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Super Admin Email
            </label>
            <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3">
              <span className="text-gray-900 font-medium">mahfuzurrahman6042@gmail.com</span>
            </div>
          </div>

          <button
            onClick={handleSetSuperAdmin}
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Setting up...
              </>
            ) : success ? (
              <>
                <CheckCircle size={20} />
                Setup Complete
              </>
            ) : (
              <>
                <Crown size={20} />
                Set as Super Admin
              </>
            )}
          </button>

          {message && (
            <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
              success 
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {success ? (
                <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm">{message}</p>
            </div>
          )}
        </div>

        <div className="text-center">
          <a
            href="/login"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Go to Login Page
          </a>
        </div>
      </div>
    </div>
  );
}
