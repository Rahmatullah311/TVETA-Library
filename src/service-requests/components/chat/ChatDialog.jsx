import { Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import ChatWindow from './ChatWindow';

export default function ChatDialog({ open, onClose, requestId }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Chat — Request #{requestId}
      </DialogTitle>

      <DialogContent dividers>
        <ChatWindow requestId={requestId} />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained" color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
