import { createAdminClient } from '@/lib/supabase/admin';
import IllustrationGrid from '@/components/admin/illustrations/IllustrationGrid';

export default async function IllustrationsPage() {
  const supabase = await createAdminClient();

  const { data: illustrations, error } = await supabase
    .from('illustrations')
    .select(`
      *,
      user_profiles (
        full_name
      )
    `)
    .order('deck_order', { ascending: true })
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Illustration Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Upload, organize, and manage illustration decks.
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Upload Illustration
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <IllustrationGrid illustrations={illustrations || []} />
      </div>
    </div>
  );
}
