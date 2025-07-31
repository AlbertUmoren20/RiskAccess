import React from 'react';
import { useTasks } from '@/contexts/taskcontext';

const ProgressByStandard = () => {
  const { tasks } = useTasks();

  // Group tasks by standard
  const standards = [...new Set(tasks.map(task => task.standard))];

  const calculateProgress = (standard) => {
    const filtered = tasks.filter(task => task.standard === standard);
    const total = filtered.length;
    const completed = filtered.filter(task => task.status === 'Completed').length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percent };
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Task Progress by Standard</h2>
      {standards.map((standard) => {
        const { total, completed, percent } = calculateProgress(standard);
        return (
          <div key={standard} className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="font-medium">{standard}</span>
              <span className="text-sm text-gray-500">{completed}/{total} completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-sm text-right mt-1">{percent}%</p>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressByStandard;
