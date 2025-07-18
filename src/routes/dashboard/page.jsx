import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "@/hooks/use-theme";
import { format } from "date-fns";
import { useState } from "react";
import { overviewData, recentSalesData, topProducts } from "@/constants";
import { useStandards } from "../../contexts/standardscontext";
import { Footer } from "@/layouts/footer";
import { CreditCard, DollarSign, Package, PencilLine, Star, Trash, TrendingUp, Users } from "lucide-react";



const DashboardPage = () => {
    const { theme } = useTheme();
       const [pciEvents, setPciEvents] = useState([]);
           const { standardsEvents, getAllEvents } = useStandards();

            const standardCounts = {
        pci: standardsEvents.pci.length,
        iso: standardsEvents.iso.length,
        vulnerability: standardsEvents.vulnerability.length,
        erm: standardsEvents.erm.length,
    };
          const allEvents = getAllEvents().sort((a, b) => 
        new Date(a.start.dateTime) - new Date(b.start.dateTime)
    );


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
                         <p className="card-value"></p>
                    </div>
                    <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                        <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">{standardCounts.iso}</p>
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
                        <p className="card-title"> Vulnerability Ass.</p>
                    </div>
                    <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                        <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">{standardCounts.vulnerability}</p>
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
                        <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">{standardCounts.pci}</p>
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
                        <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">{standardCounts.erm}</p>
                        <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
                            <TrendingUp size={18} />
                            
                        </span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="card col-span-1 md:col-span-2 lg:col-span-4">
                    <div className="card-header">
                        <p className="card-title">Assigned Task</p>
                    </div>
                    <div className="card-body p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Standard</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Task</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Assigned To</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Start Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">End Date</th>
                                </tr>
                            </thead>
                                     <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {allEvents.slice(0, 5).map((event) => (
                                    <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {event.summary.includes('PCI') ? 'PCI' : 
                                             event.summary.includes('ISO') ? 'ISO 27001' : 
                                             event.summary.includes('Vulnerability') ? 'Vulnerability' : 
                                             event.summary.includes('ERM') ? 'ERM' : 'Other'}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">{event.summary}</td>
                                        <td className="whitespace-nowrap px-6 py-4">{event.description.replace('Assigned to: ', '')}</td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {format(new Date(event.start.dateTime), 'PPpp')}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {format(new Date(event.end.dateTime), 'PPpp')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                            </div>
                    </div>
                {/* <div className="card col-span-1 md:col-span-2 lg:col-span-3">
                    <div className="card-header">
                        <p className="card-title">Recent Sales</p>
                    </div>
                    <div className="card-body h-[300px] overflow-auto p-0">
                        {recentSalesData.map((sale) => (
                            <div
                                key={sale.id}
                                className="flex items-center justify-between gap-x-4 py-2 pr-2"
                            >
                                <div className="flex items-center gap-x-4">
                                    <img
                                        src={sale.image}
                                        alt={sale.name}
                                        className="size-10 flex-shrink-0 rounded-full object-cover"
                                    />
                                    <div className="flex flex-col gap-y-2">
                                        <p className="font-medium text-slate-900 dark:text-slate-50">{sale.name}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{sale.email}</p>
                                    </div>
                                </div>
                                <p className="font-medium text-slate-900 dark:text-slate-50">${sale.total}</p>
                            </div>
                        ))}
                    </div>
                </div> */}
            </div>
            </div>
            {/* <div className="card">
                <div className="card-header">
                    <p className="card-title">Top Orders</p>
                </div>
                <div className="card-body p-0">
                    <div className="relative h-[500px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                        <table className="table">
                            <thead className="table-header">
                                <tr className="table-row">
                                    <th className="table-head">#</th>
                                    <th className="table-head">Product</th>
                                    <th className="table-head">Price</th>
                                    <th className="table-head">Status</th>
                                    <th className="table-head">Rating</th>
                                    <th className="table-head">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {topProducts.map((product) => (
                                    <tr
                                        key={product.number}
                                        className="table-row"
                                    >
                                        <td className="table-cell">{product.number}</td>
                                        <td className="table-cell">
                                            <div className="flex w-max gap-x-4">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="size-14 rounded-lg object-cover"
                                                />
                                                <div className="flex flex-col">
                                                    <p>{product.name}</p>
                                                    <p className="font-normal text-slate-600 dark:text-slate-400">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell">${product.price}</td>
                                        <td className="table-cell">{product.status}</td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-x-2">
                                                <Star
                                                    size={18}
                                                    className="fill-yellow-600 stroke-yellow-600"
                                                />
                                                {product.rating}
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-x-4">
                                                <button className="text-blue-500 dark:text-blue-600">
                                                    <PencilLine size={20} />
                                                </button>
                                                <button className="text-red-500">
                                                    <Trash size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div> */}
            <Footer />
</div>
    );
};

export default DashboardPage;
