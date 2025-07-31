
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
// import { useTasks } from '@/contexts/taskcontext';


const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const supabase = useSupabaseClient(); 

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*');

      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }
  console.log('Fetched tasks from Supabase:', data); // ✅ ADD THIS
    setTasks(data);

    };

    fetchTasks();
  }, [supabase]);

  const addTask = (task) => {
    setTasks((prev) => [...prev, { ...task, id: Date.now().toString(), status: 'Not Started' }]);
  };

  const updateTaskStatus = (taskId, status) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status } : task))
    );
  };

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTaskStatus, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
