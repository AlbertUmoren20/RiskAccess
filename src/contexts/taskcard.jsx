import React, { useState } from 'react';
import { useTasks } from './taskcontext';


const statusColors = {
  'Completed': 'bg-green-100 text-green-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'Not Started': 'bg-gray-100 text-gray-800',
  'Overdue': 'bg-red-100 text-red-800',
  'Pending Review': 'bg-yellow-100 text-yellow-800'
};

const priorityColors = {
  'High': 'text-red-600',
  'Medium': 'text-yellow-600',
  'Low': 'text-green-600'
};

const TaskCard = ({ task }) => {
  const { updateTaskStatus } = useTasks();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
   const [showStatusOptions, setShowStatusOptions] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    await updateTaskStatus(task.id, newStatus);
    // setShowStatusMenu(false);
       setShowStatusOptions(false);
  };

  const daysRemaining = Math.ceil((new Date(task.end) - new Date()) / (1000 * 60 * 60 * 24));

  // --- NEW: safely split assigned_to into array ---
  const assignedUsers = task.assigned_to
    ? task.assigned_to.split(',').map((u) => u.trim())
    : [];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="p-5">
        {/* Status Update Section */}
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Status</span>

            <div className="relative">
              <button
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  statusColors[task.status] || 'bg-gray-100 text-gray-800'
                }`}
                onClick={() => setShowStatusMenu(!showStatusMenu)}
              > 
                {task.status || 'Not Started'}
              </button>

              {showStatusMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {Object.entries(statusColors).map(([status, colorClass]) => (
                    <button
                      key={status}
                      className={`block w-full text-left px-4 py-2 text-sm ${colorClass} hover:bg-gray-50`}
                      onClick={() => handleStatusUpdate(status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start mt-3">
          <div>
            {/* --- FIX: use task.title not summary --- */}
            <h3 className="font-bold text-lg text-gray-800">
              {task.title || 'Untitled Task'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">ID: {task.id}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Assigned To</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {assignedUsers.length > 0 ? (
                assignedUsers.map((name, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                  >
                    {name}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">Unassigned</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500">Priority</p>
            <p className={`font-semibold ${priorityColors[task.priority] || ''}`}>
              {task.priority || 'N/A'}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Due Date</p>
            <p className="font-medium">
              {task.end
                ? new Date(task.end).toLocaleDateString()
                : 'No due date'}{' '}
              <span
                className={`ml-2 text-sm ${
                  daysRemaining < 3 ? 'text-red-500' : 'text-gray-500'
                }`}
              >
                ({daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'})
              </span>
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Timeframe</p>
            <p className="font-medium">
              {task.start
                ? new Date(task.start).toLocaleDateString()
                : 'N/A'}{' '}
              -{' '}
              {task.end ? new Date(task.end).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-500">Description</p>
          <p className="text-sm mt-1 text-gray-700 line-clamp-2 font-bold">
            {task.description || 'No description provided'}
          </p>
        </div>

        <div className="mt-5 flex justify-between">
          <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
            View Details
          </button>
          <button 
          onClick={() => setShowStatusOptions(!showStatusOptions)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            Update Status
          </button>
        </div>
         {showStatusOptions && (
        <div className="mt-2 flex space-x-2">
          {["Not Started", "In Progress", "Completed"].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusUpdate(status)}
              className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              {status}
            </button>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default TaskCard;
