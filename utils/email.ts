import { Resend } from "resend";
import EmailTemplate from "../models/EmailTemplate.js";
import type {
  EmailTemplateKey,
  EmailVars,
  EmailResult,
} from "../types/index.js";

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Default templates ─────────────────────────────────────────────────────────

interface DefaultTemplate {
  key: EmailTemplateKey;
  subject: string;
  bodyHtml: string;
}

const DEFAULT_TEMPLATES: DefaultTemplate[] = [
  {
    key: "booking_submitted",
    subject: "Booking Received — {{celebName}} {{bookingType}}",
    bodyHtml: `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#0a0806;color:#F5EDD6;border-radius:16px;overflow:hidden;border:1px solid rgba(201,169,110,0.2)">
  <div style="background:linear-gradient(135deg,#1c1812,#141109);padding:32px;text-align:center;border-bottom:1px solid rgba(201,169,110,0.15)">
    <div style="display:inline-block;background:linear-gradient(135deg,#C9A96E,#8a6a30);border-radius:10px;padding:8px 16px;font-size:14px;color:#0a0806;font-weight:bold;letter-spacing:1px;margin-bottom:16px">RAZORGOLD</div>
    <h1 style="font-size:26px;color:#F5EDD6;margin:0;font-style:italic">Booking Received!</h1>
  </div>
  <div style="padding:32px">
    <p style="font-size:16px;color:#AAA;line-height:1.8">Hi <strong style="color:#F5EDD6">{{fanName}}</strong>,</p>
    <p style="font-size:15px;color:#888;line-height:1.9">Your <strong style="color:#C9A96E">{{bookingType}}</strong> booking for <strong style="color:#C9A96E">{{celebName}}</strong> has been received and is now under review.</p>
    <div style="background:rgba(201,169,110,0.06);border:1px solid rgba(201,169,110,0.15);border-radius:12px;padding:20px;margin:24px 0">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#666;font-size:13px;letter-spacing:1px">REFERENCE</td><td style="padding:8px 0;color:#C9A96E;font-family:monospace;font-size:14px;text-align:right">{{refCode}}</td></tr>
        <tr><td style="padding:8px 0;color:#666;font-size:13px;letter-spacing:1px;border-top:1px solid rgba(255,255,255,0.04)">CELEBRITY</td><td style="padding:8px 0;color:#F5EDD6;font-size:14px;text-align:right;border-top:1px solid rgba(255,255,255,0.04)">{{celebName}}</td></tr>
        <tr><td style="padding:8px 0;color:#666;font-size:13px;letter-spacing:1px;border-top:1px solid rgba(255,255,255,0.04)">BOOKING TYPE</td><td style="padding:8px 0;color:#F5EDD6;font-size:14px;text-align:right;border-top:1px solid rgba(255,255,255,0.04);text-transform:capitalize">{{bookingType}}</td></tr>
        <tr><td style="padding:8px 0;color:#666;font-size:13px;letter-spacing:1px;border-top:1px solid rgba(255,255,255,0.04)">AMOUNT</td><td style="padding:8px 0;color:#C9A96E;font-size:14px;text-align:right;border-top:1px solid rgba(255,255,255,0.04)">${"$"}{{amount}}</td></tr>
        <tr><td style="padding:8px 0;color:#666;font-size:13px;letter-spacing:1px;border-top:1px solid rgba(255,255,255,0.04)">STATUS</td><td style="padding:8px 0;font-size:14px;text-align:right;border-top:1px solid rgba(255,255,255,0.04)"><span style="color:#E0A44A;background:rgba(224,164,74,0.1);border:1px solid rgba(224,164,74,0.3);padding:3px 10px;border-radius:20px;font-size:11px;letter-spacing:1px">PAYMENT PENDING</span></td></tr>
      </table>
    </div>
    <p style="font-size:14px;color:#666;line-height:1.9">Our team will review your RazorGold card code and update your booking status shortly. You will receive another email once it has been approved or declined.</p>
  </div>
  <div style="background:#0a0806;padding:20px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.04)">
    <p style="color:#333;font-size:12px;margin:0">CelebConnect × RazorGold · All rights reserved</p>
  </div>
</div>`,
  },
  {
    key: "booking_approved",
    subject: "🎉 Booking Approved — {{celebName}} {{bookingType}}",
    bodyHtml: `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#0a0806;color:#F5EDD6;border-radius:16px;overflow:hidden;border:1px solid rgba(110,196,122,0.25)">
  <div style="background:linear-gradient(135deg,#1c1812,#141109);padding:32px;text-align:center;border-bottom:1px solid rgba(110,196,122,0.15)">
    <div style="font-size:40px;margin-bottom:12px">🎉</div>
    <h1 style="font-size:26px;color:#F5EDD6;margin:0;font-style:italic">Booking Approved!</h1>
  </div>
  <div style="padding:32px">
    <p style="font-size:16px;color:#AAA;line-height:1.8">Hi <strong style="color:#F5EDD6">{{fanName}}</strong>,</p>
    <p style="font-size:15px;color:#888;line-height:1.9">Great news! Your <strong style="color:#C9A96E">{{bookingType}}</strong> booking for <strong style="color:#C9A96E">{{celebName}}</strong> has been <strong style="color:#6EC47A">approved</strong>.</p>
    <div style="background:rgba(110,196,122,0.05);border:1px solid rgba(110,196,122,0.2);border-radius:12px;padding:20px;margin:24px 0">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#666;font-size:13px;letter-spacing:1px">REFERENCE</td><td style="padding:8px 0;color:#C9A96E;font-family:monospace;font-size:14px;text-align:right">{{refCode}}</td></tr>
        <tr><td style="padding:8px 0;color:#666;font-size:13px;letter-spacing:1px;border-top:1px solid rgba(255,255,255,0.04)">CELEBRITY</td><td style="padding:8px 0;color:#F5EDD6;font-size:14px;text-align:right;border-top:1px solid rgba(255,255,255,0.04)">{{celebName}}</td></tr>
        <tr><td style="padding:8px 0;color:#666;font-size:13px;letter-spacing:1px;border-top:1px solid rgba(255,255,255,0.04)">BOOKING TYPE</td><td style="padding:8px 0;color:#F5EDD6;font-size:14px;text-align:right;border-top:1px solid rgba(255,255,255,0.04);text-transform:capitalize">{{bookingType}}</td></tr>
        {{#if scheduledDate}}<tr><td style="padding:8px 0;color:#666;font-size:13px;letter-spacing:1px;border-top:1px solid rgba(255,255,255,0.04)">SCHEDULED DATE</td><td style="padding:8px 0;color:#9ECA9E;font-size:14px;text-align:right;border-top:1px solid rgba(255,255,255,0.04)">{{scheduledDate}}</td></tr>{{/if}}
        <tr><td style="padding:8px 0;color:#666;font-size:13px;letter-spacing:1px;border-top:1px solid rgba(255,255,255,0.04)">STATUS</td><td style="padding:8px 0;font-size:14px;text-align:right;border-top:1px solid rgba(255,255,255,0.04)"><span style="color:#6EC47A;background:rgba(110,196,122,0.1);border:1px solid rgba(110,196,122,0.3);padding:3px 10px;border-radius:20px;font-size:11px;letter-spacing:1px">APPROVED</span></td></tr>
      </table>
    </div>
    {{#if adminNote}}<div style="background:rgba(255,255,255,0.03);border-left:3px solid #C9A96E;padding:14px 18px;border-radius:0 10px 10px 0;margin-bottom:20px"><p style="color:#AAA;font-size:14px;margin:0;line-height:1.7"><strong style="color:#C9A96E">Note from CelebConnect:</strong> {{adminNote}}</p></div>{{/if}}
    <p style="font-size:14px;color:#666;line-height:1.9">You will receive further details and joining instructions closer to your booking date.</p>
  </div>
  <div style="background:#0a0806;padding:20px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.04)">
    <p style="color:#333;font-size:12px;margin:0">CelebConnect × RazorGold · All rights reserved</p>
  </div>
</div>`,
  },
  {
    key: "booking_failed",
    subject: "Booking Update — {{celebName}} {{bookingType}}",
    bodyHtml: `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#0a0806;color:#F5EDD6;border-radius:16px;overflow:hidden;border:1px solid rgba(224,107,107,0.2)">
  <div style="background:linear-gradient(135deg,#1c1812,#141109);padding:32px;text-align:center;border-bottom:1px solid rgba(224,107,107,0.15)">
    <div style="font-size:40px;margin-bottom:12px">❌</div>
    <h1 style="font-size:26px;color:#F5EDD6;margin:0;font-style:italic">Booking Declined</h1>
  </div>
  <div style="padding:32px">
    <p style="font-size:16px;color:#AAA;line-height:1.8">Hi <strong style="color:#F5EDD6">{{fanName}}</strong>,</p>
    <p style="font-size:15px;color:#888;line-height:1.9">Unfortunately your <strong style="color:#C9A96E">{{bookingType}}</strong> booking for <strong style="color:#C9A96E">{{celebName}}</strong> could not be processed.</p>
    <div style="background:rgba(224,107,107,0.05);border:1px solid rgba(224,107,107,0.15);border-radius:12px;padding:20px;margin:24px 0">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#666;font-size:13px;letter-spacing:1px">REFERENCE</td><td style="padding:8px 0;color:#C9A96E;font-family:monospace;font-size:14px;text-align:right">{{refCode}}</td></tr>
        <tr><td style="padding:8px 0;color:#666;font-size:13px;letter-spacing:1px;border-top:1px solid rgba(255,255,255,0.04)">STATUS</td><td style="padding:8px 0;font-size:14px;text-align:right;border-top:1px solid rgba(255,255,255,0.04)"><span style="color:#E06B6B;background:rgba(224,107,107,0.1);border:1px solid rgba(224,107,107,0.3);padding:3px 10px;border-radius:20px;font-size:11px;letter-spacing:1px">FAILED</span></td></tr>
      </table>
    </div>
    {{#if adminNote}}<div style="background:rgba(255,255,255,0.03);border-left:3px solid #E06B6B;padding:14px 18px;border-radius:0 10px 10px 0;margin-bottom:20px"><p style="color:#AAA;font-size:14px;margin:0;line-height:1.7"><strong style="color:#E06B6B">Reason:</strong> {{adminNote}}</p></div>{{/if}}
    <p style="font-size:14px;color:#666;line-height:1.9">You are welcome to submit a new booking with a valid RazorGold card code. If you believe this is an error, please contact our support team.</p>
  </div>
  <div style="background:#0a0806;padding:20px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.04)">
    <p style="color:#333;font-size:12px;margin:0">CelebConnect × RazorGold · All rights reserved</p>
  </div>
</div>`,
  },
];

// ── Seed defaults ─────────────────────────────────────────────────────────────

export const seedTemplates = async (): Promise<void> => {
  for (const tmpl of DEFAULT_TEMPLATES) {
    await EmailTemplate.findOneAndUpdate(
      { key: tmpl.key },
      { $setOnInsert: tmpl },
      { upsert: true, new: true },
    );
  }
  console.log("✅ Email templates seeded");
};

// ── Template variable substitution ────────────────────────────────────────────

const fillTemplate = (html: string, vars: EmailVars): string => {
  let filled = html;
  // {{#if var}}...{{/if}}
  filled = filled.replace(
    /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, key: string, content: string) => (vars[key] ? content : ""),
  );
  // {{var}}
  for (const [k, v] of Object.entries(vars)) {
    filled = filled.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v ?? "");
  }
  return filled;
};

// ── Send ──────────────────────────────────────────────────────────────────────

export const sendBookingEmail = async (
  templateKey: EmailTemplateKey,
  toEmail: string,
  vars: EmailVars,
): Promise<EmailResult> => {
  try {
    const template = await EmailTemplate.findOne({
      key: templateKey,
      active: true,
    });

    const def = DEFAULT_TEMPLATES.find((t) => t.key === templateKey);
    const source = template ?? def;
    if (!source) return { success: false, error: "Template not found" };

    const subject = fillTemplate(source.subject, vars);
    const bodyHtml = fillTemplate(source.bodyHtml, vars);

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "CelebConnect <onboarding@resend.dev>",
      to: [toEmail],
      subject,
      html: bodyHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    console.log(
      `📧 Email sent [${templateKey}] → ${toEmail} (id: ${data?.id})`,
    );
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("sendBookingEmail failed:", (err as Error).message);
    return { success: false, error: err };
  }
};
