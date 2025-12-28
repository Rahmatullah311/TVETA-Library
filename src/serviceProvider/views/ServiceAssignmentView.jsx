import React, { useState, useEffect } from 'react';

import { Add, People, Delete, NoAccounts } from '@mui/icons-material';
import {Box,Grid,Chip,Card,Paper,Alert,Button,Avatar,Divider,Container,Typography,CardHeader,IconButton,CardContent,CircularProgress,} from '@mui/material';

import { serviceApi } from '../api';
import ServiceProviderAssignmentForm from '../components/ServiceProviderAssignmentForm';

const ServiceAssignmentView = () => {
  const [services, setServices] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesData, assignmentsData] = await Promise.all([
        serviceApi.getServices(),
        serviceApi.getAssignments(),
      ]);
      setServices(servicesData);
      setAssignments(assignmentsData);
      setError('');
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentsForService = (serviceId) => assignments.filter(a => a.service === serviceId);

  const handleDelete = async (assignmentId) => {
    if (window.confirm('Are you sure you want to remove this assignment?')) {
      try {
        await serviceApi.deleteAssignment(assignmentId);
        setAssignments(assignments.filter(a => a.id !== assignmentId));
        setError('');
      } catch (err) {
        setError('Failed to remove assignment. Please try again.');
      }
    }
  };

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
          <Typography variant="h4">Service Assignments</Typography>
          <Typography variant="body2" color="text.secondary">
            View which services are assigned to which providers
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenForm(true)}
        >
          New Assignment
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Services with Assignments */}
      <Grid container spacing={3}>
        {services.map((service) => {
          const serviceAssignments = getAssignmentsForService(service.id);
          const hasAssignments = serviceAssignments.length > 0;
          
          return (
            <Grid item xs={12} md={6} key={service.id}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  avatar={
                    service.logo_url ? (
                      <Avatar 
                        src={service.logo_url} 
                        alt={service.title}
                        sx={{ width: 56, height: 56 }}
                      />
                    ) : (
                      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        {service.title.charAt(0).toUpperCase()}
                      </Avatar>
                    )
                  }
                  title={
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="h6">{service.title}</Typography>
                      <Chip
                        label={`${serviceAssignments.length} provider(s)`}
                        color={hasAssignments ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                  }
                  subheader={
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {service.description}
                    </Typography>
                  }
                />
                
                <Divider />
                
                <CardContent>
                  {hasAssignments ? (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Assigned Providers:
                      </Typography>
                      
                      <Box mt={2}>
                        {serviceAssignments.map((assignment) => (
                          <Paper 
                            key={assignment.id} 
                            sx={{ 
                              p: 2, 
                              mb: 1, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between' 
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                <People />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  Provider #{assignment.provider}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Assignment ID: {assignment.id}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDelete(assignment.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Paper>
                        ))}
                      </Box>
                    </Box>
                  ) : (
                    <Box textAlign="center" py={3}>
                      <NoAccounts sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Providers Assigned
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        This service has no providers assigned yet.
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Add />}
                        onClick={() => setOpenForm(true)}
                      >
                        Assign a Provider
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Form Dialog */}
      <ServiceProviderAssignmentForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={fetchData}
      />
    </Container>
  );
};

export default ServiceAssignmentView;