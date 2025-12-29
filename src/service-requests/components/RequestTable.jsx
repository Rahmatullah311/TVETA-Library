'use client';

import { Link } from 'react-router';
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
  const [selectedRequest, setSelectedRequest] = useState(null);
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

  const handleRowClick = (request) => {
    // Open modal immediately
    setSelectedRequest(request);
    setModalOpen(true);

    (async () => {
      try {
        const response = await requestsApi.getById(request.id);
        const requestData = response.data;
        setSelectedRequest(requestData);

        // Only mark as viewed if status is "new" or "pending"
        if (['new', 'pending'].includes(requestData.status.toLowerCase())) {
          await requestsApi.update(request.id, { status: 'viewed' });

          // Update modal state
          setSelectedRequest((prev) => ({ ...prev, status: 'viewed' }));

          // Update table state
          setRequests((prev) =>
            prev.map((r) => (r.id === request.id ? { ...r, status: 'viewed' } : r))
          );
        }
      } catch (err) {
        console.error('Error fetching/updating request:', err);
      }
    })();
  };

  const handleOccupyTask = async () => {
    if (!selectedRequest) return;

    try {
      // Only send status; backend will attach provider
      await requestsApi.update(selectedRequest.id, { status: 'in_progress' });

      setSelectedRequest((prev) => ({ ...prev, status: 'in_progress' }));

      setRequests((prev) =>
        prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: 'in_progress' } : r))
      );
    } catch (err) {
      console.error('Failed to occupy task:', err);
    }
  };

  //   complete task (in_progress → completed)
  const handleCompleteTask = async () => {
    if (!selectedRequest) return;

    try {
      await requestsApi.update(selectedRequest.id, { status: 'completed' });

      // Update modal state
      setSelectedRequest((prev) => ({ ...prev, status: 'completed' }));

      // Update table state
      setRequests((prev) =>
        prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: 'completed' } : r))
      );
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const handleApproveDelivery = async () => {
    if (!selectedRequest) return;

    try {
      // Example: update status to "approved" (or call a specific API endpoint)
      await requestsApi.update(selectedRequest.id, { status: 'approved' });

      // Update modal state
      setSelectedRequest((prev) => ({ ...prev, status: 'approved' }));

      // Update table state
      setRequests((prev) =>
        prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: 'approved' } : r))
      );
    } catch (err) {
      console.error('Failed to approve delivery:', err);
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

  const priorityColors = {
    low: 'green',
    medium: 'orange',
    high: 'red',
    urgent: 'purple',
  };

  const statusColors = {
    new: 'blue',
    in_progress: 'orange',
    viewed: 'green',
    Completed: 'gray',
    approved: 'darkgreen',
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <Button
          component={Link}
          to="/dashboard/services"
          variant="contained"
          color="primary"
          title="Click here to create a new service request"
        >
          New Request
        </Button>
      </div>

      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Provider</TableCell>
              
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
                  <TableCell>{req.provider_username || '-'}</TableCell>
                  
    
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
                      title={
                        req.status === 'viewed'
                          ? 'Request has been viewed but not occupied by any provider'
                          : 'task has been occupied and a provider is working on it, we will soon inform you once it is ready to deliver.'
                      }
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
                  <div style={{ fontWeight: 'bold', color: '#555', textAlign: 'left' }}>
                    {field.label}:
                  </div>
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

        <DialogActions sx={{ justifyContent: 'space-between', padding: '16px' }}>
          {/* Occupy Task Button */}
          {selectedRequest && selectedRequest.status.toLowerCase() === 'viewed' && (
            <Button
              onClick={handleOccupyTask}
              title="click here if you want this task to be assigned to you, then keep working on it and after the task is completed, you can change the status to completed to inform the client."
              variant="contained"
              color="secondary"
            >
              Occupy Task
            </Button>
          )}

          {/* Complete Task Button */}
          {selectedRequest && selectedRequest.status.toLowerCase() === 'in_progress' && (
            <Button
              onClick={handleCompleteTask}
              variant="contained"
              color="success"
              title="click here, If you completed the task? wait for the client approve"
            >
              Mark as Completed
            </Button>
          )}

          {/* Approve Delivery Button */}
          {selectedRequest && selectedRequest.status.toLowerCase() === 'completed' && (
            <Button
              onClick={handleApproveDelivery}
              variant="contained"
              color="primary"
              title="click here to approve the delivery of the completed task. This action confirms that you are satisfied with the work done and allows the service provider to finalize the request."
            >
              Approve Delivery
            </Button>
          )}

          <Button onClick={handleClose} variant="contained" color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ---------------- HELPERS ----------------
const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '-');
