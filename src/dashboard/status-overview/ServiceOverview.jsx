'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { Build, FiberNew, CheckCircle, HourglassEmpty } from '@mui/icons-material';

import { servicesApi } from '../../services/api/service-api';

export default function ServiceStatusOverview() {
  const { t } = useTranslation();

  const [serviceCounts, setServiceCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServiceCounts();
  }, []);

  const fetchServiceCounts = async () => {
    try {
      setLoading(true);
      const response = await servicesApi.getAll();
      const data = response.data;

      const counts = data.reduce((acc, service) => {
        const status = service.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      setServiceCounts(counts);
    } catch (err) {
      console.error(err);
      setError(t('loadError'));
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    new: {
      label: t('NewServices'),
      color: '#81c784',
      icon: <FiberNew fontSize="large" />,
    },
    active: {
      label: t('ActiveServices'),
      color: '#4fc3f7',
      icon: <Build fontSize="large" />,
    },
    inactive: {
      label: t('InactiveServices'),
      color: '#90a4ae',
      icon: <HourglassEmpty fontSize="large" />,
    },
    unknown: {
      label: t('AllServices'),
      color: '#bdbdbd',
      icon: <CheckCircle fontSize="large" />,
    },
  };

  const statusOrder = ['new', 'active', 'inactive', 'unknown'];

  return (
    <div style={{ padding: '24px' }}>
      <Typography variant="h4" gutterBottom>
        {t('ServicesOverview')}
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
            const count = serviceCounts[status] || 0;
            const config = statusConfig[status] || statusConfig.unknown;

            return (
              <Grid item xs={12} sm={6} md={3} key={status}>
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
