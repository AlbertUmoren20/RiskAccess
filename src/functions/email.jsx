// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'

const resend = new Resend(Deno.env.get('re_BdXNcLkY_NLoyBsNWsYnivngdGy8GytpF'))
const FROM_EMAIL = 'Risk and Compliance System <noreply@etranzact.com>'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const { emailType, ...data } = await req.json()
    
    console.log('Received email request:', { emailType, data })
    
    let emailConfig

    switch (emailType) {
      case 'evidence':
        emailConfig = {
          from: FROM_EMAIL,
          to: [data.recipientEmail],
          subject: `New Evidence Submitted: ${data.taskTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">New Evidence Submitted</h2>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
                <p><strong>Task:</strong> ${data.taskTitle}</p>
                <p><strong>Submitted by:</strong> ${data.userName}</p>
                <p><strong>Description:</strong> ${data.description}</p>
                ${data.evidenceUrl ? `<p><strong>Evidence File:</strong> <a href="${data.evidenceUrl}" style="color: #2563eb;">View Evidence</a></p>` : ''}
              </div>
              <br/>
              <p style="color: #64748b; font-size: 14px;">
                <em>This is an automated notification from the Risk and Compliance System</em>
              </p>
            </div>
          `
        }
        break

      case 'query':
        emailConfig = {
          from: FROM_EMAIL,
          to: [data.to],
          subject: `Query Raised on Task: ${data.task}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Query Raised</h2>
              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
                <p>A query has been raised regarding your assigned task:</p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li><strong>Standard:</strong> ${data.standard}</li>
                  <li><strong>Task:</strong> ${data.task}</li>
                  <li><strong>Query:</strong> ${data.query}</li>
                </ul>
              </div>
              <p>Please address this query and provide clarification or take the necessary action.</p>
              <br/>
              <p>Regards,<br/><strong>Risk and Compliance Management</strong></p>
            </div>
          `
        }
        break

      case 'assignment':
        emailConfig = {
          from: FROM_EMAIL,
          to: [data.to],
          subject: `New Task Assigned: ${data.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #059669;">New Task Assignment</h2>
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #059669;">
                <p>Hello ${data.name},</p>
                <p>You've been assigned a new task in the <strong>${data.standard}</strong> standard.</p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li><strong>Task:</strong> ${data.title}</li>
                  <li><strong>Start:</strong> ${new Date(data.start).toLocaleDateString()}</li>
                  <li><strong>End:</strong> ${new Date(data.end).toLocaleDateString()}</li>
                  <li><strong>Frequency:</strong> ${data.frequency}</li>
                </ul>
              </div>
              <p>Please check it out in the Risk & Compliance Management System.</p>
              <br/>
              <p>Regards,<br/><strong>Risk and Compliance Management Team</strong></p>
            </div>
          `
        }
        break

      case 'welcome':
        emailConfig = {
          from: FROM_EMAIL,
          to: [data.to],
          subject: 'Welcome to the Risk and Compliance Management Team',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">Welcome to the Team! 🎉</h2>
              <div style="background: #faf5ff; padding: 20px; border-radius: 8px; border-left: 4px solid #7c3aed;">
                <p>Hello ${data.firstName},</p>
                <p>Welcome to the <strong>Risk and Compliance Management Team</strong>!</p>
                <p>Here are your login details:</p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li><strong>Email:</strong> ${data.email}</li>
                  <li><strong>Temporary Password:</strong> ${data.password}</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 20px 0;">
                <a href="https://risk-monitor-swart.vercel.app/" 
                   style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Click here to sign in
                </a>
              </div>
              <p style="color: #dc2626; font-size: 14px;">
                <strong>Note:</strong> Please change your password immediately after your first login for security purposes.
              </p>
              <br/>
              <p>Best regards,<br/><strong>Risk and Compliance Management Team</strong></p>
            </div>
          `
        }
        break

      case 'status_update':
        emailConfig = {
          from: FROM_EMAIL,
          to: [data.to],
          subject: `Task Status Updated: ${data.taskTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #d97706;">Task Status Updated</h2>
              <div style="background: #fffbeb; padding: 20px; border-radius: 8px; border-left: 4px solid #d97706;">
                <p><strong>Task:</strong> ${data.taskTitle}</p>
                <p><strong>Previous Status:</strong> ${data.previousStatus}</p>
                <p><strong>New Status:</strong> ${data.newStatus}</p>
                <p><strong>Updated by:</strong> ${data.updatedBy}</p>
                ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
              </div>
              <br/>
              <p>Regards,<br/><strong>Risk and Compliance Management</strong></p>
            </div>
          `
        }
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid email type' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        )
    }

    console.log('Sending email with config:', emailConfig)

    const { data: emailData, error } = await resend.emails.send(emailConfig)

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('Email sent successfully:', emailData)

    return new Response(
      JSON.stringify({ success: true, data: emailData }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})