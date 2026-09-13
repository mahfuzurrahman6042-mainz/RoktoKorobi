"use client";

import { useState, useEffect } from "react";
import { onValue, ref } from 'firebase/database';
import { database } from '@/lib/firebase';
import { getCurrentUser } from '@/lib/firebase';

interface Notification {
  id: string;
  type: string;
  bloodRequest: {
    id: string;
    patientName: string;
    bloodType: string;
    hospital: string;
    location: string;
    urgency: string;
    units: string;
    contact: string;
    createdAt: string;
  };
  message: string;
  read: boolean;
  createdAt: string;
}

interface Toast {
  id: string;
  notification: Notification;
  autoClose: boolean;
}

export default function ToastNotifications() {
  const [toasts, setToasts] = useState<Toast[]>([]);
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

    // Track already seen notifications to avoid duplicate toasts
    const seenNotifications = new Set<string>();

    // Set up real-time listener for notifications
    const notificationsRef = ref(database, `notifications/${currentUser.uid}`);
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationsArray = Object.keys(data).map(key => ({ 
          id: key, 
          ...data[key] as Notification 
        })).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Find new unread notifications
        const newNotifications = notificationsArray.filter(n => 
          !n.read && !seenNotifications.has(n.id)
        );

        // Add new notifications as toasts
        newNotifications.forEach(notification => {
          seenNotifications.add(notification.id);
          addToast(notification);
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addToast = (notification: Notification) => {
    const toastId = `toast-${notification.id}-${Date.now()}`;
    const toast: Toast = {
      id: toastId,
      notification,
      autoClose: true
    };

    setToasts(prev => [...prev, toast]);

    // Auto-close after 5 seconds
    setTimeout(() => {
      removeToast(toastId);
    }, 5000);
  };

  const removeToast = (toastId: string) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: Record<string, string> = {
      'low': '#22c55e',
      'medium': '#f59e0b',
      'high': '#ef4444',
      'critical': '#A32D2D'
    };
    return colors[urgency] || '#666';
  };

  const getUrgencyIcon = (urgency: string) => {
    const icons: Record<string, string> = {
      'low': '✓',
      'medium': '⏰',
      'high': '⚠️',
      'critical': '🚨'
    };
    return icons[urgency] || '🩸';
  };

  if (!currentUser) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm animate-slide-in"
          style={{
            animation: 'slideIn 0.3s ease-out',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: getUrgencyColor(toast.notification.bloodRequest.urgency) }}
            >
              {getUrgencyIcon(toast.notification.bloodRequest.urgency)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-900">
                  Blood Request Alert
                </span>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">{toast.notification.bloodRequest.patientName}</span> needs{' '}
                <span className="font-bold" style={{ color: getUrgencyColor(toast.notification.bloodRequest.urgency) }}>
                  {toast.notification.bloodRequest.bloodType}
                </span>{' '}
                blood
              </p>
              <p className="text-xs text-gray-500 mb-2">
                {toast.notification.bloodRequest.hospital} • {toast.notification.bloodRequest.location}
              </p>
              <button
                onClick={() => {
                  window.location.href = '/request';
                  removeToast(toast.id);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View Details →
              </button>
            </div>
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        .animate-slide-out {
          animation: slideOut 0.3s ease-in forwards;
        }
      `}</style>
    </div>
  );
}
