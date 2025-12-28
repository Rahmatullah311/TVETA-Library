'use client';

import { useState, useEffect } from 'react';

import {
  Table,
  Paper,
  Dialog,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { requestsApi } from '../api';

export default function RequestTable() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null); // selected request for modal
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await requestsApi.getAll();
      setRequests(response.data);
    } catch (err) {
      console.error('REQUEST FETCH ERROR:', err);
      setError('Failed to load service requests');
    } finally {
      setLoading(false);
    }
  };
  const handleRowClick = async (request) => {
    try {
      // Fetch full request details
      const response = await requestsApi.getById(request.id);
      const requestData = response.data;

      // Open modal
      setSelectedRequest(requestData);
      setModalOpen(true);

      // Update status to "viewed" if not already
      if (requestData.status.toLowerCase() !== 'viewed') {
        await requestsApi.update(request.id, { status: 'viewed' });

        // Update table state
        setRequests((prev) =>
          prev.map((r) => (r.id === request.id ? { ...r, status: 'viewed' } : r))
        );

        // Update modal state
        setSelectedRequest((prev) => ({ ...prev, status: 'viewed' }));
      }
    } catch (err) {
      console.error('Error fetching or updating request:', err);
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedRequest(null);
  };

  if (loading)
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <CircularProgress />
      </div>
    );

  if (error)
    return (
      <Typography color="error" variant="body1" align="center">
        {error}
      </Typography>
    );

  // For priority
  const priorityColors = {
    low: 'green',
    medium: 'orange',
    high: 'red',
    urgent: 'purple', // optional extra
  };

  // For status
  const statusColors = {
    new: 'blue',
    in_progress: 'orange',
    viewed: 'green',
    closed: 'gray',
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No requests found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow
                  key={req.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleRowClick(req)}
                >
                  <TableCell>{req.id}</TableCell>
                  <TableCell>{req.description}</TableCell>
                  <TableCell>{req.created_by_username}</TableCell>
                  <TableCell>
                    <span
                      style={{
                        color: priorityColors[req.priority.toLowerCase()] || 'black',
                        fontWeight: 'bold',
                      }}
                    >
                      {capitalize(req.priority)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      style={{
                        color: statusColors[req.status.toLowerCase()] || 'black',
                        fontWeight: 'bold',
                      }}
                    >
                      {capitalize(req.status)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal */}
      <Dialog open={modalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Request Details</DialogTitle>
        <DialogContent dividers>
          {selectedRequest ? (
            <div style={{ width: '100%' }}>
              {[
                { label: 'ID', value: selectedRequest.id },
                { label: 'Description', value: selectedRequest.description },
                { label: 'Created By', value: selectedRequest.created_by_username },
                { label: 'Priority', value: capitalize(selectedRequest.priority) },
                { label: 'Status', value: capitalize(selectedRequest.status) },
              ].map((field) => (
                <div
                  key={field.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #eee',
                  }}
                >
                  {/* LEFT: key */}
                  <div
                    style={{
                      fontWeight: 'bold',
                      color: '#555',
                      textAlign: 'left',
                    }}
                  >
                    {field.label}:
                  </div>

                  {/* RIGHT: value */}
                  <div
                    style={{
                      textAlign: 'right',
                      maxWidth: '60%',
                      overflowWrap: 'break-word',
                    }}
                  >
                    {field.value !== null ? field.value.toString() : '-'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Typography textAlign="center">Loading...</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={handleClose} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ---------------- HELPERS ----------------

const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '-');
