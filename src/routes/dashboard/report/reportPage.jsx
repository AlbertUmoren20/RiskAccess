import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ReportPage() {
  const [tasks, setTasks] = useState([]);
  const [standards, setStandards] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showQueryOverdue, setShowQueryOverdue] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState("all");
  const [queryText, setQueryText] = useState("");
  const [queries, setQueries] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [showQueryPopup, setShowQueryPopup] = useState(false);
  const [showEvidencePopup, setShowEvidencePopup] = useState(false);
  const [evidenceData, setEvidenceData] = useState(null);

  const supabase = useSupabaseClient();

  const selectedTaskObj = tasks.find(
    (task) => task.id === parseInt(selectedTask)
  );

  // 🔸 Fetch Queries
  useEffect(() => {
    const fetchQueries = async () => {
      const { data, error } = await supabase.from("queries").select("*");
      if (!error) setQueries(data);
    };
    fetchQueries();
  }, [supabase]);

  // 🔸 Fetch Tasks & Standards
  useEffect(() => {
    async function fetchData() {
      const { data: tasksData } = await supabase.from("tasks").select("*");
      setTasks(tasksData || []);
      setFilteredTasks(tasksData || []);

      const { data: standardsData } = await supabase
        .from("standards")
        .select("*");
      setStandards(standardsData || []);
    }
    fetchData();
  }, [supabase]);


  useEffect(() => {
    let result = tasks;
    if (selectedStandard !== "all") {
      result = result.filter((task) => task.standard === selectedStandard);
    }
    if (showQueryOverdue) {
      result = result.filter((task) => task.status === "Overdue");
    }
    setFilteredTasks(result);
  }, [selectedStandard, showQueryOverdue, tasks]);


  const getFrequencyDisplay = (task) => {
  
    return task.frequency || getFrequencyFromDates(task.start, task.end);
  };

  const getFrequencyFromDates = (start, end) => {
    const days = Math.ceil(
      (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)
    );
    if (days <= 1) return "Daily";
    if (days <= 7) return "Weekly";
    if (days <= 30) return "Monthly";
    if (days <= 90) return "Quarterly"; 
    if (days <= 180) return "Bi-Annually";
    return "Annually";
  };

  const getMonthStatus = (task, monthIndex) => {
    const dueDate = new Date(task.end);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const dueMonth = dueDate.getMonth();
    const dueYear = dueDate.getFullYear();

    // Check if this cell represents the due date month
    const isDueMonth = dueMonth === monthIndex && dueYear === currentYear;
    
    if (task.status === "Completed" && isDueMonth) {
      return "bg-green-500 text-white cursor-pointer";
    }
    
    // Task is overdue if it's not completed and due date has passed
    const isOverdue = task.status !== "Completed" && dueDate < new Date();
    
    if (isOverdue && monthIndex <= currentMonth && dueYear <= currentYear) {
      return "bg-red-500 text-white cursor-pointer";
    }
    
    if (monthIndex > currentMonth && isDueMonth) {
      return "bg-blue-100 cursor-pointer";
    }
    
    return "bg-gray-100";
  };

  // 🔸 Open Popup on Cell Click
  const handleCellClick = async (task) => {
    const currentDate = new Date();
    const dueDate = new Date(task.end);
    const isOverdue = task.status === "Overdue" || (task.status !== "Completed" && dueDate < currentDate);

    console.log("Task clicked:", task);
    console.log("Is overdue:", isOverdue, "Status:", task.status, "Due date:", dueDate);

    if (task.status === "Completed") {
      const { data, error } = await supabase
        .from("evidence")
        .select("*")
        .eq("task_id", task.id)
        .single();

      if (!error && data) {
        setEvidenceData(data);
        setShowEvidencePopup(true);
      } else {
        alert("No evidence uploaded for this task.");
      }
    } else if (isOverdue) {
      setSelectedTask(task.id);
      setSelectedStandard(task.standard);
      setShowQueryPopup(true);
    }
  };

  // 🔸 Submit Query
  const handleSubmitQuery = async () => {
    if (!selectedStandard || !selectedTask || !queryText) {
      alert("Please fill all fields");
      return;
    }

    const { data, error } = await supabase
      .from("queries")
      .insert([
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
      alert("Query submitted successfully!");
      setShowQueryPopup(false);
      setSelectedStandard("");
      setSelectedTask("");
      setQueryText("");
      setQueries((prev) => [...prev, ...data]);
    }
  };

  // 🔸 Export Report to Excel - UPDATED to use getFrequencyDisplay
  const exportReportToExcel = () => {
    if (!filteredTasks.length) {
      alert("No tasks to export");
      return;
    }

    const rows = filteredTasks.map((t) => {
      const months = {};
      [...Array(12)].forEach((_, i) => {
        const monthName = new Date(0, i).toLocaleString("default", {
          month: "short",
        });
        const dueDate = new Date(t.end);
        months[monthName] =
          dueDate.getMonth() === i ? t.status || "Pending" : "";
      });

      return {
        Activity: t.title,
        Coordinator: t.assigned_to || "Unassigned",
        Frequency: getFrequencyDisplay(t), // ✅ Updated to use new function
        ...months,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `report-${selectedStandard || "all"}.xlsx`);
  };

  const compliancePercentage =
    tasks.length > 0
      ? Math.round(
          (tasks.filter((t) => t.status === "Completed").length / tasks.length) *
            100
        )
      : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports</h1>
      </div>

      {/* Evidence Popup */}
      {showEvidencePopup && evidenceData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-2">Proof of Evidence</h3>
            <p className="mb-4">
              {evidenceData.description || "No description provided"}
            </p>
            {evidenceData.file_url && (
              <a
                href={evidenceData.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Evidence File
              </a>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowEvidencePopup(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Query Popup */}
      {showQueryPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-2">Raise a Query</h3>
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

      {/* Progress Overview */}
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
          <span>
            {standards.filter((s) => s.status === "Compliant").length} of{" "}
            {standards.length} standards
          </span>
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
            <label htmlFor="standard-select" className="text-sm font-medium">
              Filter by Standard:
            </label>
            <select
              id="standard-select"
              className="border rounded-md p-2 text-sm"
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
            >
              <option value="all">All Standards</option>
              {standards.map((standard) => (
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
                  <th
                    key={i}
                    className="p-2 border text-center"
                    style={{ minWidth: "60px" }}
                  >
                    {new Date(0, i).toLocaleString("default", { month: "short" })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-t">
                  <td className="p-2 border">{task.title}</td>
                  <td className="p-2 border">{task.assigned_to || "Unassigned"}</td>
                  <td className="p-2 border">
                    {getFrequencyDisplay(task) || "N/A"} 
                  </td>
                  {[...Array(12)].map((_, monthIndex) => (
                    <td
                      key={monthIndex}
                      className={`p-2 border text-center ${getMonthStatus(
                        task,
                        monthIndex
                      )}`}
                      onClick={() => handleCellClick(task)}
                    ></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No activities found for the selected criteria.
          </div>
        )}
      </div>
    </div>
  );
}