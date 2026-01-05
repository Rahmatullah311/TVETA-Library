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
  TextField,
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
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await requestsApi.getAll();
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

      if (
        !requestData.is_creator &&
        !requestData.provider &&
        ['pending', 'new'].includes(requestData.status?.toLowerCase())
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
      const updated = await requestsApi.update(selectedRequest.id, { status: 'in_progress' });
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
        serial_number: selectedRequest.serial_number || undefined,
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
      const updated = await requestsApi.update(selectedRequest.id, { status: 'approved' });
      setSelectedRequest(updated.data);
      setRequests((prev) => prev.map((r) => (r.id === updated.data.id ? updated.data : r)));
    } catch (err) {
      console.error('Failed to approve delivery:', err);
    }
  };

  const handleSaveSerial = async () => {
    if (!selectedRequest) return;
    try {
      const updated = await requestsApi.update(selectedRequest.id, {
        serial_number: selectedRequest.serial_number,
      });
      setSelectedRequest(updated.data);
      setRequests((prev) => prev.map((r) => (r.id === updated.data.id ? updated.data : r)));
    } catch (err) {
      console.error('Failed to save serial number:', err);
    }
  };

  // New file upload handling
  const handleFileSelect = (e) => {
    if (!selectedRequest) return;
    const file = e.target.files[0];
    if (!file) return;
    setSelectedRequest({
      ...selectedRequest,
      newFiles: [...(selectedRequest.newFiles || []), file],
    });
  };
  const handleSaveFiles = async () => {
    if (!selectedRequest || !selectedRequest.newFiles?.length) return;

    try {
      for (const f of selectedRequest.newFiles) {
        const formData = new FormData();
        formData.append('file', f); // ✅ MUST be "file"

        const response = await requestsApi.uploadFile(selectedRequest.id, formData);

        setSelectedRequest((prev) => ({
          ...prev,
          files: [...(prev.files || []), response.data], // ✅ single object
        }));
      }

      // clear temp files
      setSelectedRequest((prev) => ({ ...prev, newFiles: [] }));
    } catch (err) {
      console.error('Failed to save files', err);
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
    pending: 'blue',
    viewed: 'green',
    in_progress: 'orange',
    completed: 'gray',
    approved: 'darkgreen',
  };

  const canUserComplete = (req) => req?.is_provider && req.status === 'in_progress';
  const canUserApprove = (req) => req?.is_creator && req.status === 'completed';
  const canUserOccupy = (req) => req?.status === 'viewed' && !req?.provider && !req?.is_creator;

  const filteredRequests = requests.filter((r) =>
    r.serial_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          gap: '16px',
        }}
      >
        <div>
          {requests.some((r) => r.is_provider) && (
            <TextField
              label="Search Serial Number"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: '250px' }}
            />
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outlined" onClick={fetchRequests}>
            Refresh
          </Button>
          <Button component={Link} to="/dashboard/services" variant="contained">
            New Request
          </Button>
        </div>
      </div>

      {/* Table */}
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
                <TableCell>Serial Number</TableCell>
                {/* <TableCell>Files</TableCell> */}
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(search ? filteredRequests : requests).map((req) => (
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
                  <TableCell>{req.serial_number || '-'}</TableCell>
                  {/* <TableCell>
                    {req.is_provider && req.files?.length > 0
                      ? req.files.map((f) => (
                          <a
                            key={f.id}
                            href={f.file}
                            target="_blank"
                            rel="noreferrer"
                            style={{ marginRight: 5 }}
                          >
                            {f.file.split('/').pop()}
                          </a>
                        ))
                      : '-'}
                  </TableCell> */}
                  <TableCell>{new Date(req.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal */}
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
              <Detail
                label="Created At"
                value={new Date(selectedRequest.created_at).toLocaleString()}
              />

              {/* Serial Number */}
              {selectedRequest.is_provider ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    gap: '16px',
                  }}
                >
                  <strong>Serial Number:</strong>
                  <TextField
                    size="small"
                    variant="outlined"
                    value={selectedRequest.serial_number || ''}
                    onChange={(e) =>
                      setSelectedRequest({ ...selectedRequest, serial_number: e.target.value })
                    }
                    placeholder="Enter serial number"
                    sx={{ width: '200px' }}
                  />
                </div>
              ) : selectedRequest.serial_number ? (
                <Detail label="Serial Number" value={selectedRequest.serial_number} />
              ) : null}

              {/* Files */}
              {selectedRequest.is_provider && (
                <div style={{ marginTop: '16px' }}>
                  <Button variant="outlined" component="label">
                    Upload File
                    <input type="file" hidden onChange={handleFileSelect} />
                  </Button>

                  {selectedRequest.newFiles?.length > 0 && (
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ ml: 2 }}
                      onClick={handleSaveFiles}
                    >
                      Save Files
                    </Button>
                  )}

                  <ul style={{ marginTop: '8px' }}>
                    {(selectedRequest.files || []).map((f) => (
                      <li key={f.id}>
                        <a href={f.file} target="_blank" rel="noreferrer">
                          {f.file.split('/').pop()}
                        </a>
                      </li>
                    ))}
                    {(selectedRequest.newFiles || []).map((f, i) => (
                      <li key={i}>{f.name} (new)</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <Typography align="center">Loading...</Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between' }}>
          {selectedRequest?.is_provider && (
            <Button onClick={handleSaveSerial} variant="contained" color="primary">
              Save Serial Number
            </Button>
          )}

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
