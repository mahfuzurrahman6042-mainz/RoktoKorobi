// Simple script to set a user as Super Admin
// Run with: node scripts/set-super-admin.js

const firebaseConfig = {
  apiKey: "AIzaSyCnK13W_RIhqg8HwLFAnpLXtXcuHUlPZWA",
  authDomain: "roktokorobi-ea822.firebaseapp.com",
  databaseURL: "https://roktokorobi-ea822-default-rtdb.firebaseio.com",
  projectId: "roktokorobi-ea822",
  storageBucket: "roktokorobi-ea822.firebasestorage.app",
  messagingSenderId: "837825810640",
  appId: "1:837825810640:web:6fdb6fff7c44b8f3788ed5"
};

// Initialize Firebase
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function setSuperAdmin(email) {
  try {
    const adminsRef = ref(database, 'admins/super_admin');
    await set(adminsRef, {
      email: email,
      role: 'super_admin',
      createdAt: new Date().toISOString()
    });
    
    console.log(`✅ Success: ${email} has been set as Super Admin`);
    console.log(`Database path: admins/super_admin`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting super admin:', error);
    process.exit(1);
  }
}

// Set the user as Super Admin
console.log('Script started...');
const email = 'mahfuzurrahman6042@gmail.com';
setSuperAdmin(email);
