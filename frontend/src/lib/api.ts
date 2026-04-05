import axios from 'axios';

// Ensure the baseURL ends with /api
export let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
if (baseURL && !baseURL.endsWith('/api')) {
  baseURL = `${baseURL}/api`;
}

const api = axios.create({
  baseURL,
  // Let Axios automatically determine Content-Type.
  // This is crucial for form data (file uploads) so Axios can automatically attach the boundary token.
});

export default api;