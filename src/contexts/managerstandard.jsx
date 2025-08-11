import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStandards } from '@/contexts/standardscontext.jsx';
import { Box, Typography, CircularProgress, Button } from '@mui/material';


const ManagerStandardsPage = () => {
  const navigate = useNavigate();
  const { standards, loading } = useStandards();

  const navigateToStandard = (standard) => {
    if (!standard) return;
    const path = standard.slug 
      ? `/manager-dashboard/standards/${standard.slug}`
      : `/manager-dashboard/standards/${standard.id}`;
    navigate(path);
  };

  return (
    <Box className="p-6">
      <Typography variant="h4" className="font-bold text-gray-900 mb-2">
        Standards
      </Typography>
      <Typography variant="body1" className="text-gray-600 mb-6">
        Standards created by administrators for task assignment
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))"
          gap={3}
          mt={3}
        >
          {standards.map((standard) => (
            <Button
              key={standard.id}
              variant="contained"
              sx={{ 
                minHeight: 150,
                fontSize: '1.2rem',
                backgroundColor: standard.color,
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textTransform: 'none',
                textAlign: 'center',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3,
                  backgroundColor: standard.color
                },
                transition: 'all 0.3s ease'
              }}
              onClick={() => standard && navigateToStandard(standard)}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                {standard.title}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {standard.description}
              </Typography>
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ManagerStandardsPage;