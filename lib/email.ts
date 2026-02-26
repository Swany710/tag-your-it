// Email notifications via Resend (free tier: 3k emails/month)
// Install: npm i resend
// Get API key: resend.com

interface LeadEmailParams {
  repName: string;
  repEmail: string | null;
  leadName: string;
  leadPhone: string | null;
  leadEmail: string | null;
  leadAddress: string | null;
  leadNotes: string | null;
}

export async function sendLeadNotification(params: LeadEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.LEADS_NOTIFY_EMAIL;

  if (!apiKey || !notifyEmail) {
    console.warn("Email not configured. Set RESEND_API_KEY and LEADS_NOTIFY_EMAIL.");
    return;
  }

  const body = {
    from: "NFC Tap System <noreply@yourdomain.com>",
    to: [notifyEmail],
    subject: `🔔 New Lead — ${params.leadName} via ${params.repName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#1a1a1a">New NFC Lead</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;font-weight:bold;color:#555">Lead Name</td><td style="padding:8px">${params.leadName}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#555">Phone</td><td style="padding:8px">${params.leadPhone ?? "—"}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#555">Email</td><td style="padding:8px">${params.leadEmail ?? "—"}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#555">Address</td><td style="padding:8px">${params.leadAddress ?? "—"}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#555">Rep</td><td style="padding:8px">${params.repName}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#555">Notes</td><td style="padding:8px">${params.leadNotes ?? "—"}</td></tr>
        </table>
        <p style="color:#888;font-size:12px;margin-top:24px">Sent by NFC Tap System</p>
      </div>
    `,
  };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn("Email send failed:", err);
    }
  } catch (e) {
    console.warn("Email error:", e);
  }
}
