import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Chip, Alert, Snackbar, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useTasks } from '@/contexts/taskcontext';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function ManagerTasksPage() {
  const { tasks, loading, createTask } = useTasks();
  const supabase = useSupabaseClient();
  const [teamMembers, setTeamMembers] = useState([]);
  const [standards, setStandards] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [loadingStandards, setLoadingStandards] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    start: new Date(),
    end: new Date(),
    assigned_to: [],
    status: 'Not Started',
    standard: '' 
  });

  const statusColors = {
    'Completed': 'bg-green-100 text-green-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Not Started': 'bg-gray-100 text-gray-800',
    'Overdue': 'bg-red-100 text-red-800',
  };

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoadingTeam(true);
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .order('first_name');
        
        if (error) throw error;
        setTeamMembers(data || []);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError('Failed to load team members');
      } finally {
        setLoadingTeam(false);
      }
    };
    
    fetchTeamMembers();
  }, [supabase]);


  useEffect(() => {
    const fetchStandards = async () => {
      try {
        setLoadingStandards(true);
        const { data, error } = await supabase
          .from('standards')
          .select('*')
          .order('title');
        
        if (error) throw error;
        setStandards(data || []);
      } catch (err) {
        console.error('Error fetching standards:', err);
        setError('Failed to load standards');
      } finally {
        setLoadingStandards(false);
      }
    };
    
    fetchStandards();
  }, [supabase]);

  const toggleTeamMember = (name) => {
    setNewTask(prev => ({
      ...prev,
      assigned_to: prev.assigned_to.includes(name)
        ? prev.assigned_to.filter(m => m !== name)
        : [...prev.assigned_to, name]
    }));
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      setError('Task title is required');
      return;
    }
    if (newTask.assigned_to.length === 0) {
      setError('Please assign to at least one team member');
      return;
    }
    try {
      await createTask(newTask);
      setNewTask({
        title: '',
        start: new Date(),
        end: new Date(),
        assigned_to: [],
        status: 'Not Started',
        standard: ''
      });
      setShowForm(false);
      setError(null);
      setSuccess('Task created successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setNewTask({
      title: '',
      start: new Date(),
      end: new Date(),
      assigned_to: [],
      status: 'Not Started',
      standard: ''
    });
    setError(null);
  };

  if (loading || loadingTeam || loadingStandards) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Manager Task Board
      </Typography>

      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => setShowForm(!showForm)}
        sx={{ mb: 3 }}
      >
        {showForm ? 'Cancel' : 'Assign New Task'}
      </Button>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        message={success}
      />

      {/* Task Creation Form */}
      {showForm && (
        <Box 
          mt={2} 
          p={3} 
          sx={{ 
            backgroundColor: 'white', 
            borderRadius: 2, 
            boxShadow: 1,
            border: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Create New Task
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Task Title */}
            <Box>
              <Typography variant="body2" fontWeight="medium" gutterBottom>
                Task Title *
              </Typography>
              <input
                type="text"
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task description"
              />
            </Box>

            {/* Standard Dropdown */}
            <Box>
              <Typography variant="body2" fontWeight="medium" gutterBottom>
                Standard (Optional)
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={newTask.standard}
                  onChange={e => setNewTask({ ...newTask, standard: e.target.value })}
                  displayEmpty
                  sx={{ 
                    backgroundColor: 'white',
                    '& .MuiSelect-select': {
                      py: 1.5
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>Select a standard (optional)</em>
                  </MenuItem>
                  {standards.map(standard => (
                    <MenuItem key={standard.id} value={standard.slug || standard.title}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {standard.color && (
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: standard.color,
                              mr: 1.5
                            }}
                          />
                        )}
                        {standard.title}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {standards.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  No standards available. Please ask an admin to create standards first.
                </Typography>
              )}
            </Box>

            {/* Status */}
            <Box>
              <Typography variant="body2" fontWeight="medium" gutterBottom>
                Status
              </Typography>
              <select
                value={newTask.status}
                onChange={e => setNewTask({ ...newTask, status: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(statusColors).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  Start Date & Time
                </Typography>
                <DatePicker
                  selected={newTask.start}
                  onChange={date => setNewTask({ ...newTask, start: date })}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  Due Date & Time
                </Typography>
                <DatePicker
                  selected={newTask.end}
                  onChange={date => setNewTask({ ...newTask, end: date })}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Box>
            </Box>

          
            <Box>
              <Typography variant="body2" fontWeight="medium" gutterBottom>
                Assign To Team Members *
              </Typography>
              
              {teamMembers.length === 0 ? (
                <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No team members found. Please add team members first.
                </Typography>
              ) : (
                <>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1.5, mb: 1 }}>
                    {teamMembers.map(member => {
                      const displayName = `${member.first_name} ${member.last_name}`.trim();
                      const isSelected = newTask.assigned_to.includes(displayName);
                      
                      return (
                        <Box
                          key={member.id}
                          onClick={() => toggleTeamMember(displayName)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1.5,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: isSelected ? 'primary.main' : 'grey.300',
                            backgroundColor: isSelected ? 'primary.light' : 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              backgroundColor: isSelected ? 'primary.light' : 'grey.50',
                              borderColor: isSelected ? 'primary.main' : 'grey.400'
                            }
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              backgroundColor: isSelected ? 'primary.main' : 'grey.200',
                              color: isSelected ? 'white' : 'grey.700',
                              fontWeight: 'bold',
                              fontSize: '0.875rem',
                              mr: 1.5
                            }}
                          >
                            {displayName.charAt(0).toUpperCase()}
                          </Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: isSelected ? '600' : '400',
                              color: isSelected ? 'primary.dark' : 'text.primary'
                            }}
                          >
                            {displayName}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                  
                  {newTask.assigned_to.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Selected: {newTask.assigned_to.join(', ')}
                    </Typography>
                  )}
                </>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', pt: 1 }}>
              <Button 
                variant="outlined" 
                onClick={resetForm}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleAddTask}
                disabled={!newTask.title.trim() || newTask.assigned_to.length === 0}
              >
                Create Task
              </Button>
            </Box>
          </Box>
        </Box>
      )}

 
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Your Created Tasks ({tasks.length})
        </Typography>
        
        {tasks.length === 0 ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8, 
              backgroundColor: 'grey.50', 
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'grey.300'
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No tasks created yet. Click "Assign New Task" to get started.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tasks.map(task => (
              <Box 
                key={task.id} 
                sx={{ 
                  p: 3, 
                  backgroundColor: 'white', 
                  borderRadius: 2, 
                  boxShadow: 1,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {task.title}
                  </Typography>
                  <Chip 
                    label={task.status} 
                    size="small"
                    sx={{
                      backgroundColor: statusColors[task.status]?.split(' ')[0] || 'grey.100',
                      color: statusColors[task.status]?.split(' ')[1] || 'grey.800'
                    }}
                  />
                </Box>
                
                {task.standard && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Standard: {task.standard}
                  </Typography>
                )}
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Assigned to: {task.assigned_to}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Due: {new Date(task.end).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}