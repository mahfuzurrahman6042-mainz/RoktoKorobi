"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, requestNotificationPermission, saveFCMToken } from '@/lib/firebase';

export default function NotificationPermission() {
  const [showPermission, setShowPermission] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // Check if permission is already granted
    if (Notification.permission === 'granted') {
      // Get and save FCM token
      requestNotificationPermission().then(token => {
        if (token && currentUser.uid) {
          saveFCMToken(currentUser.uid, token);
        }
      });
      return;
    }

    // Check if permission is denied
    if (Notification.permission === 'denied') {
      return;
    }

    // Show permission request after a delay
    const timer = setTimeout(() => {
      setShowPermission(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentUser]);

  const handleRequestPermission = async () => {
    const token = await requestNotificationPermission();
    if (token && currentUser?.uid) {
      await saveFCMToken(currentUser.uid, token);
    }
    setShowPermission(false);
  };

  const handleDismiss = () => {
    setShowPermission(false);
    // Store that user dismissed to not show again
    localStorage.setItem('notificationPermissionDismissed', 'true');
  };

  if (!showPermission || !currentUser) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Enable Notifications
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Get notified when someone needs blood matching your blood group. You won't receive notifications if you've donated in the last 3 months.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleRequestPermission}
              className="flex-1 bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Enable
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
