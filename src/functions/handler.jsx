import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { to,email, firstName, password } = req.body;

  try {
    await resend.emails.send({
      from: 'Risk & Compliance <noreply@etranzact.com>',
      to,
      subject: 'Welcome to the Risk and Compliance Management Team',
      html: `
        <p>Hello ${firstName},</p>
        <p>Welcome to the <strong>Risk and Compliance Management Team</strong> 🎉</p>
        <p>Here are your login details:</p>
        <ul>
          <li>Email: ${email}</li>
          <li>Temporary Password: ${password}</li>
        </ul>
        <p>👉 <a href="https://risk-monitor-swart.vercel.app/">Click here to sign in</a></p>
        <p><strong>Note:</strong> Please change your password immediately after your first login for security purposes.</p>
        <br/>
        <p>Best regards,<br/>Risk and Compliance Management Team</p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
