import React, { useState, useEffect } from 'react';
import {FilterList} from '@mui/icons-material';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Button,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Avatar
} from '@mui/material';
import {
  Search,
  Refresh,
  CalendarMonth,
  Person,
  Flag,
  MoreVert,
  CheckCircle,
  Pending,
  Warning
} from '@mui/icons-material';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { format, parseISO, isPast, isToday, isTomorrow } from 'date-fns';

const ManagerViewTask = () => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch tasks assigned to the manager
  const fetchTasks = async () => {
    if (!user?.user_metadata?.full_name) return;
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .ilike("assigned_to", `%${user.user_metadata.name}%`)
        .order("end", { ascending: true });

      if (error) throw error;

      setTasks(data || []);
      setFilteredTasks(data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  // Filter tasks based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = tasks.filter(task => 
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.standard?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks(tasks);
    }
  }, [searchTerm, tasks]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle color="success" />;
      case 'In progress': return <Pending color="warning" />;
      default: return <Warning color="info" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In progress': return 'warning';
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

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks);
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again.');
    }
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
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            My Tasks
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tasks assigned to you by administrators
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          onClick={fetchTasks}
          startIcon={<Refresh />}
        >
          Refresh
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tasks Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredTasks.length} of {tasks.length} tasks
      </Typography>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Pending sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No tasks found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {tasks.length === 0 
                ? "You don't have any tasks assigned yet." 
                : "Try adjusting your search query."}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredTasks.map((task) => {
            const dueDateInfo = getDueDateInfo(task.end);
            
            return (
              <Grid item xs={12} key={task.id}>
                <Card 
                  sx={{ 
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {getStatusIcon(task.status)}
                          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                            {task.title}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 2 }}>
                          <Chip 
                            label={task.status || 'Not specified'} 
                            size="small" 
                            color={getStatusColor(task.status)} 
                          />
                          
                          {task.standard && (
                            <Chip 
                              label={task.standard} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarMonth sx={{ fontSize: 18, mr: 0.5, color: dueDateInfo.color }} />
                            <Typography variant="body2" sx={{ color: dueDateInfo.color }}>
                              {dueDateInfo.text}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Person sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Assigned to: {task.assigned_to}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <IconButton size="small">
                          <MoreVert />
                        </IconButton>
                        
                        {task.status !== 'Completed' && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleStatusUpdate(
                              task.id, 
                              task.status === 'assigned' ? 'In Progress' : 'Completed'
                            )}
                            sx={{ mt: 2 }}
                          >
                            {task.status === 'assigned' ? 'Start Task' : 'Complete'}
                          </Button>
                        )}
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

export default ManagerViewTask;