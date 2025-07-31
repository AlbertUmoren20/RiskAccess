import React from 'react';
import { useNavigate } from "react-router-dom";
// Uncomment after adding your logo to public/assets
// import logo from "@/public/etz.webp"; 

function Page() {
  const navigate = useNavigate();
  // Define your compliance modules with colors and IDs
  const complianceModules = [
    { id: "iso", name: "ISO 27001", color: "bg-blue-500 hover:bg-blue-600" },
    { id: "vulnerability", name: "Vulnerability Assessment", color: "bg-purple-500 hover:bg-purple-600" },
    { id: "pci", name: "PCI Compliance", color: "bg-yellow-500 hover:bg-yellow-600" },
    { id: "erm", name: "ERM Framework", color: "bg-green-500 hover:bg-green-600" },
    { id: "regulatory-compliance", name: "Compliance Tool", color: "bg-red-500 hover:bg-red-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col items-center mb-16">
          {/* Uncomment after adding your logo */}
 
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Risk & Compliance Management System
            </h1>
            <div className="w-24 h-1 bg-indigo-500 mx-auto mb-6"></div>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Comprehensive Monitoring Platform for Operational Effectiveness. 
              Proactively manage risks and ensure regulatory compliance across all business units.
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-medium text-gray-700">Active Assessments</h3>
              <p className="text-3xl font-bold mt-2">28</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <h3 className="text-lg font-medium text-gray-700">Compliance Rate</h3>
              <p className="text-3xl font-bold mt-2">92%</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
              <h3 className="text-lg font-medium text-gray-700">Critical Risks</h3>
              <p className="text-3xl font-bold mt-2">7</p>
            </div>
          </div>

          {/* Modules Grid */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
              Compliance Modules
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {complianceModules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => navigate(`/dashboard/${module.id}`)}
                  className={`${module.color} text-white rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl p-8 text-center`}
                >
                  <h3 className="text-2xl font-bold mb-4">{module.name}</h3>
                  <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                    <span className="text-3xl">📊</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Quick Actions
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                className="px-6 py-3 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition"
                onClick={() => navigate("/reports")}
              >
                Generate Report
              </button>
              <button 
                className="px-6 py-3 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 transition"
                onClick={() => navigate("/risks")}
              >
                View Risk Register
              </button>
              <button 
                className="px-6 py-3 bg-emerald-100 text-emerald-700 rounded-lg font-medium hover:bg-emerald-200 transition"
                onClick={() => navigate("/tasks")}
              >
                My Action Items (3)
              </button>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500">
          <p>Risk & Compliance Management System v2.4</p>
          <p className="mt-2">© 2025 Etranzact. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default Page;