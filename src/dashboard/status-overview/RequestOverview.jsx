'use client';

import { useState, useEffect } from 'react';

import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { DoneAll, FiberNew, PlayArrow, Visibility, CheckCircle, HourglassEmpty } from '@mui/icons-material'; 

import { requestsApi } from '../../service-requests/api';

export default function StatusOverviewPage() {
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatusCounts();
  }, []);

  const fetchStatusCounts = async () => {
    try {
      setLoading(true);
      const response = await requestsApi.getAll();
      const data = response.data;

      const counts = data.reduce((acc, req) => {
        const status = req.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      setStatusCounts(counts);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch status overview');
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    new: { label: 'NEW Requests', color: '#4fc3f7', icon: <FiberNew fontSize="large" /> },
    pending: { label: 'PENDING Requests', color: '#ba68c8', icon: <HourglassEmpty fontSize="large" /> },
    viewed: { label: 'VIEWED Requests', color: '#81c784', icon: <Visibility fontSize="large" /> },
    in_progress: { label: 'IN PROGRESS Requests', color: '#ffb74d', icon: <PlayArrow fontSize="large" /> },
    completed: { label: 'COMPLETED Requests', color: '#90a4ae', icon: <DoneAll fontSize="large" /> },
    approved: { label: 'APPROVED Requests', color: '#388e3c', icon: <CheckCircle fontSize="large" /> },
    unknown: { label: 'UNKNOWN Requests', color: '#bdbdbd', icon: <CheckCircle fontSize="large" /> },
  };

  const statusOrder = ['new', 'pending', 'viewed', 'in_progress', 'completed', 'approved', 'unknown'];

  return (
    <div style={{ padding: '24px' }}>
      <Typography variant="h4" gutterBottom>
        Request Overview
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
            const count = statusCounts[status] || 0;
            const config = statusConfig[status] || statusConfig['unknown'];

            return (
              <Grid item xs={12} sm={6} md={4} key={status}>
                <Paper
                  elevation={4}
                  style={{
                    height: '200px', // uniform height
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
