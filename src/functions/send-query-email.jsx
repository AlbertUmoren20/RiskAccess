import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { to, task, standard, query } = req.body;

  try {
    await resend.emails.send({
      from: "noreply@etranzact.com",
      to,
      subject: `Query Raised on Task: ${task}`,
      html: `
        <p>Hello,</p>
        <p>A query has been raised regarding your assigned task in the <strong>${standard}</strong> standard.</p>
        <ul>
          <li><strong>Task:</strong> ${task}</li>
          <li><strong>Query:</strong> ${query}</li>
        </ul>
        <p>Please address this query and provide clarification or take the necessary action.</p>
        <br/>
        <p>Regards,<br/>Risk and Compliance Management</p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
