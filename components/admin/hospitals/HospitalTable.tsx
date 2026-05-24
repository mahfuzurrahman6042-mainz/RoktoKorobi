'use client';

import { Building2, Edit, Trash2, MapPin, Phone, Mail, Calendar, Users, Droplet } from 'lucide-react';

interface HospitalTableProps {
  hospitals: any[];
  totalCount: number;
  currentPage: number;
  limit: number;
}

export default function HospitalTable({ hospitals, totalCount, currentPage, limit }: HospitalTableProps) {
  const handleDelete = async (hospitalId: string) => {
    if (!confirm('Are you sure you want to delete this hospital?')) return;

    try {
      const response = await fetch('/api/admin/hospitals/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete hospital');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error deleting hospital:', error);
      alert('Failed to delete hospital');
    }
  };

  const handleToggleStatus = async (hospitalId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/hospitals/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId, active: !isActive })
      });

      if (!response.ok) {
        throw new Error('Failed to update hospital');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error updating hospital:', error);
      alert('Failed to update hospital');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Hospital
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Organization
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Contact
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Location
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Blood Types
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {hospitals.map((hospital) => (
            <tr key={hospital.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {hospital.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {hospital.type || 'Hospital'}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {hospital.organizations?.name || 'Independent'}
                </p>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  {hospital.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-3 h-3" />
                      <span className="truncate max-w-[150px]">{hospital.email}</span>
                    </div>
                  )}
                  {hospital.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-3 h-3" />
                      <span>{hospital.phone}</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate max-w-[150px]">{hospital.city || 'N/A'}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {hospital.blood_types?.join(', ') || 'All'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                {hospital.is_active ? (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(hospital.id, hospital.is_active)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title={hospital.is_active ? 'Deactivate' : 'Activate'}
                  >
                    <Building2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(hospital.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} hospitals
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('page', (currentPage - 1).toString());
                window.location.href = url.toString();
              }}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('page', page.toString());
                  window.location.href = url.toString();
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                  page === currentPage
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('page', (currentPage + 1).toString());
                window.location.href = url.toString();
              }}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
