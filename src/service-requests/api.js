import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const serviceRequestApi = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

serviceRequestApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (!(config.data instanceof FormData)) config.headers['Content-Type'] = 'application/json';
    return config;
  },

  (error) => Promise.reject(error)
);


export const requestsApi = {
  create: (data) => serviceRequestApi.post('requests/', data, {
    headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('jwt_access_token')}`,
    }
  }),
  getAll: (params) => serviceRequestApi.get('requests/', { params }),
  getMyRequests: () => serviceRequestApi.get('requests/my_requests/'),
  getAssignedRequests: () => serviceRequestApi.get('requests/assigned_to_me/'),
  getById: (id) => serviceRequestApi.get(`requests/${id}/`),
  update: (id, data) => 
  serviceRequestApi.patch(`requests/${id}/`, data, {
    headers: {
      'Authorization': `Bearer ${sessionStorage.getItem('jwt_access_token')}`,
    },
  }),

  delete: (id) => serviceRequestApi.delete(`requests/${id}/`),
};

// backward compatible named export
export const createServiceRequest = (data) => requestsApi.create(data);

export default serviceRequestApi;


