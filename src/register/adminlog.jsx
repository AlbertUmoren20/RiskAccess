import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Formik } from "formik";
import * as yup from "yup";
import { useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import { Lock, User, Mail, Eye, EyeOff, Settings } from 'lucide-react';
import { useSupabaseLogin } from './sharedlogin';
import ForgotPassword from './forgotpassword'; 
import { useState } from 'react';

export function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useSupabaseLogin();
   const supabase = useSupabaseClient();  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [isLoading, setIsLoading] = useState(false);
  const { isLoading, setIsLoading } = useSessionContext();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
     const [sessionReady, setSessionReady] = useState(false);
    

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  const passwordRegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
  const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // Step 2: Fetch the matching team member row
      const { data: teamMember, error: teamError } = await supabase
        .from("team_members")
        .select("*")
        .eq("email", email)
        .maybeSingle(); // prevents "multiple or no rows" crash

      if (teamError) {
        setError(teamError.message);
        setLoading(false);
        return;
      }

      if (!teamMember) {
        setError("No matching team member found in database.");
        setLoading(false);
        return;
      }

      // Successful login
      console.log("Auth data:", authData);
      console.log("Team member:", teamMember);
      navigate("/admin");


      // You can redirect based on `teamMember.access` here
      // Example:
      // if (teamMember.access === "admin") navigate("/admin-dashboard");
      // else navigate("/user-dashboard");

    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;
      
      if (data.user) {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Login error:', error.message);
    } finally {
      setIsSubmitting(false);
    }
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
      console.error('Google login error:', error);
    }
  };

  const initialValues = { email: '', password: '' };
  const checkoutSchema = yup.object().shape({
    email: yup.string().matches(emailRegExp, 'Invalid email').required('Email is required'),
    password: yup
      .string()
      .matches(passwordRegExp, "Password must be at least 8 characters with letters and numbers")
      .required("Password is required"),
  });

    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Settings className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-600 mt-2">Sign in to your administrator account</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
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
                
              }) => (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="admin@example.com"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`block w-full pl-10 pr-3 py-3 border ${
                          touched.email && errors.email ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      />
                    </div>
                    {touched.email && errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`block w-full pl-10 pr-10 py-3 border ${
                          touched.password && errors.password ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      />
                      <button
                        disabled={isLoading}
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        )}
                        {isLoading ? "Logging in..." : ""}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                    <div className="text-sm">
                      <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Forgot password?
                      </a>
                    </div>
                  
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                        isSubmitting 
                          ? 'bg-indigo-400 cursor-not-allowed' 
                          : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </>
                      ) : (
                        'Sign in'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </Formik>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 gap-3">
                <button
                  onClick={googleSignIn}
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-8 py-6 rounded-b-2xl">
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Request access
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Risk Monitoring System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;