'use client';

import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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
import ChatDialog from './chat/ChatDialog';

export default function RequestTable() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [completedByText, setCompletedByText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await requestsApi.getAll({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
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
      setCompletedByText(requestData.completed_by || '');
      setRequests((prev) => prev.map((r) => (r.id === requestId ? requestData : r)));
      setModalOpen(true);
    } catch (err) {
      console.error('Error fetching request:', err);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await requestsApi.exportExcel({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'service_requests.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export Excel:', err);
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

  const handleSaveCompletedBy = async () => {
    if (!selectedRequest) return;

    try {
      const updated = await requestsApi.update(selectedRequest.id, {
        completed_by: completedByText,
      });
      setSelectedRequest(updated.data);
      setRequests((prev) => prev.map((r) => (r.id === updated.data.id ? updated.data : r)));
    } catch (err) {
      console.error('Failed to save completion comment:', err);
    }
  };

  // File upload handling
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
        formData.append('file', f);

        const response = await requestsApi.uploadFile(selectedRequest.id, formData);

        setSelectedRequest((prev) => ({
          ...prev,
          files: [...(prev.files || []), response.data],
        }));
      }

      setSelectedRequest((prev) => ({ ...prev, newFiles: [] }));
    } catch (err) {
      console.error('Failed to save files', err);
    }
  };

  const handleRemoveNewFile = (index) => {
    if (!selectedRequest) return;
    const updatedFiles = [...(selectedRequest.newFiles || [])];
    updatedFiles.splice(index, 1);
    setSelectedRequest({ ...selectedRequest, newFiles: updatedFiles });
  };

  const handleDeleteFile = async (fileId) => {
    if (!selectedRequest) return;

    try {
      await requestsApi.deleteFile(selectedRequest.id, fileId);

      setSelectedRequest((prev) => ({
        ...prev,
        files: prev.files.filter((f) => f.id !== fileId),
      }));
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  };

  const handleRejectTask = async () => {
    console.log('REJECT CLICKED', selectedRequest);

    if (!selectedRequest) return;

    try {
      const updated = await requestsApi.update(selectedRequest.id, {
        status: 'rejected',
      });

      console.log('REJECT RESPONSE:', updated.data);

      setSelectedRequest(updated.data);
      setRequests((prev) => prev.map((r) => (r.id === updated.data.id ? updated.data : r)));
    } catch (err) {
      console.error('Failed to reject task:', err);
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedRequest(null);
    setCompletedByText('');
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
    rejected: 'red',
  };

  const canUserComplete = (req) => req?.is_provider && req.status === 'in_progress';
  const canUserApprove = (req) => req?.is_creator && req.status === 'completed';
  const canUserOccupy = (req) => req?.status === 'viewed' && !req?.provider && !req?.is_creator;
  const canUserReject = (req) => !req?.provider && req.status === 'viewed' && !req?.is_creator;

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
              label={t('SearchSerialNumber')}
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: '250px' }}
            />
          )}
        </div>
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
  {requests.some((r) => r.is_provider) && (
    <>
      <TextField
        label={t('Start Date')}
        type="date"
        size="small"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label={t('End Date')}
        type="date"
        size="small"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />

      <Button variant="contained" size="small" onClick={fetchRequests}>
        {t('Filters')}
      </Button>

      <Button variant="contained" size="small" color="success" onClick={handleExportExcel}>
        {t('Export Excel')}
      </Button>
    </>
  )}
</div>


        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outlined" onClick={fetchRequests}>
            {t('refresh')}
          </Button>
          <Button component={Link} to="/dashboard/services" variant="contained">
            {t('NEWRequests')}
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
                <TableCell>{t('ID')}</TableCell>
                <TableCell>{t('Description')}</TableCell>
                <TableCell>{t('Services')}</TableCell>
                <TableCell>{t('Created By')}</TableCell>
                <TableCell>{t('Priority')}</TableCell>
                <TableCell>{t('Status')}</TableCell>
                <TableCell>{t('CompletedBy')}</TableCell>
                <TableCell>{t('serialnumber')}</TableCell>
                <TableCell>{t('created_at')}</TableCell>
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
                  <TableCell style={{ color: statusColors[req.status] }}>
                    {capitalize(req.completed_by)}
                  </TableCell>
                  <TableCell>{req.serial_number || '-'}</TableCell>
                  <TableCell>{new Date(req.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">{t('RequestDetails')}</Typography>

          <Button variant="contained" size="small" onClick={() => setChatOpen(true)}>
            {t('Chat')}
          </Button>
        </DialogTitle>

        <ChatDialog
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          requestId={selectedRequest?.id}
        />

        <DialogContent dividers>
          {selectedRequest ? (
            <>
              <Detail label={t('ID')} value={selectedRequest.id} />
              <Detail label={t('Description')} value={selectedRequest.description} />
              <Detail label={t('Created By')} value={selectedRequest.created_by_username} />
              <Detail
                label={t('ServiceProvider')}
                value={selectedRequest.provider_username || 'Not assigned'}
              />
              <Detail
                label={t('Priority')}
                value={capitalize(selectedRequest.priority)}
                color={priorityColors[selectedRequest.priority]}
              />
              <Detail
                label={t('Status')}
                value={capitalize(selectedRequest.status)}
                color={statusColors[selectedRequest.status]}
              />

              <Detail
                label={t('CompletedBy')}
                value={capitalize(selectedRequest.completed_by)}
                color={statusColors[selectedRequest.status]}
              />
              <Detail
                label={t('created_at')}
                value={new Date(selectedRequest.created_at).toLocaleString()}
              />

              {/* Serial Number with Save button */}
              {selectedRequest.is_provider && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 8 }}>
                  <TextField
                    size="small"
                    variant="outlined"
                    value={selectedRequest.serial_number || ''}
                    onChange={(e) =>
                      setSelectedRequest({ ...selectedRequest, serial_number: e.target.value })
                    }
                    placeholder={t('Enterserialnumber')}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={handleSaveSerial}
                  >
                    {t('save')}
                  </Button>
                </div>
              )}

              {/* Completed By (Provider Comment) */}
              {selectedRequest.is_provider && selectedRequest.status === 'in_progress' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 8 }}>
                  <TextField
                    multiline
                    minRows={2}
                    size="small"
                    variant="outlined"
                    value={completedByText}
                    onChange={(e) => setCompletedByText(e.target.value)}
                    placeholder={t('EnterCompletionComment')}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    onClick={handleSaveCompletedBy}
                  >
                    {t('save')}
                  </Button>
                </div>
              )}

              {/* File Upload */}
              {selectedRequest.is_provider && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Button variant="outlined" component="label" size="small">
                      {t('UploadFile')}
                      <input type="file" hidden onChange={handleFileSelect} />
                    </Button>
                    {selectedRequest.newFiles?.length > 0 && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={handleSaveFiles}
                      >
                        {t('save')}
                      </Button>
                    )}
                  </div>

                  {/* Files List */}
                  <ul style={{ marginTop: 8, paddingLeft: 0, listStyle: 'none' }}>
                    {/* Existing files */}
                    {(selectedRequest.files || []).map((f) => (
                      <li
                        key={f.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 4,
                        }}
                      >
                        <a href={f.file} target="_blank" rel="noreferrer">
                          {f.file.split('/').pop()}
                        </a>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteFile(f.id)}
                        >
                          {t('Delete')}
                        </Button>
                      </li>
                    ))}

                    {/* New files (not uploaded yet) */}
                    {(selectedRequest.newFiles || []).map((f, i) => (
                      <li
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 4,
                        }}
                      >
                        <span>{f.name} (new)</span>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleRemoveNewFile(i)}
                        >
                          {t('Delete')}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <Typography align="center">{t('Loading')}</Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
          {/* Occupy Task */}
          {selectedRequest && canUserOccupy(selectedRequest) && (
            <Button onClick={handleOccupyTask} variant="contained" color="secondary" size="small">
              {t('OccupyTask')}
            </Button>
          )}

          {/* Reject Task */}
          {selectedRequest && canUserReject(selectedRequest) && (
            <Button onClick={handleRejectTask} variant="contained" color="error" size="small">
              {t('RejectTask')}
            </Button>
          )}

          {/* Complete Task */}
          {selectedRequest && canUserComplete(selectedRequest) && (
            <Button onClick={handleCompleteTask} variant="contained" color="warning" size="small">
              {t('MarkasCompleted')}
            </Button>
          )}

          {/* Approve Delivery */}
          {selectedRequest && canUserApprove(selectedRequest) && (
            <Button onClick={handleApproveDelivery} variant="contained" size="small">
              {t('ApproveDelivery')}
            </Button>
          )}

          <Button onClick={handleClose} variant="outlined" color="inherit" size="small">
            {t('Close')}
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
