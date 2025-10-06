import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  // TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Delete,
  Visibility,
  Send,
} from '@mui/icons-material';
import { adminAlertAPI } from '../../services/api';
import { format } from 'date-fns';

const AlertList = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
  });
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, [filters]);

  const loadAlerts = React.useCallback(async () => {
    try {
      const response = await adminAlertAPI.getAlerts(filters);
      // Normalize response shapes: array, {data: [...]}, {results: [...]}, or nested
      const payload = response?.data;
      let list = [];
      if (Array.isArray(payload)) {
        list = payload;
      } else if (Array.isArray(payload?.data)) {
        list = payload.data;
      } else if (Array.isArray(payload?.results)) {
        list = payload.results;
      } else if (Array.isArray(payload?.data?.results)) {
        list = payload.data.results;
      }

      const normalized = list.map((a) => ({
        _id: a.id ?? a._id ?? a.pk ?? a.uuid,
        title: a.title,
        message: a.message,
        severity: a.severity,
        visibilityType: a.visibility_type ?? a.visibilityType ?? a.visibility,
        isActive: a.is_active ?? a.isActive ?? a.active ?? false,
        expiryTime: a.expiry_time ?? a.expiryTime ?? a.expire_at,
      }));

      setAlerts(normalized);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = async () => {
    try {
      await adminAlertAPI.archiveAlert(selectedAlert._id);
      setDeleteDialog(false);
      loadAlerts();
    } catch (error) {
      console.error('Error archiving alert:', error);
    }
  };

  const handleTrigger = async (alertId) => {
    try {
      await adminAlertAPI.triggerAlert(alertId);
      alert('Alert triggered successfully!');
    } catch (error) {
      console.error('Error triggering alert:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'error';
      case 'Warning':
        return 'warning';
      case 'Info':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusChip = (alert) => {
    const now = new Date();
    const expiry = new Date(alert.expiryTime);
    
    if (expiry < now) {
      return <Chip label="Expired" size="small" color="default" />;
    }
    if (alert.isActive) {
      return <Chip label="Active" size="small" color="success" />;
    }
    return <Chip label="Inactive" size="small" color="default" />;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Manage Alerts
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/alerts/create')}
        >
          Create Alert
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              name="severity"
              value={filters.severity}
              label="Severity"
              onChange={handleFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Info">Info</MenuItem>
              <MenuItem value="Warning">Warning</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={filters.status}
              label="Status"
              onChange={handleFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Alerts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Severity</strong></TableCell>
              <TableCell><strong>Visibility</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Expiry</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No alerts found
                </TableCell>
              </TableRow>
            ) : (
              alerts.map((alert) => (
                <TableRow key={alert._id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {alert.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {alert.message.substring(0, 60)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={alert.severity}
                      color={getSeverityColor(alert.severity)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={alert.visibilityType}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{getStatusChip(alert)}</TableCell>
                  <TableCell>
                    {format(new Date(alert.expiryTime), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell align="right">
                    {/* <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/admin/alerts/${alert._id}`)}
                      title="View Details"
                    >
                      <Visibility />
                    </IconButton> */}
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleTrigger(alert._id)}
                      title="Trigger Manually"
                    >
                      <Send />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedAlert(alert);
                        setDeleteDialog(true);
                      }}
                      title="Archive"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Archive Alert?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to archive "{selectedAlert?.title}"? This will deactivate the alert and stop all reminders.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Archive
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AlertList;