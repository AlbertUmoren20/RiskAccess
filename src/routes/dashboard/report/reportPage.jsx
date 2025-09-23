import React, { useState, useEffect } from "react";
import { useSupabaseClient } from '@supabase/auth-helpers-react';
 import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


export default function ReportPage() {
  const [tasks, setTasks] = useState([]);
  const [standards, setStandards] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showQueryOverdue, setShowQueryOverdue] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState("all");
    const [queryText, setQueryText] = useState("");
  const [queries, setQueries] = useState([]);
  const supabase = useSupabaseClient();
   const [showQueryPopup, setShowQueryPopup] = useState(false);
   const [selectedTask, setSelectedTask] = useState("");
   const [assigned_to, setAssignedTo] = useState("");


  // Fetch queries from Supabase
    // const selectedTaskObj = tasks.find(task => task.id === selectedTask);
    const selectedTaskObj = tasks.find((task) => task.id === parseInt(selectedTask));

  useEffect(() => {
    const fetchQueries = async () => {
      const { data, error } = await supabase.from("queries").select("*");
      if (!error) setQueries(data);
    };
    fetchQueries();
  }, []);

  const handleSubmitQuery = async () => {
    if (!selectedStandard || !selectedTask || !queryText) {
      alert("Please fill all fields");
      return;
    }

    const { data, error } = await supabase.from("queries").insert([
      {
        standard: selectedStandard,
        task_id: selectedTask,
        query_text: queryText,
        assigned_to: selectedTaskObj?.assigned_to || "Unassigned",
      },
    ])
      .select();

    if (error) {
      console.error("Error inserting query:", error);
      alert("Failed to submit query");
    } else {
// Send email to whoever is assigned
    if (selectedTaskObj?.assigned_to) {
      // assigned_to could be "John Doe" → find their email in team_members
      const { data: members } = await supabase
        .from("team_members")
        .select("email, first_name, last_name");

      const recipients = members.filter(
        m => `${m.first_name} ${m.last_name}` === selectedTaskObj.assigned_to
      );

      for (let recipient of recipients) {
        await fetch("/api/send-query-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: recipient.email,
            task: selectedTaskObj.title,
            standard: standards.find(s => s.slug === selectedStandard)?.title,
            query: queryText,
          }),
        });
      }
    }

      alert("Query submitted successfully!");
      setShowQueryPopup(false);
      setSelectedStandard("");
      setSelectedTask("");
      setQueryText("");
      setQueries((prev) => [...prev, ...data]);
    }
  };


  const getFrequency = (start, end) => {
    const days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
    if (days <= 1) return "Daily";
    if (days <= 7) return "Weekly";
    if (days <= 30) return "Monthly";
    if (days <= 180) return "Bi-Annually";
    return "Annually";
  };

 // --- Export Report View to Excel ---
const exportReportToExcel = () => {
  if (!filteredTasks.length) {
    alert("No tasks to export for the selected standard");
    return;
  }

  // Build rows for report view
  const rows = filteredTasks.map((t) => {
    const months = {};

    // Mark the month where this task falls
    [...Array(12)].forEach((_, i) => {
      const monthName = new Date(0, i).toLocaleString("default", { month: "short" });
      const dueDate = new Date(t.end);

      if (dueDate.getMonth() === i) {
        months[monthName] = t.status || "Pending";
      } else {
        months[monthName] = "";
      }
    });

    return {
      Activity: t.title,
      Coordinator: t.assigned_to || "Unassigned",
      Frequency: getFrequency(t.start, t.end),
      ...months, // spread the month columns (Jan–Dec)
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  // filename should reflect the selected standard
  const standardName =
    selectedStandard === "all"
      ? "all-standards"
      : standards.find((s) => s.slug === selectedStandard)?.title || selectedStandard;

  saveAs(blob, `report-${standardName}.xlsx`);
};


  useEffect(() => {
    async function fetchData() {
      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase.from("tasks").select("*");
      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
      } else {
        setTasks(tasksData || []);
        setFilteredTasks(tasksData || []);
      }

      // Fetch standards
      const { data: standardsData, error: standardsError } = await supabase.from("standards").select("*");
      console.log("Fetched standards:", standardsData);
      if (standardsError) {
        console.error("Error fetching standards:", standardsError);
      } else {
        setStandards(standardsData || []);
      }
    }
    fetchData();
  }, []);

  // Filter tasks based on selected standard and overdue filter
  useEffect(() => {
    let result = tasks;
    console.log("All tasks:", result);
     
    // Filter by selected standard
    if (selectedStandard && selectedStandard !== "all") {
      console.log("Task sample:", tasks[0]); 
      result = result.filter(task => task.standard === selectedStandard);
    }

    console.log("Selected standard:", selectedStandard);
    console.log("Filtered by standard:",  result);

    // Filter by overdue status if enabled
    if (showQueryOverdue) {
      result = result.filter(task => task.status === "Overdue");
    }
    
    setFilteredTasks(result);
  }, [selectedStandard, showQueryOverdue, tasks]);

  // Function to determine cell color based on task status for a specific month
  const getMonthStatus = (task, monthIndex) => {
    const dueDate = new Date(task.end);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Check if the task is due in this month
    if (dueDate.getMonth() === monthIndex && dueDate.getFullYear() === currentYear) {
      if (task.status === "Completed") {
        return "bg-green-500 text-white";
      } else if (task.status === "Overdue" || (monthIndex < currentMonth && task.status !== "Completed")) {
        return "bg-red-500 text-white";
      } else if (monthIndex > currentMonth) {
        return "bg-blue-100";
      }
    }
    
    return "bg-gray-100";
  };

  // Calculate compliance percentage
  const compliancePercentage = tasks.length > 0
  ? Math.round(
      (tasks.filter(t => t.status === "Completed").length / tasks.length) * 100
    )
  : 0;
  return (
    <div className="p-6 space-y-6">
      {/* Header with Query Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports</h1>
        <button
          className={`px-4 py-2 rounded-md ${
            showQueryOverdue 
              ? "bg-red-500 text-white" 
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setShowQueryOverdue(!showQueryOverdue)}
        >
          {showQueryOverdue ? "Show All Activities" : "Query Overdue"}
        </button>
        
      {/* Query button */}
      <button
        onClick={() => setShowQueryPopup(true)}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Raise Query
      </button>
      </div>
            {/* Query popup */}
      {showQueryPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-2">Raise a Query</h3>

            {/* Standard dropdown */}
            <label className="block mb-2">Select Standard</label>
            <select
              className="w-full border p-2 mb-3"
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
            >
              <option value=""></option>
              {standards.map((std) => (
                <option key={std.slug} value={std.slug}>
                  {std.title}
                </option>
              ))}
            </select>

            <label className="block mb-2">Assigned To</label>
<select
  className="w-full border p-2 mb-3"
  value={selectedTask}
  onChange={(e) => setSelectedTask(e.target.value)}
>
  <option value=""></option>
  {tasks
    .filter((task) => task.standard === selectedStandard)
    .map((task) => (
      <option key={task.id} value={task.id}>
      ({task.assigned_to || "Unassigned"})
      </option>
    ))}
</select>


            {/* Task dropdown */}
            <label className="block mb-2">Select Task</label>
            <select
              className="w-full border p-2 mb-3"
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
            >
              <option value=""></option>
              {tasks
                .filter((task) => task.standard === selectedStandard)
                .map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
            
                </select>
            {/* Query text */}
            <label className="block mb-2">Write Query</label>
            <textarea
              className="w-full border p-2 mb-3"
              rows={4}
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowQueryPopup(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuery}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Standards Overview */}
      <div className="rounded-2xl shadow-md p-4 bg-white">
        <h2 className="text-lg font-semibold mb-4">Standards Overview</h2>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div 
            className="bg-green-500 h-4 rounded-full" 
            style={{ width: `${compliancePercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Compliance: {compliancePercentage}%</span>
          <span>{standards.filter(s => s.status === "Compliant").length} of {standards.length} standards</span>
        </div>
      </div>

      {/* Activity Table */}
      <div className="rounded-2xl shadow-md p-4 bg-white overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Activity Timeline</h2>
          <button
          onClick={exportReportToExcel}
          className="bg-blue-100 border px-4 py-2 rounded-lg hover:bg-blue-50"
          >
          Export to Excel
          </button>

          <div className="flex items-center space-x-2">
            <label htmlFor="standard-select" className="text-sm font-medium">Filter by Standard:</label>
            <select
              id="standard-select"
              className="border rounded-md p-2 text-sm"
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
            >
              <option value="all">All Standards</option>
              {standards.map(standard => (
                <option key={standard.id} value={standard.slug}>
                  {standard.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {filteredTasks.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border text-left">Activity List</th>
                <th className="p-2 border text-left">Coordinator</th>
                <th className="p-2 border text-left">Frequency</th>
                {[...Array(12)].map((_, i) => (
                  <th key={i} className="p-2 border text-center" style={{ minWidth: '60px' }}>
                    {new Date(0, i).toLocaleString('default', { month: 'short' })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-t">
                  <td className="p-2 border">{task.title}</td>
                  <td className="p-2 border">{task.assigned_to || "Unassigned"}</td>
                  <td className="p-2 border">{getFrequency(task.start, task.end) || "N/A"}</td>
                  {[...Array(12)].map((_, monthIndex) => (
                    <td 
                      key={monthIndex} 
                      className={`p-2 border text-center ${getMonthStatus(task, monthIndex)}`}
                    >
                      {/* You can add icons or text here to indicate status */}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center p y-8 text-gray-500">
            No activities found for the selected criteria.
          </div>
        )}
      </div>
    </div>
  );
}