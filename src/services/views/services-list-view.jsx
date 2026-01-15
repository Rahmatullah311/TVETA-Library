// src/services/views/services-list-view.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next'; // ✅ for translations

import { Grid, Container, Typography } from '@mui/material';

import { useServices } from '../hooks';
import { ServiceCard } from '../components';
import { createServiceRequest } from '../../service-requests/api';
import { ServiceRequestForm } from '../../service-requests/components/ServiceRequestForm';

export function ServicesListView() {
  const { services } = useServices();
  const { t } = useTranslation(); // ✅ hook for translation

  const [openRequestForm, setOpenRequestForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleSelectService = (service) => {
    setSelectedService(service);
    setOpenRequestForm(true);
  };

  const handleSubmitRequest = async (data) => await createServiceRequest(data);

  return (
    <Container>
      {/* Header */}
      <Typography variant="h6" sx={{ mb: 4 }}>
        {t('ChooseService')} {/* ✅ Translatable key */}
      </Typography>

      <Grid container spacing={4}>
        {services.map((service) => (
          <Grid item xs={12} sm={3} md={3} key={service.id}>
            <ServiceCard
              service={service}
              onViewDetails={handleSelectService} // ✅ CLICK OPENS FORM
            />
          </Grid>
        ))}
      </Grid>

      <ServiceRequestForm
        open={openRequestForm}
        onClose={() => setOpenRequestForm(false)}
        serviceId={selectedService?.id}
        serviceTitle={selectedService?.title}
        onSubmit={handleSubmitRequest}
      />
    </Container>
  );
}
