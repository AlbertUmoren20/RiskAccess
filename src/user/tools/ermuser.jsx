import { useTasks } from '@/contexts/taskcontext';
import TaskListLayout from '@/layouts/cardlayouts';

const ERMUser = () => {
  const { tasks } = useTasks();
  const ermTasks = tasks.filter(task => task.standard === 'erm');

  return (
    <TaskListLayout 
      tasks={ermTasks}
      title="Enterprise Risk Management"
      description="Manage organizational risks and mitigation strategies across all business units"
    />
  );
};

export default ERMUser;