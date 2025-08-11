import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, Users, BarChart, Shield, ChevronRight } from "lucide-react";

const UserSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Header */}
      <div className="w-full max-w-4xl text-center mb-8 sm:mb-12">
        <div className="flex justify-center mb-4">
          <div className="bg-indigo-600 p-3 rounded-xl shadow-lg">
            <Shield className="text-white" size={36} />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
          Risk Monitoring System
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Select your role to access the system dashboard and management tools
        </p>
      </div>
      
      {/* Role Selection Cards */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* User Card */}
        <div 
          onClick={() => navigate("/userlogin")}
          className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-indigo-300 cursor-pointer group"
        >
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="bg-indigo-100 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                  <User className="text-indigo-600" size={24} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">User</h2>
                <p className="text-gray-600 text-sm mb-4">Access dashboard and reports</p>
              </div>
              <ChevronRight className="text-gray-400 mt-1 group-hover:text-indigo-600 transition-colors" />
            </div>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></div>
                <span>View risk metrics</span>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></div>
                <span>Generate reports</span>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></div>
                <span>Submit incidents</span>
              </li>
            </ul>
          </div>
          <div className="bg-indigo-50 px-6 py-3 border-t border-indigo-100">
            <button className="text-indigo-700 font-medium text-sm flex items-center">
              Login as User
              <ChevronRight className="ml-1" size={16} />
            </button>
          </div>
        </div>
        
        {/* Manager Card */}
        <div 
          onClick={() => navigate("/managerlog")}
          className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-emerald-300 cursor-pointer group"
        >
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="bg-emerald-100 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="text-emerald-600" size={24} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">Manager</h2>
                <p className="text-gray-600 text-sm mb-4">Oversee teams and performance</p>
              </div>
              <ChevronRight className="text-gray-400 mt-1 group-hover:text-emerald-600 transition-colors" />
            </div>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                <span>Team management</span>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                <span>Performance analytics</span>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                <span>Risk assessment</span>
              </li>
            </ul>
          </div>
          <div className="bg-emerald-50 px-6 py-3 border-t border-emerald-100">
            <button className="text-emerald-700 font-medium text-sm flex items-center">
              Login as Manager
              <ChevronRight className="ml-1" size={16} />
            </button>
          </div>
        </div>
        
        {/* Admin Card */}
        <div 
          onClick={() => navigate("/adminlog")}
          className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-purple-300 cursor-pointer group"
        >
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="bg-purple-100 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                  <Settings className="text-purple-600" size={24} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">Admin</h2>
                <p className="text-gray-600 text-sm mb-4">Configure system settings</p>
              </div>
              <ChevronRight className="text-gray-400 mt-1 group-hover:text-purple-600 transition-colors" />
            </div>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                <span>System configuration</span>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                <span>User management</span>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                <span>Security settings</span>
              </li>
            </ul>
          </div>
          <div className="bg-purple-50 px-6 py-3 border-t border-purple-100">
            <button className="text-purple-700 font-medium text-sm flex items-center">
              Login as Admin
              <ChevronRight className="ml-1" size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      {/* <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">System Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"> */}
          {/* <div className="bg-indigo-50 rounded-xl p-4 flex items-center">
            <div className="bg-indigo-100 p-3 rounded-lg mr-4">
              <BarChart className="text-indigo-600" size={20} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Active Users</p>
              <p className="text-xl font-bold text-gray-800">1,248</p>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 flex items-center">
            <div className="bg-emerald-100 p-3 rounded-lg mr-4">
              <Users className="text-emerald-600" size={20} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Teams</p>
              <p className="text-xl font-bold text-gray-800">42</p>
            </div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <Shield className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Protected Assets</p>
              <p className="text-xl font-bold text-gray-800">5,739</p>
            </div>
          </div> */}
        {/* </div> */}
       {/* </div> */}
      
      {/* Footer */}
      <div className="text-gray-600 text-sm text-center">
        <p>© {new Date().getFullYear()} Risk Monitoring System. All rights reserved.</p>
        <p className="mt-1 text-gray-500 text-xs">v2.5.1 | Secure Access Portal</p>
      </div>
    </div>
  );
};

export default UserSelection;