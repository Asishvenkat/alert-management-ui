import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Grid,
} from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import { adminAlertAPI } from '../../services/api';
import { format } from 'date-fns';

const CreateAlert = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    severity: 'Info',
    deliveryType: 'InApp',
    visibilityType: 'Organization',
    targetOrganization: 'default-org',
    reminderEnabled: true,
    reminderFrequencyHours: 2,
    expiryTime: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
  });

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: e.target.type === 'checkbox' ? checked : value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await adminAlertAPI.createAlert({
        ...formData,
        expiryTime: new Date(formData.expiryTime).toISOString(),
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/alerts');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/admin/alerts')}
        sx={{ mb: 2 }}
      >
        Back to Alerts
      </Button>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Create New Alert
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configure and send alerts to your organization, teams, or specific users
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Alert created successfully! Redirecting...</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Alert Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., System Maintenance Scheduled"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Detailed information about the alert..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Severity</InputLabel>
                <Select
                  name="severity"
                  value={formData.severity}
                  label="Severity"
                  onChange={handleChange}
                >
                  <MenuItem value="Info">Info</MenuItem>
                  <MenuItem value="Warning">Warning</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Delivery Type</InputLabel>
                <Select
                  name="deliveryType"
                  value={formData.deliveryType}
                  label="Delivery Type"
                  onChange={handleChange}
                >
                  <MenuItem value="InApp">In-App</MenuItem>
                  <MenuItem value="Email">Email (Coming Soon)</MenuItem>
                  <MenuItem value="SMS">SMS (Coming Soon)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Visibility</InputLabel>
                <Select
                  name="visibilityType"
                  value={formData.visibilityType}
                  label="Visibility"
                  onChange={handleChange}
                >
                  <MenuItem value="Organization">Entire Organization</MenuItem>
                  <MenuItem value="Team">Specific Teams</MenuItem>
                  <MenuItem value="User">Specific Users</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Expiry Date & Time"
                name="expiryTime"
                value={formData.expiryTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.reminderEnabled}
                    onChange={handleChange}
                    name="reminderEnabled"
                  />
                }
                label="Enable Reminders"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Reminder Frequency (hours)"
                name="reminderFrequencyHours"
                value={formData.reminderFrequencyHours}
                onChange={handleChange}
                disabled={!formData.reminderEnabled}
                inputProps={{ min: 1, max: 24 }}
              />
            </Grid>

            {formData.visibilityType === 'Organization' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Organization ID"
                  name="targetOrganization"
                  value={formData.targetOrganization}
                  onChange={handleChange}
                  helperText="Default: default-org"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/alerts')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Send />}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create & Send Alert'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateAlert;