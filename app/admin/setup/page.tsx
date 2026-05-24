// @ts-nocheck - Supabase type inference issues with Database types
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { assignSuperAdminRole, isFirstUser } from '../actions/assignSuperAdmin';

export default function SuperAdminSetup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSetupAllowed, setIsSetupAllowed] = useState<boolean | null>(null);

  const supabase = createClient();

  const checkSetupAllowed = async () => {
    const allowed = await isFirstUser();
    setIsSetupAllowed(allowed);
    return allowed;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Check if setup is allowed
      const allowed = await checkSetupAllowed();
      if (!allowed) {
        setMessage('Setup is only allowed for the first user. Super Admin already exists.');
        return;
      }

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setMessage(`Error: ${authError.message}`);
        return;
      }

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            full_name: email.split('@')[0], // Use email prefix as name
          });

        if (profileError) {
          setMessage(`Error creating profile: ${profileError.message}`);
          return;
        }

        // Assign Super Admin role
        const { success, error: roleError } = await assignSuperAdminRole(authData.user.id);

        if (success) {
          setMessage('Success! Super Admin account created. You can now login to the admin dashboard.');
        } else {
          setMessage(`Error assigning role: ${roleError}`);
        }
      }
    } catch (error) {
      setMessage('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Super Admin Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Create the first Super Admin account for RoktoKorobi
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Super Admin Account'}
            </button>
          </div>

          {message && (
            <div className={`text-center p-3 rounded-md ${
              message.includes('Success') 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {message}
            </div>
          )}
        </form>

        <div className="text-center">
          <a
            href="/admin"
            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Already have an account? Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
