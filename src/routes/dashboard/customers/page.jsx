import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
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
  PersonAdd,
  Edit,
  Delete,
  VerifiedUser
} from '@mui/icons-material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
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

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  const fetchCustomers = async () => {
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
      
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers();
  };
  const handleNavigation = () => {
  navigate('/admin/new-customer');
};

  return (
    <Box className="p-6 max-w-7xl mx-auto">
      <Box className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
            Team Members
          </Typography>
          <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your team members and their access levels
          </Typography>
        </div>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAdd />}
          onClick={handleNavigation}
          className="mt-4 md:mt-0"
        >
          Add Team Member
        </Button>
      </Box>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6">
          <div className="flex items-center">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg mr-4">
              <VerifiedUser className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">Total Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{customers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg mr-4">
              <VerifiedUser className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">Active Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {customers.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg mr-4">
              <VerifiedUser className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">Admins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {customers.filter(c => c.access === 'admin').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Box className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by name, email, or role..."
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
                onClick={fetchCustomers}
                className="bg-gray-100 dark:bg-gray-700"
              >
                <Refresh className="text-gray-600 dark:text-gray-300" />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded flex items-center">
            <div className="text-red-500 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
              <Button 
                variant="text" 
                color="error" 
                size="small"
                onClick={fetchCustomers}
                className="mt-1"
              >
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={customers}
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
                      {search ? 'Try a different search' : 'Add your first team member to get started'}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={<PersonAdd />}

                    >
                      Add Team Member
                    </Button>
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

     
    </Box>
  );
}

export default CustomersPage;