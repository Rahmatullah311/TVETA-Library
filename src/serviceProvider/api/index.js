import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

// Get JWT token from localStorage
const getToken = () => {
  // Check common JWT token storage locations
  return localStorage.getItem('access_token') || 
         localStorage.getItem('token') || 
         localStorage.getItem('jwt') ||
         localStorage.getItem('auth_token');
};

// Create axios instance with default headers
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // For JWT
      // OR config.headers.Authorization = `JWT ${token}`; // Some setups use "JWT" instead of "Bearer"
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const serviceApi = {
  // Use the api instance (with interceptor) for all requests
  getUsers: async () => {
    try {
      console.log('Fetching users with JWT token:', getToken() ? 'Token found' : 'No token');
      const response = await api.get('/auth/users/');
      console.log('Users fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('JWT auth error:', error.response?.data || error.message);
      return [];
    }
  },

  getAssignments: async () => {
    try {
      const response = await api.get('/api/assignments/');
      
      // Fetch user details for each assignment
      const assignmentsWithDetails = await Promise.all(
        response.data.map(async (assignment) => {
          try {
            // Get user details
            const userResponse = await api.get(`/auth/users/${assignment.provider}/`);
            const user = userResponse.data;
            
            // Get service details
            const serviceResponse = await api.get(`/api/services/${assignment.service}/`);
            const service = serviceResponse.data;
            
            return {
              ...assignment,
              provider_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
              provider_username: user.username,
              provider_email: user.email,
              service_title: service.title,
            };
          } catch (err) {
            console.error(`Failed to fetch details for assignment ${assignment.id}:`, err);
            return assignment;
          }
        })
      );
      
      return assignmentsWithDetails;
    } catch (error) {
      console.error('Error fetching assignments:', error.response?.data || error.message);
      return [];
    }
  },

  createAssignment: async (data) => {
    try {
      const response = await api.post('/api/assignments/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating assignment:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteAssignment: async (id) => {
    try {
      await api.delete(`/api/assignments/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting assignment:', error.response?.data || error.message);
      throw error;
    }
  },

  getServices: async () => {
    try {
      const response = await api.get('/api/services/');
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error.response?.data || error.message);
      return [];
    }
  },
};