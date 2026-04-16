'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Donor {
  id: string;
  name: string;
  blood_group: string;
  location: string;
  phone: string;
  age: number;
}

export default function DonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    bloodGroup: '',
    location: '',
  });

  useEffect(() => {
    fetchDonors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [donors, filters]);

  const fetchDonors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonors(data || []);
    } catch (err) {
      console.error('Error fetching donors:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = donors;

    if (filters.bloodGroup) {
      filtered = filtered.filter(d => d.blood_group === filters.bloodGroup);
    }

    if (filters.location) {
      filtered = filtered.filter(d => 
        d.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredDonors(filtered);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ color: '#e53935', fontSize: '2rem', marginBottom: '1rem' }}>
        🔍 Find Blood Donors
      </h1>

      <div style={{
        padding: '1.5rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Filter Donors</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Blood Group
            </label>
            <select
              value={filters.bloodGroup}
              onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            >
              <option value="">All Blood Groups</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Location
            </label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder="Enter location"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading donors...</div>
      ) : filteredDonors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          No donors found matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredDonors.map((donor) => (
            <div
              key={donor.id}
              style={{
                padding: '1.5rem',
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>{donor.name}</h3>
                <span style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e53935',
                  color: 'white',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}>
                  {donor.blood_group}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', color: '#555' }}>
                <div><strong>Age:</strong> {donor.age} years</div>
                <div><strong>Location:</strong> {donor.location}</div>
                <div><strong>Phone:</strong> {donor.phone}</div>
              </div>

              <a
                href={`tel:${donor.phone}`}
                style={{
                  display: 'inline-block',
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold'
                }}
              >
                📞 Call Donor
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
