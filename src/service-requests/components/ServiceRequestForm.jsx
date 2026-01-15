import { toast } from 'react-toastify';
// ServiceRequestForm.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Alert,
  Stack,
  Dialog,
  Button,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { useAuth } from 'src/auth/context/auth-context.jsx';

export function ServiceRequestForm({ open, onClose, serviceId, serviceTitle, onSubmit }) {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setDescription('');
      setPriority('medium');
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (authLoading) return;
    if (!description.trim()) {
      setError('Description cannot be empty.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      service: serviceId,
      created_by: user.username,
      description,
      priority,
    };

    try {
      const result = await onSubmit(payload);

      console.log('Submission result:', result); // Debug logging

      if (result.status === 201) {
        toast.success('Service request submitted successfully!');
        onClose();
      } else {
        setError(result.error || 'Something  wrong.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('title')}</DialogTitle>

      <DialogContent>
        {serviceTitle && (
          <Typography sx={{ mb: 1 }} color="text.secondary">
            {t('serviceLabel')}: <strong>{serviceTitle}</strong>
          </Typography>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label={t('descriptionPlaceholder')}
          multiline
          rows={4}
          fullWidth
          required
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Typography sx={{ mt: 2, mb: 1 }}>{t('priorityLabel')}</Typography>
        <Stack direction="row" spacing={2}>
          {['low', 'medium', 'high', 'urgent'].map((level) => (
            <Button
              key={level}
              variant={priority === level ? 'contained' : 'outlined'}
              color={
                level === 'high'
                  ? 'warning'
                  : level === 'medium'
                    ? 'success'
                    : level === 'urgent'
                      ? 'error'
                      : 'info'
              }
              onClick={() => setPriority(level)}
            >
              {t(level)}
            </Button>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t('cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !description.trim() || authLoading}
        >
          {loading ? t('submitting') : t('submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
