// utils/emailService.jsx
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export const useEmailService = () => {
  const supabase = useSupabaseClient()

  const sendEmail = async (emailType, data) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: {
          emailType,
          ...data
        }
      })

      if (error) {
        console.error('Email function error:', error)
        throw error
      }

      if (result.error) {
        console.error('Email service error:', result.error)
        throw new Error(result.error)
      }

      return result
    } catch (error) {
      console.error('Failed to send email:', error)
      throw error
    }
  }

  // Specific email functions
  const sendEvidenceEmail = async (task, evidenceData, user) => {
    return await sendEmail('evidence', {
      recipientEmail: task.assigned_to_email || 'admin@etranzact.com',
      taskTitle: task.title,
      userName: user?.user_metadata?.name || user?.email || 'Unknown User',
      description: evidenceData.description || 'No description provided',
      evidenceUrl: evidenceData.file_url || null
    })
  }

  const sendQueryEmail = async (queryData, task) => {
    return await sendEmail('query', {
      to: queryData.assigned_to,
      task: task?.title || 'Unknown Task',
      standard: queryData.standard,
      query: queryData.query_text
    })
  }

  const sendWelcomeEmail = async (userData) => {
    return await sendEmail('welcome', {
      to: userData.email,
      firstName: userData.first_name,
      email: userData.email,
      password: userData.temporary_password
    })
  }

  const sendTaskAssignmentEmail = async (task, user) => {
    return await sendEmail('assignment', {
      to: user.email,
      name: user.name,
      title: task.title,
      standard: task.standard,
      start: task.start,
      end: task.end,
      frequency: task.frequency
    })
  }

  const sendStatusUpdateEmail = async (task, previousStatus, newStatus, user, notes = '') => {
    return await sendEmail('status_update', {
      to: task.assigned_to_email || 'admin@etranzact.com',
      taskTitle: task.title,
      previousStatus,
      newStatus,
      updatedBy: user?.user_metadata?.name || user?.email || 'Unknown User',
      notes
    })
  }

  return {
    sendEmail,
    sendEvidenceEmail,
    sendQueryEmail,
    sendWelcomeEmail,
    sendTaskAssignmentEmail,
    sendStatusUpdateEmail
  }
}

export default useEmailService