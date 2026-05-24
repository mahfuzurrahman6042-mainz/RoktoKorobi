'use client';

import { Image as ImageIcon, Edit, Trash2, Eye } from 'lucide-react';

interface IllustrationGridProps {
  illustrations: any[];
}

export default function IllustrationGrid({ illustrations }: IllustrationGridProps) {
  const handleDelete = async (illustrationId: string) => {
    if (!confirm('Are you sure you want to delete this illustration?')) return;

    try {
      const response = await fetch('/api/admin/illustrations/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ illustrationId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete illustration');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error deleting illustration:', error);
      alert('Failed to delete illustration');
    }
  };

  const handlePublish = async (illustrationId: string, isPublished: boolean) => {
    try {
      const response = await fetch('/api/admin/illustrations/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ illustrationId, published: !isPublished })
      });

      if (!response.ok) {
        throw new Error('Failed to update illustration');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error updating illustration:', error);
      alert('Failed to update illustration');
    }
  };

  if (illustrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No illustrations found</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Upload your first illustration to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {illustrations.map((illustration) => (
        <div
          key={illustration.id}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden group"
        >
          <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
            <img
              src={illustration.thumbnail_url || illustration.image_url}
              alt={illustration.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => handlePublish(illustration.id, illustration.is_published)}
                className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                title={illustration.is_published ? 'Unpublish' : 'Publish'}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(illustration.id)}
                className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
              {illustration.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {illustration.category || 'Uncategorized'}
            </p>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                illustration.is_published
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {illustration.is_published ? 'Published' : 'Draft'}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(illustration.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
