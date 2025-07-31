import { useTasks } from '@/contexts/taskcontext';
import TaskListLayout from '@/layouts/cardlayouts';
const ISOUser = () => {
  const { tasks } = useTasks();
  const isoTasks = tasks.filter(task => task.standard === 'iso');

  return (
    <TaskListLayout 
      tasks={isoTasks}
      title="ISO 27001 Compliance"
      description="Information security management system implementation and maintenance tasks"
    />
  );
};

export default ISOUser;