'use client';

import { useState, useEffect } from 'react';

import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { Build, FiberNew, CheckCircle, HourglassEmpty } from '@mui/icons-material';

import { servicesApi } from '../../services/api/service-api';

export default function ServiceStatusOverview() {
  const [serviceCounts, setServiceCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServiceCounts();
  }, []);

  const fetchServiceCounts = async () => {
    try {
      setLoading(true);
      const response = await servicesApi.getAll(); // fetch all services
      const data = response.data;

      // Count by status or type (you can customize)
      const counts = data.reduce((acc, service) => {
        const status = service.status || 'unknown'; // adjust if your services have different fields
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      setServiceCounts(counts);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch service overview');
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    active: { label: 'Active Services', color: '#4fc3f7', icon: <Build fontSize="large" /> },
    inactive: { label: 'Inactive Services', color: '#90a4ae', icon: <HourglassEmpty fontSize="large" /> },
    new: { label: 'New Services', color: '#81c784', icon: <FiberNew fontSize="large" /> },
    unknown: { label: 'All Services', color: '#bdbdbd', icon: <CheckCircle fontSize="large" /> },
  };

  const statusOrder = ['new', 'active', 'inactive', 'unknown'];

  return (
    <div style={{ padding: '24px' }}>
      <Typography variant="h4" gutterBottom>
        Services Overview
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={3}>
          {statusOrder.map((status) => {
            const count = serviceCounts[status] || 0;
            const config = statusConfig[status] || statusConfig['unknown'];

            return (
              <Grid item xs={12} sm={6} md={3} key={status}>
                <Paper
                  elevation={4}
                  style={{
                    height: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '12px',
                    backgroundColor: config.color,
                    color: '#fff',
                    padding: '16px',
                    textAlign: 'center',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {config.icon}
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {config.label}
                  </Typography>
                  <Typography variant="h3">{count}</Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </div>
  );
}
