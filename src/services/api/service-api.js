// src/services/api/service-api.js
import axios from 'axios';


// Base API configuration
const API_BASE_URL = 'http://127.0.0.1:8000/';

const serviceApi = axios.create({
  baseURL: `${API_BASE_URL}api/`,
  timeout: 30000, // Increased for file uploads
  headers: {
    'Accept': 'application/json',
  },
});

// Request interceptor for auth
serviceApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData (axios sets it automatically)
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to get full logo URL
export const getLogoUrl = (logoPath) => {
  if (!logoPath) return null;
  const baseUrl = API_BASE_URL;
  const logoUrl = logoPath.startsWith('http') ? logoPath : `${baseUrl}${logoPath}`;
  return logoUrl;
};

// Service endpoints
export const servicesApi = {
  // Services
  getAll: () => serviceApi.get('services/'),
  getById: (id) => serviceApi.get(`services/${id}/`),
  
  // Create service with FormData for file upload
  create: (data) => {
    if (data.logo && typeof data.logo !== 'string') {
      // If logo is a File object, use FormData
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('logo', data.logo);
      return serviceApi.post('services/', formData);
    }
    return serviceApi.post('services/', data);
  },
  
  // Update service with FormData
  update: (id, data) => {
    if (data.logo && typeof data.logo !== 'string') {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });
      return serviceApi.put(`services/${id}/`, formData);
    }
    return serviceApi.put(`services/${id}/`, data);
  },
  
  patch: (id, data) => serviceApi.patch(`services/${id}/`, data),
  delete: (id) => serviceApi.delete(`services/${id}/`),
  
  // Service Requests
  getRequests: (params) => serviceApi.get('requests/', { params }),
  getMyRequests: () => serviceApi.get('requests/my_requests/'),
  getAssignedRequests: () => serviceApi.get('requests/assigned_to_me/'),
  createRequest: (data) => serviceApi.post('requests/', data),
  updateRequestStatus: (id, status) => serviceApi.patch(`requests/${id}/update_status/`, { status }),
  
  // Users
  getCurrentUser: () => serviceApi.get('users/me/'),
};

export default serviceApi;

