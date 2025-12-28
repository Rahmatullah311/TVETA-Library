
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {Box,Avatar,Typography,IconButton,CircularProgress,} from '@mui/material';

export function LogoUpload({ value, onChange, disabled, loading, error, helperText }) {
  const [preview, setPreview] = useState(value);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, SVG, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result;
      setPreview(previewUrl);
      onChange(file);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box sx={{ width: '100%' }}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
        disabled={disabled || loading}
      />
      
      <Box
        sx={{
          border: '2px dashed',
          borderColor: dragOver ? 'primary.main' : error ? 'error.main' : 'grey.300',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          bgcolor: dragOver ? 'action.hover' : 'background.paper',
          cursor: disabled ? 'default' : 'pointer',
          transition: 'all 0.2s',
          '&:hover': !disabled && {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        {loading ? (
          <CircularProgress size={48} sx={{ mb: 2 }} />
        ) : preview ? (
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              src={preview}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              variant="rounded"
            />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'grey.200' },
              }}
              disabled={disabled}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
        )}
        
        <Typography variant="body2" color={error ? 'error' : 'text.secondary'} gutterBottom>
          {preview ? 'Click or drag to replace logo' : 'Drag & drop logo here, or click to select'}
        </Typography>
        
        <Typography variant="caption" color="text.secondary">
          Supports: JPEG, PNG, GIF, SVG, WebP (Max 5MB)
        </Typography>
      </Box>

      {helperText && (
        <Typography
          variant="caption"
          color={error ? 'error' : 'text.secondary'}
          sx={{ mt: 1, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}

LogoUpload.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
};