'use client';

import { useState, useEffect } from 'react';

import { Person } from '@mui/icons-material';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';

import { serviceApi } from '../../serviceProvider/api/index';

export default function ServiceProviderOverview() {
  const [providerCounts, setProviderCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProviderOverview();
  }, []);

  const fetchProviderOverview = async () => {
    try {
      setLoading(true);

      // Fetch all assignments
      const assignments = await serviceApi.getAssignments();

      // Count assignments per provider
      const counts = assignments.reduce((acc, assignment) => {
        const username = assignment.provider_username || 'Unknown';
        const name = assignment.provider_name || username;
        if (!acc[username]) {
          acc[username] = { name, count: 0 };
        }
        acc[username].count += 1;
        return acc;
      }, {});

      // Convert to array
      const countsArray = Object.values(counts);
      setProviderCounts(countsArray);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch provider overview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Typography variant="h4" gutterBottom>
        Service Providers Overview
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : providerCounts.length === 0 ? (
        <Typography>No assignments found.</Typography>
      ) : (
        <Grid container spacing={3}>
          {providerCounts.map((provider) => (
            <Grid item xs={12} sm={6} md={4} key={provider.name}>
              <Paper
                elevation={4}
                style={{
                  height: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '12px',
                  backgroundColor: '#1976d2',
                  color: '#fff',
                  padding: '16px',
                  textAlign: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
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
                <Person fontSize="large" />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {provider.name}
                </Typography>
                <Typography variant="h3">
                  {provider.count} {provider.count === 1 ? 'Assignment' : 'Assignments'}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
}
