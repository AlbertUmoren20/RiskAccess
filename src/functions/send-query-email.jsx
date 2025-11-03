// components/QueryForm.jsx
import React, { useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useEmailService } from '../utils/emailService';

const QueryForm = ({ task, onClose, onSuccess }) => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const { sendQueryEmail } = useEmailService();
  const [queryText, setQueryText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!queryText.trim()) {
      setError('Please enter a query');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Insert query into database
      const { data: queryData, error: queryError } = await supabase
        .from('queries')
        .insert([
          {
            standard: task.standard,
            task_id: task.id,
            assigned_to: task.assigned_to,
            query_text: queryText
          }
        ])
        .select()
        .single();

      if (queryError) throw queryError;

      // Send email notification
      try {
        await sendQueryEmail(queryData, task);
      } catch (emailError) {
        console.error('Failed to send query email:', emailError);
        // Continue even if email fails
      }

      onSuccess?.('Query submitted successfully!');
      onClose();
      
    } catch (err) {
      console.error('Error submitting query:', err);
      setError('Failed to submit query: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-bold mb-4">Raise Query for: {task.title}</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Query Details
          </label>
          <textarea
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Enter your query or clarification request..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={submitting}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Query'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QueryForm;