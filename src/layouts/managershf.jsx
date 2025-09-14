import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  FileText,
  Menu
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@mui/material";


export default function ManagerSHF() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Toggle */}
        <div className="flex items-center justify-between p-4">
          {!collapsed && <h2 className="text-lg font-semibold">Manager</h2>}
          <button onClick={() => setCollapsed(!collapsed)}>
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-1">
          <NavLink
            to="/manager-dashboard"
            end
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20",
                isActive && "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
              )
            }
          >
            <LayoutDashboard size={22} />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink
            to="/manager-dashboard/standards"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20",
                isActive && "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
              )
            }
          >
            <ClipboardList size={22} />
            {!collapsed && <span>Standards</span>}
          </NavLink>

          <NavLink
            to="/manager-dashboard/team"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20",
                isActive && "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
              )
            }
          >
            <Users size={22} />
            {!collapsed && <span>Team Members</span>}
          </NavLink>

          <NavLink
            to="/manager-dashboard/view-tasks"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20",
                isActive && "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
              )
            }
          >
            <FileText size={22} />
            {!collapsed && <span>View Tasks</span>}
          </NavLink>
          <NavLink
            to="/manager-dashboard/tasks"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20",
                isActive && "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
              )
            }
          >
            <FileText size={22} />
            {!collapsed && <span>Create Tasks</span>}
          </NavLink>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
