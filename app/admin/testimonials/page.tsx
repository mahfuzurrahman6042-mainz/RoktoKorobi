'use client';

import { useState, useEffect } from 'react';
import { database, ref, get, set, update, remove } from '@/lib/firebase';
import { MessageSquare, Plus, Trash2, Edit, Search, Check, X, Star } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  nameBn: string;
  bloodGroup: string;
  donations: number;
  quote: string;
  quoteBn: string;
  location: string;
  verified: boolean;
  date: string;
  createdAt: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameBn: '',
    bloodGroup: 'O+',
    donations: 0,
    quote: '',
    quoteBn: '',
    location: '',
    verified: false
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      if (!database) return;
      
      const testimonialsRef = ref(database, 'testimonials');
      const snapshot = await get(testimonialsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const testimonialsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          verified: data[key].verified !== false
        }));
        setTestimonials(testimonialsArray);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTestimonial = async () => {
    try {
      if (!database) return;

      if (editingTestimonial) {
        await update(ref(database, `testimonials/${editingTestimonial.id}`), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        const newTestimonialKey = Date.now().toString();
        await set(ref(database, `testimonials/${newTestimonialKey}`), {
          ...formData,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        });
      }

      setShowModal(false);
      setEditingTestimonial(null);
      setFormData({ name: '', nameBn: '', bloodGroup: 'O+', donations: 0, quote: '', quoteBn: '', location: '', verified: false });
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
    }
  };

  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      if (!database) return;
      
      await remove(ref(database, `testimonials/${testimonialId}`));
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  };

  const toggleVerified = async (testimonial: Testimonial) => {
    try {
      if (!database) return;
      
      await update(ref(database, `testimonials/${testimonial.id}`), {
        verified: !testimonial.verified,
        updatedAt: new Date().toISOString()
      });
      fetchTestimonials();
    } catch (error) {
      console.error('Error toggling verified status:', error);
    }
  };

  const openEditModal = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      nameBn: testimonial.nameBn,
      bloodGroup: testimonial.bloodGroup,
      donations: testimonial.donations,
      quote: testimonial.quote,
      quoteBn: testimonial.quoteBn,
      location: testimonial.location,
      verified: testimonial.verified
    });
    setShowModal(true);
  };

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = 
      testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.nameBn.includes(searchTerm) ||
      testimonial.quote.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'verified' && testimonial.verified) ||
      (filterStatus === 'unverified' && !testimonial.verified);
    
    return matchesSearch && matchesStatus;
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testimonial Management</h1>
          <p className="text-gray-600 mt-2">
            Manage donor testimonials and stories.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTestimonial(null);
            setFormData({ name: '', nameBn: '', bloodGroup: 'O+', donations: 0, quote: '', quoteBn: '', location: '', verified: false });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={20} />
          Add Testimonial
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or quote..."
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
            <option value="all">All Testimonials</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Total Testimonials</p>
          <p className="text-3xl font-bold text-gray-900">{testimonials.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Verified</p>
          <p className="text-3xl font-bold text-green-600">{testimonials.filter(t => t.verified).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Pending Review</p>
          <p className="text-3xl font-bold text-yellow-600">{testimonials.filter(t => !t.verified).length}</p>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTestimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-lg">{testimonial.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.nameBn}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleVerified(testimonial)}
                  className={`p-2 rounded-lg transition-colors ${testimonial.verified ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                  title={testimonial.verified ? 'Unverify' : 'Verify'}
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => openEditModal(testimonial)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit size={18} className="text-gray-500" />
                </button>
                <button
                  onClick={() => handleDeleteTestimonial(testimonial.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 size={18} className="text-red-500" />
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {testimonial.bloodGroup}
                </span>
                <span className="text-sm text-gray-500">{testimonial.donations} donations</span>
              </div>
              <p className="text-sm text-gray-500">{testimonial.location}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-700 text-sm italic">"{testimonial.quote}"</p>
              <p className="text-gray-500 text-sm italic">"{testimonial.quoteBn}"</p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-500">{testimonial.date}</span>
              {testimonial.verified ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Check size={12} className="mr-1" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <X size={12} className="mr-1" />
                  Pending
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTestimonials.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No testimonials found</p>
        </div>
      )}

      {/* Add/Edit Testimonial Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name (English)</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Donor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name (বাংলা)</label>
                  <input
                    type="text"
                    value={formData.nameBn}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="দাতার নাম"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Donations</label>
                  <input
                    type="number"
                    value={formData.donations}
                    onChange={(e) => setFormData({ ...formData, donations: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="City, District"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quote (English)</label>
                <textarea
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Donor's testimonial in English"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quote (বাংলা)</label>
                <textarea
                  value={formData.quoteBn}
                  onChange={(e) => setFormData({ ...formData, quoteBn: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="বাংলায় সাক্ষ্য"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.verified}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm text-gray-700">Mark as verified</span>
              </label>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTestimonial(null);
                  setFormData({ name: '', nameBn: '', bloodGroup: 'O+', donations: 0, quote: '', quoteBn: '', location: '', verified: false });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTestimonial}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
