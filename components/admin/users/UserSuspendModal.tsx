'use client';

import { X, Ban, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface UserSuspendModalProps {
  user: any;
  onClose: () => void;
}

export default function UserSuspendModal({ user, onClose }: UserSuspendModalProps) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!user.is_suspended && !reason.trim()) {
      setError('Please provide a reason for suspension');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/users/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          reason,
          action: user.is_suspended ? 'unsuspend' : 'suspend'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error suspending user:', error);
      setError('Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user.is_suspended ? 'Unsuspend User' : 'Suspend User'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {user.is_suspended ? (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to unsuspend <strong>{user.full_name || user.email}</strong>?
              </p>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Previous suspension reason:</strong>
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{user.suspension_reason || 'No reason provided'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">
                    Warning
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    Suspending a user will prevent them from accessing the platform.
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to suspend <strong>{user.full_name || user.email}</strong>?
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for suspension <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide a reason for this suspension..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors"
          >
            {loading ? 'Processing...' : user.is_suspended ? 'Unsuspend User' : 'Suspend User'}
          </button>
        </div>
      </div>
    </div>
  );
}
