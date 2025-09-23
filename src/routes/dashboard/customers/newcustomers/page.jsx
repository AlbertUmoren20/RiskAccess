import React, { useState } from 'react';
import { Box, Button, TextField, FormControl, InputLabel, MenuItem, Select, FormHelperText, CircularProgress } from '@mui/material';
import { Formik } from 'formik';
import * as yup from 'yup';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { supabase } from '@/lib/supabaseClient';
import { Resend } from 'resend';

const NewCustomerPage = () => {
   const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formValues, setFormValues] = useState(initialValues); // Store form values for success message
  
  const handleNavigation = () => {
    navigate('/admin/customers'); 
  }
  const handleFormSubmit = async (values) => {
    setLoading(true);
    setError(null);
    setFormValues(values); // Store values for success message
    
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            access: values.access,
          }
        }
      });

      if (authError) throw authError;

      // Add additional data to profiles table
      const { error: profileError } = await supabase
        .from('team_members')
        .insert([{
          id: authData.user.id,
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          phone: values.contact,
          address1: values.address1,
          address2: values.address2,
          access: values.access,
        }]);

      if (profileError) throw profileError;
        await fetch('/functions/handler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        email: values.email,
        firstName: values.firstName,
        password: values.password,
        }),
      });
        if (!response.ok) throw new Error("Failed to send welcome email");

      setSuccess(true);
      setTimeout(() => router.push('/admin/customers'), 2000);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  

  if (success) {
    return (
      <Box className="min-h-screen flex items-center justify-center p-4">
        <Box className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Created</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {formValues.firstName} {formValues.lastName} has been added to your team
          </p>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/admin/customers')}
            className="w-full"
          >
            Back to Team
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Box className="mb-8">
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick= {handleNavigation}
            className="mb-6"
          >
            Back to Customers
          </Button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg">
              <UserPlus className="text-indigo-600 dark:text-indigo-400" size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Add New Team Member</h1>
              <p className="text-gray-600 dark:text-gray-400">Create a new account for your team members</p>
            </div>
          </div>
        </Box>

        <Box className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8">
          <Formik
            onSubmit={handleFormSubmit}
            initialValues={initialValues}
            validationSchema={checkoutSchema}
          >
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="First Name"
                    name="firstName"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.firstName && !!errors.firstName}
                    helperText={touched.firstName && errors.firstName}
                    className="dark:[&_.MuiInputLabel-root]:text-gray-300 dark:[&_.MuiInputBase-input]:text-white"
                  />
                  
                  <TextField
  fullWidth
  variant="outlined"
  label="Last Name"
  name="lastName"
  value={values.lastName}
  onChange={handleChange}
  onBlur={handleBlur}
  error={!!touched.lastName && !!errors.lastName}
  helperText={touched.lastName && errors.lastName}
  className="dark:[&_.MuiInputLabel-root]:text-gray-300 dark:[&_.MuiInputBase-input]:text-white"
/>

<TextField
  fullWidth
  variant="outlined"
  label="Email"
  name="email"
  value={values.email}
  onChange={handleChange}
  onBlur={handleBlur}
  error={!!touched.email && !!errors.email}
  helperText={touched.email && errors.email}
  className="dark:[&_.MuiInputLabel-root]:text-gray-300 dark:[&_.MuiInputBase-input]:text-white"
/>

<TextField
  fullWidth
  variant="outlined"
  label="Phone Number"
  name="contact"
  value={values.contact}
  onChange={handleChange}
  onBlur={handleBlur}
  error={!!touched.contact && !!errors.contact}
  helperText={touched.contact && errors.contact}
  className="dark:[&_.MuiInputLabel-root]:text-gray-300 dark:[&_.MuiInputBase-input]:text-white"
/>

<TextField
  fullWidth
  variant="outlined"
  label="Address Line 1"
  name="address1"
  value={values.address1}
  onChange={handleChange}
  onBlur={handleBlur}
  error={!!touched.address1 && !!errors.address1}
  helperText={touched.address1 && errors.address1}
  className="dark:[&_.MuiInputLabel-root]:text-gray-300 dark:[&_.MuiInputBase-input]:text-white"
/>

<TextField
  fullWidth
  variant="outlined"
  label="Address Line 2"
  name="address2"
  value={values.address2}
  onChange={handleChange}
  onBlur={handleBlur}
  error={!!touched.address2 && !!errors.address2}
  helperText={touched.address2 && errors.address2}
  className="dark:[&_.MuiInputLabel-root]:text-gray-300 dark:[&_.MuiInputBase-input]:text-white"
/>

<FormControl
  fullWidth
  error={!!touched.access && !!errors.access}
>
  <InputLabel className="dark:text-gray-300">Access Level</InputLabel>
  <Select
    label="Access Level"
    name="access"
    value={values.access}
    onChange={handleChange}
    onBlur={handleBlur}
    className="dark:text-white"
  >
    <MenuItem value="admin">Admin</MenuItem>
    <MenuItem value="manager">Manager</MenuItem>
    <MenuItem value="user">User</MenuItem>
  </Select>
  <FormHelperText>{touched.access && errors.access}</FormHelperText>
</FormControl>

<TextField
  fullWidth
  variant="outlined"
  label="Password"
  name="password"
  type="password"
  value={values.password}
  onChange={handleChange}
  onBlur={handleBlur}
  error={!!touched.password && !!errors.password}
  helperText={touched.password && errors.password}
  className="dark:[&_.MuiInputLabel-root]:text-gray-300 dark:[&_.MuiInputBase-input]:text-white"
/>

<TextField
  fullWidth
  variant="outlined"
  label="Confirm Password"
  name="confirmPassword"
  type="password"
  value={values.confirmPassword}
  onChange={handleChange}
  onBlur={handleBlur}
  error={!!touched.confirmPassword && !!errors.confirmPassword}
  helperText={touched.confirmPassword && errors.confirmPassword}
  className="dark:[&_.MuiInputLabel-root]:text-gray-300 dark:[&_.MuiInputBase-input]:text-white"
/>
                  
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                <div className="flex justify-end mt-8">
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                    className="min-w-[180px]"
                  >
                    {loading ? 'Creating User...' : 'Create New User'}
                  </Button>
                </div>
              </form>
            )}
          </Formik>
        </Box>
      </div>
    </Box>
  );
};

// Validation schemas and initial values remain the same
const phoneRegExp = /^(\+(?:[0-9]{1,3})[- ]?)?(?:\([0-9]{2,3}\)[- ]?|[0-9]{2,4}[- ]?)*[0-9]{3,4}[- ]?[0-9]{3,4}$/;
const passwordRegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

const checkoutSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  contact: yup.string().matches(phoneRegExp, 'Phone number is not valid').required('Phone number is required'),
  address1: yup.string().required('Address is required'),
  address2: yup.string(),
  access: yup.string()
    .oneOf(['admin', 'manager', 'user'], 'Invalid access level')
    .required('Access level is required'),
  password: yup.string()
    .matches(passwordRegExp, 'Password must be at least 8 characters, include at least one letter and one number')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  contact: '',
  address1: '',
  address2: '',
  access: 'user',
  password: '',
  confirmPassword: ''
};

export default NewCustomerPage;