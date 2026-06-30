// Seed script for Firebase Realtime Database
// Run with: node scripts/seed.js

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get } = require('firebase/database');

// Firebase configuration - load from environment or use defaults
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'your_api_key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'your_project.firebaseapp.com',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://your_project.firebaseio.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'your_project_id',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'your_project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'your_sender_id',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'your_app_id'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Sample hospitals data
const hospitals = [
  {
    id: 'hosp_1',
    name: 'Dhaka Medical College Hospital',
    address: 'Secretariat Road, Dhaka 1000',
    phone: '+880-2-55165088',
    district: 'Dhaka',
    bloodBank: true,
    emergency: true,
    coordinates: { lat: 23.7259, lng: 90.3971 }
  },
  {
    id: 'hosp_2',
    name: 'Bangabandhu Sheikh Mujib Medical University',
    address: 'Shaheed Sheikh Abu Naser Sarak, Dhaka',
    phone: '+880-2-9661051',
    district: 'Dhaka',
    bloodBank: true,
    emergency: true,
    coordinates: { lat: 23.7384, lng: 90.3892 }
  },
  {
    id: 'hosp_3',
    name: 'Chittagong Medical College Hospital',
    address: 'KB Fazlul Kader Road, Chittagong',
    phone: '+880-31-619400',
    district: 'Chattogram',
    bloodBank: true,
    emergency: true,
    coordinates: { lat: 22.3591, lng: 91.8215 }
  },
  {
    id: 'hosp_4',
    name: 'Rajshahi Medical College Hospital',
    address: 'Rajshahi',
    phone: '+880-721-772150',
    district: 'Rajshahi',
    bloodBank: true,
    emergency: true,
    coordinates: { lat: 24.3732, lng: 88.5866 }
  },
  {
    id: 'hosp_5',
    name: 'Khulna Medical College Hospital',
    address: 'Khulna',
    phone: '+880-41-722000',
    district: 'Khulna',
    bloodBank: true,
    emergency: true,
    coordinates: { lat: 22.8456, lng: 89.5403 }
  },
  {
    id: 'hosp_6',
    name: 'Sylhet MAG Osmani Medical College Hospital',
    address: 'Sylhet',
    phone: '+880-821-710221',
    district: 'Sylhet',
    bloodBank: true,
    emergency: true,
    coordinates: { lat: 24.9045, lng: 91.8607 }
  },
  {
    id: 'hosp_7',
    name: 'Barishal Medical College Hospital',
    address: 'Barishal',
    phone: '+880-431-65444',
    district: 'Barishal',
    bloodBank: true,
    emergency: true,
    coordinates: { lat: 22.7010, lng: 90.3531 }
  },
  {
    id: 'hosp_8',
    name: 'Rangpur Medical College Hospital',
    address: 'Rangpur',
    phone: '+880-521-62274',
    district: 'Rangpur',
    bloodBank: true,
    emergency: true,
    coordinates: { lat: 25.7439, lng: 89.2477 }
  },
  {
    id: 'hosp_9',
    name: 'Mymensingh Medical College Hospital',
    address: 'Mymensingh',
    phone: '+880-91-66600',
    district: 'Mymensingh',
    bloodBank: true,
    emergency: true,
    coordinates: { lat: 24.7471, lng: 90.4203 }
  },
  {
    id: 'hosp_10',
    name: 'Square Hospital',
    address: '18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka',
    phone: '+880-2-8159444',
    district: 'Dhaka',
    bloodBank: true,
    emergency: true,
    coordinates: { lat: 23.7529, lng: 90.3814 }
  }
];

// Sample blog posts
const blogPosts = [
  {
    id: 'blog_1',
    title: 'Why Blood Donation is Important',
    titleBn: 'রক্তদান কেন গুরুত্বপূর্ণ',
    excerpt: 'Blood donation saves lives. Learn about the impact of donating blood and how you can help.',
    excerptBn: 'রক্তদান জীবন বাঁচায়। রক্তদানের প্রভাব এবং কীভাবে আপনি সাহায্য করতে পারেন তা জানুন।',
    content: 'Every year, millions of people need blood transfusions due to accidents, surgeries, and medical conditions. By donating blood, you can save up to three lives with a single donation. The process is safe, quick, and virtually painless. Regular blood donation also has health benefits for donors, including reduced risk of heart disease and improved cardiovascular health.',
    contentBn: 'প্রতি বছর, দুর্ঘটনা, অস্ত্রোপচার এবং চিকিৎসা সংক্রান্ত কারণে লক্ষ লক্ষ মানুষের রক্ত সঞ্চালনের প্রয়োজন হয়। রক্ত দান করে আপনি একটি দানে তিনটি পর্যন্ত জীবন বাঁচাতে পারেন। প্রক্রিয়াটি নিরাপদ, দ্রুত এবং প্রায় ব্যথাহীন। নিয়মিত রক্তদান দাতাদের জন্য স্বাস্থ্য সুবিধাও রয়েছে, যার মধ্যে হৃদরোগের ঝুঁকি কমে যাওয়া এবং হৃদয়ের স্বাস্থ্যের উন্নতি অন্তর্ভুক্ত।',
    author: 'Dr. Rahman',
    date: '2024-01-15',
    category: 'Health',
    categoryBn: 'স্বাস্থ্য',
    image: '/blog/blood-donation.jpg'
  },
  {
    id: 'blog_2',
    title: 'Who Can Donate Blood?',
    titleBn: 'কারা রক্ত দিতে পারেন?',
    excerpt: 'Learn about the eligibility criteria for blood donation and find out if you can become a donor.',
    excerptBn: 'রক্তদানের যোগ্যতার মানদণ্ড সম্পর্কে জানুন এবং দেখুন আপনি কি দাতা হতে পারেন।',
    content: 'To donate blood, you must be between 18-65 years old, weigh at least 50kg, and be in good health. You should not have any serious illnesses or have had recent tattoos or piercings. Regular donors can donate every 56 days (8 weeks). The entire process takes about 10-15 minutes, and you can resume normal activities immediately after donation.',
    contentBn: 'রক্ত দান করতে, আপনার বয়স ১৮-৬৫ বছরের মধ্যে হতে হবে, ওজন কমপক্ষে ৫০ কেজি হতে হবে এবং সুস্থ থাকতে হবে। আপনার কোনো গুরুতর রোগ থাকা উচিত নয় বা সাম্প্রতিক ট্যাটু বা পিয়ার্সিং হওয়া উচিত নয়। নিয়মিত দাতারা প্রতি ৫৬ দিনে (৮ সপ্তাহ) রক্ত দিতে পারেন। সম্পূর্ণ প্রক্রিয়াটি প্রায় ১০-১৫ মিনিট সময় নেয় এবং দানের পরে আপনি সাধারণ কার্যকলাপে অবিলম্বে ফিরে যেতে পারেন।',
    author: 'Dr. Fatema',
    date: '2024-01-20',
    category: 'Education',
    categoryBn: 'শিক্ষা',
    image: '/blog/eligibility.jpg'
  },
  {
    id: 'blog_3',
    title: 'Blood Donation Process: What to Expect',
    titleBn: 'রক্তদান প্রক্রিয়া: কী আশা করবেন',
    excerpt: 'A step-by-step guide to the blood donation process, from registration to recovery.',
    excerptBn: 'নিবন্ধন থেকে পুনরুদ্ধার পর্যন্ত রক্তদান প্রক্রিয়ার ধাপে ধাপে নির্দেশিকা।',
    content: 'The blood donation process begins with registration and a health screening. A small amount of blood is taken to check your hemoglobin levels. If eligible, you proceed to the donation area where about 450ml of blood is collected. After donation, you rest briefly and enjoy refreshments. The entire process takes about an hour from arrival to departure.',
    contentBn: 'রক্তদান প্রক্রিয়া নিবন্ধন এবং স্বাস্থ্য পরীক্ষার মাধ্যমে শুরু হয়। আপনার হিমোগ্লোবিন স্তর পরীক্ষা করতে অল্প পরিমাণে রক্ত নেওয়া হয়। যোগ্য হলে, আপনি দান এলাকায় যান যেখানে প্রায় ৪৫০ মিলি রক্ত সংগ্রহ করা হয়। দানের পরে, আপনি সংক্ষিপ্তভাবে বিশ্রাম নিন এবং রিফ্রেশমেন্ট উপভোগ করুন। আগমন থেকে প্রস্থান পর্যন্ত সম্পূর্ণ প্রক্রিয়াটি প্রায় এক ঘণ্টা সময় নেয়।',
    author: 'Nurse Ayesha',
    date: '2024-01-25',
    category: 'Process',
    categoryBn: 'প্রক্রিয়া',
    image: '/blog/process.jpg'
  }
];

// Sample testimonials
const testimonials = [
  {
    id: 'test_1',
    name: 'Ahmed Hossain',
    nameBn: 'আহমেদ হোসেন',
    bloodGroup: 'O+',
    donations: 15,
    quote: 'I have been donating blood for 5 years now. It feels amazing to know that my blood has saved lives. RoktoKorobi made it so easy to find people who need help.',
    quoteBn: 'আমি ৫ বছর ধরে রক্ত দিচ্ছি। আমার রক্ত জীবন বাঁচিয়েছে এটি জেনে অবিশ্বাস্য অনুভূতি হয়। রক্তকরবী সাহায্যের প্রয়োজনে থাকা মানুষদের খুঁজে পাওয়া এত সহজ করে দিয়েছে।',
    location: 'Dhaka',
    verified: true,
    date: '2024-01-10'
  },
  {
    id: 'test_2',
    name: 'Fatema Akter',
    nameBn: 'ফাতেমা আক্তার',
    bloodGroup: 'A+',
    donations: 8,
    quote: 'When my father needed blood urgently, RoktoKorobi connected us with donors within hours. This platform is truly life-saving.',
    quoteBn: 'যখন আমার বাবার জরুরি রক্তের প্রয়োজন ছিল, রক্তকরবী কয়েক ঘণ্টার মধ্যে আমাদের দাতাদের সাথে যুক্ত করেছিল। এই প্ল্যাটফর্মটি সত্যিই জীবন বাঁচায়।',
    location: 'Chattogram',
    verified: true,
    date: '2024-01-12'
  },
  {
    id: 'test_3',
    name: 'Rafiqul Islam',
    nameBn: 'রফিকুল ইসলাম',
    bloodGroup: 'B+',
    donations: 22,
    quote: 'As a regular donor, I appreciate how RoktoKorobi makes the process seamless. The app is user-friendly and the response time is incredible.',
    quoteBn: 'একজন নিয়মিত দাতা হিসেবে, আমি প্রশংসা করি কীভাবে রক্তকরবী প্রক্রিয়াটি সহজতর করে। অ্যাপটি ব্যবহারকারী-বান্ধব এবং প্রতিক্রিয়া সময় অবিশ্বাস্য।',
    location: 'Sylhet',
    verified: true,
    date: '2024-01-08'
  }
];

// Sample illustrations (for Chitrokothon section)
const illustrations = [
  {
    id: 'ill_1',
    title: 'The Gift of Life',
    titleBn: 'জীবনের উপহার',
    description: 'A heartwarming story of how one donation saved three lives',
    descriptionBn: 'কীভাবে একটি দান তিনটি জীবন বাঁচিয়েছে তার একটি হৃদয়স্পর্শী গল্প',
    imageUrl: '/illustrations/gift-of-life.jpg',
    author: 'Artist Karim',
    date: '2024-01-05'
  },
  {
    id: 'ill_2',
    title: 'Every Drop Counts',
    titleBn: 'প্রতিটি ফোঁটা গুরুত্বপূর্ণ',
    description: 'Visual journey of blood from donor to recipient',
    descriptionBn: 'দাতা থেকে গ্রহীতা পর্যন্ত রক্তের দৃশ্যমান যাত্রা',
    imageUrl: '/illustrations/every-drop-counts.jpg',
    author: 'Artist Nasreen',
    date: '2024-01-07'
  }
];

// Function to seed data
async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Seed hospitals
    console.log('🏥 Seeding hospitals...');
    for (const hospital of hospitals) {
      await set(ref(db, `hospitals/${hospital.id}`), hospital);
      console.log(`   ✓ Added: ${hospital.name}`);
    }

    // Seed blog posts
    console.log('\n📝 Seeding blog posts...');
    for (const post of blogPosts) {
      await set(ref(db, `blogPosts/${post.id}`), post);
      console.log(`   ✓ Added: ${post.title}`);
    }

    // Seed testimonials
    console.log('\n💬 Seeding testimonials...');
    for (const testimonial of testimonials) {
      await set(ref(db, `testimonials/${testimonial.id}`), testimonial);
      console.log(`   ✓ Added: ${testimonial.name}`);
    }

    // Seed illustrations
    console.log('\n🎨 Seeding illustrations...');
    for (const illustration of illustrations) {
      await set(ref(db, `illustrations/${illustration.id}`), illustration);
      console.log(`   ✓ Added: ${illustration.title}`);
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Hospitals: ${hospitals.length}`);
    console.log(`   - Blog Posts: ${blogPosts.length}`);
    console.log(`   - Testimonials: ${testimonials.length}`);
    console.log(`   - Illustrations: ${illustrations.length}`);

  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    console.error('\nMake sure your Firebase credentials are set in .env.local');
    process.exit(1);
  }
}

// Check if data already exists
async function checkExistingData() {
  try {
    const hospitalsSnapshot = await get(ref(db, 'hospitals'));
    if (hospitalsSnapshot.exists()) {
      console.log('⚠️  Warning: Hospitals data already exists in the database.');
      console.log('   Existing data will be overwritten.\n');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking existing data:', error);
    return false;
  }
}

// Main execution
(async () => {
  console.log('========================================');
  console.log('   RoktoKorobi Database Seeding Script');
  console.log('========================================\n');

  await checkExistingData();
  await seedDatabase();

  console.log('\n========================================');
  console.log('   Seeding Complete!');
  console.log('========================================\n');
})();
