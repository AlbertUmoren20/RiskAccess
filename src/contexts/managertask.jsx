import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Chip } from '@mui/material';
import { useTasks } from '@/contexts/taskcontext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function ManagerTasksPage({ teamMembers }) {
  const { tasks, loading, createTask } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    start: new Date(),
    end: new Date(),
    assigned_to: [],
    status: 'Not Started',
  });

  const statusColors = {
    'Completed': 'bg-green-100 text-green-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Not Started': 'bg-gray-100 text-gray-800',
    'Overdue': 'bg-red-100 text-red-800',
    // 'Pending Review': 'bg-yellow-100 text-yellow-800'
  };

  const toggleTeamMember = (name) => {
    setNewTask(prev => ({
      ...prev,
      assigned_to: prev.assigned_to.includes(name)
        ? prev.assigned_to.filter(m => m !== name)
        : [...prev.assigned_to, name]
    }));
    console.log("Teammembers : ", teamMembers )
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
      });
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Manager Task Board
      </Typography>

      <Button variant="contained" color="primary" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Assign New Task'}
      </Button>

      {showForm && (
        <Box mt={3} className="bg-white p-4 rounded-lg shadow">
          {error && <div className="text-red-500 mb-2">{error}</div>}

          <label className="block text-sm font-medium mb-1">Task Title</label>
          <input
            type="text"
            value={newTask.title}
            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full border rounded px-3 py-2 mb-3"
          />

          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={newTask.status}
            onChange={e => setNewTask({ ...newTask, status: e.target.value })}
            className="w-full border rounded px-3 py-2 mb-3"
          >
            {Object.keys(statusColors).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start</label>
              <DatePicker
                selected={newTask.start}
                onChange={date => setNewTask({ ...newTask, start: date })}
                showTimeSelect
                dateFormat="Pp"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End</label>
              <DatePicker
                selected={newTask.end}
                onChange={date => setNewTask({ ...newTask, end: date })}
                showTimeSelect
                dateFormat="Pp"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <label className="block text-sm font-medium mb-2">Assign To Team Members</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {teamMembers?.map(member => {
              const displayName = member?.name || member?.full_name || 'No Name';
              return (
                <div
                  key={member.id}
                  onClick={() => toggleTeamMember(displayName)}
                  className={`flex items-center p-2 rounded-lg border cursor-pointer ${
                    newTask.assigned_to.includes(displayName)
                      ? 'bg-indigo-100 border-indigo-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 mr-2">
                    {displayName.charAt(0)}
                  </div>
                  <span>{displayName}</span>
                </div>
              );
            })}
          </div>

          {/* <Button variant="contained" color="success" onClick={handleAddTask}>
            Create Task
          </Button> */}
        </Box>
      )}

      {/* Manager's task list */}
      <Box mt={4}>
        {tasks.map(task => (
          <Box key={task.id} p={2} mb={2} className="bg-gray-50 rounded-lg shadow-sm">
            <Typography variant="h6">{task.title}</Typography>
            <Chip label={task.status} className={statusColors[task.status]} />
            <Typography variant="body2" color="textSecondary">
              Assigned to: {task.assigned_to}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
