'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import {
  DoneAll,
  FiberNew,
  PlayArrow,
  Visibility,
  CheckCircle,
  HourglassEmpty,
} from '@mui/icons-material';

import { requestsApi } from '../../service-requests/api';

export default function StatusOverviewPage() {
  const { t } = useTranslation();

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
      setError(t('loadError'));
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    new: {
      label: t('NEWRequests'),
      color: '#4fc3f7',
      icon: <FiberNew fontSize="large" />,
    },
    pending: {
      label: t('PENDINGRequests'),
      color: '#ba68c8',
      icon: <HourglassEmpty fontSize="large" />,
    },
    viewed: {
      label: t('VIEWEDRequests'),
      color: '#81c784',
      icon: <Visibility fontSize="large" />,
    },
    in_progress: {
      label: t('INPROGRESSRequests'),
      color: '#ffb74d',
      icon: <PlayArrow fontSize="large" />,
    },
    completed: {
      label: t('COMPLETEDRequests'),
      color: '#90a4ae',
      icon: <DoneAll fontSize="large" />,
    },
    approved: {
      label: t('APPROVEDRequests'),
      color: '#388e3c',
      icon: <CheckCircle fontSize="large" />,
    },
    unknown: {
      label: t('UNKNOWNRequests'),
      color: '#bdbdbd',
      icon: <CheckCircle fontSize="large" />,
    },
  };

  const statusOrder = [
    'new',
    'pending',
    'viewed',
    'in_progress',
    'completed',
    'approved',
    'unknown',
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Typography variant="h4" gutterBottom>
        {t('RequestOverview')}
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>{t('Loading')}</Typography>
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={3}>
          {statusOrder.map((status) => {
            const count = statusCounts[status] || 0;
            const config = statusConfig[status] || statusConfig.unknown;

            return (
              <Grid item xs={12} sm={6} md={4} key={status}>
                <Paper
                  elevation={4}
                  sx={{
                    height: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 2,
                    backgroundColor: config.color,
                    color: '#fff',
                    p: 2,
                    textAlign: 'center',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    },
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
