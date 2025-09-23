import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { to, name, standard, title, start, end, frequency } = req.body;

  try {
    await resend.emails.send({
      from: "noreply@etranzact.com",
      to,
      subject: `New Task Assigned: ${title}`,
      html: `
        <p>Hello ${name},</p>
        <p>You've been assigned a new task in the <strong>${standard}</strong> standard.</p>
        <ul>
          <li><strong>Task:</strong> ${title}</li>
          <li><strong>Start:</strong> ${new Date(start).toLocaleString()}</li>
          <li><strong>End:</strong> ${new Date(end).toLocaleString()}</li>
          <li><strong>Frequency:</strong> ${frequency}</li>
        </ul>
        <p>Please check it out in the Risk & Compliance Management System.</p>
        <br/>
        <p>Regards,<br/>Risk and Compliance Management Team</p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
