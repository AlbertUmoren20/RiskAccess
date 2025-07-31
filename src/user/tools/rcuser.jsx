import { useTasks } from '@/contexts/taskcontext';
import TaskListLayout from '@/layouts/cardlayouts';
const RCUser = () => {
  const { tasks } = useTasks();
  const rcTasks = tasks.filter(task => task.standard === 'rc');

  return (
    <TaskListLayout 
      tasks={rcTasks}
      title="Regulatory Compliance"
      description="Tasks related to financial, data privacy, and industry-specific regulations"
    />
  );
};

export default RCUser;