import React, { useState, useEffect } from 'react';

import {Box,Alert,Dialog,Button,Select,MenuItem,InputLabel,Typography,DialogTitle,FormControl,DialogContent,DialogActions,CircularProgress,} from '@mui/material';

import { serviceApi } from '../api';

const ServiceProviderAssignmentForm = ({ open, onClose, onSuccess }) => {
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    service: '',
    provider: '',
  });

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      setFormLoading(true);
      const [servicesData, usersData] = await Promise.all([
        serviceApi.getServices(),
        serviceApi.getUsers(),
      ]);
      setServices(servicesData);
      setUsers(usersData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.service || !formData.provider) {
      setError('Please select both service and provider');
      return;
    }

    try {
      setLoading(true);
      await serviceApi.createAssignment(formData);
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ service: '', provider: '' });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Service Provider</DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {formLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Service *</InputLabel>
                <Select
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                  label="Select Service *"
                  required
                >
                  <MenuItem value="">Select a service</MenuItem>
                  {services.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Select Provider *</InputLabel>
                <Select
                  value={formData.provider}
                  onChange={(e) => setFormData({...formData, provider: e.target.value})}
                  label="Select Provider *"
                  required
                >
                  <MenuItem value="">Select a provider</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.username} ({user.email || 'No email'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                * This will assign the selected provider to the selected service
              </Typography>
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || formLoading}
          >
            {loading ? 'Assigning...' : 'Assign Provider'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ServiceProviderAssignmentForm;