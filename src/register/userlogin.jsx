import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, Shield, Users } from "lucide-react";
import { useSupabaseLogin } from "./sharedlogin"
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const UserLogin = () => {
   const supabase = useSupabaseClient(); 
  const navigate = useNavigate();
    const { login } = useSupabaseLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const { email, password } = credentials;
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // const handleLogin = (e) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   // Simulate login process
  //   setTimeout(() => {
  //     setIsLoading(false);
  //     navigate("/dashboard");
  //   }, 1500);
  // };

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

      // ✅ Successful login
      console.log("Auth data:", authData);
      console.log("Team member:", teamMember);
      navigate("/userHome");


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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-2xl">
              <User className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">User Login</h1>
          <p className="text-indigo-200 mt-2">Access your risk monitoring dashboard</p>
        </div>
        
        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6">
          <div className="mb-5">
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="text-gray-400" size={18} />
              </div>
              <input
                type="email"
                id="email"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="you@company.com"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="mb-5">
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-gray-400" size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
              />
              <button 
                disabled={isLoading} 
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                  
              >

                {showPassword ? (
                  <EyeOff className="text-gray-400 hover:text-gray-600" size={18} />
                ) : (
                  <Eye className="text-gray-400 hover:text-gray-600" size={18} />
                )}
                    {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </a>
            </div>
          </div>
          
          <button
            type="submit"
            className={`w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition duration-300 ${
              isLoading ? "opacity-80 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
            
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </div>
            ) : (
              "Sign in to Dashboard"
            )}
            
          </button>
        </form>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{" "}
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              Contact your administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
export default UserLogin;