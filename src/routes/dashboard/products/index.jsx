import React, { useState } from 'react';
import { Button, Box, TextField, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';


const ProductsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const [standards, setStandards] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#40E0D0', // Default color
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

  const handleSubmit = () => {
    console.log('New Standard:', formData);
    setStandards((prev) => [
      ...prev, {
        id: Date.now(), ...formData},
    ])
    // TODO: Add to the standards list
    handleCloseForm();
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
        <h1 className="title">Standard Page</h1>
        <p className="text-gray-600">This is the standard page content.</p>

        <Box
          display="grid"
          gridTemplateColumns="repeat(2, auto)"
          gap={2}
          mt={2}
          sx={{
            '@media (max-width: 900px)': {
              gridTemplateColumns: 'repeat(2, auto)',
            },
            '@media (max-width: 600px)': {
              gridTemplateColumns: '1fr',
            },
          }}
        >
          
          <Button variant="contained" color="primary" sx={{ py: 7.5, fontSize: '3.3rem' }} onClick={handleCreateClick}>
            +
          </Button>
          <Button variant="contained" sx={{ py: 7.5, backgroundColor: '#40E0D0', fontSize: '1.3rem' }}onClick={() => navigate('/standards/iso')}>
            ISO 27001
          </Button>
          <Button variant="contained" color="secondary" sx={{ py: 7.5, fontSize: '1.3rem' }} onClick={() => navigate ('/standards/vulnerability')}>
            Vulnerability <br /> Assessment
          </Button>
          <Button variant="contained" color="success" sx={{ py: 7.5, fontSize: '1.3rem' }}  onClick={() => navigate('/standards/pci')}>
            PCI
          </Button>
          <Button variant="contained" color="warning" sx={{ py: 7.5, fontSize: '1.3rem' }} onClick={() => navigate('/standards/erm')}>
            ERM <br />(Enterprise Risk Management)
          </Button>
            <Button
            variant="contained"
            sx={{ py: 7.5, backgroundColor: '#FFB2B2', color: 'white', fontSize: '1.3rem' }} onClick={() => navigate ('/standards/regulatory-compliance')}
            >
            Regulatory Compliance
          </Button>

           {/* Display standards */}
      <Box display="grid"
          gridTemplateColumns="repeat(2, auto)"
          gap={2}
          mt={2}
           sx={{
            '@media (max-width: 900px)': {
              gridTemplateColumns: 'repeat(2, auto)',
            },
            '@media (max-width: 600px)': {
              gridTemplateColumns: '1fr',
            },
          }}
          >
        {standards.length === 0 ? (
          <Typography>No standards created yet.</Typography>
        ) : (
          standards.map((standard) => (
            <Button
              key={standard.id} 
              sx={{
                mb: 2,
                py: 7.5,
                fontSize: '1.3rem',
                backgroundColor: standard.color,
                color: '#fff'
              }}
            >
              <Typography variant="contained">{standard.title}</Typography>
              {/* <Typography>{standard.description}</Typography> */}
            </Button>
          ))
        )}
      </Box>

        </Box>
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
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Submit
            </Button> 
          </Box>
        </Paper>
      )}
    </div>
  );
};

export default ProductsPage;
