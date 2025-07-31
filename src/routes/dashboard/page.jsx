import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '@/hooks/use-theme';
import { format } from 'date-fns';
import { useTasks } from '@/contexts/taskcontext';
import { Footer } from '@/layouts/footer';
import { CreditCard, Package, TrendingUp, Users } from 'lucide-react';
import ProgressStandard from '@/contexts/progressstandard';
import { useState, useEffect } from 'react';

const DashboardPage = () => {
  const { theme } = useTheme();
  const { tasks } = useTasks();

  const standardCounts = {
    PCI: tasks.filter((task) => task.standard === 'pci').length,
    ISO: tasks.filter((task) => task.standard === 'iso').length,
    Vulnerability: tasks.filter((task) => task.standard === 'vulnerability').length,
    ERM: tasks.filter((task) => task.standard === 'erm').length,
    RC: tasks.filter((task) => task.standard === 'rc').length,
  };
    // Add real-time update indicator
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    // Update timestamp whenever tasks change
    setLastUpdated(new Date());
  }, [tasks]);


  const allEvents = tasks.sort((a, b) => new Date(a.start) - new Date(b.start));

  return (
    <div className="flex flex-col gap-y-4">
      <h1 className="title">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="card">
          <div className="card-header">
            <div className="w-fit rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
              <Package size={26} />
            </div>

            
            <p className="card-title">ISO 27001</p>
          </div>
          <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
            <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">{standardCounts.ISO}</p>
            <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
              <TrendingUp size={18} />
            </span>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
              <Package size={26} />
            </div>
            <p className="card-title">Vulnerability Ass.</p>
          </div>
          <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
            <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">{standardCounts.Vulnerability}</p>
            <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
              <TrendingUp size={18} />
            </span>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
              <Users size={26} />
            </div>
            <p className="card-title">PCI</p>
          </div>
          <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
            <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">{standardCounts.PCI}</p>
            <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
              <TrendingUp size={18} />
            </span>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
              <CreditCard size={26} />
            </div>
            <p className="card-title">ERM</p>
          </div>
          <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
            <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">{standardCounts.ERM}</p>
            <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
              <TrendingUp size={18} />
            </span>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
              <CreditCard size={26} />
            </div>
            <p className="card-title">RC</p>
          </div>
          <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
            <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">{standardCounts.RC}</p>
            <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
              <TrendingUp size={18} />
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="card col-span-1 md:col-span-2 lg:col-span-4">
          <div className="card-header">
            <p className="card-title">Assigned Tasks</p>
          </div>
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Standards</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">End Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {allEvents.slice(0, 5).map((event) => (
                    <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                      <td className="whitespace-nowrap px-6 py-4">{event.standard}</td>
                      <td className="whitespace-nowrap px-6 py-4">{event.title}</td>
                      <td className="whitespace-nowrap px-6 py-4">{event.assigned_to}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {format(new Date(event.start), 'PPpp')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {format(new Date(event.end), 'PPpp')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">{event.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
            </div>
          
          </div>
          
        </div>
        
     </div>
         <ProgressStandard />
      <Footer />
    </div>
  );
};

export default DashboardPage;