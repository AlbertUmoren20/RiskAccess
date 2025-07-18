import React from 'react';
import {Box} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { mockDataTeam } from '@/constants/index';
import { Type } from 'lucide-react';


const columns = [
    { field: 'id', headerName: 'ID', width: 90,cellclassName: 'name-column--cell' },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    // { field: 'age', headerName: 'Age', width: 150, headerAlign: "left", align: "left", type: "number"},
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'access', headerName: 'Access Level', width: 150, renderCell: ({row: {access}}) =>{
        return (
            <Box
                sx={{
                    backgroundColor: access === 'admin' ? '#d1e7dd' : access === 'manager' ? '#fff3cd' : '#f8d7da',
                    color: access === 'admin' ? '#0f5132' : access === 'manager' ? '#664d03' : '#842029',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    textAlign: 'center',
                }}
            >
                {access}
            </Box>
        );
    } },
];

function CustomersPage() {
    return (
        <Box className="page">
            <h1 className="title">Customers</h1>
            <p className="description ">Manage your customers here </p>

            <Box>
                <DataGrid
                rows={mockDataTeam}
                columns={columns}
                
                
                />
            </Box>
            </Box>
            
        
    );
}

export default CustomersPage;