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
    start: new Date(),
    end: new Date(),
    assigned_to: [],
    status: 'Not Started'
  });
  const [openForm, setOpenForm] = useState(false); // modal form
  const [tableView, setTableView] = useState(false); // toggle for table view
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NEW state for compact list ---
  const [showAllMembers, setShowAllMembers] = useState(false);
  const DEFAULT_VISIBLE_MEMBERS = 10;

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

      //send emails to assigned members
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
            start: newTask.start,
            end: newTask.end,
            frequency: getFrequency(newTask.start, newTask.end)
          }),
        });
      }
    }

      setNewTask({
        title: '',
        start: new Date(),
        end: new Date(),
        assigned_to: [],
        status: 'Not Started'
      });

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
    'Pending Review': 'bg-yellow-100 text-yellow-800'
  };

  const getFrequency = (start, end) => {
    const days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
    if (days <= 1) return "Daily";
    if (days <= 7) return "Weekly";
    if (days <= 30) return "Monthly";
    if (days <= 180) return "Bi-Annually";
    return "Annually";
  };

  // --- Export to Excel handler ---
  const exportToExcel = () => {
    // Build rows exactly as table headers: Task, Coordinator, Frequency, Status, Timeframe
    const rows = tasks.map(t => ({
      Task: t.title,
      Coordinator: t.assigned_to,
      Frequency: getFrequency(t.start, t.end),
      Status: t.status || 'Not specified',
      Timeframe: `${t.start ? new Date(t.start).toLocaleString() : 'N/A'} - ${t.end ? new Date(t.end).toLocaleString() : 'N/A'}`
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

  // --- helper slice for compact members display ---
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                    <DatePicker
                      selected={newTask.start}
                      onChange={(d) => setNewTask({ ...newTask, start: d })}
                      showTimeSelect
                      dateFormat="Pp"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                    <DatePicker
                      selected={newTask.end}
                      onChange={(d) => setNewTask({ ...newTask, end: d })}
                      showTimeSelect
                      dateFormat="Pp"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>

                  {/* Compact list with View All toggle */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-2">
                    {visibleMembers.map(m => {
                      const fullName = `${m.first_name} ${m.last_name}`;
                      return (
                        <div
                          key={m.id}
                          onClick={() => toggleTeamMember(fullName)}
                          className={`p-2 rounded-lg border cursor-pointer select-none ${
                            newTask.assigned_to.includes(fullName)
                              ? "bg-indigo-100 border-indigo-500"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          {fullName}
                        </div>
                      );
                    })}
                  </div>

                  {/* If there are more members than DEFAULT_VISIBLE_MEMBERS show toggle */}
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

                  {/* Small helper text about multi-select */}
                  <p className="text-xs text-gray-500 mt-2">Click to select multiple coordinators. Selected names will be saved as a comma-separated list.</p>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => { setOpenForm(false); setShowAllMembers(false); }}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTask}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                  >
                    Create
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
                    <th className="px-4 py-2 border">Title</th>
                    <th className="px-4 py-2 border">Assigned To</th>
                    <th className="px-4 py-2 border">Timeframe</th>
                    <th className="px-4 py-2 border">Frequency</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id} className="text-center">
                      <td className="border px-4 py-2">{task.title}</td>
                      <td className="border px-4 py-2">{task.assigned_to}</td>
                      <td className="border px-4 py-2">
                        {task.start ? new Date(task.start).toLocaleString() : 'N/A'} - {task.end ? new Date(task.end).toLocaleString() : 'N/A'}
                      </td>
                      <td className="border px-4 py-2">{getFrequency(task.start, task.end)}</td>
                      <td className="border px-4 py-2">{task.status}</td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-800"
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
            // Card View (your old design)
            <div className="space-y-4 mt-6">
              {tasks.map(task => {
                const daysRemaining = Math.ceil((new Date(task.end) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex justify-between">
                      <h3 className="font-bold">{task.title}</h3>
                      <button onClick={() => handleDeleteTask(task.id)} className="text-red-600">✕</button>
                    </div>
                    <p className="text-sm mt-2">{task.assigned_to}</p>
                    <p className="text-xs mt-1">
                      {task.start ? new Date(task.start).toLocaleString() : 'N/A'} – {task.end ? new Date(task.end).toLocaleString() : 'N/A'}
                    </p>
                    <span className={`mt-2 inline-block px-2 py-1 rounded text-xs ${statusColors[task.status] || 'bg-gray-100 text-gray-800'}`}>{task.status}</span>
                    {daysRemaining < 0 && <span className="ml-2 text-red-600 text-xs">Overdue</span>}
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
