import React from 'react';
// Import Typography from MUI
import {Card,CardContent,Typography,Box,Chip,IconButton,Avatar} from '@mui/material';
import { Delete, Person } from '@mui/icons-material';

const ServiceProviderCard = ({ assignment, onDelete }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <Person />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {assignment.provider_name || assignment.provider_username || 'Provider'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Service: {assignment.service_title || `Service #${assignment.service}`}
              </Typography>
            </Box>
          </Box>
          
          <Box>
            {/* <Chip
              label="Assigned"
              color="success"
              size="small"
              sx={{ mr: 1 }}
            /> */}
            <IconButton 
              size="small" 
              color="error"
              onClick={() => onDelete(assignment.id)}
              title="Remove Assignment"
            >
              <Delete />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ServiceProviderCard;