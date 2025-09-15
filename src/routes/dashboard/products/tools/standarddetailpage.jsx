import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { mockDataTeam } from '@/constants/index';

export default function StandardDetailPage() {
  const { slug } = useParams();
  const supabase = useSupabaseClient();
  const [tasks, setTasks] = useState([]);
  const [standard, setStandard] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    start: new Date(),
    end: new Date(),
    assigned_to: [],
    status: 'Not Started'
  });
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch standard details and tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch standard details
        const { data: standardData, error: standardError } = await supabase
          .from('standards')
          .select('*')
          .eq('slug', slug)
          .single();
          
        if (standardError) throw standardError;
        setStandard(standardData);
        
        // Fetch tasks for this standard
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('standard', slug);
          
        if (tasksError) throw tasksError;
        setTasks(tasksData || []);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [slug, supabase]);

//Fetch Team Members
const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('team_members')
        .select('*')
      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }
      
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to load team members. Please try again.');
    } finally {
      setLoading(false);
    }
  };
    useEffect(() => {
      fetchTeamMembers();
    }, [supabase]);




  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      setError('Task title is required');
      return;
    }
    
    if (newTask.assigned_to.length === 0) {
      setError('Please assign the task to at least one team member');
      return;
    }
    
    try {
      const { error } = await supabase.from('tasks').insert([{
        title: newTask.title,
        assigned_to: newTask.assigned_to.join(', '),
        start: newTask.start.toISOString(),
        end: newTask.end.toISOString(),
        status: newTask.status,
        standard: slug
      }]);
      
      if (error) {
        setError(`Failed to create task: ${error.message}`);
        return;
      }
      
      // Reset form and fetch updated tasks
      setNewTask({
        title: '',
        start: new Date(),
        end: new Date(),
        assigned_to: [],
        status: 'Not Started'
      });
      
      // Refresh tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('standard', slug);
      
      if (!tasksError) setTasks(tasksData || []);
      
      setOpenForm(false);
      setError(null);
      
    } catch (err) {
      setError(`Unexpected error: ${err.message}`);
    }
  };

  const handleDeleteTask = async id => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      
      if (error) {
        setError(`Failed to delete task: ${error.message}`);
        return;
      }
      
      // Refresh tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('standard', slug);
      
      if (!tasksError) setTasks(tasksData || []);
      
      setError(null);
    } catch (err) {
      setError(`Unexpected error: ${err.message}`);
    }
  };

  const toggleTeamMember = (name) => {
    setNewTask(prev => {
      if (prev.assigned_to.includes(name)) {
        return {
          ...prev,
          assigned_to: prev.assigned_to.filter(member => member !== name)
        };
      } else {
        return {
          ...prev,
          assigned_to: [...prev.assigned_to, name]
        };
      }
    });
  };

  // Status colors for visual consistency
  const statusColors = {
    'Completed': 'bg-green-100 text-green-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Not Started': 'bg-gray-100 text-gray-800',
    'Overdue': 'bg-red-100 text-red-800',
    'Pending Review': 'bg-yellow-100 text-yellow-800'
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!standard) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-4 text-lg font-medium text-gray-900">Standard not found</h3>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {standard.title} Tasks
              <span className="ml-2 text-sm font-normal bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                Admin View
              </span>
            </h1>
            
            <button
              onClick={() => setOpenForm(!openForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition"
            >
              <span className="mr-2">+</span> Add Task
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Task Form */}
          {openForm && (
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Create New Task</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter task title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.keys(statusColors).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time
                  </label>
                  <DatePicker
                    selected={newTask.start}
                    onChange={date => setNewTask({...newTask, start: date})}
                    showTimeSelect
                    dateFormat="Pp"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time
                  </label>
                  <DatePicker
                    selected={newTask.end}
                    onChange={date => setNewTask({...newTask, end: date})}
                    showTimeSelect
                    dateFormat="Pp"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To Team Members
                </label>
                {/* <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {teamMembers.map(member => (
                    <div 
                      key={member.id}
                      onClick={() => toggleTeamMember(member.name)}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
                        newTask.assigned_to.includes(member.name)
                          ? 'bg-indigo-100 border-indigo-500'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-medium mr-2">
                        {member.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{member.name}</span>
                    </div>
                  ))}
                </div> */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
  {teamMembers.map(member => {
    const fullName = `${member.first_name} ${member.last_name}`;
    return (
      <div 
        key={member.id}
        onClick={() => toggleTeamMember(fullName)}
        className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
          newTask.assigned_to.includes(fullName)
            ? 'bg-indigo-100 border-indigo-500'
            : 'bg-white border-gray-300 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-medium mr-2">
          {member.first_name.charAt(0)}
        </div>
        <span className="text-sm font-medium">{fullName}</span>
      </div>
    );
  })}
</div>

              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setOpenForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Task
                </button>
              </div>
            </div>
          )}
          
          {/* Task List */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {tasks.length} Task{tasks.length !== 1 ? 's' : ''}
            </h2>
            
            {tasks.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No tasks found</h3>
                <p className="mt-1 text-gray-500">
                  Get started by creating a new task
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map(task => {
                  const daysRemaining = Math.ceil((new Date(task.end) - new Date()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="p-5">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">{task.title}</h3>
                            <div className="mt-1 flex flex-wrap gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                                {task.status}
                              </span>
                              {task.status !== "Completed" && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                daysRemaining < 0 ? 'bg-red-100 text-red-800' : 
                                daysRemaining < 3 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'
                              }`}>
                                {daysRemaining < 0 
                                  ? `Overdue by ${Math.abs(daysRemaining)} days` 
                                  : `${daysRemaining} days remaining`}
                              </span>
                                )}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Assigned To</p>
                            <div className="flex flex-wrap gap-2 mt-1">
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
                          
                          <div>
                            <p className="text-xs text-gray-500">Timeframe</p>
                            <p className="text-sm font-medium mt-1">
                              {new Date(task.start).toLocaleString()} –<br />
                              {new Date(task.end).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            Created: {new Date(task.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}