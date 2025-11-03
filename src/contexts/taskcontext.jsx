
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback, useMemo } from 'react';

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
// In your createTask function
const createTask = async (taskData) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title: taskData.title,
        start: taskData.start,
        end: taskData.end,
        assigned_to: taskData.assigned_to,
        status: taskData.status,
        standard: taskData.standard
      
      }])
      .select();

    if (error) throw error;
    

    setTasks(prev => [...prev, ...data]);
    return data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};
 // In your taskcontext.jsx
  const updateTaskStatus = useCallback(async (taskId, newStatus) => {
  try {
     setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    console.log('Context: Updating task', taskId, 'to', newStatus);
    
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Task status updated successfully');
 } catch (error) {
      // Revert on error
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: task.status } : task
        )
      );
      throw error;
    }
  }, []);

  
  const value = useMemo(() => ({
    tasks,
    updateTaskStatus,
  }), [tasks, updateTaskStatus]);


  const addTask = (task) => {
    setTasks((prev) => [...prev, { ...task, id: Date.now().toString(), status: 'Not Started' }]);
  };



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
