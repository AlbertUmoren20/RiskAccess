
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
// import { useTasks } from '@/contexts/taskcontext';


const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const supabase = useSupabaseClient(); 

  useEffect(() => {
     const channel = supabase
      .channel('tasks')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks'
      }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);
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
const createTask = async (task) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select();
    
    if (error) throw error;
    
    setTasks(prev => [...prev, ...data]);
    return data[0];
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
};
  
 const updateTaskStatus = async (taskId, status) => {
    // Optimistic UI update
    setTasks(prev => 
      prev.map(task => task.id === taskId ? { ...task, status } : task)
    );
    
    // Update in Supabase
    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      // Revert on error
      setTasks(prev => 
        prev.map(task => task.id === taskId ? { ...task, status: task.status } : task)
      );
    }
  };


  const addTask = (task) => {
    setTasks((prev) => [...prev, { ...task, id: Date.now().toString(), status: 'Not Started' }]);
  };

  // const updateTaskStatus = (taskId, status) => {
  //   setTasks((prev) =>
  //     prev.map((task) => (task.id === taskId ? { ...task, status } : task))
  //   );
  // };

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTaskStatus, deleteTask, createTask,    refreshTasks: fetchTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
