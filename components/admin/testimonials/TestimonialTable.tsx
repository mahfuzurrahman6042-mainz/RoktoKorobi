'use client';

import { Check, X, Star, Trash2, MessageSquare } from 'lucide-react';

interface TestimonialTableProps {
  testimonials: any[];
  totalCount: number;
  currentPage: number;
  limit: number;
}

export default function TestimonialTable({ testimonials, totalCount, currentPage, limit }: TestimonialTableProps) {
  const handleApprove = async (testimonialId: string) => {
    try {
      const response = await fetch('/api/admin/testimonials/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testimonialId, approved: true })
      });

      if (!response.ok) {
        throw new Error('Failed to approve testimonial');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error approving testimonial:', error);
      alert('Failed to approve testimonial');
    }
  };

  const handleReject = async (testimonialId: string, reason: string) => {
    try {
      const response = await fetch('/api/admin/testimonials/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testimonialId, reason })
      });

      if (!response.ok) {
        throw new Error('Failed to reject testimonial');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error rejecting testimonial:', error);
      alert('Failed to reject testimonial');
    }
  };

  const handleDelete = async (testimonialId: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const response = await fetch('/api/admin/testimonials/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testimonialId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete testimonial');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('Failed to delete testimonial');
    }
  };

  const handleFeature = async (testimonialId: string, isFeatured: boolean) => {
    try {
      const response = await fetch('/api/admin/testimonials/feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testimonialId, featured: !isFeatured })
      });

      if (!response.ok) {
        throw new Error('Failed to update testimonial');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error updating testimonial:', error);
      alert('Failed to update testimonial');
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
              User
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Testimonial
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Rating
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Date
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {testimonials.map((testimonial) => (
            <tr key={testimonial.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-6 py-4">
                <p className="font-medium text-gray-900 dark:text-white">
                  {testimonial.user_profiles?.full_name || 'Unknown User'}
                </p>
              </td>
              <td className="px-6 py-4">
                <div className="max-w-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {testimonial.content}
                  </p>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </td>
              <td className="px-6 py-4">
                {testimonial.is_approved ? (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Approved
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    Pending
                  </span>
                )}
                {testimonial.is_featured && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Featured
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(testimonial.created_at)}
                </p>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {!testimonial.is_approved && (
                    <button
                      onClick={() => handleApprove(testimonial.id)}
                      className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {!testimonial.is_approved && (
                    <button
                      onClick={() => {
                        const reason = prompt('Reason for rejection:');
                        if (reason) handleReject(testimonial.id, reason);
                      }}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {testimonial.is_approved && (
                    <button
                      onClick={() => handleFeature(testimonial.id, testimonial.is_featured)}
                      className={`p-2 rounded-lg transition-colors ${
                        testimonial.is_featured
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title={testimonial.is_featured ? 'Unfeature' : 'Feature'}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(testimonial.id)}
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
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} testimonials
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
