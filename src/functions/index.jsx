// import { createClient } from '@supabase/supabase-js'
// import { Resend } from 'resend'
// // import { NextApiRequest, NextApiResponse } from 'next'

// // Initialize clients with proper error handling
// const resendApiKey = process.env.RESEND_API_KEY
// const supabaseUrl = process.env.SUPABASE_URL
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// if (!resendApiKey) {
//   throw new Error('RESEND_API_KEY is not defined in environment variables')
// }
// if (!supabaseUrl) {
//   throw new Error('SUPABASE_URL is not defined in environment variables')
// }
// if (!supabaseServiceKey) {
//   throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables')
// }

// const resend = new Resend(resendApiKey)
// const supabase = createClient(supabaseUrl, supabaseServiceKey)


// export default async function index(

//   try {
//     // Get overdue tasks or tasks with specific status
//     const { data: tasks, error } = await supabase
//       .from('tasks')
//       .select('*')
//       .eq('status', 'Not Started')
//       // Add additional filters as needed, for example:
//       // .lt('end', new Date().toISOString()) // For overdue tasks

//     if (error) {
//       console.error('Supabase error:', error)
//       throw new Error(`Database error: ${error.message}`)
//     }

//     if (!tasks || tasks.length === 0) {
//       return res.status(200).json({ 
//         success: true, 
//         message: 'No tasks require reminders' 
//       })
//     }

//     const emailResults = []
//     const errors = []

//     for (const task of tasks) {
//       try {
//         if (!task.assigned_to) {
//           console.warn(`Task ${task.id} has no assigned user`)
//           continue
//         }

//         // Convert assigned_to to array of emails, handling various formats
//         const emailRecipients = task.assigned_to
//           .split(',')
//           .map(email => email.trim())
//           .filter(email => {
//             // Basic email validation
//             const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//             return emailRegex.test(email)
//           })

//         if (emailRecipients.length === 0) {
//           console.warn(`No valid emails found for task ${task.id}`)
//           continue
//         }

//         // Send email using Resend
//         const result = await resend.emails.send({
//           from: 'onboarding@resend.dev', // Use a verified domain with Resend
//           to: emailRecipients,
//           subject: `Reminder: Task "${task.title}" is pending`,
//           html: `
//             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//               <h2 style="color: #333;">Task Reminder</h2>
//               <p>Hello,</p>
//               <p>This is a reminder for your pending task:</p>
              
//               <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
//                 <h3 style="margin: 0; color: #0066cc;">${task.title}</h3>
//                 <p style="margin: 10px 0 0 0;">
//                   <strong>Status:</strong> ${task.status}<br>
//                   <strong>Due Date:</strong> ${task.end ? new Date(task.end).toLocaleDateString() : 'No due date set'}
//                 </p>
//               </div>

//               <p>Please take appropriate action on this task.</p>
              
//               <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
//               <p style="color: #666; font-size: 12px;">
//                 This is an automated reminder. Please do not reply to this email.
//               </p>
//             </div>
//           `
//         })

//         emailResults.push({
//           taskId: task.id,
//           recipients: emailRecipients,
//           success: true,
//           result
//         })

//         console.log(`Reminder sent for task ${task.id} to ${emailRecipients.join(', ')}`)

//       } catch (taskError) {
//         console.error(`Error processing task ${task.id}:`, taskError)
//         errors.push({
//           taskId: task.id,
//           error: taskError instanceof Error ? taskError.message : 'Unknown error'
//         })
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       sent: emailResults.length,
//       failed: errors.length,
//       results: emailResults,
//       errors: errors.length > 0 ? errors : undefined
//     })

//   } catch (e) {
//     console.error('Handler error:', e)
//     return res.status(500).json({
//       error: e instanceof Error ? e.message : 'Internal server error'
//     })
//   }
// }