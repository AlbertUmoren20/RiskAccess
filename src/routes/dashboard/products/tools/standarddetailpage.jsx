import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function StandardDetailPage() {
  const { slug } = useParams();
  const supabase = useSupabaseClient();
  const [tasks, setTasks] = useState([]);
  const [standard, setStandard] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    dueDate: new Date(),
    frequency: 'Monthly',
    assigned_to: [],
    status: 'Not Started'
  });
  const [openForm, setOpenForm] = useState(false);
  const [tableView, setTableView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Frequency options
  const frequencyOptions = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Bi-Annually', 'Annually'];
  
  // NEW state for compact list
  const [showAllMembers, setShowAllMembers] = useState(false);
  const DEFAULT_VISIBLE_MEMBERS = 10;

  // Calculate start date based on frequency and due date
  const calculateStartDate = (dueDate, frequency) => {
    const due = new Date(dueDate);
    const start = new Date(due);
    
    switch (frequency) {
      case 'Daily':
        start.setDate(due.getDate());
        break;
      case 'Weekly':
        start.setDate(due.getDate() - 7);
        break;
      case 'Monthly':
        start.setMonth(due.getMonth() - 1);
        break;
      case 'Quarterly':
        start.setMonth(due.getMonth() - 3);
        break;
      case 'Bi-Annually':
        start.setMonth(due.getMonth() - 6);
        break;
      case 'Annually':
        start.setFullYear(due.getFullYear() - 1);
        break;
      default:
        start.setMonth(due.getMonth() - 1);
    }
    
    return start;
  };

  // Fetch standard + tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: standardData, error: standardError } = await supabase
          .from('standards')
          .select('*')
          .eq('slug', slug)
          .single();

        if (standardError) throw standardError;
        setStandard(standardData);

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

  // Fetch team members
  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      let query = supabase.from('team_members').select('*');
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setTeamMembers(data || []);
    } catch (err) {
      setError('Failed to load team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [supabase]);

  // Add Task
  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      setError('Task title is required');
      return;
    }

    if (newTask.assigned_to.length === 0) {
      setError('Please assign at least one team member');
      return;
    }

    try {
      // Calculate start date based on frequency and due date
      const startDate = calculateStartDate(newTask.dueDate, newTask.frequency);
      
      const { error } = await supabase.from('tasks').insert([{
        title: newTask.title,
        assigned_to: newTask.assigned_to.join(', '),
        start: startDate.toISOString(),
        end: newTask.dueDate.toISOString(),
        status: newTask.status,
        standard: slug,
        frequency: newTask.frequency // Store frequency for easy access
      }]);

      if (error) {
        setError(`Failed to create task: ${error.message}`);
        return;
      }

      // Send emails to assigned members
      for (let fullName of newTask.assigned_to) {
        const member = teamMembers.find(
          m => `${m.first_name} ${m.last_name}` === fullName
        );

        if (member?.email) {
          await fetch("/api/send-task-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: member.email,
              name: fullName,
              standard: standard.title,
              title: newTask.title,
              start: startDate,
              end: newTask.dueDate,
              frequency: newTask.frequency
            }),
          });
        }
      }

      // Reset form
      setNewTask({
        title: '',
        dueDate: new Date(),
        frequency: 'Monthly',
        assigned_to: [],
        status: 'Not Started'
      });

      // Refresh tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('standard', slug);

      setTasks(tasksData || []);
      setOpenForm(false);
      setShowAllMembers(false);
      setError(null);
    } catch (err) {
      setError(`Unexpected error: ${err.message}`);
    }
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) {
        setError(`Failed to delete task: ${error.message}`);
        return;
      }
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('standard', slug);
      setTasks(tasksData || []);
      setError(null);
    } catch (err) {
      setError(`Unexpected error: ${err.message}`);
    }
  };

  const toggleTeamMember = (name) => {
    setNewTask((prev) => {
      if (prev.assigned_to.includes(name)) {
        return { ...prev, assigned_to: prev.assigned_to.filter(m => m !== name) };
      } else {
        return { ...prev, assigned_to: [...prev.assigned_to, name] };
      }
    });
  };

  const statusColors = {
    'Completed': 'bg-green-100 text-green-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Not Started': 'bg-gray-100 text-gray-800',
    'Overdue': 'bg-red-100 text-red-800',
  };

  // Get frequency for display (now stored in task.frequency)
  const getFrequencyDisplay = (task) => {
    return task.frequency || getFrequency(task.start, task.end);
  };

  // Legacy frequency calculation (for existing tasks)
  const getFrequency = (start, end) => {
    const days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
    if (days <= 1) return "Daily";
    if (days <= 7) return "Weekly";
    if (days <= 30) return "Monthly";
    if (days <= 90) return "Quarterly";  
    if (days <= 180) return "Bi-Annually";
    return "Annually";
  };

  // Export to Excel handler
  const exportToExcel = () => {
    const rows = tasks.map(t => ({
      Task: t.title,
      Coordinator: t.assigned_to,
      Frequency: getFrequencyDisplay(t),
      Status: t.status || 'Not specified',
      'Due Date': t.end ? new Date(t.end).toLocaleString() : 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'tasks.xlsx');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Error: {error}</div>;
  }

  if (!standard) {
    return <div className="text-center py-12">Standard not found</div>;
  }

  // Helper slice for compact members display
  const visibleMembers = showAllMembers ? teamMembers : teamMembers.slice(0, DEFAULT_VISIBLE_MEMBERS);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {standard.title} Tasks
              <span className="ml-2 text-sm font-normal bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">Admin View</span>
            </h1>

            <div className="flex gap-2 items-center">
              {/* Toggle button */}
              <button
                onClick={() => setTableView(!tableView)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
              >
                {tableView ? "Card View" : "Table View"}
              </button>

              {/* Export (only useful in table view) */}
              {tableView && (
                <button
                  onClick={exportToExcel}
                  className="bg-white border px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Export to Excel
                </button>
              )}

              {/* Add Task button */}
              <button
                onClick={() => { setOpenForm(true); setShowAllMembers(false); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <span className="mr-2">+</span> Add Task
              </button>
            </div>
          </div>

          {/* Modal Popup */}
          {openForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Create New Task</h2>

                <div className="space-y-4">
                  {/* Task Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter task description"
                    />
                  </div>

                  {/* Frequency and Due Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                      <select
                        value={newTask.frequency}
                        onChange={(e) => setNewTask({ ...newTask, frequency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {frequencyOptions.map(freq => (
                          <option key={freq} value={freq}>{freq}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                      <DatePicker
                        selected={newTask.dueDate}
                        onChange={(date) => setNewTask({ ...newTask, dueDate: date })}
                        showTimeSelect
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        minDate={new Date()}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={newTask.status}
                      onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {Object.keys(statusColors).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Assign To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign To *</label>

                    {/* Compact list with View All toggle */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-2">
                      {visibleMembers.map(m => {
                        const fullName = `${m.first_name} ${m.last_name}`;
                        return (
                          <div
                            key={m.id}
                            onClick={() => toggleTeamMember(fullName)}
                            className={`p-2 rounded-lg border cursor-pointer select-none text-sm ${
                              newTask.assigned_to.includes(fullName)
                                ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                                : "bg-white border-gray-300 text-gray-700"
                            }`}
                          >
                            {fullName}
                          </div>
                        );
                      })}
                    </div>
                    {teamMembers.length > DEFAULT_VISIBLE_MEMBERS && (
                      <div className="mt-1">
                        <button
                          onClick={() => setShowAllMembers(prev => !prev)}
                          className="text-sm text-indigo-600 hover:underline"
                          type="button"
                        >
                          {showAllMembers ? 'Show less' : `View all (${teamMembers.length})`}
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Selected: {newTask.assigned_to.length > 0 ? newTask.assigned_to.join(', ') : 'None'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => { setOpenForm(false); setShowAllMembers(false); }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
            </div>
          )}

          {/* Task Display */}
          {tableView ? (
            // Table View
            <div className="overflow-x-auto mt-6">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border text-left">Task</th>
                    <th className="px-4 py-2 border text-left">Coordinator</th>
                    <th className="px-4 py-2 border text-left">Frequency</th>
                    <th className="px-4 py-2 border text-left">Due Date</th>
                    <th className="px-4 py-2 border text-left">Status</th>
                    <th className="px-4 py-2 border text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{task.title}</td>
                      <td className="border px-4 py-2">{task.assigned_to}</td>
                      <td className="border px-4 py-2">{getFrequencyDisplay(task)}</td>
                      <td className="border px-4 py-2">
                        {task.end ? new Date(task.end).toLocaleString() : 'N/A'}
                      </td>
                      <td className="border px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${statusColors[task.status] || 'bg-gray-100 text-gray-800'}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Card View
            <div className="space-y-4 mt-6">
              {tasks.map(task => {
                const dueDate = new Date(task.end);
                const daysRemaining = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-800 text-lg">{task.title}</h3>
                      <button 
                        onClick={() => handleDeleteTask(task.id)} 
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Assigned to:</span> {task.assigned_to}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Frequency:</span> {getFrequencyDisplay(task)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Due:</span> {dueDate.toLocaleString()}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status] || 'bg-gray-100 text-gray-800'}`}>
                          {task.status}
                        </span>
                        {daysRemaining >= 0 && task.status !== 'Completed' && (
                          <span className="text-xs text-gray-500">
                            {daysRemaining === 0 ? 'Due today' : `${daysRemaining} days remaining`}
                          </span>
                        )}
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
  );
}