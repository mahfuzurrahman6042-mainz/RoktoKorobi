'use client';

import React, { useState, useEffect } from 'react';

interface BloodRequest {
  id: string;
  patientName: string;
  bloodType: string;
  hospital: string;
  location: string;
  urgency: 'high' | 'medium' | 'low';
  contact: string;
  postedAt: string;
}

const UrgentBloodRequests = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for urgent blood requests
    const mockRequests: BloodRequest[] = [
      {
        id: '1',
        patientName: 'জনৈক রোগী',
        bloodType: 'O+',
        hospital: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
        location: 'ঢাকা',
        urgency: 'high',
        contact: '0171-1234567',
        postedAt: '2 hours ago'
      },
      {
        id: '2',
        patientName: 'জরুরি অস্ত্রোপ্রচার',
        bloodType: 'A+',
        hospital: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়',
        location: 'ঢাকা',
        urgency: 'high',
        contact: '0181-2345678',
        postedAt: '4 hours ago'
      },
      {
        id: '3',
        patientName: 'নবজাতক',
        bloodType: 'B+',
        hospital: 'শিশু হাসপাতাল',
        location: 'ঢাকা',
        urgency: 'medium',
        contact: '0191-3456789',
        postedAt: '6 hours ago'
      }
    ];

    setTimeout(() => {
      setRequests(mockRequests);
      setLoading(false);
    }, 1000);
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'জরুরি';
      case 'medium': return 'মাঝারি';
      case 'low': return 'সাধারণ';
      default: return 'সাধারণ';
    }
  };

  if (loading) {
    return (
      <section className="urgent-requests py-16 lg:py-24 bg-red-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading urgent requests...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="urgent-requests py-16 lg:py-24 bg-red-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="urgent-header reveal text-center mb-12 lg:mb-16">
          <div className="s-label inline-block">
            <div className="s-label-line"></div>
            <span className="s-label-text">জরুরি অনুরোধ</span>
          </div>
          <h2 className="s-title text-3xl lg:text-4xl font-bold mb-4">
            জরুরি রক্তের <span className="accent">প্রয়োজন</span>
          </h2>
          <p className="s-desc text-lg max-w-3xl mx-auto">
            এই মুহূর্তে রক্তের প্রয়োজনে থাকা রোগীদের তালিকা। আপনার সাহায্য জীবন বাঁচাতে পারে।
          </p>
        </div>

        <div className="requests-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <div key={request.id} className="request-card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="request-header flex justify-between items-start mb-4">
                <div className="blood-type-badge bg-red-600 text-white px-3 py-1 rounded-full text-lg font-bold">
                  {request.bloodType}
                </div>
                <span className={`urgency-badge px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency)}`}>
                  {getUrgencyText(request.urgency)}
                </span>
              </div>

              <div className="request-content space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{request.patientName}</h3>
                  <p className="text-sm text-gray-600">{request.hospital}</p>
                </div>

                <div className="location-info flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span>{request.location}</span>
                </div>

                <div className="contact-info flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span>{request.contact}</span>
                </div>

                <div className="time-info text-xs text-gray-500">
                  পোস্ট করা হয়েছে: {request.postedAt}
                </div>
              </div>

              <div className="request-actions mt-4 pt-4 border-t border-gray-200">
                <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                  যোগাযোগ করুন
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="view-all-section text-center mt-12">
          <button className="view-all-btn bg-white text-red-600 border border-red-600 px-6 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors">
            সব অনুরোধ দেখুন
          </button>
        </div>
      </div>
    </section>
  );
};

export default UrgentBloodRequests;
