// src/services/views/services-list-view.jsx
import { useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Container,Grid,Typography,Button,Box,Alert,CircularProgress,Snackbar,Paper,} from '@mui/material';

import { useServices } from '../hooks';
import { ServiceCard, ServiceFormDialog } from '../components';

export function ServicesListView() {
  const { services, loading, error, refetch, createService, updateService, deleteService } = useServices();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleOpenDialog = (service = null) => {
    setEditingService(service);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingService(null);
  };

  const handleSubmit = async (data) => {
    let result;
    
    if (editingService) {
      result = await updateService(editingService.id, data);
    } else {
      result = await createService(data);
    }

    if (result.success) {
      setSnackbar({
        open: true,
        message: editingService ? 'Service updated successfully!' : 'Service created successfully!',
        severity: 'success',
      });
      handleCloseDialog();
    } else {
      setSnackbar({
        open: true,
        message: result.error?.detail || result.error || 'An error occurred',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      const result = await deleteService(id);
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Service deleted successfully!',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Failed to delete service',
          severity: 'error',
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleViewDetails = (service) => {
    // Navigate to service details page
    console.log('View details:', service);
    // router.push(`/services/${service.id}`);
  };

  if (loading && services.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Services Management
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refetch}
              disabled={loading}
            >
              Refresh
            </Button> */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Service
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Services Grid */}
        {services.length === 0 && !loading ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No services found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Get started by creating your first service
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {services.map((service) => (
              <Grid item key={service.id} xs={12} sm={6} md={4}>
                <ServiceCard
                  service={service}
                  onEdit={() => handleOpenDialog(service)}
                  onDelete={handleDelete}
                  onViewDetails={handleViewDetails}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Form Dialog */}
      <ServiceFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        service={editingService}
        isEditing={!!editingService}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}