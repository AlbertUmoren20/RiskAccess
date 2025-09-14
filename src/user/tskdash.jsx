import React from 'react';
import { useTasks } from "@/contexts/taskcontext";
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { mockDataTeam }from '@/constants/index';

const TskDash = () => {
  const { tasks, updateTaskStatus } = useTasks();
  const supabase = useSupabaseClient();
    const [userTasks, setUserTasks] = useState([]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Started':
        return 'status-not-started bg-red-500 text-white';
      case 'In Progress':
        return 'status-in-progress bg-yellow-500 text-white';
      case 'Completed':
        return 'status-completed bg-green-500 text-white';
      default:
        return '';
    }
  };

  const handleStatusChange = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'In Progress' : 'Completed';
    updateTaskStatus(taskId, newStatus);
  };

  // useEffect(() => {

  //   const fetchUserTasks = async () => {
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (user?.email) {
  //       const filteredTasks = tasks.filter((task) => {
  //         const member = mockDataTeam.find((m) => m.name === task.assignedTo);
  //         return member?.email === user.email;
  //       });
  //       setUserTasks(filteredTasks);
  //         console.log('Current user:', user);
  //     }
  //   };
  //   fetchUserTasks();
  // }, [tasks, supabase]);

  useEffect(() => {
  const fetchUserTasks = async () => {
        console.log("fetchUserTasks starting...");
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting user:", error.message);
      return;
    }

    if (user?.email) {
      // normalize case sensitivity
      const email = user.email.toLowerCase();

      // filter tasks that include this user’s email or name
      const filteredTasks = tasks.filter((task) => {
        if (!task.assigned_to) return false;

        // Split string by comma, trim spaces, normalize
        const assignedList = task.assigned_to
          .split(",")
          .map((entry) => entry.trim().toLowerCase());

        return assignedList.includes(email);
      });

      setUserTasks(filteredTasks);
    
      console.log("Current user:", user.email);
      console.log("Filtered tasks:", filteredTasks);
    }
  };

  fetchUserTasks();
}, [tasks, supabase]);



  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Task Dashboard</h1>
      <div className="task-sections">
        <div className="task-section">
          <h2 className="section-title">Assigned Task</h2>
          <div className="task-list">
            {userTasks.length > 0 ? (
              userTasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-info">
                    <h3 className="task-name">{task.summary}</h3>
                    <p className="task-coordinator">Standard: {task.standard}</p>
                    <p className="task-frequency">
                      {new Date(task.start).toLocaleString()} -{' '}
                      {new Date(task.end).toLocaleString()}
                    </p>
                  </div>
                  <div className="task-meta">
                    <button
                      className={`task-status ${getStatusColor(task.status)} p-2 rounded`}
                      onClick={() => handleStatusChange(task.id, task.status)}
                    >
                      {task.status}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No tasks assigned.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TskDash;