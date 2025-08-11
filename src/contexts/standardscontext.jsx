// contexts/StandardsContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useTasks } from '@/contexts/taskcontext'; // Import the task context
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const StandardsContext = createContext();

export const StandardsProvider = ({ children }) => {
  const { tasks } = useTasks(); // Get tasks from 
  // TaskContext
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient();
  const [standardsEvents, setStandardsEvents] = useState([]);
  const [standards, setStandards] = useState([]);
  
  // Organize tasks by standard
  // useEffect(() => {
  //   const updated = {
  //     pci: tasks.filter(task => task.standard?.toLowerCase() === 'pci'),
  //     iso: tasks.filter(task => task.standard?.toLowerCase() === 'iso'),
  //     vulnerability: tasks.filter(task => task.standard?.toLowerCase() === 'vulnerability'),
  //     erm: tasks.filter(task => task.standard?.toLowerCase() === 'erm'),
  //     rc: tasks.filter(task => task.standard?.toLowerCase() === 'rc')
  //   };
  //   setStandardsEvents(updated);
  // }, [tasks]);

  useEffect(() => {
    fetchStandards();
  }, [supabase]);

  // const getAllEvents = () => tasks;

  const fetchStandards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('standards')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setStandards(data || []);
    } catch (error) {
      console.error('Error fetching standards:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStandard = async (standard) => {
    try {
       if (!standard.slug) {
        standard.slug = standard.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '');
      }
      
      const { data, error } = await supabase
        .from('standards')
        .insert([standard])
        .select();
      
      if (error) throw error;
      // Update state with new standard
      if (data && data.length > 0) {
         const newStandard = data[0];
        setStandards(prev => [...prev, newStandard]);
        return newStandard;
      }

       return null;
    } catch (error) {
      console.error('Error creating standard:', error);
      return null;
    }
  };

  return (
    <StandardsContext.Provider value={{ standardsEvents,
     standards, 
      loading, 
      createStandard,
      refreshStandards: fetchStandards
   }}>
      {children}
    </StandardsContext.Provider>
  );
};

export const useStandards = () => useContext(StandardsContext);