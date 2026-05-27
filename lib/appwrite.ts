import { Client, Account, Databases, ID } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6a147b080028f1362954')
  .setLocale('en-US');

export const account = new Account(client);
export const databases = new Databases(client);

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a147f7000179146f157';
export const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || 'donors_';

// Auth helper functions
export const loginUser = async (email: string, password: string) => {
  return account.createEmailPasswordSession(email, password);
};

export const registerUser = async (email: string, password: string, name: string) => {
  return account.create(ID.unique(), email, password, name);
};

export const logoutUser = async () => {
  return account.deleteSession('current');
};

export const getCurrentUser = async () => {
  return account.get();
};

// Database helper functions
export const saveUserData = async (userId: string, data: any) => {
  return databases.createDocument(
    DATABASE_ID,
    COLLECTION_ID,
    userId,
    {
      ...data,
      updatedAt: new Date().toISOString()
    }
  );
};

export const getUserData = async (userId: string) => {
  return databases.getDocument(
    DATABASE_ID,
    COLLECTION_ID,
    userId
  );
};

export const updateUserData = async (userId: string, data: any) => {
  return databases.updateDocument(
    DATABASE_ID,
    COLLECTION_ID,
    userId,
    {
      ...data,
      updatedAt: new Date().toISOString()
    }
  );
};

export const listAllDonors = async () => {
  return databases.listDocuments(
    DATABASE_ID,
    COLLECTION_ID
  );
};

export { client, ID };
