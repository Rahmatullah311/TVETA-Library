// src/services/components/service-form-dialog.jsx
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
} from '@mui/material';

import { LogoUpload } from './logo-upload';

export function ServiceFormDialog({ open, onClose, onSubmit, service, isEditing }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    logo: null,
  });
  const [errors, setErrors] = useState({});
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || '',
        description: service.description || '',
        logo: service.logo_url || service.logo || null,
      });
      setLogoFile(null);
    } else {
      setFormData({
        title: '',
        description: '',
        logo: null,
      });
      setLogoFile(null);
    }
    setErrors({});
  }, [service]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogoChange = (file) => {
    setLogoFile(file);
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
    } else {
      setFormData(prev => ({ ...prev, logo: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Prepare form data
    const submitData = {
      title: formData.title,
      description: formData.description,
    };
    
    // Add logo if it's a new file
    if (logoFile instanceof File) {
      submitData.logo = logoFile;
    } else if (formData.logo === null && isEditing) {
      // If logo was removed, send null
      submitData.logo = null;
    }
    
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {isEditing ? 'Edit Service' : 'Create New Service'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Logo Upload */}
            <Box>
              <LogoUpload
                value={formData.logo}
                onChange={handleLogoChange}
              />
            </Box>

            {/* Title */}
            <TextField
              autoFocus
              label="Service Title *"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              fullWidth
              required
            />

            {/* Description */}
            <TextField
              label="Description *"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={4}
              fullWidth
              required
            />

            {/* Required fields note */}
            <Alert severity="info" sx={{ mt: 1 }}>
              Fields marked with * are required
            </Alert>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

ServiceFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  service: PropTypes.object,
  isEditing: PropTypes.bool,
};