import axios from 'axios';

import { getSession } from 'next-auth/react';

export let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
if (baseURL && !baseURL.endsWith('/api')) {
  baseURL = `${baseURL}/api`;
}

const api = axios.create({
  baseURL,
  timeout: 120000, // 2 minute timeout for analysis tasks
});

api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.apiToken) {
    config.headers.Authorization = `Bearer ${session.apiToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        // Only sign out if the user actually has an active session
        // This prevents infinite loops on public pages
        const { getSession: checkSession, signOut } = await import('next-auth/react');
        const session = await checkSession();
        if (session?.apiToken) {
          signOut({ callbackUrl: '/' });
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;