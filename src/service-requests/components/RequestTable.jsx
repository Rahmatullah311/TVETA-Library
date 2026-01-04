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
      // Sort so newest requests appear first
      const sorted = response.data.sort((a, b) => b.id - a.id);
      setRequests(sorted);
    } catch (err) {
      console.error('REQUEST FETCH ERROR:', err);
      setError('Failed to load service requests');
    } finally {
      setLoading(false);
    }
  };

  const openRequestModal = async (requestId) => {
    try {
      const response = await requestsApi.getById(requestId);
      let requestData = response.data;

      // Mark as viewed if user is not creator and no provider
      if (
        !requestData.is_creator &&
        !requestData.provider &&
        ['new', 'pending'].includes(requestData.status?.toLowerCase())
      ) {
        const updated = await requestsApi.update(requestId, { status: 'viewed' });
        requestData = updated.data;
      }

      setSelectedRequest(requestData);
      setRequests((prev) => prev.map((r) => (r.id === requestId ? requestData : r)));
      setModalOpen(true);
    } catch (err) {
      console.error('Error fetching request:', err);
    }
  };

  const handleOccupyTask = async () => {
    if (!selectedRequest) return;

    try {
      const updated = await requestsApi.update(selectedRequest.id, {
        status: 'in_progress',
      });

      setSelectedRequest(updated.data);
      setRequests((prev) => prev.map((r) => (r.id === updated.data.id ? updated.data : r)));
    } catch (err) {
      console.error('Failed to occupy task:', err);
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedRequest) return;

    try {
      const updated = await requestsApi.update(selectedRequest.id, {
        status: 'completed',
      });

      setSelectedRequest(updated.data);
      setRequests((prev) => prev.map((r) => (r.id === updated.data.id ? updated.data : r)));
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const handleApproveDelivery = async () => {
    if (!selectedRequest) return;

    try {
      const updated = await requestsApi.update(selectedRequest.id, {
        status: 'approved',
      });

      setSelectedRequest(updated.data);
      setRequests((prev) => prev.map((r) => (r.id === updated.data.id ? updated.data : r)));
    } catch (err) {
      console.error('Failed to approve delivery:', err);
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedRequest(null);
  };

  const priorityColors = {
    low: 'green',
    medium: 'orange',
    high: 'red',
    urgent: 'purple',
  };

  const statusColors = {
    new: 'blue',
    viewed: 'green',
    in_progress: 'orange',
    completed: 'gray',
    approved: 'darkgreen',
  };

  const canUserComplete = (req) => req?.is_provider && req.status === 'in_progress';

  const canUserApprove = (req) => req?.is_creator && req.status === 'completed';

  const canUserOccupy = (req) => req?.status === 'viewed' && !req?.provider && !req?.is_creator;

  return (
    <>
      <div
        style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px' }}
      >
        <Button variant="outlined" onClick={fetchRequests}>
          Refresh
        </Button>

        <Button component={Link} to="/dashboard/services" variant="contained">
          New Request
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <CircularProgress />
        </div>
      ) : error ? (
        <Typography color="error" align="center">
          {error}
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((req) => (
                <TableRow
                  key={req.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => openRequestModal(req.id)}
                >
                  <TableCell>{req.id}</TableCell>
                  <TableCell>{req.description}</TableCell>
                  <TableCell>{req.service_info.title}</TableCell>
                  <TableCell>{req.created_by_username}</TableCell>
                  <TableCell style={{ color: priorityColors[req.priority] }}>
                    {capitalize(req.priority)}
                  </TableCell>
                  <TableCell style={{ color: statusColors[req.status] }}>
                    {capitalize(req.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={modalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Request Details</DialogTitle>

        <DialogContent dividers>
          {selectedRequest ? (
            <>
              <Detail label="ID" value={selectedRequest.id} />
              <Detail label="Description" value={selectedRequest.description} />
              <Detail label="Created By" value={selectedRequest.created_by_username} />
              <Detail
                label="Provider"
                value={selectedRequest.provider_username || 'Not assigned'}
              />
              <Detail
                label="Priority"
                value={capitalize(selectedRequest.priority)}
                color={priorityColors[selectedRequest.priority]}
              />
              <Detail
                label="Status"
                value={capitalize(selectedRequest.status)}
                color={statusColors[selectedRequest.status]}
              />
            </>
          ) : (
            <Typography align="center">Loading...</Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between' }}>
          {selectedRequest && canUserOccupy(selectedRequest) && (
            <Button onClick={handleOccupyTask} variant="contained" color="secondary">
              Occupy Task
            </Button>
          )}

          {selectedRequest && canUserComplete(selectedRequest) && (
            <Button onClick={handleCompleteTask} variant="contained" color="warning">
              Mark as Completed
            </Button>
          )}

          {selectedRequest && canUserApprove(selectedRequest) && (
            <Button onClick={handleApproveDelivery} variant="contained">
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

const Detail = ({ label, value, color }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #eee',
      color: color || 'inherit',
    }}
  >
    <strong>{label}:</strong>
    <span>{value ?? '-'}</span>
  </div>
);

const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '-');
