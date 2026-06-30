'use client';

import { useState, useEffect } from 'react';
import { database, ref, get, set, update, remove } from '@/lib/firebase';
import { Building2, Plus, Trash2, Edit, MapPin, Phone, Search, Filter } from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  district: string;
  bloodBank: boolean;
  emergency: boolean;
  coordinates?: { lat: number; lng: number };
  createdAt: string;
}

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    district: '',
    bloodBank: false,
    emergency: false
  });

  const districts = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Sylhet', 'Barishal', 'Rangpur', 'Mymensingh'];

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      if (!database) return;
      
      const hospitalsRef = ref(database, 'hospitals');
      const snapshot = await get(hospitalsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const hospitalsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setHospitals(hospitalsArray);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHospital = async () => {
    try {
      if (!database) return;

      if (editingHospital) {
        await update(ref(database, `hospitals/${editingHospital.id}`), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        const newHospitalKey = Date.now().toString();
        await set(ref(database, `hospitals/${newHospitalKey}`), {
          ...formData,
          createdAt: new Date().toISOString()
        });
      }

      setShowModal(false);
      setEditingHospital(null);
      setFormData({ name: '', address: '', phone: '', district: '', bloodBank: false, emergency: false });
      fetchHospitals();
    } catch (error) {
      console.error('Error saving hospital:', error);
    }
  };

  const handleDeleteHospital = async (hospitalId: string) => {
    if (!window.confirm('Are you sure you want to delete this hospital?')) return;

    try {
      if (!database) return;
      
      await remove(ref(database, `hospitals/${hospitalId}`));
      fetchHospitals();
    } catch (error) {
      console.error('Error deleting hospital:', error);
    }
  };

  const openEditModal = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setFormData({
      name: hospital.name,
      address: hospital.address,
      phone: hospital.phone,
      district: hospital.district,
      bloodBank: hospital.bloodBank,
      emergency: hospital.emergency
    });
    setShowModal(true);
  };

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = 
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.phone.includes(searchTerm);
    
    const matchesDistrict = 
      filterDistrict === 'all' || hospital.district === filterDistrict;
    
    return matchesSearch && matchesDistrict;
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
          <h1 className="text-3xl font-bold text-gray-900">Hospital Management</h1>
          <p className="text-gray-600 mt-2">
            Manage hospitals and blood donation centers.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingHospital(null);
            setFormData({ name: '', address: '', phone: '', district: '', bloodBank: false, emergency: false });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={20} />
          Add Hospital
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, address, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Districts</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Total Hospitals</p>
          <p className="text-3xl font-bold text-gray-900">{hospitals.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">With Blood Bank</p>
          <p className="text-3xl font-bold text-red-600">{hospitals.filter(h => h.bloodBank).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Emergency Services</p>
          <p className="text-3xl font-bold text-green-600">{hospitals.filter(h => h.emergency).length}</p>
        </div>
      </div>

      {/* Hospitals Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredHospitals.map((hospital) => (
                <tr key={hospital.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <Building2 size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{hospital.name}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin size={14} />
                          {hospital.address}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900 flex items-center gap-1">
                      <Phone size={14} />
                      {hospital.phone}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{hospital.district}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {hospital.bloodBank && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Blood Bank
                        </span>
                      )}
                      {hospital.emergency && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Emergency
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEditModal(hospital)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit size={18} className="text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteHospital(hospital.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
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
        
        {filteredHospitals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hospitals found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Hospital Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingHospital ? 'Edit Hospital' : 'Add New Hospital'}
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Dhaka Medical College Hospital"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Full address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="+880-1X-XXX-XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select District</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.bloodBank}
                    onChange={(e) => setFormData({ ...formData, bloodBank: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Has Blood Bank</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.emergency}
                    onChange={(e) => setFormData({ ...formData, emergency: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Emergency Services</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingHospital(null);
                  setFormData({ name: '', address: '', phone: '', district: '', bloodBank: false, emergency: false });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHospital}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {editingHospital ? 'Update Hospital' : 'Add Hospital'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
