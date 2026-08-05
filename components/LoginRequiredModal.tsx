"use client";

import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, X } from 'lucide-react';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
}

export default function LoginRequiredModal({ isOpen, onClose, action }: LoginRequiredModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <LogIn className="w-6 h-6 text-red-600" />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Login Required
        </h3>
        
        <p className="text-gray-600 mb-6">
          You need to sign up or log in to {action}. Please create an account or sign in to continue using this feature.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/login')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            <LogIn size={20} />
            Log In
          </button>
          
          <button
            onClick={() => router.push('/signup')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-semibold"
          >
            <UserPlus size={20} />
            Sign Up
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
