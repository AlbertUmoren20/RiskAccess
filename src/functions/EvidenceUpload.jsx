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
  CircularProgress
} from '@mui/material';
import { AttachFile, Upload, Close } from '@mui/icons-material';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

const EvidenceUpload = ({ open, onClose, task, onSuccess }) => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleEvidenceSubmit = async () => {
    if (!task || !evidenceFile) {
      setError('Please select a file to upload as evidence');
      return;
    }

    try {
      setUploading(true);
      setError('');

      console.log('Starting evidence upload process...');
      console.log('Task:', task);
      console.log('File:', evidenceFile);
      console.log('User:', user);

      const fileExt = evidenceFile.name.split('.').pop();
      const fileName = `${task.id}_${Date.now()}.${fileExt}`;
      const filePath = `evidence/${fileName}`;

      console.log('Uploading file to storage...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('task-evidence')
        .upload(filePath, evidenceFile);

      if (uploadError) {
        console.error(' Storage upload failed:', uploadError);
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }
      console.log('File uploaded to storage:', uploadData);

      
      const { data: { publicUrl } } = supabase.storage
        .from('task-evidence')
        .getPublicUrl(filePath);
      console.log('Public URL generated:', publicUrl);


      const evidenceData = {
        task_id: task.id,
        file_url: publicUrl,
        file_name: evidenceFile.name,
        description: evidenceDescription || 'No description provided',
        uploaded_by: user?.user_metadata?.name || user?.email || 'Unknown User'
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

  
      console.log('Updating task status...');
      if (task.status !== 'Completed') {
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ status: 'Completed' })
          .eq('id', task.id);

        if (updateError) {
          console.error(' Task status update failed:', updateError);
    
          console.warn('Evidence uploaded but task status update failed');
        } else {
          console.log(' Task status updated to Completed');
        }
      }

      // Success!
      console.log('Evidence upload completed successfully!');
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
    
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setEvidenceFile(file);
      setError('');
    }
  };

  const resetForm = () => {
    setEvidenceFile(null);
    setEvidenceDescription('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={resetForm} maxWidth="sm" fullWidth>
      <DialogTitle>
        Add Evidence for: {task?.title}
        <Typography variant="body2" color="text.secondary">
          Task ID: {task?.id}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                Upload Failed
              </Typography>
              <Typography variant="body2">
                {error}
              </Typography>
            </Alert>
          )}
          
          <Button
            variant="outlined"
            component="label"
            startIcon={<AttachFile />}
            disabled={uploading}
          >
            Select File
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
              disabled={uploading}
            />
          </Button>
          
          <Typography variant="body2" color="text.secondary">
            Accepted files: PDF, Word, Excel, JPEG, PNG (Max 10MB)
          </Typography>
          
          <TextField
            label="Evidence Description"
            multiline
            rows={3}
            value={evidenceDescription}
            onChange={(e) => setEvidenceDescription(e.target.value)}
            placeholder="Describe the evidence you're uploading..."
            disabled={uploading}
          />
          
          {evidenceFile && (
            <Box sx={{ p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                Selected File:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Name: {evidenceFile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Size: {(evidenceFile.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Type: {evidenceFile.type || 'Unknown'}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={resetForm} disabled={uploading}>
          Cancel
        </Button>
        <Button 
          onClick={handleEvidenceSubmit} 
          variant="contained" 
          disabled={!evidenceFile || uploading}
          startIcon={uploading ? <CircularProgress size={20} /> : <Upload />}
        >
          {uploading ? 'Uploading...' : 'Upload Evidence'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EvidenceUpload;