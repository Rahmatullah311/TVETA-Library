// src/services/views/services-list-view.jsx
import { useState } from 'react';

import { Grid, Container } from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { useServices } from '../hooks';
import { ServiceCard } from '../components';
import { createServiceRequest } from '../../service-requests/api';
import { ServiceRequestForm } from '../../service-requests/components/ServiceRequestForm';

export function ServicesListView() {
  const { services } = useServices();
  

  const [openRequestForm, setOpenRequestForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleSelectService = (service) => {
    setSelectedService(service);
    setOpenRequestForm(true);
  };

  const handleSubmitRequest = async (data) => await createServiceRequest(data);

  return (

    <Container>
      <DashboardContent>
        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid item xs={12} md={4} key={service.id}>
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


      </DashboardContent>
      
    </Container>
  );
}
