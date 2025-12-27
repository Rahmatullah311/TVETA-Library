import React, { useState, useEffect } from 'react';
// Import Typography from MUI
import {
  Container,
  Paper,
  Typography,  // Make sure this is imported
  Button,
  Box,
  CircularProgress,
  Alert,
  TextField,
  Grid,
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import ServiceProviderCard from '../components/ServiceProviderCard';
import ServiceProviderAssignmentForm from '../components/ServiceProviderAssignmentForm';
import { serviceApi } from '../api';

const ServiceProviderView = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openForm, setOpenForm] = useState(false);

  // useEffect(() => {
  //   fetchAssignments();
  // }, []);

  // const fetchAssignments = async () => {
  //   try {
  //     setLoading(true);
  //     const data = await serviceApi.getAssignments();
  //     setAssignments(data);
  //     setError('');
  //   } catch (err) {
  //     setError('Failed to load assignments. Please try again.');
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };



  // In ServiceProviderView.jsx, after fetching assignments
useEffect(() => {
  fetchAssignments();
}, []);

const fetchAssignments = async () => {
  try {
    setLoading(true);
    const data = await serviceApi.getAssignments();
    console.log('Assignments data (check for username):', data);
    
    // Log the first assignment to see structure
    if (data.length > 0) {
      console.log('First assignment structure:', data[0]);
      console.log('Available keys:', Object.keys(data[0]));
    }
    
    setAssignments(data);
  } catch (err) {
    console.error('Full error:', err);
    setError('Failed to load assignments. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this assignment?')) {
      try {
        await serviceApi.deleteAssignment(id);
        setAssignments(assignments.filter(a => a.id !== id));
        setError('');
      } catch (err) {
        setError('Failed to delete assignment. Please try again.');
      }
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    const providerName = assignment.provider_name?.toLowerCase() || '';
    const serviceTitle = assignment.service_title?.toLowerCase() || '';
    const username = assignment.provider_username?.toLowerCase() || '';
    
    return (
      providerName.includes(term) ||
      serviceTitle.includes(term) ||
      username.includes(term)
    );
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4">Service Providers</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage service provider assignments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenForm(true)}
        >
          Assign Provider
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <TextField
        fullWidth
        label="Search by name, service, or username"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
        }}
      />

      {/* Statistics */}
      <Box display="flex" gap={2} mb={3}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" color="primary">
            {assignments.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Assignments
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" color="success.main">
            {new Set(assignments.map(a => a.provider)).size}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Unique Providers
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" color="warning.main">
            {new Set(assignments.map(a => a.service)).size}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Services with Providers
          </Typography>
        </Paper>
      </Box>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No service provider assignments yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Assign your first provider to a service
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenForm(true)}
          >
            Create First Assignment
          </Button>
        </Paper>
      ) : filteredAssignments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No assignments match your search
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredAssignments.map((assignment) => (
            <Grid item xs={12} key={assignment.id}>
              <ServiceProviderCard
                assignment={assignment}
                onDelete={handleDelete}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Form Dialog */}
      <ServiceProviderAssignmentForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={fetchAssignments}
      />
    </Container>
  );
};

export default ServiceProviderView;