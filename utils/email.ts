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
<div style="font-family:'Jost',Arial,sans-serif;max-width:600px;margin:0 auto;background:#08090C;color:#EDE8DF;border-radius:4px;overflow:hidden;border:1px solid rgba(176,148,96,0.18);box-shadow:0 0 80px rgba(0,0,0,0.9)">

  <!-- HEADER -->
  <div style="position:relative;background:linear-gradient(160deg,#0D0E14 0%,#0A0B10 60%,#0C0D11 100%);padding:52px 48px 40px;text-align:center;border-bottom:1px solid rgba(176,148,96,0.12);overflow:hidden">
    <div style="position:absolute;top:20px;left:20px;width:28px;height:28px;border-top:1px solid rgba(176,148,96,0.5);border-left:1px solid rgba(176,148,96,0.5)"></div>
    <div style="position:absolute;top:20px;right:20px;width:28px;height:28px;border-top:1px solid rgba(176,148,96,0.5);border-right:1px solid rgba(176,148,96,0.5)"></div>
    <div style="position:absolute;bottom:20px;left:20px;width:28px;height:28px;border-bottom:1px solid rgba(176,148,96,0.5);border-left:1px solid rgba(176,148,96,0.5)"></div>
    <div style="position:absolute;bottom:20px;right:20px;width:28px;height:28px;border-bottom:1px solid rgba(176,148,96,0.5);border-right:1px solid rgba(176,148,96,0.5)"></div>

    <p style="font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:5px;color:rgba(176,148,96,0.6);margin:0 0 32px;text-transform:uppercase">CelebConnect</p>

    <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(224,164,74,0.08);border:1px solid rgba(224,164,74,0.25);border-radius:2px;padding:6px 18px;margin-bottom:24px">
      <div style="width:6px;height:6px;background:#E0A44A;border-radius:50%;box-shadow:0 0 10px rgba(224,164,74,0.8);display:inline-block"></div>
      <span style="font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:3px;color:#E0A44A;text-transform:uppercase">Under Review</span>
    </div>

    <h1 style="font-family:Georgia,serif;font-size:38px;font-weight:300;font-style:italic;color:#EDE8DF;margin:0 0 10px;line-height:1.2">Booking Received</h1>
    <p style="font-size:11px;font-weight:300;letter-spacing:4px;color:rgba(176,148,96,0.45);margin:0;text-transform:uppercase">We have got your request</p>
  </div>

  <!-- BODY -->
  <div style="padding:44px 48px">
    <p style="font-size:15px;font-weight:300;color:rgba(237,232,223,0.65);line-height:1.9;margin:0 0 6px">Dear <strong style="color:#EDE8DF;font-weight:500">{{fanName}}</strong>,</p>
    <p style="font-size:14px;font-weight:300;color:rgba(237,232,223,0.45);line-height:1.9;margin:0 0 36px">Your <strong style="color:#B09460;font-weight:400">{{bookingType}}</strong> request for <strong style="color:#B09460;font-weight:400">{{celebName}}</strong> has been received and is currently under review. A summary of your submission is below.</p>

    <!-- Divider -->
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:28px">
      <div style="flex:1;height:1px;background:linear-gradient(to right,transparent,rgba(176,148,96,0.2))"></div>
      <div style="width:4px;height:4px;background:rgba(176,148,96,0.35);transform:rotate(45deg)"></div>
      <div style="flex:1;height:1px;background:linear-gradient(to left,transparent,rgba(176,148,96,0.2))"></div>
    </div>

    <!-- Details Card -->
    <div style="border:1px solid rgba(176,148,96,0.15);border-radius:3px;overflow:hidden;margin-bottom:28px">
      <div style="background:rgba(176,148,96,0.05);padding:13px 24px;border-bottom:1px solid rgba(176,148,96,0.1)">
        <p style="font-family:'DM Mono',monospace,monospace;font-size:9px;letter-spacing:4px;color:rgba(176,148,96,0.5);margin:0;text-transform:uppercase">Booking Summary</p>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:16px 24px;color:rgba(237,232,223,0.28);font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;width:44%">Reference</td>
          <td style="padding:16px 24px;color:#B09460;font-family:'DM Mono',monospace,monospace;font-size:13px;text-align:right">{{refCode}}</td>
        </tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.04)">
          <td style="padding:16px 24px;color:rgba(237,232,223,0.28);font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase">Celebrity</td>
          <td style="padding:16px 24px;color:#EDE8DF;font-size:14px;text-align:right">{{celebName}}</td>
        </tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.04)">
          <td style="padding:16px 24px;color:rgba(237,232,223,0.28);font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase">Booking Type</td>
          <td style="padding:16px 24px;color:#EDE8DF;font-size:14px;text-align:right;text-transform:capitalize">{{bookingType}}</td>
        </tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.04)">
          <td style="padding:16px 24px;color:rgba(237,232,223,0.28);font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase">Amount</td>
          <td style="padding:16px 24px;color:#B09460;font-family:'DM Mono',monospace,monospace;font-size:14px;text-align:right">${"$"}{{amount}}</td>
        </tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.04);background:rgba(224,164,74,0.02)">
          <td style="padding:16px 24px;color:rgba(237,232,223,0.28);font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase">Status</td>
          <td style="padding:16px 24px;text-align:right">
            <span style="display:inline-flex;align-items:center;gap:6px;color:#E0A44A;background:rgba(224,164,74,0.08);border:1px solid rgba(224,164,74,0.22);padding:4px 14px;border-radius:2px;font-family:'DM Mono',monospace,monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase">
              <span style="width:5px;height:5px;background:#E0A44A;border-radius:50%;display:inline-block;box-shadow:0 0 6px rgba(224,164,74,0.8)"></span>
              Payment Pending
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Divider -->
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:28px">
      <div style="flex:1;height:1px;background:linear-gradient(to right,transparent,rgba(176,148,96,0.2))"></div>
      <div style="width:4px;height:4px;background:rgba(176,148,96,0.35);transform:rotate(45deg)"></div>
      <div style="flex:1;height:1px;background:linear-gradient(to left,transparent,rgba(176,148,96,0.2))"></div>
    </div>

    <p style="font-size:13px;font-weight:300;color:rgba(237,232,223,0.32);line-height:1.9;margin:0 0 6px">Our team will review your RazorGold card code and update your booking status shortly.</p>
    <p style="font-size:13px;font-weight:300;color:rgba(237,232,223,0.32);line-height:1.9;margin:0">You will receive another email once your booking has been approved or declined.</p>
  </div>

  <!-- FOOTER -->
  <div style="background:#06070A;padding:22px 48px;text-align:center;border-top:1px solid rgba(176,148,96,0.1)">
    <p style="font-family:'DM Mono',monospace,monospace;font-size:9px;letter-spacing:3px;color:rgba(237,232,223,0.18);margin:0;text-transform:uppercase">CelebConnect &times; RazorGold &nbsp;&middot;&nbsp; All rights reserved</p>
  </div>

</div>`,
  },
  {
    key: "booking_approved",
    subject: "🎉 Booking Approved — {{celebName}} {{bookingType}}",
    bodyHtml: `
  <div style="font-family:'Jost',Arial,sans-serif;max-width:600px;margin:0 auto;background:#08090C;color:#EDE8DF;border-radius:4px;overflow:hidden;border:1px solid rgba(176,148,96,0.18);box-shadow:0 0 80px rgba(0,0,0,0.9)">

    <!-- HEADER -->
    <div style="position:relative;background:linear-gradient(160deg,#0D0E14 0%,#0A0B10 60%,#0C0D11 100%);padding:52px 48px 40px;text-align:center;border-bottom:1px solid rgba(176,148,96,0.12);overflow:hidden">
      <div style="position:absolute;top:20px;left:20px;width:28px;height:28px;border-top:1px solid rgba(176,148,96,0.5);border-left:1px solid rgba(176,148,96,0.5)"></div>
      <div style="position:absolute;top:20px;right:20px;width:28px;height:28px;border-top:1px solid rgba(176,148,96,0.5);border-right:1px solid rgba(176,148,96,0.5)"></div>
      <div style="position:absolute;bottom:20px;left:20px;width:28px;height:28px;border-bottom:1px solid rgba(176,148,96,0.5);border-left:1px solid rgba(176,148,96,0.5)"></div>
      <div style="position:absolute;bottom:20px;right:20px;width:28px;height:28px;border-bottom:1px solid rgba(176,148,96,0.5);border-right:1px solid rgba(176,148,96,0.5)"></div>

      <p style="font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:5px;color:rgba(176,148,96,0.6);margin:0 0 32px;text-transform:uppercase">CelebConnect</p>

      <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(94,185,104,0.08);border:1px solid rgba(94,185,104,0.25);border-radius:2px;padding:6px 18px;margin-bottom:24px">
        <div style="width:6px;height:6px;background:#5EB968;border-radius:50%;box-shadow:0 0 10px rgba(94,185,104,0.8);display:inline-block"></div>
        <span style="font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:3px;color:#5EB968;text-transform:uppercase">Approved</span>
      </div>

      <h1 style="font-family:Georgia,serif;font-size:38px;font-weight:300;font-style:italic;color:#EDE8DF;margin:0 0 10px;line-height:1.2">Booking Confirmed</h1>
      <p style="font-size:11px;font-weight:300;letter-spacing:4px;color:rgba(176,148,96,0.45);margin:0;text-transform:uppercase">Your experience awaits</p>
    </div>

    <!-- BODY -->
    <div style="padding:44px 48px">
      <p style="font-size:15px;font-weight:300;color:rgba(237,232,223,0.65);line-height:1.9;margin:0 0 6px">Dear <strong style="color:#EDE8DF;font-weight:500">{{fanName}}</strong>,</p>
      <p style="font-size:14px;font-weight:300;color:rgba(237,232,223,0.45);line-height:1.9;margin:0 0 36px">Your <strong style="color:#B09460;font-weight:400">{{bookingType}}</strong> with <strong style="color:#B09460;font-weight:400">{{celebName}}</strong> has been reviewed and officially approved. All details are confirmed below.</p>

      <!-- Divider -->
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:28px">
        <div style="flex:1;height:1px;background:linear-gradient(to right,transparent,rgba(176,148,96,0.2))"></div>
        <div style="width:4px;height:4px;background:rgba(176,148,96,0.35);transform:rotate(45deg)"></div>
        <div style="flex:1;height:1px;background:linear-gradient(to left,transparent,rgba(176,148,96,0.2))"></div>
      </div>

      <!-- Details Card -->
      <div style="border:1px solid rgba(176,148,96,0.15);border-radius:3px;overflow:hidden;margin-bottom:28px">
        <div style="background:rgba(176,148,96,0.05);padding:13px 24px;border-bottom:1px solid rgba(176,148,96,0.1)">
          <p style="font-family:'DM Mono',monospace,monospace;font-size:9px;letter-spacing:4px;color:rgba(176,148,96,0.5);margin:0;text-transform:uppercase">Booking Details</p>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:16px 24px;color:rgba(237,232,223,0.28);font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;width:44%">Reference</td>
            <td style="padding:16px 24px;color:#B09460;font-family:'DM Mono',monospace,monospace;font-size:13px;text-align:right">{{refCode}}</td>
          </tr>
          <tr style="border-top:1px solid rgba(255,255,255,0.04)">
            <td style="padding:16px 24px;color:rgba(237,232,223,0.28);font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase">Celebrity</td>
            <td style="padding:16px 24px;color:#EDE8DF;font-size:14px;text-align:right">{{celebName}}</td>
          </tr>
          <tr style="border-top:1px solid rgba(255,255,255,0.04)">
            <td style="padding:16px 24px;color:rgba(237,232,223,0.28);font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase">Booking Type</td>
            <td style="padding:16px 24px;color:#EDE8DF;font-size:14px;text-align:right;text-transform:capitalize">{{bookingType}}</td>
          </tr>
          {{#if scheduledDate}}
          <tr style="border-top:1px solid rgba(255,255,255,0.04)">
            <td style="padding:16px 24px;color:rgba(237,232,223,0.28);font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase">Scheduled Date</td>
            <td style="padding:16px 24px;color:#7EC47A;font-size:14px;text-align:right">{{scheduledDate}}</td>
          </tr>
          {{/if}}
          {{#if location}}
          <tr style="border-top:1px solid rgba(255,255,255,0.04)">
            <td style="padding:16px 24px;color:rgba(237,232,223,0.28);font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase">Location</td>
            <td style="padding:16px 24px;color:#EDE8DF;font-size:14px;text-align:right">{{location}}</td>
          </tr>
          {{/if}}
          <tr style="border-top:1px solid rgba(255,255,255,0.04);background:rgba(94,185,104,0.02)">
            <td style="padding:16px 24px;color:rgba(237,232,223,0.28);font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase">Status</td>
            <td style="padding:16px 24px;text-align:right">
              <span style="display:inline-flex;align-items:center;gap:6px;color:#5EB968;background:rgba(94,185,104,0.08);border:1px solid rgba(94,185,104,0.22);padding:4px 14px;border-radius:2px;font-family:'DM Mono',monospace,monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase">
                <span style="width:5px;height:5px;background:#5EB968;border-radius:50%;display:inline-block;box-shadow:0 0 6px rgba(94,185,104,0.8)"></span>
                Approved
              </span>
            </td>
          </tr>
        </table>
      </div>

      {{#if adminNote}}
      <!-- Admin Note -->
      <div style="background:rgba(176,148,96,0.04);border:1px solid rgba(176,148,96,0.14);border-radius:3px;padding:20px 24px;margin-bottom:32px">
        <p style="font-family:'DM Mono',monospace,monospace;font-size:9px;letter-spacing:3px;color:rgba(176,148,96,0.5);text-transform:uppercase;margin:0 0 10px">Note from CelebConnect</p>
        <p style="color:rgba(237,232,223,0.55);font-size:14px;font-weight:300;margin:0;line-height:1.8">{{adminNote}}</p>
      </div>
      {{/if}}

      <!-- Divider -->
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:28px">
        <div style="flex:1;height:1px;background:linear-gradient(to right,transparent,rgba(176,148,96,0.2))"></div>
        <div style="width:4px;height:4px;background:rgba(176,148,96,0.35);transform:rotate(45deg)"></div>
        <div style="flex:1;height:1px;background:linear-gradient(to left,transparent,rgba(176,148,96,0.2))"></div>
      </div>

      <p style="font-size:13px;font-weight:300;color:rgba(237,232,223,0.32);line-height:1.9;margin:0 0 6px">Further details and joining instructions will be sent to you closer to your booking date. Please keep this confirmation for your records.</p>
      <p style="font-size:13px;font-weight:300;color:rgba(237,232,223,0.32);line-height:1.9;margin:0">Should you have any questions, our support team is available to assist you.</p>
    </div>

    <!-- FOOTER -->
    <div style="background:#06070A;padding:22px 48px;text-align:center;border-top:1px solid rgba(176,148,96,0.1)">
      <p style="font-family:'DM Mono',monospace,monospace;font-size:9px;letter-spacing:3px;color:rgba(237,232,223,0.18);margin:0;text-transform:uppercase">CelebConnect &times; RazorGold &nbsp;&middot;&nbsp; All rights reserved</p>
    </div>

  </div>`,
  },
  {
    key: "booking_failed",
    subject: "Booking Update — {{celebName}} {{bookingType}}",
    bodyHtml: `
    <div style="font-family:'Jost',Arial,sans-serif;max-width:600px;margin:0 auto;background:#08090C;color:#EDE8DF;border-radius:4px;overflow:hidden;border:1px solid rgba(224,107,107,0.18);box-shadow:0 0 80px rgba(0,0,0,0.9)">

      <!-- HEADER -->
      <div style="position:relative;background:linear-gradient(160deg,#130E0E 0%,#0F0A0A 60%,#110B0B 100%);padding:52px 48px 40px;text-align:center;border-bottom:1px solid rgba(224,107,107,0.1);overflow:hidden">
        <div style="position:absolute;top:20px;left:20px;width:28px;height:28px;border-top:1px solid rgba(224,107,107,0.4);border-left:1px solid rgba(224,107,107,0.4)"></div>
        <div style="position:absolute;top:20px;right:20px;width:28px;height:28px;border-top:1px solid rgba(224,107,107,0.4);border-right:1px solid rgba(224,107,107,0.4)"></div>
        <div style="position:absolute;bottom:20px;left:20px;width:28px;height:28px;border-bottom:1px solid rgba(224,107,107,0.4);border-left:1px solid rgba(224,107,107,0.4)"></div>
        <div style="position:absolute;bottom:20px;right:20px;width:28px;height:28px;border-bottom:1px solid rgba(224,107,107,0.4);border-right:1px solid rgba(224,107,107,0.4)"></div>

        <p style="font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:5px;color:rgba(176,148,96,0.6);margin:0 0 32px;text-transform:uppercase">CelebConnect</p>

        <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(224,107,107,0.08);border:1px solid rgba(224,107,107,0.25);border-radius:2px;padding:6px 18px;margin-bottom:24px">
          <div style="width:6px;height:6px;background:#E06B6B;border-radius:50%;box-shadow:0 0 10px rgba(224,107,107,0.8);display:inline-block"></div>
          <span style="font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:3px;color:#E06B6B;text-transform:uppercase">Declined</span>
        </div>

        <h1 style="font-family:Georgia,serif;font-size:38px;font-weight:300;font-style:italic;color:#EDE8DF;margin:0 0 10px;line-height:1.2">Booking Declined</h1>
        <p style="font-size:11px;font-weight:300;letter-spacing:4px;color:rgba(224,107,107,0.4);margin:0;text-transform:uppercase">We could not process your request</p>
      </div>

      <!-- BODY -->
      <div style="padding:44px 48px">
        <p style="font-size:15px;font-weight:300;color:rgba(237,232,223,0.65);line-height:1.9;margin:0 0 6px">Dear <strong style="color:#EDE8DF;font-weight:500">{{fanName}}</strong>,</p>
        <p style="font-size:14px;font-weight:300;color:rgba(237,232,223,0.45);line-height:1.9;margin:0 0 36px">Unfortunately, your <strong style="color:#B09460;font-weight:400">{{bookingType}}</strong> request for <strong style="color:#B09460;font-weight:400">{{celebName}}</strong> could not be processed. Please review the details below.</p>

        <!-- Divider -->
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:28px">
          <div style="flex:1;height:1px;background:linear-gradient(to right,transparent,rgba(224,107,107,0.15))"></div>
          <div style="width:4px;height:4px;background:rgba(224,107,107,0.3);transform:rotate(45deg)"></div>
          <div style="flex:1;height:1px;background:linear-gradient(to left,transparent,rgba(224,107,107,0.15))"></div>
        </div>

        <!-- Details Card -->
        <div style="border:1px solid rgba(224,107,107,0.12);border-radius:3px;overflow:hidden;margin-bottom:28px">
          <div style="background:rgba(224,107,107,0.04);padding:13px 24px;border-bottom:1px solid rgba(224,107,107,0.08)">
            <p style="font-family:'DM Mono',monospace,monospace;font-size:9px;letter-spacing:4px;color:rgba(224,107,107,0.4);margin:0;text-transform:uppercase">Booking Details</p>
          </div>
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:16px 24px;color:rgba(237,232,223,0.28);font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;width:44%">Reference</td>
              <td style="padding:16px 24px;color:#B09460;font-family:'DM Mono',monospace,monospace;font-size:13px;text-align:right">{{refCode}}</td>
            </tr>
            <tr style="border-top:1px solid rgba(255,255,255,0.04)">
              <td style="padding:16px 24px;color:rgba(237,232,223,0.28);font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase">Celebrity</td>
              <td style="padding:16px 24px;color:#EDE8DF;font-size:14px;text-align:right">{{celebName}}</td>
            </tr>
            <tr style="border-top:1px solid rgba(255,255,255,0.04)">
              <td style="padding:16px 24px;color:rgba(237,232,223,0.28);font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase">Booking Type</td>
              <td style="padding:16px 24px;color:#EDE8DF;font-size:14px;text-align:right;text-transform:capitalize">{{bookingType}}</td>
            </tr>
            <tr style="border-top:1px solid rgba(255,255,255,0.04);background:rgba(224,107,107,0.02)">
              <td style="padding:16px 24px;color:rgba(237,232,223,0.28);font-family:'DM Mono',monospace,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase">Status</td>
              <td style="padding:16px 24px;text-align:right">
                <span style="display:inline-flex;align-items:center;gap:6px;color:#E06B6B;background:rgba(224,107,107,0.08);border:1px solid rgba(224,107,107,0.22);padding:4px 14px;border-radius:2px;font-family:'DM Mono',monospace,monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase">
                  <span style="width:5px;height:5px;background:#E06B6B;border-radius:50%;display:inline-block;box-shadow:0 0 6px rgba(224,107,107,0.8)"></span>
                  Failed
                </span>
              </td>
            </tr>
          </table>
        </div>

        {{#if adminNote}}
        <!-- Reason Note -->
        <div style="background:rgba(224,107,107,0.04);border:1px solid rgba(224,107,107,0.14);border-radius:3px;padding:20px 24px;margin-bottom:32px">
          <p style="font-family:'DM Mono',monospace,monospace;font-size:9px;letter-spacing:3px;color:rgba(224,107,107,0.5);text-transform:uppercase;margin:0 0 10px">Reason for Decline</p>
          <p style="color:rgba(237,232,223,0.55);font-size:14px;font-weight:300;margin:0;line-height:1.8">{{adminNote}}</p>
        </div>
        {{/if}}

        <!-- Divider -->
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:28px">
          <div style="flex:1;height:1px;background:linear-gradient(to right,transparent,rgba(224,107,107,0.15))"></div>
          <div style="width:4px;height:4px;background:rgba(224,107,107,0.3);transform:rotate(45deg)"></div>
          <div style="flex:1;height:1px;background:linear-gradient(to left,transparent,rgba(224,107,107,0.15))"></div>
        </div>

        <p style="font-size:13px;font-weight:300;color:rgba(237,232,223,0.32);line-height:1.9;margin:0 0 6px">You are welcome to submit a new booking with a valid RazorGold card code.</p>
        <p style="font-size:13px;font-weight:300;color:rgba(237,232,223,0.32);line-height:1.9;margin:0">If you believe this is an error, please do not hesitate to contact our support team.</p>
      </div>

      <!-- FOOTER -->
      <div style="background:#06070A;padding:22px 48px;text-align:center;border-top:1px solid rgba(224,107,107,0.08)">
        <p style="font-family:'DM Mono',monospace,monospace;font-size:9px;letter-spacing:3px;color:rgba(237,232,223,0.18);margin:0;text-transform:uppercase">CelebConnect &times; RazorGold &nbsp;&middot;&nbsp; All rights reserved</p>
      </div>

    </div>`,
  },
];

// ── Seed defaults ─────────────────────────────────────────────────────────────

export const seedTemplates = async (): Promise<void> => {
  for (const tmpl of DEFAULT_TEMPLATES) {
    await EmailTemplate.findOneAndUpdate(
      { key: tmpl.key },
      { $set: tmpl },
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
      from: process.env.EMAIL_FROM ?? "RazorGold <onboarding@resend.dev>",
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
