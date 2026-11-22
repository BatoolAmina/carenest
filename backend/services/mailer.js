import nodemailer from "nodemailer";

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
export const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const mailConfigured = () => Boolean(process.env.SMTP_HOST);

let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

/** Branded e-mail shell. */
export function layout({ title, body, cta }) {
  const button = cta ? `<p style="margin:28px 0"><a href="${esc(cta.url)}" style="background:#0f7652;color:#fff;padding:13px 26px;border-radius:10px;text-decoration:none;font-weight:600">${esc(cta.label)}</a></p>` : "";
  return `<div style="background:#faf7f0;padding:32px 12px;font-family:Segoe UI,Arial,sans-serif;color:#102a21">
  <div style="max-width:560px;margin:auto;background:#fff;border:1px solid #e8dcc0;border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#064e3b,#0f7652);padding:22px 28px"><span style="color:#e8d096;font-size:22px;font-weight:700;letter-spacing:.3px">CareNest</span><span style="color:#cfe9dc;font-size:12px;margin-left:10px">Care Today, Brighter Tomorrows</span></div>
    <div style="padding:28px"><h2 style="margin:0 0 14px;font-size:20px">${esc(title)}</h2><div style="line-height:1.6;font-size:15px">${body}</div>${button}
    <p style="font-size:12px;color:#5b7066;margin-top:28px">This is an automated message from CareNest Hospital. Never share verification codes with anyone.</p></div>
  </div></div>`;
}

/** Never throws. Without SMTP configured the message is logged so local development still works. */
export async function sendMail({ to, subject, html }) {
  if (!mailConfigured()) {
    console.log(`\n[mail:not-configured] To: ${to}\nSubject: ${subject}\n${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 500)}\n`);
    return { skipped: true };
  }
  try {
    await getTransporter().sendMail({ from: process.env.MAIL_FROM || "CareNest <no-reply@carenest.health>", to, subject, html });
    return { sent: true };
  } catch (e) {
    console.error("[mail:error]", e.message);
    return { error: true };
  }
}
