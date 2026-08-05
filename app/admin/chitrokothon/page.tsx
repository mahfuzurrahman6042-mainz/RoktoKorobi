'use client';

import { useState, useEffect } from 'react';
import { database, ref, get, set, update, remove, uploadImage } from '@/lib/firebase';
import { ImageIcon, Plus, Trash2, Edit, Search, Eye, EyeOff, Upload, X } from 'lucide-react';

interface Chitrokothon {
  id: string;
  title: string;
  titleBn: string;
  caption: string;
  captionBn: string;
  imageUrl: string;
  author: string;
  category: string;
  categoryBn: string;
  published: boolean;
  createdAt: string;
}

export default function ChitrokothonPage() {
  const [chitrokothon, setChitrokothon] = useState<Chitrokothon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingChitrokothon, setEditingChitrokothon] = useState<Chitrokothon | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    titleBn: '',
    caption: '',
    captionBn: '',
    imageUrl: '',
    author: '',
    category: 'Story',
    categoryBn: 'গল্প',
    published: false
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const categories = ['Story', 'Awareness', 'Donor Story', 'Event'];
  const categoryBnMap = {
    'Story': 'গল্প',
    'Awareness': 'সচেতনতা',
    'Donor Story': 'দাতার গল্প',
    'Event': 'ইভেন্ট'
  };

  useEffect(() => {
    fetchChitrokothon();
  }, []);

  const fetchChitrokothon = async () => {
    try {
      if (!database) return;
      
      const chitrokothonRef = ref(database, 'chitrokothon');
      const snapshot = await get(chitrokothonRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const chitrokothonArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          published: data[key].published !== false
        }));
        setChitrokothon(chitrokothonArray);
      }
    } catch (error) {
      console.error('Error fetching chitrokothon:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChitrokothon = async () => {
    try {
      if (!database) return;

      let imageUrl = formData.imageUrl;

      // Upload new image if provided
      if (imageFile) {
        setUploading(true);
        const fileName = `chitrokothon/${Date.now()}_${imageFile.name}`;
        imageUrl = await uploadImage(imageFile, fileName);
        setUploading(false);
      }

      if (editingChitrokothon) {
        await update(ref(database, `chitrokothon/${editingChitrokothon.id}`), {
          ...formData,
          imageUrl,
          categoryBn: categoryBnMap[formData.category as keyof typeof categoryBnMap],
          updatedAt: new Date().toISOString()
        });
      } else {
        const newChitrokothonKey = Date.now().toString();
        await set(ref(database, `chitrokothon/${newChitrokothonKey}`), {
          ...formData,
          imageUrl,
          categoryBn: categoryBnMap[formData.category as keyof typeof categoryBnMap],
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        });
      }

      setShowModal(false);
      setEditingChitrokothon(null);
      setFormData({ title: '', titleBn: '', caption: '', captionBn: '', imageUrl: '', author: '', category: 'Story', categoryBn: 'গল্প', published: false });
      setImageFile(null);
      setImagePreview('');
      fetchChitrokothon();
    } catch (error) {
      console.error('Error saving chitrokothon:', error);
      setUploading(false);
    }
  };

  const handleDeleteChitrokothon = async (chitrokothonId: string) => {
    if (!confirm('Are you sure you want to delete this chitrokothon?')) return;
    
    try {
      if (!database) return;
      await remove(ref(database, `chitrokothon/${chitrokothonId}`));
      fetchChitrokothon();
    } catch (error) {
      console.error('Error deleting chitrokothon:', error);
    }
  };

  const handleTogglePublish = async (chitrokothon: Chitrokothon) => {
    try {
      if (!database) return;
      await update(ref(database, `chitrokothon/${chitrokothon.id}`), {
        published: !chitrokothon.published
      });
      fetchChitrokothon();
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const handleEditChitrokothon = (chitrokothon: Chitrokothon) => {
    setEditingChitrokothon(chitrokothon);
    setFormData({
      title: chitrokothon.title,
      titleBn: chitrokothon.titleBn,
      caption: chitrokothon.caption,
      captionBn: chitrokothon.captionBn,
      imageUrl: chitrokothon.imageUrl,
      author: chitrokothon.author,
      category: chitrokothon.category,
      categoryBn: chitrokothon.categoryBn,
      published: chitrokothon.published
    });
    setImagePreview(chitrokothon.imageUrl);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, imageUrl: '' });
  };

  const filteredChitrokothon = chitrokothon.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.titleBn.includes(searchTerm) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'published' && item.published) ||
                         (filterStatus === 'draft' && !item.published);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#dc2626' }}></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Chitrokothon Management</h1>
        <p className="text-gray-600">Manage illustrated stories and captions</p>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by title, Bengali title, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button
          onClick={() => {
            setEditingChitrokothon(null);
            setFormData({ title: '', titleBn: '', caption: '', captionBn: '', imageUrl: '', author: '', category: 'Story', categoryBn: 'গল্প', published: false });
            setImageFile(null);
            setImagePreview('');
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <Plus size={20} />
          Add Chitrokothon
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bengali Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredChitrokothon.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <ImageIcon className="text-gray-400" size={24} />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{item.caption}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{item.titleBn}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{item.captionBn}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{item.author}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleTogglePublish(item)}
                    className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                      item.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {item.published ? <Eye size={14} /> : <EyeOff size={14} />}
                    {item.published ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditChitrokothon(item)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteChitrokothon(item.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredChitrokothon.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No chitrokothon found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingChitrokothon ? 'Edit Chitrokothon' : 'Add New Chitrokothon'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (English)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Bengali)</label>
                <input
                  type="text"
                  value={formData.titleBn}
                  onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption (English)</label>
                <textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption (Bengali)</label>
                <textarea
                  value={formData.captionBn}
                  onChange={(e) => setFormData({ ...formData, captionBn: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-500 hover:bg-red-50 transition">
                      <Upload size={20} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Choose file or drag and drop</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {imagePreview && (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      Uploading image...
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, categoryBn: categoryBnMap[e.target.value as keyof typeof categoryBnMap] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="published" className="text-sm font-medium text-gray-700">Publish immediately</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingChitrokothon(null);
                  setFormData({ title: '', titleBn: '', caption: '', captionBn: '', imageUrl: '', author: '', category: 'Story', categoryBn: 'গল্প', published: false });
                  setImageFile(null);
                  setImagePreview('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChitrokothon}
                disabled={uploading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : (editingChitrokothon ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
