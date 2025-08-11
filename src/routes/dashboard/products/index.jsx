import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStandards } from '@/contexts/standardscontext.jsx';
import { Button, Box, TextField, Typography, Paper, CircularProgress } from '@mui/material';
// import slugify from 'slugify';

const ProductsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const { standards, loading, createStandard } = useStandards();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#40E0D0',
  });

  const handleCreateClick = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({ title: '', description: '', color: '#40E0D0' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
   const slug = formData.title
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^\w-]+/g, ''); // Remove non-word characters
      
    const newStandard = {
      title: formData.title,
      description: formData.description,
      color: formData.color,
      slug: slug
    };

    const createdStandard = await createStandard(newStandard);
    if (createdStandard) {
      navigate(`/admin/standards/${createdStandard.slug}`);
    }
    handleCloseForm();
  };

  const navigateToStandard = (standard) => {
    // navigate(`/admin/standards/${slug}`);
    if (!standard) return;
     const path = standard.slug 
      ? `/admin/standards/${standard.slug}`
      : `/admin/standards/${standard.id}`;
    navigate(path);
  };

  return (
    <div style={{ position: 'relative' }}>
      {showForm && (
        <Box
          onClick={handleCloseForm}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 998,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      <div style={{ opacity: showForm ? 0.3 : 1, transition: 'opacity 0.3s' }}>
        <h1 className="title">Standards Management</h1>
        <p className="text-gray-600">Create and manage compliance standards</p>

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
            <Button 
              variant="contained" 
              sx={{ 
                minHeight: 150, 
                fontSize: '3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} 
              onClick={handleCreateClick}
            >
              +
            </Button>
            
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
      </div>
      
      {/* Form modal */}
      {showForm && (
        <Paper
          elevation={4}
          sx={{
            position: 'fixed',
            zIndex: 999,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '400px' },
            p: 3,
            backgroundColor: 'white',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Typography variant="h6" gutterBottom>
            Add New Standard
          </Typography>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
            required
          />
          <Box mt={2}>
            <Typography variant="body1" mb={1}>
              Pick a Color:
            </Typography>
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              style={{ width: '100%', height: '40px', border: 'none' }}
            />
          </Box>

          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button onClick={handleCloseForm} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSubmit}
              disabled={!formData.title.trim()}
            >
              Create Standard
            </Button> 
          </Box>
        </Paper>
      )}
    </div>
  );
};

export default ProductsPage;