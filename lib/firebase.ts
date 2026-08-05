import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, updateProfile, sendPasswordResetEmail, sendEmailVerification, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { getDatabase, Database, ref, set, get, update, onValue, push, remove } from 'firebase/database';
import { getMessaging, Messaging } from 'firebase/messaging';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let database: Database | null = null;
let messaging: Messaging | null = null;
let storage: any = null;

// Initialize Firebase
const initializeFirebase = () => {
  try {
    console.log('Firebase config check:', {
      hasApiKey: !!firebaseConfig.apiKey,
      hasProjectId: !!firebaseConfig.projectId,
      hasAuthDomain: !!firebaseConfig.authDomain,
      apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
      projectId: firebaseConfig.projectId
    });

    // Check if Firebase is properly configured
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.error('Firebase not configured - missing API key or project ID');
      return;
    }

    app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    database = getDatabase(app);
    storage = getStorage(app);

    console.log('Firebase initialized successfully:', {
      hasApp: !!app,
      hasAuth: !!auth,
      hasDatabase: !!database,
      hasStorage: !!storage
    });

    if ('serviceWorker' in navigator) {
      try {
        messaging = getMessaging(app);
      } catch (error) {
        console.log('Messaging not supported in this environment');
      }
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
};

if (typeof window !== 'undefined') {
  initializeFirebase();
}

// Auth helper functions
export const loginUser = async (email: string, password: string, rememberMe: boolean = false) => {
  if (!auth) {
    console.error('Auth not initialized');
    throw new Error('Auth not initialized');
  }

  console.log('Attempting login:', {
    email,
    hasPassword: !!password,
    passwordLength: password.length,
    rememberMe
  });

  try {
    // Set persistence based on remember me checkbox
    if (rememberMe) {
      await setPersistence(auth, browserLocalPersistence); // Persistent across browser sessions
      console.log('Set persistence to browserLocalPersistence');
    } else {
      await setPersistence(auth, browserSessionPersistence); // Cleared when browser closes
      console.log('Set persistence to browserSessionPersistence');
    }

    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login successful:', {
      uid: result.user.uid,
      email: result.user.email,
      emailVerified: result.user.emailVerified
    });
    return result;
  } catch (error: any) {
    console.error('Login error details:', {
      code: error.code,
      message: error.message,
      customData: error.customData
    });
    throw error;
  }
};

export const registerUser = async (email: string, password: string) => {
  if (!auth) throw new Error('Auth not initialized');
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  if (!auth) throw new Error('Auth not initialized');
  return signOut(auth);
};

export const resetPassword = async (email: string) => {
  if (!auth) throw new Error('Auth not initialized');
  return sendPasswordResetEmail(auth, email);
};

export const sendVerificationEmail = async (user: User) => {
  if (!auth) throw new Error('Auth not initialized');
  return sendEmailVerification(user);
};

export const getCurrentUser = (): User | null => {
  return auth?.currentUser || null;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

// Database helper functions
export const saveUserData = async (userId: string, data: any) => {
  if (!database) throw new Error('Database not initialized');
  const userRef = ref(database, `users/${userId}`);
  await set(userRef, {
    ...data,
    updatedAt: new Date().toISOString()
  });
};

export const getUserData = async (userId: string) => {
  if (!database) throw new Error('Database not initialized');
  const userRef = ref(database, `users/${userId}`);
  const snapshot = await get(userRef);
  return snapshot.exists() ? snapshot.val() : null;
};

export const updateUserData = async (userId: string, data: any) => {
  if (!database) throw new Error('Database not initialized');
  const userRef = ref(database, `users/${userId}`);
  await update(userRef, {
    ...data,
    updatedAt: new Date().toISOString()
  });
};

export const listAllDonors = async () => {
  if (!database) throw new Error('Database not initialized');
  const usersRef = ref(database, 'users');
  const snapshot = await get(usersRef);
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  // Filter only users who are donors
  return Object.keys(data)
    .filter(key => data[key].isDonor === true)
    .map(key => ({ 
      id: key, 
      uid: key,
      ...data[key],
      lat: data[key].lat || 23.6850, // Default to Dhaka if no coordinates
      lng: data[key].lng || 90.3563,
      available: data[key].availability !== false
    }));
};

export const listAllHospitals = async () => {
  if (!database) throw new Error('Database not initialized');
  const hospitalsRef = ref(database, 'hospitals');
  const snapshot = await get(hospitalsRef);
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};

// Super Admin functions
export const setSuperAdmin = async (email: string) => {
  if (!database) throw new Error('Database not initialized');
  
  const adminsRef = ref(database, 'admins/super_admin');
  await set(adminsRef, {
    email: email,
    role: 'super_admin',
    createdAt: new Date().toISOString()
  });
  
  return { success: true, email };
};

export const isSuperAdmin = async (email: string): Promise<boolean> => {
  if (!database) throw new Error('Database not initialized');
  
  const adminRef = ref(database, 'admins/super_admin');
  const snapshot = await get(adminRef);
  
  if (!snapshot.exists()) return false;
  
  const adminData = snapshot.val();
  return adminData.email === email;
};

// Activity logging function
export const logActivity = async (action: string, entity: string, entityId: string, performedBy: string, performedByEmail: string, details: string) => {
  if (!database) throw new Error('Database not initialized');
  
  const activityRef = ref(database, 'activityLogs');
  const newActivityKey = Date.now().toString();
  
  await set(ref(database, `activityLogs/${newActivityKey}`), {
    action,
    entity,
    entityId,
    performedBy,
    performedByEmail,
    details,
    timestamp: new Date().toISOString()
  });
};

// Role-based access control functions
export const assignUserRole = async (userId: string, roleId: string, assignedBy: string, assignedByEmail: string) => {
  if (!database) throw new Error('Database not initialized');
  
  await update(ref(database, `users/${userId}`), {
    role: roleId,
    roleAssignedAt: new Date().toISOString(),
    roleAssignedBy: assignedBy
  });
  
  await logActivity('role_assigned', 'user', userId, assignedBy, assignedByEmail, `Assigned role ${roleId} to user`);
  
  return { success: true, roleId };
};

export const getUserRole = async (userId: string): Promise<string | null> => {
  if (!database) throw new Error('Database not initialized');
  
  const userRef = ref(database, `users/${userId}`);
  const snapshot = await get(userRef);
  
  if (!snapshot.exists()) return null;
  
  const userData = snapshot.val();
  return userData.role || null;
};

export const getRolePermissions = async (roleId: string): Promise<string[]> => {
  if (!database) throw new Error('Database not initialized');
  
  const roleRef = ref(database, `roles/${roleId}`);
  const snapshot = await get(roleRef);
  
  if (!snapshot.exists()) return [];
  
  const roleData = snapshot.val();
  return roleData.permissions || [];
};

export const hasPageAccess = async (userId: string, pagePath: string): Promise<boolean> => {
  if (!database) throw new Error('Database not initialized');
  
  // First check if user is super admin
  const userRef = ref(database, `users/${userId}`);
  const userSnapshot = await get(userRef);
  
  if (!userSnapshot.exists()) return false;
  
  const userData = userSnapshot.val();
  const userEmail = userData.email;
  
  // Super admin has access to everything
  const isAdmin = await isSuperAdmin(userEmail);
  if (isAdmin) return true;
  
  // Check role-based permissions
  const roleId = userData.role;
  if (!roleId) return false;
  
  const permissions = await getRolePermissions(roleId);
  return permissions.includes(pagePath) || permissions.includes('/admin/all');
};

export const initializeRoles = async () => {
  if (!database) throw new Error('Database not initialized');
  
  const rolesData = {
    // Board of Advisors
    'medical_advisor': {
      name: 'Medical Advisor',
      category: 'Board of Advisors',
      subcategory: 'Medical Advisors',
      hierarchy: 1,
      permissions: ['/admin/requests', '/admin/hospitals']
    },
    'healthcare_advisor': {
      name: 'Healthcare Advisor',
      category: 'Board of Advisors',
      subcategory: 'Healthcare Advisors',
      hierarchy: 1,
      permissions: ['/admin/requests', '/admin/hospitals']
    },
    'ngo_advisor': {
      name: 'NGO Advisor',
      category: 'Board of Advisors',
      subcategory: 'NGO Advisors',
      hierarchy: 1,
      permissions: ['/admin/partnerships', '/admin/requests']
    },
    'legal_advisor': {
      name: 'Legal Advisor',
      category: 'Board of Advisors',
      subcategory: 'Legal Advisors',
      hierarchy: 1,
      permissions: ['/admin/settings']
    },
    'technology_advisor': {
      name: 'Technology Advisor',
      category: 'Board of Advisors',
      subcategory: 'Technology Advisors',
      hierarchy: 1,
      permissions: ['/admin/settings']
    },
    
    // President's Office
    'president_founder': {
      name: 'President & Founder',
      category: "President's Office",
      subcategory: 'Leadership',
      hierarchy: 2,
      permissions: ['/admin/all']
    },
    'executive_vp': {
      name: 'Executive Vice President',
      category: "President's Office",
      subcategory: 'Leadership',
      hierarchy: 2,
      permissions: ['/admin/all']
    },
    'general_secretary': {
      name: 'General Secretary',
      category: "President's Office",
      subcategory: 'Leadership',
      hierarchy: 2,
      permissions: ['/admin/all']
    },
    'treasurer': {
      name: 'Treasurer',
      category: "President's Office",
      subcategory: 'Leadership',
      hierarchy: 2,
      permissions: ['/admin/finance', '/admin/users', '/admin/activity']
    },
    'chief_of_staff': {
      name: 'Chief of Staff',
      category: "President's Office",
      subcategory: 'Leadership',
      hierarchy: 2,
      permissions: ['/admin/all']
    },
    
    // Executive Council
    'director_operations': {
      name: 'Director of Operations',
      category: 'Executive Council',
      subcategory: 'Directors',
      hierarchy: 3,
      permissions: ['/admin/requests', '/admin/hospitals', '/admin/users', '/admin/activity']
    },
    'director_growth_media': {
      name: 'Director of Growth & Media',
      category: 'Executive Council',
      subcategory: 'Directors',
      hierarchy: 3,
      permissions: ['/admin/blogs', '/admin/testimonials', '/admin/users', '/admin/activity']
    },
    'director_technology': {
      name: 'Director of Technology',
      category: 'Executive Council',
      subcategory: 'Directors',
      hierarchy: 3,
      permissions: ['/admin/settings', '/admin/users', '/admin/activity']
    },
    'director_partnerships': {
      name: 'Director of Partnerships',
      category: 'Executive Council',
      subcategory: 'Directors',
      hierarchy: 3,
      permissions: ['/admin/hospitals', '/admin/users', '/admin/activity']
    },
    'director_hr': {
      name: 'Director of Human Resources',
      category: 'Executive Council',
      subcategory: 'Directors',
      hierarchy: 3,
      permissions: ['/admin/users', '/admin/roles', '/admin/activity']
    },
    'director_research_impact': {
      name: 'Director of Research & Impact',
      category: 'Executive Council',
      subcategory: 'Directors',
      hierarchy: 3,
      permissions: ['/admin/requests', '/admin/blogs', '/admin/activity']
    },
    'director_finance': {
      name: 'Director of Finance',
      category: 'Executive Council',
      subcategory: 'Directors',
      hierarchy: 3,
      permissions: ['/admin/users', '/admin/activity']
    },
    
    // Operations Division
    'blood_request_lead': {
      name: 'Blood Request Management Lead',
      category: 'Divisions',
      subcategory: 'Operations',
      hierarchy: 4,
      permissions: ['/admin/requests']
    },
    'donor_relations_lead': {
      name: 'Donor Relations Lead',
      category: 'Divisions',
      subcategory: 'Operations',
      hierarchy: 4,
      permissions: ['/admin/users']
    },
    'emergency_response_lead': {
      name: 'Emergency Response Lead',
      category: 'Divisions',
      subcategory: 'Operations',
      hierarchy: 4,
      permissions: ['/admin/requests']
    },
    'hospital_coordination_lead': {
      name: 'Hospital Coordination Lead',
      category: 'Divisions',
      subcategory: 'Operations',
      hierarchy: 4,
      permissions: ['/admin/hospitals', '/admin/requests']
    },
    'regional_operations_lead': {
      name: 'Regional Operations Lead',
      category: 'Divisions',
      subcategory: 'Operations',
      hierarchy: 4,
      permissions: ['/admin/requests', '/admin/hospitals']
    },
    
    // Growth & Media Division
    'content_lead': {
      name: 'Content Lead',
      category: 'Divisions',
      subcategory: 'Growth & Media',
      hierarchy: 4,
      permissions: ['/admin/blogs']
    },
    'design_lead': {
      name: 'Design Lead',
      category: 'Divisions',
      subcategory: 'Growth & Media',
      hierarchy: 4,
      permissions: ['/admin/blogs']
    },
    'video_reels_lead': {
      name: 'Video/Reels Lead',
      category: 'Divisions',
      subcategory: 'Growth & Media',
      hierarchy: 4,
      permissions: ['/admin/blogs']
    },
    'social_media_lead': {
      name: 'Social Media Lead',
      category: 'Divisions',
      subcategory: 'Growth & Media',
      hierarchy: 4,
      permissions: ['/admin/blogs', '/admin/testimonials']
    },
    'pr_communications_lead': {
      name: 'PR & Communications Lead',
      category: 'Divisions',
      subcategory: 'Growth & Media',
      hierarchy: 4,
      permissions: ['/admin/blogs', '/admin/testimonials']
    },
    'brand_strategy_lead': {
      name: 'Brand Strategy Lead',
      category: 'Divisions',
      subcategory: 'Growth & Media',
      hierarchy: 4,
      permissions: ['/admin/blogs']
    },
    
    // Technology Division
    'web_development_lead': {
      name: 'Web Development Lead',
      category: 'Divisions',
      subcategory: 'Technology',
      hierarchy: 4,
      permissions: ['/admin/settings']
    },
    'product_lead': {
      name: 'Product Lead',
      category: 'Divisions',
      subcategory: 'Technology',
      hierarchy: 4,
      permissions: ['/admin/settings']
    },
    'data_analytics_lead': {
      name: 'Data & Analytics Lead',
      category: 'Divisions',
      subcategory: 'Technology',
      hierarchy: 4,
      permissions: ['/admin/activity']
    },
    'automation_lead': {
      name: 'Automation Lead',
      category: 'Divisions',
      subcategory: 'Technology',
      hierarchy: 4,
      permissions: ['/admin/settings']
    },
    'cybersecurity_lead': {
      name: 'Cybersecurity Lead',
      category: 'Divisions',
      subcategory: 'Technology',
      hierarchy: 4,
      permissions: ['/admin/settings', '/admin/users']
    },
    
    // Partnerships & Outreach Division
    'hospital_relations_lead': {
      name: 'Hospital Relations Lead',
      category: 'Divisions',
      subcategory: 'Partnerships & Outreach',
      hierarchy: 4,
      permissions: ['/admin/hospitals']
    },
    'ngo_relations_lead': {
      name: 'NGO Relations Lead',
      category: 'Divisions',
      subcategory: 'Partnerships & Outreach',
      hierarchy: 4,
      permissions: ['/admin/hospitals']
    },
    'corporate_relations_lead': {
      name: 'Corporate Relations Lead',
      category: 'Divisions',
      subcategory: 'Partnerships & Outreach',
      hierarchy: 4,
      permissions: ['/admin/hospitals']
    },
    'campus_relations_lead': {
      name: 'Campus Relations Lead',
      category: 'Divisions',
      subcategory: 'Partnerships & Outreach',
      hierarchy: 4,
      permissions: ['/admin/users']
    },
    'community_outreach_lead': {
      name: 'Community Outreach Lead',
      category: 'Divisions',
      subcategory: 'Partnerships & Outreach',
      hierarchy: 4,
      permissions: ['/admin/users']
    },
    
    // Human Resources Division
    'recruitment_lead': {
      name: 'Recruitment Lead',
      category: 'Divisions',
      subcategory: 'Human Resources',
      hierarchy: 4,
      permissions: ['/admin/users']
    },
    'volunteer_management_lead': {
      name: 'Volunteer Management Lead',
      category: 'Divisions',
      subcategory: 'Human Resources',
      hierarchy: 4,
      permissions: ['/admin/users']
    },
    'training_lead': {
      name: 'Training Lead',
      category: 'Divisions',
      subcategory: 'Human Resources',
      hierarchy: 4,
      permissions: ['/admin/users']
    },
    'culture_recognition_lead': {
      name: 'Culture & Recognition Lead',
      category: 'Divisions',
      subcategory: 'Human Resources',
      hierarchy: 4,
      permissions: ['/admin/users']
    },
    'leadership_development_lead': {
      name: 'Leadership Development Lead',
      category: 'Divisions',
      subcategory: 'Human Resources',
      hierarchy: 4,
      permissions: ['/admin/users', '/admin/roles']
    },
    
    // Research & Impact Division
    'data_collection_lead': {
      name: 'Data Collection Lead',
      category: 'Divisions',
      subcategory: 'Research & Impact',
      hierarchy: 4,
      permissions: ['/admin/activity']
    },
    'impact_measurement_lead': {
      name: 'Impact Measurement Lead',
      category: 'Divisions',
      subcategory: 'Research & Impact',
      hierarchy: 4,
      permissions: ['/admin/activity']
    },
    'survey_lead': {
      name: 'Survey Lead',
      category: 'Divisions',
      subcategory: 'Research & Impact',
      hierarchy: 4,
      permissions: ['/admin/testimonials']
    },
    'healthcare_research_lead': {
      name: 'Healthcare Research Lead',
      category: 'Divisions',
      subcategory: 'Research & Impact',
      hierarchy: 4,
      permissions: ['/admin/requests', '/admin/hospitals']
    },
    'policy_research_lead': {
      name: 'Policy Research Lead',
      category: 'Divisions',
      subcategory: 'Research & Impact',
      hierarchy: 4,
      permissions: ['/admin/settings']
    },
    
    // Finance Division
    'budget_lead': {
      name: 'Budget Lead',
      category: 'Divisions',
      subcategory: 'Finance',
      hierarchy: 4,
      permissions: ['/admin/activity']
    },
    'fundraising_lead': {
      name: 'Fundraising Lead',
      category: 'Divisions',
      subcategory: 'Finance',
      hierarchy: 4,
      permissions: ['/admin/users']
    },
    'grant_writing_lead': {
      name: 'Grant Writing Lead',
      category: 'Divisions',
      subcategory: 'Finance',
      hierarchy: 4,
      permissions: ['/admin/users']
    },
    'sponsorship_lead': {
      name: 'Sponsorship Lead',
      category: 'Divisions',
      subcategory: 'Finance',
      hierarchy: 4,
      permissions: ['/admin/users']
    },
    'compliance_lead': {
      name: 'Compliance Lead',
      category: 'Divisions',
      subcategory: 'Finance',
      hierarchy: 4,
      permissions: ['/admin/settings']
    }
  };
  
  await set(ref(database, 'roles'), rolesData);
  
  return { success: true, count: Object.keys(rolesData).length };
};

export const getAllRoles = async () => {
  if (!database) throw new Error('Database not initialized');
  
  const rolesRef = ref(database, 'roles');
  const snapshot = await get(rolesRef);
  
  if (!snapshot.exists()) return [];
  
  const data = snapshot.val();
  return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};

// Storage helper functions
export const uploadImage = async (file: File, path: string) => {
  if (!storage) throw new Error('Storage not initialized');
  
  const imageRef = storageRef(storage, path);
  const snapshot = await uploadBytes(imageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
};

export const deleteImage = async (path: string) => {
  if (!storage) throw new Error('Storage not initialized');
  
  const imageRef = storageRef(storage, path);
  await deleteObject(imageRef);
};

// Messaging helper functions
export const sendMessage = async (senderId: string, receiverId: string, requestId: string, content: string) => {
  if (!database) throw new Error('Database not initialized');
  
  const messagesRef = ref(database, `messages/${requestId}`);
  const newMessageRef = push(messagesRef);
  
  await set(newMessageRef, {
    senderId,
    receiverId,
    requestId,
    content,
    timestamp: new Date().toISOString(),
    read: false
  });
  
  return newMessageRef.key;
};

export const getMessages = (requestId: string, callback: (messages: any[]) => void) => {
  if (!database) throw new Error('Database not initialized');
  
  const messagesRef = ref(database, `messages/${requestId}`);
  
  return onValue(messagesRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const messages = Object.keys(data).map(key => ({ id: key, ...data[key] }));
      callback(messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    } else {
      callback([]);
    }
  });
};

export const markMessageAsRead = async (messageId: string, requestId: string) => {
  if (!database) throw new Error('Database not initialized');
  
  const messageRef = ref(database, `messages/${requestId}/${messageId}`);
  await update(messageRef, { read: true });
};

export const getConversationList = (userId: string, callback: (conversations: any[]) => void) => {
  if (!database) throw new Error('Database not initialized');
  
  const messagesRef = ref(database, 'messages');
  
  return onValue(messagesRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const conversations: any[] = [];
      
      Object.keys(data).forEach(requestId => {
        const requestMessages = Object.values(data[requestId]) as any[];
        const userMessages = requestMessages.filter((msg: any) => 
          msg.senderId === userId || msg.receiverId === userId
        );
        
        if (userMessages.length > 0) {
          const lastMessage = userMessages[userMessages.length - 1];
          const otherUserId = lastMessage.senderId === userId ? lastMessage.receiverId : lastMessage.senderId;
          const unreadCount = userMessages.filter((msg: any) => msg.receiverId === userId && !msg.read).length;
          
          conversations.push({
            requestId,
            otherUserId,
            lastMessage,
            unreadCount,
            timestamp: lastMessage.timestamp
          });
        }
      });
      
      callback(conversations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } else {
      callback([]);
    }
  });
};

export { app, auth, database, messaging, updateProfile, ref, set, get, update, onValue, push, remove };
