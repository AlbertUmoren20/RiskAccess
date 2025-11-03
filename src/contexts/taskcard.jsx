import React, { useState, useEffect } from 'react';
import { useTasks } from './taskcontext';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { 
  CheckCircle, 
  PlayCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Calendar,
  User,
  Flag,
  Edit3,
  Eye,
  Download,
  Trash2
} from 'lucide-react';
import EvidenceUpload from '@/functions/EvidenceUpload'; // Import the EvidenceUpload component

const statusColors = {
  'Completed': 'bg-green-100 text-green-800 border-green-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'Not Started': 'bg-gray-100 text-gray-800 border-gray-200',
  'Overdue': 'bg-red-100 text-red-800 border-red-200',
  'Pending Review': 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

const statusIcons = {
  'Completed': CheckCircle,
  'In Progress': PlayCircle,
  'Not Started': Clock,
  'Overdue': AlertCircle,
  'Pending Review': Clock
};

const priorityColors = {
  'High': 'text-red-600 bg-red-50 border-red-200',
  'Medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
  'Low': 'text-green-600 bg-green-50 border-green-200'
};

const TaskCard = ({ task, onAddEvidence }) => {
  const { updateTaskStatus } = useTasks();
  const supabase = useSupabaseClient();
  const user = useUser();
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false);
  const [submittedEvidence, setSubmittedEvidence] = useState([]);
  const [viewingEvidence, setViewingEvidence] = useState(false);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  // Load evidence when component mounts or task changes
  useEffect(() => {
    if (task?.id) {
      loadEvidence();
    }
  }, [task?.id]);

  const loadEvidence = async () => {
    try {
      setLoadingEvidence(true);
      const { data, error } = await supabase
        .from('evidence')
        .select('*')
        .eq('task_id', task.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      
      setSubmittedEvidence(data || []);
    } catch (error) {
      console.error('Error loading evidence:', error);
    } finally {
      setLoadingEvidence(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await updateTaskStatus(task.id, newStatus);
      setShowStatusOptions(false);
      
      // If marking as completed, show evidence upload modal immediately
      if (newStatus === 'Completed') {
        setShowEvidenceUpload(true);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update task status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewEvidence = () => {
    if (submittedEvidence.length > 0) {
      setViewingEvidence(true);
    } else {
      // If no evidence exists but task is completed, allow adding evidence
      setShowEvidenceUpload(true);
    }
  };

  const handleAddEvidence = () => {
    setShowEvidenceUpload(true);
  };

  const handleDownloadEvidence = async (evidence) => {
    if (!evidence.file_url) return;
    
    try {
      const response = await fetch(evidence.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = evidence.file_name || 'evidence';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const handleDeleteEvidence = async (evidenceId) => {
    if (!confirm('Are you sure you want to delete this evidence?')) return;

    try {
      const { error } = await supabase
        .from('evidence')
        .delete()
        .eq('id', evidenceId);

      if (error) throw error;

      // Reload evidence list
      await loadEvidence();
      alert('Evidence deleted successfully');
    } catch (error) {
      console.error('Error deleting evidence:', error);
      alert('Failed to delete evidence');
    }
  };

  const handleEvidenceUploadSuccess = (message) => {
    console.log(message);
    // Reload evidence after successful upload
    loadEvidence();
    setShowEvidenceUpload(false);
  };

  // Calculate days remaining/overdue only for incomplete tasks
  const daysRemaining = task.status !== 'Completed' 
    ? Math.ceil((new Date(task.end) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const isOverdue = daysRemaining < 0 && task.status !== 'Completed';
  const isDueSoon = daysRemaining <= 3 && daysRemaining >= 0 && task.status !== 'Completed';

  const assignedUsers = task.assigned_to
    ? task.assigned_to.split(',').map((u) => u.trim())
    : [];

  const StatusIcon = statusIcons[task.status] || Clock;

  // Format dates consistently
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
        <div className="p-6">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 mb-1">
                {task.title || 'Untitled Task'}
              </h3>
              {task.standard && (
                <p className="text-sm text-gray-500 mb-2">
                  Standard: <span className="font-medium">{task.standard}</span>
                </p>
              )}
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <StatusIcon size={16} className={task.status === 'Completed' ? 'text-green-600' : 'text-gray-400'} />
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[task.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {task.status || 'Not Started'}
              </span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Assigned To */}
            <div className="flex items-start gap-2">
              <User size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                <div className="flex flex-wrap gap-1">
                  {assignedUsers.length > 0 ? (
                    assignedUsers.map((name, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700 border"
                      >
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">Unassigned</span>
                  )}
                </div>
              </div>
            </div>

            {/* Priority */}
            {task.priority && (
              <div className="flex items-start gap-2">
                <Flag size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Priority</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${priorityColors[task.priority] || 'text-gray-600 bg-gray-50'}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            )}

            {/* Due Date */}
            <div className="flex items-start gap-2">
              <Calendar size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-1">Due Date</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {formatDate(task.end) || 'No due date'}
                  </span>
                  {/* Only show days status for incomplete tasks */}
                  {task.status !== 'Completed' && daysRemaining !== null && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isOverdue ? 'bg-red-100 text-red-700 border border-red-200' :
                      isDueSoon ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                      {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : 
                      isDueSoon ? `${daysRemaining} days left` : 
                      `${daysRemaining} days left`}
                    </span>
                  )}
                  {/* Show completion badge for completed tasks */}
                  {task.status === 'Completed' && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="flex items-start gap-2">
              <Clock size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-1">Schedule</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-medium">Start:</span>
                    <span>{formatDateTime(task.start)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-medium">Due:</span>
                    <span>{formatDateTime(task.end)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            {/* Evidence Button - Show for completed tasks or tasks with evidence */}
            {(task.status === 'Completed' || submittedEvidence.length > 0) && (
              <button
                onClick={handleViewEvidence}
                disabled={loadingEvidence}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loadingEvidence ? (
                  <Clock size={16} className="animate-spin" />
                ) : submittedEvidence.length > 0 ? (
                  <Eye size={16} />
                ) : (
                  <FileText size={16} />
                )}
                {loadingEvidence ? 'Loading...' : submittedEvidence.length > 0 ? `View Evidence (${submittedEvidence.length})` : 'Add Evidence'}
              </button>
            )}
            
            {/* Update Status Button - Always show */}
            <button 
              onClick={() => setShowStatusOptions(!showStatusOptions)}
              disabled={isUpdating}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Edit3 size={16} />
              {isUpdating ? 'Updating...' : 'Update Status'}
            </button>
          </div>

          {/* Status Options */}
          {showStatusOptions && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
              <p className="text-xs text-gray-500 mb-2 font-medium">Change Status:</p>
              <div className="flex flex-wrap gap-2">
                {["Not Started", "In Progress", "Completed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={isUpdating || task.status === status}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      task.status === status 
                        ? 'bg-indigo-600 text-white border-indigo-600 cursor-default' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Upload Prompt for completed tasks without evidence */}
          {task.status === 'Completed' && submittedEvidence.length === 0 && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Task completed!</span> Upload evidence to document your work.
                </p>
              </div>
            </div>
          )}

          {/* Evidence Submitted Confirmation */}
          {submittedEvidence.length > 0 && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700">
                  <span className="font-medium">{submittedEvidence.length} evidence item(s) submitted!</span> Click "View Evidence" to see submissions.
                </p>
              </div>
            </div>
          )}

          {/* Task ID */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Task ID: {task.id}</p>
          </div>
        </div>
      </div>

      {/* Evidence Upload Dialog */}
      <EvidenceUpload
        open={showEvidenceUpload}
        onClose={() => setShowEvidenceUpload(false)}
        task={task}
        onSuccess={handleEvidenceUploadSuccess}
      />

      {/* View Evidence Modal */}
      {viewingEvidence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Evidence for Task
                </h3>
                <button
                  onClick={() => setViewingEvidence(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FileText size={20} />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                <p className="text-sm text-gray-600">Task ID: {task.id}</p>
                <p className="text-sm text-gray-600">Total Evidence: {submittedEvidence.length} item(s)</p>
              </div>

              {/* Evidence List */}
              <div className="space-y-4">
                {submittedEvidence.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No evidence submitted yet.</p>
                    <button
                      onClick={() => {
                        setViewingEvidence(false);
                        setShowEvidenceUpload(true);
                      }}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Add Evidence
                    </button>
                  </div>
                ) : (
                  submittedEvidence.map((evidence) => (
                    <div key={evidence.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {evidence.file_name || 'Text Evidence'}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Uploaded by {evidence.uploaded_by} on {formatDateTime(evidence.uploaded_at)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {evidence.file_url && (
                            <button
                              onClick={() => handleDownloadEvidence(evidence)}
                              className="text-indigo-600 hover:text-indigo-800 p-1"
                              title="Download"
                            >
                              <Download size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteEvidence(evidence.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {evidence.description && evidence.description !== 'No description provided' && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {evidence.description}
                          </p>
                        </div>
                      )}

                      {evidence.file_url && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText size={16} />
                          <span>File attached: {evidence.file_name}</span>
                          {evidence.file_size && (
                            <span className="text-gray-400">
                              ({formatFileSize(evidence.file_size)})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setViewingEvidence(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setViewingEvidence(false);
                    setShowEvidenceUpload(true);
                  }}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add More Evidence
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCard;