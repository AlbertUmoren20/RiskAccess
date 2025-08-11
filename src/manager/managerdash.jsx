import { Man } from "@mui/icons-material";
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import { Users, FileText, ClipboardList, Bell } from 'lucide-react';
import React from 'react';
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { set } from "date-fns";


const ManagerDashboard = () => {
  const [standards, setStandards] = useState([]);
  const supabase = useSupabaseClient();
    const [lastUpdated, setLastUpdated] = useState(new Date());
const [tasks, setTasks] = useState([]);
const [team, setTeam] = useState([])
const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    const { data: standardsData } = await supabase.from('standards').select('*');
    const { data: tasksData } = await supabase.from('tasks').select('*');
    const { data: teamMembersDate } = await supabase.from('team_members').select('*');
    setStandards(standardsData);
    setTasks(tasksData);
    setTeam(teamMembersDate);
    setLoading(false);
  };
  fetchData();
}, [supabase]);

  // Mock data - in a real app, you would fetch this from Supabase
const stats = [
  { name: 'Team Members', value: team.length, icon: Users, color: 'bg-blue-100 text-blue-600' },
  { name: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, icon: FileText, color: 'bg-green-100 text-green-600' },
  { name: 'Standards', value: standards.length, icon: ClipboardList, color: 'bg-purple-100 text-purple-600' },
  { name: 'Pending Actions', value: tasks.filter(t => t.status === 'Pending').length, icon: Bell, color: 'bg-yellow-100 text-yellow-600' },
];


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Manager Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Overview of your team's activities</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm flex items-center border border-slate-200 dark:border-slate-700">
            <div className={`p-3 rounded-lg mr-4 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{stat.name}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Standard Overview</h2>
            <button className="text-blue-600 text-sm font-medium">View All</button>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-96">
            {standards.map(standard => {
              const standardTasks = tasks.filter(task => task.standard === standard.slug);
              const completed = standardTasks.filter(task => task.status === 'Completed').length;
              const progress = standardTasks.length > 0 ? Math.round((completed / standardTasks.length) * 100) : 0;

              return (
                <div key={standard.id} className="pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: standard.color }}
                      ></div>
                      <span className="font-medium">{standard.title}</span>
                    </div>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-indigo-500" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>{completed}/{standardTasks.length} tasks</span>
                    <span>{progress}% complete</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Bottom Grid */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {tasks.slice(0, 5).map(task => {
              const daysRemaining = Math.ceil((new Date(task.end) - new Date()) / (1000 * 60 * 60 * 24));
              const statusColors = {
                'Completed': 'bg-green-100 text-green-800',
                'Pending': 'bg-yellow-100 text-yellow-800',
                'In Progress': 'bg-blue-100 text-blue-800',
                'Overdue': 'bg-red-100 text-red-800'
              };
              function format(date, formatStr) {
                // Simple date formatting for 'MMM dd, yyyy'
                const options = { month: 'short', day: '2-digit', year: 'numeric' };
                return date.toLocaleDateString(undefined, options);
              }
              return (
                <div key={task.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-800">{task.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      statusColors[task.status] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="mr-2">Assigned to:</span>
                      <div className="flex flex-wrap gap-1">
                        {task.assigned_to && task.assigned_to.split(', ').map((name, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-1">
                      <span className="mr-2">Due:</span>
                      {format(new Date(task.end), 'MMM dd, yyyy')}
                      <span className={`ml-2 ${
                        daysRemaining < 0 ? 'text-red-600' : 
                        daysRemaining < 3 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        ({daysRemaining < 0 
                          ? `${Math.abs(daysRemaining)} days overdue` 
                          : `${daysRemaining} days left`})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;