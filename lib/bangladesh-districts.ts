// Bangladesh Districts with coordinates for location-based matching
export interface District {
  name: string;
  nameBN: string;
  lat: number;
  lng: number;
  division: string;
}

export const bangladeshDistricts: District[] = [
  // Dhaka Division
  { name: 'Dhaka', nameBN: 'ঢাকা', lat: 23.8103, lng: 90.4125, division: 'Dhaka' },
  { name: 'Faridpur', nameBN: 'ফরিদপুর', lat: 23.6065, lng: 89.8408, division: 'Dhaka' },
  { name: 'Gazipur', nameBN: 'গাজীপুর', lat: 24.0023, lng: 90.4264, division: 'Dhaka' },
  { name: 'Gopalganj', nameBN: 'গোপালগঞ্জ', lat: 23.0082, lng: 89.8284, division: 'Dhaka' },
  { name: 'Kishoreganj', nameBN: 'কিশোরগঞ্জ', lat: 24.4389, lng: 90.7842, division: 'Dhaka' },
  { name: 'Madaripur', nameBN: 'মাদারীপুর', lat: 23.1644, lng: 90.1893, division: 'Dhaka' },
  { name: 'Manikganj', nameBN: 'মানিকগঞ্জ', lat: 23.8643, lng: 90.0024, division: 'Dhaka' },
  { name: 'Munshiganj', nameBN: 'মুন্সিগঞ্জ', lat: 23.5458, lng: 90.5292, division: 'Dhaka' },
  { name: 'Narayanganj', nameBN: 'নারায়ণগঞ্জ', lat: 23.6238, lng: 90.4985, division: 'Dhaka' },
  { name: 'Narsingdi', nameBN: 'নরসিংদী', lat: 23.9325, lng: 90.7162, division: 'Dhaka' },
  { name: 'Rajbari', nameBN: 'রাজবাড়ী', lat: 23.7574, lng: 89.9157, division: 'Dhaka' },
  { name: 'Shariatpur', nameBN: 'শরীয়তপুর', lat: 23.4473, lng: 90.3533, division: 'Dhaka' },
  { name: 'Tangail', nameBN: 'টাঙ্গাইল', lat: 24.2514, lng: 89.9181, division: 'Dhaka' },
  
  // Chittagong Division
  { name: 'Chittagong', nameBN: 'চট্টগ্রাম', lat: 22.3569, lng: 91.7832, division: 'Chittagong' },
  { name: 'Bandarban', nameBN: 'বান্দরবান', lat: 22.1956, lng: 92.2186, division: 'Chittagong' },
  { name: 'Brahmanbaria', nameBN: 'ব্রাহ্মণবাড়িয়া', lat: 23.9571, lng: 91.1119, division: 'Chittagong' },
  { name: 'Chandpur', nameBN: 'চাঁদপুর', lat: 23.2365, lng: 90.6708, division: 'Chittagong' },
  { name: 'Comilla', nameBN: 'কুমিল্লা', lat: 23.4607, lng: 91.1809, division: 'Chittagong' },
  { name: 'Coxs Bazar', nameBN: 'কক্সবাজার', lat: 21.4272, lng: 92.0058, division: 'Chittagong' },
  { name: 'Feni', nameBN: 'ফেনী', lat: 23.2448, lng: 91.3984, division: 'Chittagong' },
  { name: 'Khagrachhari', nameBN: 'খাগড়াছড়ি', lat: 23.1257, lng: 91.9836, division: 'Chittagong' },
  { name: 'Lakshmipur', nameBN: 'লক্ষ্মীপুর', lat: 22.9451, lng: 90.8419, division: 'Chittagong' },
  { name: 'Noakhali', nameBN: 'নোয়াখালী', lat: 22.8696, lng: 91.0995, division: 'Chittagong' },
  { name: 'Rangamati', nameBN: 'রাঙ্গামাটি', lat: 22.6354, lng: 92.1805, division: 'Chittagong' },
  
  // Rajshahi Division
  { name: 'Rajshahi', nameBN: 'রাজশাহী', lat: 24.3732, lng: 88.5549, division: 'Rajshahi' },
  { name: 'Bogra', nameBN: 'বগুড়া', lat: 24.8466, lng: 89.3776, division: 'Rajshahi' },
  { name: 'Joypurhat', nameBN: 'জয়পুরহাট', lat: 25.0993, lng: 89.2344, division: 'Rajshahi' },
  { name: 'Naogaon', nameBN: 'নওগাঁ', lat: 24.8189, lng: 88.9351, division: 'Rajshahi' },
  { name: 'Natore', nameBN: 'নাটোর', lat: 24.4247, lng: 88.9863, division: 'Rajshahi' },
  { name: 'Chapainawabganj', nameBN: 'চাঁপাইনবাবগঞ্জ', lat: 24.6378, lng: 88.2786, division: 'Rajshahi' },
  { name: 'Pabna', nameBN: 'পাবনা', lat: 23.9966, lng: 89.2337, division: 'Rajshahi' },
  { name: 'Sirajganj', nameBN: 'সিরাজগঞ্জ', lat: 24.4536, lng: 89.7013, division: 'Rajshahi' },
  
  // Khulna Division
  { name: 'Khulna', nameBN: 'খুলনা', lat: 22.8456, lng: 89.5403, division: 'Khulna' },
  { name: 'Bagerhat', nameBN: 'বাগেরহাট', lat: 22.6511, lng: 89.7859, division: 'Khulna' },
  { name: 'Chuadanga', nameBN: 'চুয়াডাঙা', lat: 23.6412, lng: 88.8452, division: 'Khulna' },
  { name: 'Jessore', nameBN: 'যশোর', lat: 23.1656, lng: 89.2081, division: 'Khulna' },
  { name: 'Jhenaidah', nameBN: 'ঝিনাইদহ', lat: 23.5448, lng: 89.1539, division: 'Khulna' },
  { name: 'Kushtia', nameBN: 'কুষ্টিয়া', lat: 23.9010, lng: 89.1204, division: 'Khulna' },
  { name: 'Magura', nameBN: 'মাগুরা', lat: 23.4846, lng: 89.4179, division: 'Khulna' },
  { name: 'Meherpur', nameBN: 'মেহেরপুর', lat: 23.7622, lng: 88.6324, division: 'Khulna' },
  { name: 'Narail', nameBN: 'নড়াইল', lat: 23.1703, lng: 89.4974, division: 'Khulna' },
  { name: 'Satkhira', nameBN: 'সাতক্ষীরা', lat: 22.7188, lng: 89.0785, division: 'Khulna' },
  
  // Barisal Division
  { name: 'Barisal', nameBN: 'বরিশাল', lat: 22.7010, lng: 90.3531, division: 'Barisal' },
  { name: 'Barguna', nameBN: 'বরগুনা', lat: 22.1683, lng: 90.1255, division: 'Barisal' },
  { name: 'Bhola', nameBN: 'ভোলা', lat: 22.6859, lng: 90.6481, division: 'Barisal' },
  { name: 'Jhalokati', nameBN: 'ঝালকাঠি', lat: 22.6953, lng: 90.1883, division: 'Barisal' },
  { name: 'Patuakhali', nameBN: 'পটুয়াখালী', lat: 22.3593, lng: 90.3298, division: 'Barisal' },
  { name: 'Pirojpur', nameBN: 'পিরোজপুর', lat: 22.5784, lng: 90.0298, division: 'Barisal' },
  
  // Sylhet Division
  { name: 'Sylhet', nameBN: 'সিলেট', lat: 24.9042, lng: 91.8608, division: 'Sylhet' },
  { name: 'Habiganj', nameBN: 'হবিগঞ্জ', lat: 24.3779, lng: 91.4186, division: 'Sylhet' },
  { name: 'Moulvibazar', nameBN: 'মৌলভীবাজার', lat: 24.4820, lng: 91.7775, division: 'Sylhet' },
  { name: 'Sunamganj', nameBN: 'সুনামগঞ্জ', lat: 24.9372, lng: 91.3930, division: 'Sylhet' },
  
  // Rangpur Division
  { name: 'Rangpur', nameBN: 'রংপুর', lat: 25.7439, lng: 89.2752, division: 'Rangpur' },
  { name: 'Dinajpur', nameBN: 'দিনাজপুর', lat: 25.6219, lng: 88.6382, division: 'Rangpur' },
  { name: 'Gaibandha', nameBN: 'গাইবান্ধা', lat: 25.3179, lng: 89.5279, division: 'Rangpur' },
  { name: 'Kurigram', nameBN: 'কুড়িগ্রাম', lat: 25.8056, lng: 89.6424, division: 'Rangpur' },
  { name: 'Lalmonirhat', nameBN: 'লালমনিরহাট', lat: 25.9973, lng: 89.4470, division: 'Rangpur' },
  { name: 'Nilphamari', nameBN: 'নীলফামারী', lat: 25.9360, lng: 88.8535, division: 'Rangpur' },
  { name: 'Panchagarh', nameBN: 'পঞ্চগড়', lat: 26.3431, lng: 88.5549, division: 'Rangpur' },
  { name: 'Thakurgaon', nameBN: 'ঠাকুরগাঁও', lat: 26.0335, lng: 88.4618, division: 'Rangpur' },
  
  // Mymensingh Division
  { name: 'Mymensingh', nameBN: 'ময়মনসিংহ', lat: 24.7471, lng: 90.4203, division: 'Mymensingh' },
  { name: 'Jamalpur', nameBN: 'জামালপুর', lat: 24.9376, lng: 89.9503, division: 'Mymensingh' },
  { name: 'Netrokona', nameBN: 'নেত্রকোনা', lat: 24.8730, lng: 90.7269, division: 'Mymensingh' },
  { name: 'Sherpur', nameBN: 'শেরপুর', lat: 25.0197, lng: 90.0175, division: 'Mymensingh' },
];

// Calculate distance between two coordinates in kilometers
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearest district to given coordinates
export function findNearestDistrict(lat: number, lng: number): District | null {
  let nearest: District | null = null;
  let minDistance = Infinity;

  for (const district of bangladeshDistricts) {
    const distance = calculateDistance(lat, lng, district.lat, district.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = district;
    }
  }

  return nearest;
}

// Get district by name (case-insensitive)
export function getDistrictByName(name: string): District | null {
  return bangladeshDistricts.find(
    d => d.name.toLowerCase() === name.toLowerCase() || 
         d.nameBN === name
  ) || null;
}

// Get all districts in a division
export function getDistrictsByDivision(division: string): District[] {
  return bangladeshDistricts.filter(d => d.division === division);
}
