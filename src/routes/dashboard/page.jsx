import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { 
  Activity, Users, FileText, ClipboardList, 
  CheckCircle, Clock, AlertCircle, TrendingUp 
} from 'lucide-react';

const DashboardPage = () => {
  const supabase = useSupabaseClient();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // 'day', 'week', 'month'

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch standards
        const { data: standardsData, error: standardsError } = await supabase
          .from('standards')
          .select('*');
          
        if (standardsError) throw standardsError;
        setStandards(standardsData || []);
        
        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*');
          
        if (tasksError) throw tasksError;
        setTasks(tasksData || []);
        
        setLastUpdated(new Date());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [supabase]);

  // Calculate key metrics
  const calculateMetrics = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const overdueTasks = tasks.filter(task => task.status === 'Overdue').length;
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
    
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const overdueRate = totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      inProgressTasks,
      taskCompletionRate,
      overdueRate
    };
  };

  // Prepare data for standards progress chart
  const prepareProgressData = () => {
    return standards.map(standard => {
      const standardTasks = tasks.filter(task => task.standard === standard.slug);
      const completed = standardTasks.filter(task => task.status === 'Completed').length;
      
      return {
        name: standard.title,
        total: standardTasks.length,
        completed: completed,
        progress: standardTasks.length > 0 ? Math.round((completed / standardTasks.length) * 100) : 0
      };
    });
  };

  // Prepare recent activity data
  const getRecentActivity = () => {
    return [...tasks]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  };

  // Prepare data for task status distribution
  const getStatusDistribution = () => {
    const statusCounts = {
      'Completed': 0,
      'In Progress': 0,
      'Not Started': 0,
      'Overdue': 0,
      'Pending Review': 0
    };
    
    tasks.forEach(task => {
      if (statusCounts.hasOwnProperty(task.status)) {
        statusCounts[task.status]++;
      }
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));
  };

  // Metrics data
  const metrics = calculateMetrics();
  const progressData = prepareProgressData();
  const recentActivity = getRecentActivity();
  const statusDistribution = getStatusDistribution();

  // Status colors
  const statusColors = {
    'Completed': 'bg-green-100 text-green-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Not Started': 'bg-gray-100 text-gray-800',
    'Overdue': 'bg-red-100 text-red-800',
    'Pending Review': 'bg-yellow-100 text-yellow-800'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Error: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Monitor compliance activities across all standards</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full mr-2">
                Live
              </span>
              <span className="text-sm text-gray-500">
                Updated: {format(lastUpdated, 'MMM dd, yyyy HH:mm')}
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg mr-4">
                <ClipboardList className="text-indigo-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Tasks</p>
                <p className="text-2xl font-bold mt-1">{metrics.totalTasks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold mt-1">{metrics.completedTasks}</p>
                <div className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp size={14} className="mr-1" />
                  {metrics.taskCompletionRate}% completion rate
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <Clock className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold mt-1">{metrics.inProgressTasks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg mr-4">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-2xl font-bold mt-1">{metrics.overdueTasks}</p>
                <div className="text-xs text-red-600 mt-1">
                  {metrics.overdueRate}% of total tasks
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Task Progress by Standard */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Task Progress by Standard</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setTimeRange('day')}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    timeRange === 'day' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Today
                </button>
                <button 
                  onClick={() => setTimeRange('week')}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    timeRange === 'week' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Week
                </button>
                <button 
                  onClick={() => setTimeRange('month')}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    timeRange === 'month' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Month
                </button>
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={progressData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [value, 'Tasks']}
                    labelFormatter={(name) => `Standard: ${name}`}
                  />
                  <Legend />
                  <Bar dataKey="total" name="Total Tasks" fill="#8884d8" />
                  <Bar dataKey="completed" name="Completed Tasks" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Standards Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Standards Overview</h2>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
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
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
              <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                View All
              </button>
              
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {recentActivity.map(task => {
                const daysRemaining = Math.ceil((new Date(task.end) - new Date()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={task.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-800">{task.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        statusColors[task.status]
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="mr-2">Assigned to:</span>
                        <div className="flex flex-wrap gap-1">
                          {task.assigned_to.split(', ').map((name, index) => (
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
                          {task.status !== "Completed" && (
                        <span className={`ml-2 ${
                          daysRemaining < 0 ? 'text-red-600' : 
                          daysRemaining < 3 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          ({daysRemaining < 0 
                            ? `${Math.abs(daysRemaining)} days overdue` 
                            : `${daysRemaining} days left`})
                        </span>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Task Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Task Status Distribution</h2>
            
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
              {statusDistribution.map((statusData) => (
                <div key={statusData.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${
                      statusData.name === 'Completed' ? 'bg-green-500' :
                      statusData.name === 'In Progress' ? 'bg-blue-500' :
                      statusData.name === 'Not Started' ? 'bg-gray-500' :
                      statusData.name === 'Overdue' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></span>
                    <span>{statusData.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{statusData.value}</span>
                    <span className="text-gray-500 text-sm">
                      ({metrics.totalTasks > 0 
                        ? Math.round((statusData.value / metrics.totalTasks) * 100) 
                        : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Task Completion Progress</span>
                <span>{metrics.taskCompletionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full bg-green-500" 
                  style={{ width: `${metrics.taskCompletionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Standards Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Compliance Standards Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
            {standards.map(standard => {
              const standardTasks = tasks.filter(task => task.standard === standard.slug);
              const completed = standardTasks.filter(task => task.status === 'Completed').length;
              const progress = standardTasks.length > 0 ? Math.round((completed / standardTasks.length) * 100) : 0;
              
              return (
                <div key={standard.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                      style={{ backgroundColor: `${standard.color}20` }}
                    >
                      <FileText style={{ color: standard.color }} size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{standard.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {standard.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: standard.color
                        }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {completed} of {standardTasks.length} tasks completed
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

export default DashboardPage;