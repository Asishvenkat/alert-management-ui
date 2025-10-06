import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  Snooze,
  Warning,
  Error,
  Info,
  NotificationsActive,
  Circle,
} from '@mui/icons-material';
import { userAlertAPI } from '../../services/api';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await userAlertAPI.getAlerts();
      // Normalize different possible response shapes:
      // - { success: true, data: [...] }
      // - { results: [...] } (paginated)
      // - raw array [...]
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

      // Normalize field names used by the UI
      const normalized = list.map((a) => ({
        _id: a.id ?? a._id ?? a.pk ?? a.uuid,
        title: a.title,
        message: a.message,
        severity: a.severity,
        isRead: a.is_read ?? a.isRead ?? a.read ?? false,
        isSnoozed: a.is_snoozed ?? a.isSnoozed ?? a.snoozed ?? false,
        createdAt: a.created_at ?? a.createdAt ?? a.created_at,
        expiryTime: a.expiry_time ?? a.expiryTime ?? a.expiry_time,
      }));

      setAlerts(normalized);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (alertId) => {
    try {
      await userAlertAPI.markAsRead(alertId);
      setFeedback({ type: 'success', message: 'Alert marked as read' });
      loadAlerts();
    } catch (error) {
      setFeedback({ type: 'error', message: 'Error marking alert as read' });
    }
  };

  const handleSnooze = async (alertId) => {
    try {
      await userAlertAPI.snoozeAlert(alertId);
      setFeedback({ type: 'success', message: 'Alert snoozed until end of day' });
      loadAlerts();
    } catch (error) {
      setFeedback({ type: 'error', message: 'Error snoozing alert' });
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'Critical':
        return <Error color="error" />;
      case 'Warning':
        return <Warning color="warning" />;
      case 'Info':
        return <Info color="info" />;
      default:
        return <NotificationsActive />;
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

  // Defensive: ensure alerts is always treated as an array
  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const unreadCount = safeAlerts.filter(a => !a?.isRead).length;
  const snoozedCount = safeAlerts.filter(a => a?.isSnoozed).length;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Welcome, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You have {unreadCount} unread {unreadCount === 1 ? 'alert' : 'alerts'}
        </Typography>
      </Box>

      {feedback && (
        <Alert
          severity={feedback.type}
          onClose={() => setFeedback(null)}
          sx={{ mb: 3 }}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <NotificationsActive color="primary" sx={{ mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  Total Alerts
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {safeAlerts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Circle color="error" sx={{ mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  Unread
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {unreadCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Snooze color="warning" sx={{ mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  Snoozed
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {snoozedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts List */}
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
        Your Alerts
      </Typography>

      {loading ? (
        <Paper sx={{ p: 3 }}>
          <Typography>Loading alerts...</Typography>
        </Paper>
  ) : safeAlerts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <NotificationsActive sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No alerts at the moment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You're all caught up!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {alerts.map((alert) => (
            <Grid item xs={12} key={alert._id}>
              <Card
                sx={{
                  borderLeft: 6,
                  borderColor: alert.isSnoozed
                    ? 'grey.400'
                    : alert.isRead
                    ? 'success.main'
                    : getSeverityColor(alert.severity) + '.main',
                  opacity: alert.isSnoozed ? 0.7 : 1,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getSeverityIcon(alert.severity)}
                      <Box>
                        <Typography variant="h6" component="div" fontWeight="bold">
                          {alert.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={alert.severity}
                            color={getSeverityColor(alert.severity)}
                            size="small"
                          />
                          {alert.isRead && (
                            <Chip
                              label="Read"
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {alert.isSnoozed && (
                            <Chip
                              label="Snoozed"
                              color="warning"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                    <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
                      {alert?.message}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="caption" color="text.secondary">
                      Created: {alert?.createdAt ? format(new Date(alert.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'} • 
                      Expires: {alert?.expiryTime ? format(new Date(alert.expiryTime), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  {!alert.isRead && (
                    <Button
                      size="small"
                      startIcon={<CheckCircle />}
                      onClick={() => handleMarkAsRead(alert._id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                  {!alert.isSnoozed && (
                    <Button
                      size="small"
                      startIcon={<Snooze />}
                      onClick={() => handleSnooze(alert._id)}
                      color="warning"
                    >
                      Snooze for Today
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default UserDashboard;