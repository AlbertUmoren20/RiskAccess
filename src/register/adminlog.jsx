import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Formik } from "formik";
import * as yup from "yup";
import { useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';

export function AdminLogin() {
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  const { isLoading, session } = useSessionContext();

  console.log('Loading state:', isLoading); // Debug log
  console.log('Session:', session); // Debug log

  if (isLoading) {
    return <div>Loading...</div>;
  }
  const passwordRegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
  const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleFormSubmit = async (values) => {
    console.log(values);
    // Add your form submission logic here
  };

  const googleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar',
        redirectTo: `${window.location.origin}/admin`
      }
    });

    if (error) {
      alert("Error logging in with Google");
      console.error(error);
    }
  };

  const initialValues = { name: '', email: '', password: '' };
  const checkoutSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().matches(emailRegExp, 'Invalid email').required('Email is required'),
    password: yup
      .string()
      .matches(passwordRegExp, "Password must be at least 8 characters")
      .required("Password is required"),
  });

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
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
          <div className="form" style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '400px'
          }}>
            <div className="heading" style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>ADMIN LOGIN</div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                {touched.name && errors.name && (
                  <div className="error" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.name}</div>
                )}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>E-Mail</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                {touched.email && errors.email && (
                  <div className="error" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email}</div>
                )}
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                {touched.password && errors.password && (
                  <div className="error" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.password}</div>
                )}
              </div>
              <button 
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Submit
              </button>
            </form>

            <button
              onClick={googleSignIn}
              style={{
                width: '100%',
                marginTop: "20px",
                backgroundColor: "#4285F4",
                color: "white",
                border: "none",
                padding: "10px 20px",
                cursor: "pointer",
                borderRadius: "5px",
              }}
            >
              Sign in with Google
            </button>

            <p style={{ marginTop: '1rem', textAlign: 'center' }}>
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </div>
        )}
      </Formik>
    </div>
  );
}

export default AdminLogin;