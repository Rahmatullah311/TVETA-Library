import { useTranslation } from 'react-i18next';

import { Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import ChatWindow from './ChatWindow';


export default function ChatDialog({ open, onClose, requestId }) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t('Chat—Request')} #{requestId}
      </DialogTitle>

      <DialogContent dividers>
        <ChatWindow requestId={requestId} />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained" color="inherit">
          {t('Close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
