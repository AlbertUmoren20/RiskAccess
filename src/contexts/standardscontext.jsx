// contexts/StandardsContext.js
import { createContext, useContext } from 'react';
import { useTasks } from '@/contexts/taskcontext'; // Import the task context

const StandardsContext = createContext();

export const StandardsProvider = ({ children }) => {
  const { tasks } = useTasks(); // Get tasks from TaskContext
  
  // Organize tasks by standard
  const standardsEvents = {
    pci: tasks.filter(task => task.standard?.toLowerCase() === 'pci'),
    iso: tasks.filter(task => task.standard?.toLowerCase() === 'iso'),
    vulnerability: tasks.filter(task => task.standard?.toLowerCase() === 'vulnerability'),
    erm: tasks.filter(task => task.standard?.toLowerCase() === 'erm'),
    rc: tasks.filter(task => task.standard?.toLowerCase() === 'rc')
  };

  const getAllEvents = () => tasks;

  return (
    <StandardsContext.Provider value={{ standardsEvents, getAllEvents }}>
      {children}
    </StandardsContext.Provider>
  );
};

export const useStandards = () => useContext(StandardsContext);