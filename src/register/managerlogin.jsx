import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, Users, Shield } from "lucide-react";

const ManagerLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "", teamCode: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true); 
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      navigate("/manager-dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-2xl">
              <Users className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Manager Login</h1>
          <p className="text-emerald-200 mt-2">Access team management dashboard</p>
        </div>
        
        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6">
          <div className="mb-5">
            <label htmlFor="manager-email" className="block text-gray-700 text-sm font-medium mb-2">
              Manager Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="text-gray-400" size={18} />
              </div>
              <input
                type="email"
                id="manager-email"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="manager@company.com"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="mb-5">
            <label htmlFor="manager-password" className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-gray-400" size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="manager-password"
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="text-gray-400 hover:text-gray-600" size={18} />
                ) : (
                  <Eye className="text-gray-400 hover:text-gray-600" size={18} />
                )}
              </button>
            </div>
          </div>
          
          <div className="mb-5">
            <label htmlFor="team-code" className="block text-gray-700 text-sm font-medium mb-2">
              Team Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield className="text-gray-400" size={18} />
              </div>
              <input
                type="text"
                id="team-code"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="Enter your team code"
                value={credentials.teamCode}
                onChange={(e) => setCredentials({...credentials, teamCode: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="remember-manager"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="remember-manager" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">
                Forgot password?
              </a>
            </div>
          </div>
          
          <button
            type="submit"
            className={`w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition duration-300 ${
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
              "Access Manager Dashboard"
            )}
          </button>
        </form>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm">
            Need help?{" "}
            <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">
              Contact IT Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManagerLogin;