// src/services/components/service-card.jsx
import PropTypes from 'prop-types';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Stack,
  Chip,
  Avatar,
  Badge,
} from '@mui/material';

export function ServiceCard({ service, onEdit, onDelete, onViewDetails }) {
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(service);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(service.id);
  };

  const handleClick = () => {
    onViewDetails?.(service);
  };

  return (
    <Card 
      onClick={handleClick}
      sx={{
        height: '100%',
        cursor: onViewDetails ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: onViewDetails ? 'translateY(-4px)' : 'none',
          boxShadow: onViewDetails ? 4 : 1,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          {/* Logo */}
          <Avatar
            src={service.logo || service.logo_url || ''}
            variant="rounded"
            sx={{ width: 80, height: 80, bgcolor: 'primary.light' }}
          >
            {service.title.charAt(0).toUpperCase()}
          </Avatar>

          {/* Title and Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {service.title}
              </Typography>
              {/* <Chip 
                label={`ID: ${service.id}`} 
                size="small" 
                variant="outlined" 
              /> */}
            </Box>
            
            {/* Show logo indicator if exists */}
            {/* {(service.logo_url || service.logo) && (
              <Chip
                label="Has Logo"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mt: 0.5 }}
              />
            )} */}
          </Box>
        </Box>
        
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            mb: 2,
          }}
        >
          {service.description}
        </Typography>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <IconButton size="small" onClick={handleEdit} aria-label="edit">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleDelete} aria-label="delete" color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
          {onViewDetails && (
            <IconButton size="small" aria-label="more">
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

ServiceCard.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    logo: PropTypes.string,
    logo_url: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onViewDetails: PropTypes.func,
};