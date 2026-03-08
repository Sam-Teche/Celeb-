import { Resend } from "resend";
import EmailTemplate from "../models/EmailTemplate.js";
import type {
  EmailTemplateKey,
  EmailVars,
  EmailResult,
} from "../types/index.js";

const resend = new Resend(process.env["RESEND_API_KEY"]);

const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] ?? "ogunrindesam@gmail.com";

// ── Design tokens ─────────────────────────────────────────────────────────────
//  Background   #020503   near-black canvas
//  Surface      #060D08   elevated card
//  Surface-2    #0A1410   inner card
//  Green        #2ECC71   primary accent
//  Green-dim    #1A8A4A   deep green
//  Gold         #F0C060   gold highlight
//  Text-1       #FFFFFF   primary
//  Text-2       #D9F0E3   secondary
//  Text-3       #8FD4A8   muted
//  Text-4       #4A8A63   very muted
//  Amber        #F5B843   pending
//  Red          #E06B6B   failed
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared partials ───────────────────────────────────────────────────────────

const EMAIL_WRAPPER_OPEN = (accentRgb: string) => `
<div style="font-family:Georgia,'Times New Roman',serif;max-width:620px;margin:0 auto;background:#020503;color:#FFFFFF;border-radius:4px;overflow:hidden;border:1px solid rgba(${accentRgb},0.18)">`;

const EMAIL_HEADER = (
  badgeLabel: string,
  badgeColor: string,
  badgeBg: string,
  badgeGlow: string,
  title: string,
  subtitle: string,
  headerBorder: string,
) => `
  <div style="position:relative;background:linear-gradient(160deg,#060D08 0%,#040806 60%,#050A07 100%);padding:52px 48px 40px;text-align:center;border-bottom:1px solid ${headerBorder};overflow:hidden">
    <!-- Corner marks -->
    <div style="position:absolute;top:16px;left:16px;width:20px;height:20px;border-top:1px solid rgba(46,204,113,0.35);border-left:1px solid rgba(46,204,113,0.35)"></div>
    <div style="position:absolute;top:16px;right:16px;width:20px;height:20px;border-top:1px solid rgba(46,204,113,0.35);border-right:1px solid rgba(46,204,113,0.35)"></div>
    <div style="position:absolute;bottom:16px;left:16px;width:20px;height:20px;border-bottom:1px solid rgba(46,204,113,0.35);border-left:1px solid rgba(46,204,113,0.35)"></div>
    <div style="position:absolute;bottom:16px;right:16px;width:20px;height:20px;border-bottom:1px solid rgba(46,204,113,0.35);border-right:1px solid rgba(46,204,113,0.35)"></div>
    <!-- Logo -->
    <p style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:6px;color:rgba(46,204,113,0.45);margin:0 0 24px;text-transform:uppercase">CelebConnect</p>
    <!-- Badge -->
    <div style="display:inline-flex;align-items:center;gap:7px;background:${badgeBg};border:1px solid ${badgeColor};border-radius:2px;padding:5px 16px;margin-bottom:20px">
      <span style="width:5px;height:5px;background:${badgeColor};border-radius:50%;display:inline-block;box-shadow:0 0 8px ${badgeGlow}"></span>
      <span style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:3px;color:${badgeColor};text-transform:uppercase">${badgeLabel}</span>
    </div>
    <!-- Title -->
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:400;font-style:italic;color:#FFFFFF;margin:0 0 10px;line-height:1.25">${title}</h1>
    <p style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:4px;color:rgba(46,204,113,0.35);margin:0;text-transform:uppercase">${subtitle}</p>
  </div>`;

const DIVIDER = (color: string) => `
  <div style="display:flex;align-items:center;gap:12px;margin:0 0 28px">
    <div style="flex:1;height:1px;background:linear-gradient(to right,transparent,${color})"></div>
    <div style="width:4px;height:4px;background:${color};transform:rotate(45deg)"></div>
    <div style="flex:1;height:1px;background:linear-gradient(to left,transparent,${color})"></div>
  </div>`;

const DETAIL_TABLE = (rows: { label: string; value: string; valueColor?: string; isBadge?: boolean; badgeBg?: string; badgeBorder?: string }[]) => `
  <div style="border:1px solid rgba(46,204,113,0.12);border-radius:3px;overflow:hidden;margin-bottom:28px">
    <div style="background:rgba(46,204,113,0.04);padding:11px 20px;border-bottom:1px solid rgba(46,204,113,0.08)">
      <p style="font-family:'Courier New',monospace;font-size:8px;letter-spacing:4px;color:rgba(46,204,113,0.4);margin:0;text-transform:uppercase">Booking Summary</p>
    </div>
    <table style="width:100%;border-collapse:collapse;background:#060D08">
      ${rows.map((r, i) => `
      <tr style="${i > 0 ? "border-top:1px solid rgba(255,255,255,0.03)" : ""}">
        <td style="padding:14px 20px;color:rgba(217,240,227,0.3);font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;width:40%">${r.label}</td>
        <td style="padding:14px 20px;text-align:right">${
          r.isBadge
            ? `<span style="display:inline-flex;align-items:center;gap:6px;color:${r.valueColor};background:${r.badgeBg};border:1px solid ${r.badgeBorder};padding:3px 12px;border-radius:2px;font-family:'Courier New',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase">${r.value}</span>`
            : `<span style="color:${r.valueColor ?? "#FFFFFF"};font-size:13px;font-weight:300">${r.value}</span>`
        }</td>
      </tr>`).join("")}
    </table>
  </div>`;

const NOTE_BOX = (title: string, content: string, color: string, bg: string, border: string) => `
  <div style="background:${bg};border:1px solid ${border};border-radius:3px;padding:16px 20px;margin-bottom:28px">
    <p style="font-family:'Courier New',monospace;font-size:8px;letter-spacing:3px;color:${color};text-transform:uppercase;margin:0 0 8px">${title}</p>
    <p style="color:rgba(217,240,227,0.55);font-size:13px;font-weight:300;margin:0;line-height:1.85">${content}</p>
  </div>`;

const EMAIL_FOOTER = `
  <div style="background:#010302;padding:18px 48px;text-align:center;border-top:1px solid rgba(46,204,113,0.07)">
    <p style="font-family:'Courier New',monospace;font-size:8px;letter-spacing:3px;color:rgba(217,240,227,0.12);margin:0;text-transform:uppercase">CelebConnect &times; RazorGold &nbsp;&middot;&nbsp; All rights reserved</p>
  </div>`;

const EMAIL_WRAPPER_CLOSE = `</div>`;

// ── Default templates ─────────────────────────────────────────────────────────

interface DefaultTemplate {
  key: EmailTemplateKey;
  subject: string;
  bodyHtml: string;
}

const DEFAULT_TEMPLATES: DefaultTemplate[] = [
  // ── 1. Booking Submitted ──────────────────────────────────────────────────
  {
    key: "booking_submitted",
    subject: "Booking Received — {{celebName}} {{bookingType}}",
    bodyHtml:
      EMAIL_WRAPPER_OPEN("46,204,113") +
      EMAIL_HEADER(
        "Under Review",
        "#F5B843",
        "rgba(245,184,67,0.07)",
        "rgba(245,184,67,0.6)",
        "Booking Received",
        "We have your request",
        "rgba(245,184,67,0.12)",
      ) +
      `
  <div style="padding:40px 48px">
    <p style="font-size:15px;font-weight:300;color:rgba(255,255,255,0.65);line-height:1.9;margin:0 0 6px">Dear <strong style="color:#FFFFFF;font-weight:500">{{fanName}}</strong>,</p>
    <p style="font-size:13px;font-weight:300;color:rgba(217,240,227,0.38);line-height:1.9;margin:0 0 32px">Your <strong style="color:#F0C060;font-weight:400">{{bookingType}}</strong> request for <strong style="color:#F0C060;font-weight:400">{{celebName}}</strong> has been received and is now under review. A summary is provided below.</p>
    ` +
      DIVIDER("rgba(46,204,113,0.15)") +
      DETAIL_TABLE([
        { label: "Reference",    value: "{{refCode}}",     valueColor: "#F0C060" },
        { label: "Celebrity",    value: "{{celebName}}",   valueColor: "#D9F0E3" },
        { label: "Booking Type", value: "{{bookingType}}", valueColor: "#D9F0E3" },
        { label: "Amount",       value: "{{amount}}",      valueColor: "#F0C060" },
        {
          label: "Status", value: "⏳ Payment Pending",
          valueColor: "#F5B843", isBadge: true,
          badgeBg: "rgba(245,184,67,0.07)", badgeBorder: "rgba(245,184,67,0.25)",
        },
      ]) +
      DIVIDER("rgba(46,204,113,0.1)") +
      `
    <p style="font-size:13px;font-weight:300;color:rgba(217,240,227,0.28);line-height:1.9;margin:0 0 6px">Our team will verify your RazorGold card code and update your booking status shortly.</p>
    <p style="font-size:13px;font-weight:300;color:rgba(217,240,227,0.28);line-height:1.9;margin:0">You will receive a follow-up email once approved or declined.</p>
  </div>` +
      EMAIL_FOOTER +
      EMAIL_WRAPPER_CLOSE,
  },

  // ── 2. Booking Approved ───────────────────────────────────────────────────
  {
    key: "booking_approved",
    subject: "🎉 Booking Approved — {{celebName}} {{bookingType}}",
    bodyHtml:
      EMAIL_WRAPPER_OPEN("46,204,113") +
      EMAIL_HEADER(
        "Approved",
        "#2ECC71",
        "rgba(46,204,113,0.07)",
        "rgba(46,204,113,0.65)",
        "Booking Confirmed",
        "Your experience awaits",
        "rgba(46,204,113,0.12)",
      ) +
      `
  <div style="padding:40px 48px">
    <p style="font-size:15px;font-weight:300;color:rgba(255,255,255,0.65);line-height:1.9;margin:0 0 6px">Dear <strong style="color:#FFFFFF;font-weight:500">{{fanName}}</strong>,</p>
    <p style="font-size:13px;font-weight:300;color:rgba(217,240,227,0.38);line-height:1.9;margin:0 0 32px">Your <strong style="color:#F0C060;font-weight:400">{{bookingType}}</strong> with <strong style="color:#F0C060;font-weight:400">{{celebName}}</strong> has been reviewed and officially confirmed. All details are below.</p>
    ` +
      DIVIDER("rgba(46,204,113,0.15)") +
      DETAIL_TABLE([
        { label: "Reference",    value: "{{refCode}}",      valueColor: "#F0C060" },
        { label: "Celebrity",    value: "{{celebName}}",    valueColor: "#D9F0E3" },
        { label: "Booking Type", value: "{{bookingType}}",  valueColor: "#D9F0E3" },
        { label: "Amount",       value: "{{amount}}",       valueColor: "#F0C060" },
        { label: "Date",         value: "{{scheduledDate}}", valueColor: "#8FD4A8" },
        { label: "Location",     value: "{{location}}",     valueColor: "#D9F0E3" },
        {
          label: "Status", value: "✓ Approved",
          valueColor: "#2ECC71", isBadge: true,
          badgeBg: "rgba(46,204,113,0.07)", badgeBorder: "rgba(46,204,113,0.25)",
        },
      ]) +
      `{{#if adminNote}}` +
      NOTE_BOX("Note from CelebConnect", "{{adminNote}}", "rgba(46,204,113,0.5)", "rgba(46,204,113,0.04)", "rgba(46,204,113,0.15)") +
      `{{/if}}` +
      DIVIDER("rgba(46,204,113,0.1)") +
      `
    <p style="font-size:13px;font-weight:300;color:rgba(217,240,227,0.28);line-height:1.9;margin:0 0 6px">Further details and joining instructions will be sent closer to your booking date.</p>
    <p style="font-size:13px;font-weight:300;color:rgba(217,240,227,0.28);line-height:1.9;margin:0">Please retain this confirmation for your records.</p>
  </div>` +
      EMAIL_FOOTER +
      EMAIL_WRAPPER_CLOSE,
  },

  // ── 3. Booking Failed ─────────────────────────────────────────────────────
  {
    key: "booking_failed",
    subject: "Booking Update — {{celebName}} {{bookingType}}",
    bodyHtml:
      EMAIL_WRAPPER_OPEN("224,107,107") +
      EMAIL_HEADER(
        "Declined",
        "#E06B6B",
        "rgba(224,107,107,0.07)",
        "rgba(224,107,107,0.6)",
        "Booking Declined",
        "We could not process your request",
        "rgba(224,107,107,0.12)",
      ) +
      `
  <div style="padding:40px 48px">
    <p style="font-size:15px;font-weight:300;color:rgba(255,255,255,0.65);line-height:1.9;margin:0 0 6px">Dear <strong style="color:#FFFFFF;font-weight:500">{{fanName}}</strong>,</p>
    <p style="font-size:13px;font-weight:300;color:rgba(217,240,227,0.38);line-height:1.9;margin:0 0 32px">We regret to inform you that your <strong style="color:#F0C060;font-weight:400">{{bookingType}}</strong> request for <strong style="color:#F0C060;font-weight:400">{{celebName}}</strong> could not be processed at this time.</p>
    ` +
      DIVIDER("rgba(224,107,107,0.15)") +
      DETAIL_TABLE([
        { label: "Reference",    value: "{{refCode}}",     valueColor: "#F0C060" },
        { label: "Celebrity",    value: "{{celebName}}",   valueColor: "#D9F0E3" },
        { label: "Booking Type", value: "{{bookingType}}", valueColor: "#D9F0E3" },
        {
          label: "Status", value: "✕ Declined",
          valueColor: "#E06B6B", isBadge: true,
          badgeBg: "rgba(224,107,107,0.07)", badgeBorder: "rgba(224,107,107,0.25)",
        },
      ]) +
      `{{#if adminNote}}` +
      NOTE_BOX("Reason for Decline", "{{adminNote}}", "rgba(224,107,107,0.5)", "rgba(224,107,107,0.04)", "rgba(224,107,107,0.15)") +
      `{{/if}}` +
      DIVIDER("rgba(224,107,107,0.1)") +
      `
    <p style="font-size:13px;font-weight:300;color:rgba(217,240,227,0.28);line-height:1.9;margin:0 0 6px">You are welcome to submit a new booking using a valid RazorGold card code.</p>
    <p style="font-size:13px;font-weight:300;color:rgba(217,240,227,0.28);line-height:1.9;margin:0">If you believe this is an error, please contact our support team.</p>
  </div>` +
      EMAIL_FOOTER +
      EMAIL_WRAPPER_CLOSE,
  },
];

// ── Admin notification template (not stored in DB — built inline) ─────────────

const buildAdminNotificationHtml = (vars: EmailVars): string =>
  EMAIL_WRAPPER_OPEN("240,192,96") +
  EMAIL_HEADER(
    "New Booking",
    "#F0C060",
    "rgba(240,192,96,0.07)",
    "rgba(240,192,96,0.6)",
    "New Booking Received",
    "Action may be required",
    "rgba(240,192,96,0.12)",
  ) +
  `
  <div style="padding:40px 48px">
    <p style="font-size:13px;font-weight:300;color:rgba(217,240,227,0.38);line-height:1.9;margin:0 0 32px">A new booking has been submitted on CelebConnect and is awaiting your review.</p>
    ` +
  DIVIDER("rgba(240,192,96,0.15)") +
  `
    <div style="border:1px solid rgba(240,192,96,0.12);border-radius:3px;overflow:hidden;margin-bottom:28px">
      <div style="background:rgba(240,192,96,0.04);padding:11px 20px;border-bottom:1px solid rgba(240,192,96,0.08)">
        <p style="font-family:'Courier New',monospace;font-size:8px;letter-spacing:4px;color:rgba(240,192,96,0.4);margin:0;text-transform:uppercase">Booking Details</p>
      </div>
      <table style="width:100%;border-collapse:collapse;background:#060D08">
        <tr>
          <td style="padding:14px 20px;color:rgba(217,240,227,0.3);font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;width:40%">Reference</td>
          <td style="padding:14px 20px;text-align:right;color:#F0C060;font-family:'Courier New',monospace;font-size:13px">${vars.refCode ?? ""}</td>
        </tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.03)">
          <td style="padding:14px 20px;color:rgba(217,240,227,0.3);font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase">Fan</td>
          <td style="padding:14px 20px;text-align:right;color:#FFFFFF;font-size:13px;font-weight:300">${vars.fanName ?? ""}</td>
        </tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.03)">
          <td style="padding:14px 20px;color:rgba(217,240,227,0.3);font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase">Fan Email</td>
          <td style="padding:14px 20px;text-align:right;color:#D9F0E3;font-size:13px;font-weight:300">${vars['fanEmail'] ?? ""}</td>
        </tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.03)">
          <td style="padding:14px 20px;color:rgba(217,240,227,0.3);font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase">Celebrity</td>
          <td style="padding:14px 20px;text-align:right;color:#D9F0E3;font-size:13px;font-weight:300">${vars.celebName ?? ""}</td>
        </tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.03)">
          <td style="padding:14px 20px;color:rgba(217,240,227,0.3);font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase">Booking Type</td>
          <td style="padding:14px 20px;text-align:right;color:#D9F0E3;font-size:13px;font-weight:300">${vars.bookingType ?? ""}</td>
        </tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.03)">
          <td style="padding:14px 20px;color:rgba(217,240,227,0.3);font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase">RazorGold Code</td>
          <td style="padding:14px 20px;text-align:right;color:#F0C060;font-family:'Courier New',monospace;font-size:13px">${vars['razorGoldCode'] ?? ""}</td>
        </tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.03)">
          <td style="padding:14px 20px;color:rgba(217,240,227,0.3);font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase">Amount</td>
          <td style="padding:14px 20px;text-align:right;color:#F0C060;font-size:13px;font-weight:300">${vars.amount ?? ""}</td>
        </tr>
        ${vars['scheduledDate'] ? `
        <tr style="border-top:1px solid rgba(255,255,255,0.03)">
          <td style="padding:14px 20px;color:rgba(217,240,227,0.3);font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase">Scheduled Date</td>
          <td style="padding:14px 20px;text-align:right;color:#8FD4A8;font-size:13px;font-weight:300">${vars['scheduledDate']}</td>
        </tr>` : ""}
        ${vars['location'] ? `
        <tr style="border-top:1px solid rgba(255,255,255,0.03)">
          <td style="padding:14px 20px;color:rgba(217,240,227,0.3);font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase">Location</td>
          <td style="padding:14px 20px;text-align:right;color:#D9F0E3;font-size:13px;font-weight:300">${vars['location']}</td>
        </tr>` : ""}
        <tr style="border-top:1px solid rgba(255,255,255,0.03);background:rgba(245,184,67,0.02)">
          <td style="padding:14px 20px;color:rgba(217,240,227,0.3);font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase">Status</td>
          <td style="padding:14px 20px;text-align:right">
            <span style="display:inline-flex;align-items:center;gap:6px;color:#F5B843;background:rgba(245,184,67,0.07);border:1px solid rgba(245,184,67,0.25);padding:3px 12px;border-radius:2px;font-family:'Courier New',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase">⏳ Awaiting Review</span>
          </td>
        </tr>
      </table>
    </div>
  </div>` +
  EMAIL_FOOTER +
  EMAIL_WRAPPER_CLOSE;

// ── Seed defaults ─────────────────────────────────────────────────────────────

export const seedTemplates = async (): Promise<void> => {
  for (const tmpl of DEFAULT_TEMPLATES) {
    await EmailTemplate.findOneAndUpdate(
      { key: tmpl.key },
      { $set: { subject: tmpl.subject, bodyHtml: tmpl.bodyHtml, active: true } },
      { upsert: true, new: true },
    );
  }
  console.log("✅ Email templates seeded");
};

// ── Template variable substitution ────────────────────────────────────────────

const fillTemplate = (html: string, vars: EmailVars): string => {
  let filled = html;
  filled = filled.replace(
    /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, key: string, content: string) => (vars[key] ? content : ""),
  );
  for (const [k, v] of Object.entries(vars)) {
    filled = filled.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v ?? "");
  }
  return filled;
};

// ── Send fan email ────────────────────────────────────────────────────────────

export const sendBookingEmail = async (
  templateKey: EmailTemplateKey,
  toEmail: string,
  vars: EmailVars,
): Promise<EmailResult> => {
  try {
    const template = await EmailTemplate.findOne({ key: templateKey, active: true });
    const def = DEFAULT_TEMPLATES.find((t) => t.key === templateKey);
    const source = template ?? def;
    if (!source) return { success: false, error: "Template not found" };

    const subject = fillTemplate(source.subject, vars);
    const bodyHtml = fillTemplate(source.bodyHtml, vars);

    const { data, error } = await resend.emails.send({
      from: process.env["EMAIL_FROM"] ?? "CelebConnect <onboarding@resend.dev>",
      to: [toEmail],
      subject,
      html: bodyHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    console.log(`📧 Email sent [${templateKey}] → ${toEmail} (id: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("sendBookingEmail failed:", (err as Error).message);
    return { success: false, error: err };
  }
};

// ── Send admin notification ───────────────────────────────────────────────────

export const sendAdminBookingNotification = async (vars: EmailVars): Promise<void> => {
  try {
    const { error } = await resend.emails.send({
      from: process.env["EMAIL_FROM"] ?? "CelebConnect <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject: `🔔 New Booking — ${vars.celebName ?? ""} (${vars.bookingType ?? ""}) · ${vars.refCode ?? ""}`,
      html: buildAdminNotificationHtml(vars),
    });

    if (error) {
      console.error("Admin notification error:", error);
    } else {
      console.log(`🔔 Admin notified → ${ADMIN_EMAIL}`);
    }
  } catch (err) {
    console.error("sendAdminBookingNotification failed:", (err as Error).message);
  }
};
