import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { AttachFile, Upload, Close, CheckCircle } from '@mui/icons-material';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

// Email service utility (you can move this to a separate file later)
const useEmailService = () => {
  const supabase = useSupabaseClient();

  const sendEmail = async (emailType, data) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: {
          emailType,
          ...data
        }
      });

      if (error) {
        console.error('Email function error:', error);
        throw error;
      }

      if (result.error) {
        console.error('Email service error:', result.error);
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  };

  const sendEvidenceEmail = async (task, evidenceData, user) => {
    return await sendEmail('evidence', {
      recipientEmail: task.assigned_to_email || 'admin@etranzact.com',
      taskTitle: task.title,
      userName: user?.user_metadata?.name || user?.email || 'Unknown User',
      description: evidenceData.description || 'No description provided',
      evidenceUrl: evidenceData.file_url || null
    });
  };

  return {
    sendEmail,
    sendEvidenceEmail
  };
};

const EvidenceUpload = ({ open, onClose, task, onSuccess }) => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const { sendEvidenceEmail } = useEmailService();
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleEvidenceSubmit = async () => {
    if (!task) {
      setError('No task selected for evidence upload');
      return;
    }

    if (!evidenceFile && !evidenceDescription.trim()) {
      setError('Please provide either a file or description as evidence.');
      return;
    }

    if (!user) {
      setError('You must be logged in to submit evidence.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      console.log('Starting evidence upload process...');
      console.log('Task:', task);
      console.log('File:', evidenceFile);
      console.log('User:', user);

      let fileUrl = null;
      let fileName = null;

      // Upload file if provided
      if (evidenceFile) {
        const fileExt = evidenceFile.name.split('.').pop();
        fileName = `${task.id}_${Date.now()}.${fileExt}`;
        const filePath = `evidence/${fileName}`;

        console.log('Uploading file to storage...');
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('task-evidence')
          .upload(filePath, evidenceFile);

        if (uploadError) {
          console.error('Storage upload failed:', uploadError);
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }
        console.log('File uploaded to storage:', uploadData);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('task-evidence')
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
        fileName = evidenceFile.name;
      }

      // Insert evidence record
      const evidenceData = {
        task_id: task.id,
        file_url: fileUrl,
        file_name: fileName,
        description: evidenceDescription.trim() || 'No description provided',
        uploaded_by: user?.email || 'Unknown User'
      };
      
      console.log('Evidence data prepared:', evidenceData);

      console.log('Inserting into evidence table...');
      const { data: insertedEvidence, error: evidenceError } = await supabase
        .from('evidence')
        .insert(evidenceData)
        .select()
        .single();

      if (evidenceError) {
        console.error('Database insert failed:', evidenceError);
        
        if (evidenceError.code) {
          console.error('Error code:', evidenceError.code);
          console.error('Error details:', evidenceError.details);
          console.error('Error hint:', evidenceError.hint);
        }
        
        throw new Error(`Database insert failed: ${evidenceError.message} (Code: ${evidenceError.code})`);
      }
      console.log('Evidence record created:', insertedEvidence);

      // Send email notification
      try {
        console.log('Sending evidence email notification...');
        await sendEvidenceEmail(task, {
          description: evidenceDescription.trim() || 'No description provided',
          file_url: fileUrl
        }, user);
        console.log('Evidence email sent successfully');
      } catch (emailError) {
        console.error('Failed to send evidence email:', emailError);
        // Don't throw here - we don't want email failure to block evidence submission
      }
  
      // Update task status to Completed if it's not already
      console.log('Updating task status...');
      if (task.status !== 'Completed') {
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ status: 'Completed' })
          .eq('id', task.id);

        if (updateError) {
          console.error('Task status update failed:', updateError);
          console.warn('Evidence uploaded but task status update failed');
        } else {
          console.log('Task status updated to Completed');
        }
      }

      // Success!
      console.log('Evidence upload completed successfully!');
      
      // Show success popup
      setSuccessMessage('Evidence submitted successfully! Email notification sent.');
      setSuccessOpen(true);
      
      resetForm();
      onSuccess?.('Evidence uploaded successfully!');
      
    } catch (err) {
      console.error('Evidence upload process failed:', err);
      setError(`Failed to upload evidence: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/jpg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('File type not supported. Please upload PDF, Word, Excel, or image files.');
        return;
      }
      
      setEvidenceFile(file);
      setError('');
    }
  };

  const removeFile = () => {
    setEvidenceFile(null);
    setError('');
  };

  const resetForm = () => {
    setEvidenceFile(null);
    setEvidenceDescription('');
    setError('');
    onClose();
  };

  const handleSuccessClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSuccessOpen(false);
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return '📄';
    
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return '📕';
    if (['doc', 'docx'].includes(ext)) return '📘';
    if (['xls', 'xlsx'].includes(ext)) return '📗';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
    return '📄';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={resetForm} 
        maxWidth="sm" 
        fullWidth
        disableEscapeKeyDown={uploading}
      >
        <DialogTitle>
          <Box>
            <Typography variant="h6" component="div">
              Add Evidence for Task
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {task?.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Task ID: {task?.id}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                onClose={() => setError('')}
              >
                <Typography variant="body2" fontWeight="bold">
                  Upload Failed
                </Typography>
                <Typography variant="body2">
                  {error}
                </Typography>
              </Alert>
            )}
            
            {/* File Upload Section */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Upload File Evidence
              </Typography>
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFile />}
                disabled={uploading}
                fullWidth
                sx={{ 
                  py: 2,
                  borderStyle: 'dashed',
                  borderWidth: 2
                }}
              >
                {evidenceFile ? 'Change File' : 'Select File to Upload'}
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  disabled={uploading}
                />
              </Button>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Accepted files: PDF, Word, Excel, JPEG, PNG (Max 10MB)
              </Typography>
            </Box>
            
            {/* Selected File Preview */}
            {evidenceFile && (
              <Box 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'primary.50', 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'primary.200'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h5">
                    {getFileIcon(evidenceFile.name)}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {evidenceFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Size: {formatFileSize(evidenceFile.size)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Type: {evidenceFile.type || 'Unknown'}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    onClick={removeFile}
                    disabled={uploading}
                    sx={{ minWidth: 'auto' }}
                  >
                    <Close />
                  </Button>
                </Box>
              </Box>
            )}
            
            {/* Description Field */}
            <TextField
              label="Evidence Description"
              multiline
              rows={3}
              value={evidenceDescription}
              onChange={(e) => setEvidenceDescription(e.target.value)}
              placeholder="Describe the evidence you're providing or summarize the work completed..."
              disabled={uploading}
              helperText="Provide details about this evidence submission"
              fullWidth
            />
            
            {/* Task Info */}
            <Box 
              sx={{ 
                p: 2, 
                backgroundColor: 'grey.50', 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Task Information
              </Typography>
              <Typography variant="body2">
                <strong>Title:</strong> {task?.title}
              </Typography>
              <Typography variant="body2">
                <strong>Standard:</strong> {task?.standard || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Current Status:</strong> {task?.status}
              </Typography>
              <Typography variant="body2">
                <strong>Assigned To:</strong> {task?.assigned_to || 'Unassigned'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={resetForm} 
            disabled={uploading}
            startIcon={<Close />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEvidenceSubmit} 
            variant="contained" 
            disabled={(!evidenceFile && !evidenceDescription.trim()) || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <Upload />}
            sx={{ minWidth: 140 }}
          >
            {uploading ? 'Uploading...' : 'Upload Evidence'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={successOpen}
        autoHideDuration={6000}
        onClose={handleSuccessClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSuccessClose}
          severity="success"
          variant="filled"
          icon={<CheckCircle fontSize="inherit" />}
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EvidenceUpload;