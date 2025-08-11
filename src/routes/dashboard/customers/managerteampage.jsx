import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { 
  DataGrid, 
  GridToolbarContainer, 
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarColumnsButton
} from '@mui/x-data-grid';
import { 
  Search, 
  Refresh,
  Assignment
} from '@mui/icons-material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { VerifiedUser } from '@mui/icons-material';
import Button from '@mui/material/Button';
import { Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const columns = [
  { 
    field: 'id', 
    headerName: 'ID', 
    width: 90,
    renderCell: (params) => <span className="font-mono">#{params.value}</span> 
  },
  { 
    field: 'first_name', 
    headerName: 'First Name', 
    width: 150,
    renderCell: (params) => (
      <div className="flex items-center">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 mr-2" />
        <span>{params.value}</span>
      </div>
    )
  },
  { 
    field: 'last_name', 
    headerName: 'Last Name', 
    width: 150 
  },
  { 
    field: 'email', 
    headerName: 'Email', 
    width: 220,
    renderCell: (params) => (
      <a 
        href={`mailto:${params.value}`} 
        className="text-blue-500 hover:underline"
      >
        {params.value}
      </a>
    )
  },
  { 
    field: 'phone', 
    headerName: 'Phone', 
    width: 160,
    renderCell: (params) => (
      <a 
        href={`tel:${params.value}`} 
        className="text-gray-600"
      >
        {params.value}
      </a>
    )
  },
  {
      field: 'access',
      headerName: 'Role',
      width: 150,
      renderCell: ({ row }) => (
        <Box
          sx={{
            backgroundColor:
              row.access === 'admin'
                ? '#d1e7dd'
                : row.access === 'manager'
                ? '#fff3cd'
                : '#f8d7da',
            color:
              row.access === 'admin'
                ? '#0f5132'
                : row.access === 'manager'
                ? '#664d03'
                : '#842029',
            padding: '5px 10px',
            borderRadius: '4px',
            textAlign: 'center',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {row.access}
        </Box>
      )
    },
  {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      disableExport: true,
      renderCell: () => (
        <div className="flex space-x-2">
          <Tooltip title="Edit">
            <IconButton size="small" color="primary">
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error">
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Profile">
            <IconButton size="small" color="secondary">
              <VerifiedUser fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      )
    }
];

function CustomToolbar() {
  return (
    <GridToolbarContainer className="p-4">
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarExport 
        printOptions={{ disableToolbarButton: true }} 
        csvOptions={{ allColumns: true }}
      />
    </GridToolbarContainer>
  );
}

function ManagerTeamPage() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const supabase = useSupabaseClient();
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [standards, setStandards] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('team_members')
        .select('*')
        
       
      if (search) {
        query = query.or(
          `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
        );
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        throw fetchError;
      }
      
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to load team members. Please try again.');
    } finally {
      setLoading(false);
    }
  };
    useEffect(() => {
      fetchTeamMembers();
    }, []);



  const handleSearch = (e) => {
    e.preventDefault();
    fetchTeamMembers();
  };

  // const handleAssignTask = (member) => {
  //   setSelectedMember(member);
  //   setShowAssignTaskModal(true);
  // };

  // const handleAssignTaskSubmit = async () => {
  //   if (!selectedMember || !selectedStandard || !taskTitle) return;
    
  //   try {
  //     const { error } = await supabase
  //       .from('tasks')
  //       .insert({
  //         title: taskTitle,
  //         description: taskDescription,
  //         assigned_to: selectedMember.id,
  //         assigned_by: 'manager', // Would be actual manager ID in real app
  //         status: 'assigned',
  //         due_date: dueDate,
  //         standard_id: selectedStandard
  //       });
      
  //     if (error) throw error;
      
  //     // Reset form and close modal
  //     setSelectedStandard('');
  //     setTaskTitle('');
  //     setTaskDescription('');
  //     setDueDate('');
  //     setShowAssignTaskModal(false);
  //     alert('Task assigned successfully!');
      
  //   } catch (error) {
  //     console.error('Error assigning task:', error);
  //     alert('Failed to assign task. Please try again.');
  //   }
  // };

  return (
    <Box className="p-6 max-w-7xl mx-auto">
      <Box className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <Typography variant="h4" className="font-bold text-gray-900">
            Team Members
          </Typography>
          <Typography variant="body1" className="text-gray-600 mt-2">
            Assign tasks to your team members
          </Typography>
        </div>
      </Box>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <VerifiedUser className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <VerifiedUser className="text-green-600" />
            </div>
            <div>
              <p className="text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.filter(m => m.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <VerifiedUser className="text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600">Tasks Assigned</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
      </div>

      <Box className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="text-gray-400" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      type="submit"
                      variant="contained" 
                      color="primary"
                      className="h-full"
                    >
                      Search
                    </Button>
                  </InputAdornment>
                )
              }}
            />
          </form>
          
          <div className="flex space-x-2">
            <Tooltip title="Refresh">
              <IconButton 
                onClick={fetchTeamMembers}
                className="bg-gray-100"
              >
                <Refresh className="text-gray-600" />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-center">
            <div className="text-red-500 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-red-700 font-medium">{error}</p>
              <Button 
                variant="text" 
                color="error" 
                size="small"
                onClick={fetchTeamMembers}
                className="mt-1"
              >
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={teamMembers}
              columns={columns}
              loading={loading}
              getRowId={(row) => row.id}
              components={{
                Toolbar: CustomToolbar,
                LoadingOverlay: () => (
                  <div className="flex items-center justify-center h-full">
                    <CircularProgress />
                    <span className="ml-3">Loading team members...</span>
                  </div>
                ),
                NoRowsOverlay: () => (
                  <div className="flex flex-col items-center justify-center h-full p-10">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
                    <Typography variant="h6" className="mb-2">
                      No team members found
                    </Typography>
                    <Typography variant="body2" className="text-gray-500 mb-4">
                      {search ? 'Try a different search' : 'No team members assigned'}
                    </Typography>
                  </div>
                )
              }}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 25]}
              checkboxSelection
              disableSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'rgba(249, 250, 251, 0.8)',
                  backdropFilter: 'blur(8px)',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px'
                },
                '& .MuiDataGrid-virtualScroller': {
                  backgroundColor: 'white'
                },
                '& .MuiDataGrid-footerContainer': {
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px'
                },
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none'
                }
              }}
              className="rounded-xl"
            />
          </Box>
        )}
      </Box>

      {/* Assign Task Modal */}
      {showAssignTaskModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h5" className="font-bold">
                Assign Task to {selectedMember.first_name} {selectedMember.last_name}
              </Typography>
              <button 
                onClick={() => setShowAssignTaskModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Select Standard
                </label>
                <select
                  value={selectedStandard}
                  onChange={(e) => setSelectedStandard(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a standard</option>
                  {standards.map(standard => (
                    <option key={standard.id} value={standard.id}>
                      {standard.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter task title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter task description"
                  rows="3"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outlined"
                onClick={() => setShowAssignTaskModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAssignTaskSubmit}
                disabled={!selectedStandard || !taskTitle}
              >
                Assign Task
              </Button>
            </div>
          </div>
        </div>
      )}
    </Box>
  );
}

export default ManagerTeamPage;