// src/services/hooks/use-services.js
import { useState, useEffect, useCallback } from 'react';

import { servicesApi, getLogoUrl } from'../api';

export function useServices() {
  const [data, setData] = useState({
    services: [],
    loading: true,
    error: null,
  });

  const fetchServices = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      const response = await servicesApi.getAll();
      
      // Process services to ensure logo URLs are complete
      const processedServices = response.data.map(service => ({
        ...service,
        logo_url: getLogoUrl(service.logo) || service.logo_url,
      }));
      
      setData(prev => ({ 
        ...prev, 
        services: processedServices, 
        loading: false 
      }));
    } catch (err) {
      setData(prev => ({
        ...prev,
        error: err.response?.data?.detail || err.message || 'Failed to fetch services',
        loading: false,
      }));
    }
  }, []);

  const createService = async (serviceData) => {
    try {
      const response = await servicesApi.create(serviceData);
      
      // Process the new service
      const newService = {
        ...response.data,
        logo_url: getLogoUrl(response.data.logo) || response.data.logo_url,
      };
      
      setData(prev => ({
        ...prev,
        services: [...prev.services, newService],
      }));
      
      return { success: true, data: newService };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || err.message || 'Failed to create service',
      };
    }
  };

  const updateService = async (id, serviceData) => {
    try {
      const response = await servicesApi.update(id, serviceData);
      
      // Process the updated service
      const updatedService = {
        ...response.data,
        logo_url: getLogoUrl(response.data.logo) || response.data.logo_url,
      };
      
      setData(prev => ({
        ...prev,
        services: prev.services.map(service =>
          service.id === id ? updatedService : service
        ),
      }));
      
      return { success: true, data: updatedService };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || err.message || 'Failed to update service',
      };
    }
  };

  const deleteService = async (id) => {
    try {
      await servicesApi.delete(id);
      setData(prev => ({
        ...prev,
        services: prev.services.filter(service => service.id !== id),
      }));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || err.message || 'Failed to delete service',
      };
    }
  };

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    ...data,
    refetch: fetchServices,
    createService,
    updateService,
    deleteService,
  };
}