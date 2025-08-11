import React from 'react';
import { useNavigate } from "react-router-dom";
import { useStandards } from '@/contexts/standardscontext.jsx';
import { CircularProgress } from '@mui/material';

function Page() {
  const navigate = useNavigate();
  const { standards, loading } = useStandards();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col items-center mb-16">
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

        <main>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-medium text-gray-700">Active Standards</h3>
              <p className="text-3xl font-bold mt-2">
                {loading ? '...' : standards.length}
              </p>
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

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
              Compliance Modules
            </h2>
            
            {loading ? (
              <div className="flex justify-center">
                <CircularProgress />
              </div>
            ) : standards.length === 0 ? (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No standards available</h3>
                <p className="mt-1 text-gray-500">
                  Compliance standards will appear here once created by the administrator
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {standards.map((standard) => (
                  <button
                    key={standard.id}
                    onClick={() => navigate(`/dashboard/${standard.slug}`)}
                    className="text-white rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl p-8 text-center"
                    style={{ backgroundColor: standard.color }}
                  >
                    <h3 className="text-2xl font-bold mb-4">{standard.title}</h3>
                    <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                      <span className="text-3xl">📊</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

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

        <footer className="mt-16 text-center text-gray-500">
          <p>Risk & Compliance Management System v2.4</p>
          <p className="mt-2">© 2025 Etranzact. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default Page;