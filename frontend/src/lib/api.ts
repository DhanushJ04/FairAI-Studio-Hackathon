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

export default api;