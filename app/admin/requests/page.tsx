'use client';

import { useState, useEffect } from 'react';
import { database, ref, get, update, remove } from '@/lib/firebase';
import { Heart, Search, Filter, Check, X, Trash2, AlertTriangle, Clock } from 'lucide-react';

interface BloodRequest {
  id: string;
  patientName: string;
  bloodType: string;
  units: number;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  hospital: string;
  location: string;
  contact: string;
  date: string;
  fulfilled: boolean;
  createdAt: string;
}

export default function BloodRequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = ['Low', 'Medium', 'High', 'Critical'];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      if (!database) return;
      
      const requestsRef = ref(database, 'bloodRequests');
      const snapshot = await get(requestsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const requestsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          fulfilled: data[key].fulfilled || false
        }));
        setRequests(requestsArray);
      }
    } catch (error) {
      console.error('Error fetching blood requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFulfillRequest = async (request: BloodRequest) => {
    if (!window.confirm(`Mark this request as fulfilled?`)) return;

    try {
      if (!database) return;
      
      await update(ref(database, `bloodRequests/${request.id}`), {
        fulfilled: true,
        fulfilledAt: new Date().toISOString()
      });
      fetchRequests();
    } catch (error) {
      console.error('Error fulfilling request:', error);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;

    try {
      if (!database) return;
      
      await remove(ref(database, `bloodRequests/${requestId}`));
      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return <AlertTriangle size={14} className="mr-1" />;
      case 'High': return <AlertTriangle size={14} className="mr-1" />;
      default: return null;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.contact.includes(searchTerm);
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'fulfilled' && request.fulfilled) ||
      (filterStatus === 'pending' && !request.fulfilled);
    
    const matchesUrgency = 
      filterUrgency === 'all' || request.urgency === filterUrgency;
    
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blood Request Management</h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage blood donation requests.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by patient, hospital, or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="fulfilled">Fulfilled</option>
          </select>
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Urgency</option>
            {urgencyLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Total Requests</p>
          <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{requests.filter(r => !r.fulfilled).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Fulfilled</p>
          <p className="text-3xl font-bold text-green-600">{requests.filter(r => r.fulfilled).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Critical</p>
          <p className="text-3xl font-bold text-red-600">{requests.filter(r => r.urgency === 'Critical' && !r.fulfilled).length}</p>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className={`hover:bg-gray-50 ${request.fulfilled ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <Heart size={20} className="text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{request.patientName}</p>
                        <p className="text-sm text-gray-500">{request.units} units</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      {request.bloodType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(request.urgency)}`}>
                      {getUrgencyIcon(request.urgency)}
                      {request.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{request.hospital}</p>
                    <p className="text-sm text-gray-500">{request.location}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{request.contact}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{request.date}</td>
                  <td className="px-6 py-4">
                    {request.fulfilled ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check size={14} className="mr-1" />
                        Fulfilled
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock size={14} className="mr-1" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      {!request.fulfilled && (
                        <button
                          onClick={() => handleFulfillRequest(request)}
                          className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                          title="Mark as fulfilled"
                        >
                          <Check size={18} className="text-green-600" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteRequest(request.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete request"
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No blood requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}
