import { useState } from 'react';
import PropTypes from 'prop-types';

import DeleteIcon from '@mui/icons-material/Delete';
import {Box,Card,Dialog,Typography,IconButton,CardContent,DialogTitle,DialogContent,} from '@mui/material';



export function ServiceCard({ service, onViewDetails }) {
  const [open, setOpen] = useState(false);
  const [expandedImage, setExpandedImage] = useState('');

  const handleCardClick = () => {
    onViewDetails?.(service);
  };


  const handleClose = () => {
    setOpen(false);
    setExpandedImage('');
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        sx={{
          height: '100%',
          maxWidth: 320,
          cursor: 'pointer',
          '&:hover': { boxShadow: 6 },
    }}
      >
        {/* Image */}
        <Box
         
          sx={{
            height: 180,
            overflow: 'hidden',
            backgroundColor: 'grey.100',
          }}
        >
          {(service.logo || service.logo_url) ? (
            <Box
              component="img"
              src={service.logo || service.logo_url}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'primary.light',
              }}
            >
              <Typography variant="h3" color="white">
                {service.title.charAt(0).toUpperCase()}
              </Typography>
            </Box>
          )}
        </Box>

        <CardContent>
          {/* TITLE — max 2 lines */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.3,
              minHeight: '2.6em', // keeps cards equal height
            }}
          >
            {service.title}
          </Typography>

          {/* DESCRIPTION — max 3 lines */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.5,
              minHeight: '4.5em',
            }}
          >
            {service.description}
          </Typography>
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="lg">
        <DialogTitle>
          <IconButton onClick={handleClose}>
            <DeleteIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            component="img"
            src={expandedImage}
            sx={{ width: '100%', maxHeight: '90vh', objectFit: 'contain' }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

ServiceCard.propTypes = {
  service: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    logo: PropTypes.string,
    logo_url: PropTypes.string,
  }).isRequired,
  onViewDetails: PropTypes.func,
};
