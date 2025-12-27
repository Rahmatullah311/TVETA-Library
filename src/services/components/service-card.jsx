// src/services/components/service-card.jsx
import PropTypes from 'prop-types';
import { useState } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Stack,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
} from '@mui/material';

export function ServiceCard({ service, onEdit, onDelete, onViewDetails }) {
  const [open, setOpen] = useState(false);
  const [expandedImage, setExpandedImage] = useState('');

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(service);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(service.id);
  };

  const handleCardClick = () => {
    onViewDetails?.(service);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (service.logo || service.logo_url) {
      setExpandedImage(service.logo || service.logo_url);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setExpandedImage('');
  };

  // Function to limit characters (better for multi-line text)
  const limitText = (text, charLimit = 100) => {
    if (!text) return '';
    if (text.length > charLimit) {
      return text.substring(0, charLimit) + '...';
    }
    return text;
  };

  return (
    <>
      <Card 
        onClick={handleCardClick}
        sx={{
          height: '100%',
          width: '100%',
          maxWidth: 320, // Fixed maximum width
          display: 'flex',
          flexDirection: 'column',
          cursor: onViewDetails ? 'pointer' : 'default',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: onViewDetails ? 'translateY(-4px)' : 'none',
            boxShadow: onViewDetails ? 6 : 1,
          },
        }}
      >
        {/* Fixed size image container */}
        <Box 
          onClick={handleImageClick}
          sx={{
            height: 200,
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            cursor: (service.logo || service.logo_url) ? 'pointer' : 'default',
            backgroundColor: 'grey.100',
          }}
        >
          {(service.logo || service.logo_url) ? (
            <Box
              component="img"
              src={service.logo || service.logo_url}
              alt={service.title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'primary.light',
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '4rem',
                }}
              >
                {service.title.charAt(0).toUpperCase()}
              </Typography>
            </Box>
          )}
        </Box>

        <CardContent sx={{ 
          flexGrow: 1, 
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}>
          {/* Title - Fixed height, wraps to multiple lines */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              lineHeight: 1.3,
              minHeight: '2.6em', // Approx 2 lines
              maxHeight: '2.6em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word',
            }}
          >
            {limitText(service.title, 50)} {/* Limit to 50 characters */}
          </Typography>

          {/* Description - Fixed height, wraps to multiple lines */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.5,
              minHeight: '4.5em', // Approx 3 lines
              maxHeight: '4.5em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word',
              flexGrow: 1,
            }}
          >
            {limitText(service.description, 120)} {/* Limit to 120 characters */}
          </Typography>

          {/* Action buttons */}
          <Stack 
            direction="row" 
            spacing={1} 
            justifyContent="space-between"
            alignItems="center"
            sx={{ 
              mt: 'auto',
              pt: 1,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            {/* <Stack direction="row" spacing={0.5}>
              <IconButton 
                size="small" 
                onClick={handleEdit} 
                aria-label="edit"
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'primary.main', 
                    color: 'white' 
                  }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={handleDelete} 
                aria-label="delete" 
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'error.main', 
                    color: 'white' 
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack> */}
            
            {/* {onViewDetails && (
              <Button
                size="small"
                variant="outlined"
                onClick={handleCardClick}
                sx={{ 
                  fontSize: '0.75rem',
                  textTransform: 'none',
                }}
              >
                View Details
              </Button>
            )} */}
          </Stack>
        </CardContent>
      </Card>

      {/* Full screen image dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
          }
        }}
      >
        <DialogTitle sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 8,
          p: 0 
        }}>
          <IconButton 
            onClick={handleClose} 
            sx={{ 
              backgroundColor: 'rgba(0,0,0,0.5)', 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)',
              }
            }}
          >
            <DeleteIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box
            component="img"
            src={expandedImage}
            alt="Full size"
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: '90vh',
              objectFit: 'contain',
            }}
          />
        </DialogContent>
      </Dialog>
    </>
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