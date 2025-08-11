import React from 'react';
import { useTasks } from '@/contexts/taskcontext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const ProgressStandard = ({ standards, tasks }) => {
  // Calculate progress for each standard
  const progressData = standards.map(standard => {
    const standardTasks = tasks.filter(task => task.standard === standard.slug);
    const totalTasks = standardTasks.length;
    const completedTasks = standardTasks.filter(task => task.status === 'Completed').length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    return {
      name: standard.title,
      progress: progress.toFixed(2)
    };
  });

  return (
    <div className="card bg-white rounded-xl shadow-md">
      <div className="card-header p-4">
        <p className="text-lg font-semibold text-gray-700">Task Progress by Standard</p>
      </div>
      <div className="card-body p-4">
        <BarChart width={600} height={300} data={progressData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#1f2937" />
          <YAxis stroke="#1f2937" />
          <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#6b7280' }} />
          <Legend />
          <Bar dataKey="progress" fill="#8884d8" />
        </BarChart>
      </div>
    </div>
  );
};

export default ProgressStandard;
