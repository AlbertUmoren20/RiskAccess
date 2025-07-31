import { useTasks } from '@/contexts/taskcontext';
import TaskListLayout from '@/layouts/cardlayouts';
const PCIUser = () => {
  const { tasks } = useTasks();
  const pciTasks = tasks.filter(task => task.standard === 'pci');

  return (
    <TaskListLayout 
      tasks={pciTasks}
      title="PCI DSS Compliance"
      description="Payment Card Industry Data Security Standard requirements and controls"
    />
  );
};

export default PCIUser;