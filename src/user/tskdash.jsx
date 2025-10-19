import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { CheckCircle, Pending, Warning, AttachFile, CalendarMonth, Person } from '@mui/icons-material';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { format, parseISO, isPast, isToday, isTomorrow } from 'date-fns';
import EvidenceUpload from '@/functions/EvidenceUpload';

const TskDash = () => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [evidenceDialog, setEvidenceDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle color="success" />;
      case 'In Progress': return <Pending color="warning" />;
      default: return <Warning color="info" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'warning';
      case 'Overdue': return 'error';
      default: return 'default';
    }
  };

  const getDueDateInfo = (dateString) => {
    if (!dateString) return { text: 'No due date', color: 'text.secondary' };
    
    const date = parseISO(dateString);
    let text = format(date, 'MMM dd, yyyy');
    let color = 'text.secondary';
    
    if (isPast(date) && !isToday(date)) {
      text = `Overdue: ${text}`;
      color = 'error.main';
    } else if (isToday(date)) {
      text = 'Due today';
      color = 'warning.main';
    } else if (isTomorrow(date)) {
      text = 'Due tomorrow';
      color = 'info.main';
    }
    
    return { text, color };
  };

  const fetchUserTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser?.email) return;

      const email = currentUser.email.toLowerCase();

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .order('end', { ascending: true });

      if (error) throw error;

      const filteredTasks = tasks.filter((task) => {
        if (!task.assigned_to) return false;
        const assignedList = task.assigned_to.split(",").map(entry => entry.trim().toLowerCase());
        return assignedList.includes(email);
      });

      setUserTasks(filteredTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserTasks();
    }
  }, [user, supabase]);

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      setUserTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      setSuccess('Task status updated successfully!');
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again.');
    }
  };

  const handleAddEvidence = (task) => {
    setSelectedTask(task);
    setEvidenceDialog(true);
  };

  const handleEvidenceSuccess = (message) => {
    setSuccess(message);
    fetchUserTasks(); 
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Task Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Tasks assigned to you
      </Typography>

      {/* Alerts */}
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)} message={success} />

      {/* Evidence Upload Dialog */}
      <EvidenceUpload
        open={evidenceDialog}
        onClose={() => setEvidenceDialog(false)}
        task={selectedTask}
        onSuccess={handleEvidenceSuccess}
      />

      {/* Tasks List */}
      {userTasks.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Pending sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No tasks assigned</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              You don't have any tasks assigned yet.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {userTasks.map((task) => {
            const dueDateInfo = getDueDateInfo(task.end);
            
            return (
              <Grid item xs={12} key={task.id}>
                <Card sx={{ transition: 'all 0.2s ease', '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {getStatusIcon(task.status)}
                          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>{task.title}</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 2 }}>
                          <Chip label={task.status || 'Not specified'} size="small" color={getStatusColor(task.status)} />
                          {task.standard && <Chip label={task.standard} size="small" variant="outlined" />}
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarMonth sx={{ fontSize: 18, mr: 0.5, color: dueDateInfo.color }} />
                            <Typography variant="body2" sx={{ color: dueDateInfo.color }}>{dueDateInfo.text}</Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Person sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">Assigned to: {task.assigned_to}</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        {task.status !== 'Completed' && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleStatusUpdate(task.id, task.status === 'Not Started' ? 'In Progress' : 'Completed')}
                          >
                            {task.status === 'Not Started' ? 'Start Task' : 'Complete'}
                          </Button>
                        )}
                        
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AttachFile />}
                          onClick={() => handleAddEvidence(task)}
                        >
                          Add Evidence
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default TskDash;