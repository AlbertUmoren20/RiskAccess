// supabase/functions/send-evidence-email/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { Resend } from 'npm:resend@1.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  try {
    const { taskTitle, evidenceUrl, recipientEmail, description, userName } = await req.json()
    
    const { data, error } = await resend.emails.send({
      from: 'Evidence System <evidence@yourdomain.com>',
      to: [recipientEmail],
      subject: `New Evidence Submitted: ${taskTitle}`,
      html: `
        <h2>New Evidence Submitted</h2>
        <p><strong>Task:</strong> ${taskTitle}</p>
        <p><strong>Submitted by:</strong> ${userName}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Evidence File:</strong> <a href="${evidenceUrl}">View Evidence</a></p>
        <br/>
        <p><em>This is an automated notification from the Evidence System</em></p>
      `
    })

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})