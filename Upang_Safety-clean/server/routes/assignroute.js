// backend/routes/assignRoute.js
const express = require("express");
const router = express.Router();
const Incident = require("../model/IncidentModel");
const sendEmail = require("../utils/sendEmail");

// POST /assign/assign
router.post("/assign", async (req, res) => {
  try {
    const { reportIds, assignedTo } = req.body;

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({ message: "No report IDs provided." });
    }

    if (!assignedTo || typeof assignedTo !== "string") {
      return res.status(400).json({ message: "No assigned staff/team specified." });
    }

    console.log(`📩 Assigning ${reportIds.length} report(s) to ${assignedTo}`);

    // Fetch and update all selected reports
    const reports = await Incident.find({ _id: { $in: reportIds } });

    if (!reports || reports.length === 0) {
      return res.status(404).json({ message: "Reports not found." });
    }

    for (const report of reports) {
      report.assignedTo = assignedTo;
      report.status = "On Process";
      await report.save();
    }

    // Build styled email HTML with alternating row colors
    const emailSubject = `New Report${reports.length > 1 ? "s" : ""} Assigned to ${assignedTo}`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px 0;">
        <div style="max-width:700px; margin:0 auto; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <div style="background-color:#16a34a; color:#fff; text-align:center; padding:25px 20px;">
            <h1 style="margin:0; font-size:24px;">PHINMA Safety & Report System</h1>
            <p style="margin:5px 0 0; font-size:14px;">Report Assignment Notification</p>
          </div>

          <div style="padding:30px 40px; color:#333; line-height:1.6; font-size:15px;">
            <p>Hello <strong>${assignedTo}</strong> Team,</p>
            <p>${reports.length} new report${reports.length > 1 ? "s have" : " has"} been assigned to your team. Please review the details below:</p>

            <table style="width:100%; border-collapse:collapse; margin-top:20px; font-size:14px;">
              <thead>
                <tr style="background-color:#14532d; color:#fff; text-align:left;">
                  <th style="padding:10px; border-bottom:2px solid #e0e0e0;">Title</th>
                  <th style="padding:10px; border-bottom:2px solid #e0e0e0;">Description</th>
                  <th style="padding:10px; border-bottom:2px solid #e0e0e0;">Location</th>
                  <th style="padding:10px; border-bottom:2px solid #e0e0e0;">Date Reported</th>
                  <th style="padding:10px; border-bottom:2px solid #e0e0e0;">Priority Level</th>
                  <th style="padding:10px; border-bottom:2px solid #e0e0e0;">Assigned To</th>
                </tr>
              </thead>
              <tbody>
                ${reports
                  .map((r, i) => {
                    const bg = i % 2 === 0 ? "#ffffff" : "#f3f7f3"; // alternating rows matching theme
                    const title = (r.title && typeof r.title === "string") ? r.title : "N/A";
                    const desc = (r.description && typeof r.description === "string") ? r.description : "N/A";
                    const loc = r.location || "Unknown";
                    const date = new Date(r.date || r.createdAt).toLocaleDateString();
                    const prio = r.priority || "N/A";
                    const assigned = assignedTo;
                    return `
                      <tr style="background:${bg};">
                        <td style="padding:10px; vertical-align:top;">${escapeHtml(title)}</td>
                        <td style="padding:10px; vertical-align:top;">${escapeHtml(desc)}</td>
                        <td style="padding:10px; vertical-align:top;">${escapeHtml(loc)}</td>
                        <td style="padding:10px; vertical-align:top;">${escapeHtml(date)}</td>
                        <td style="padding:10px; vertical-align:top;">${escapeHtml(prio)}</td>
                        <td style="padding:10px; vertical-align:top;">${escapeHtml(assigned)}</td>
                      </tr>
                    `;
                  })
                  .join("")}
              </tbody>
            </table>

            <p style="margin-top:20px;">Please report back to the admin after completing the assigned task or if any issues arise.</p>
            <p>Thank you for your continued support and commitment to safety.</p>
          </div>

          <div style="background-color:#f0f2f5; text-align:center; padding:20px; font-size:13px; color:#888;">
            &copy; ${new Date().getFullYear()} PHINMA University | Safety & Report System
          </div>
        </div>
      </div>
    `;

    // Determine recipient email mapping (add real emails here)
    const staffEmails = {
      JSD: "sham.figueroa.up@phinmaed.com",
      ITS: "its.team@phinmaed.com",
      Iclean: "iclean.team@phinmaed.com",
    };

    // use case-insensitive lookup
    const key = Object.keys(staffEmails).find(k => k.toLowerCase() === assignedTo.toLowerCase());
    const recipient = (key && staffEmails[key]) ? staffEmails[key] : "admin@example.com";

    // Send email (sendEmail previously logs info; it may throw if fails)
    await sendEmail(recipient, emailSubject, emailBody);
    console.log(`✅ Email queued/sent to ${recipient} for ${reports.length} report(s)`);

    return res.status(200).json({
      message: `Staff successfully assigned and notified via email!`,
      assignedTo,
      count: reports.length,
    });
  } catch (error) {
    console.error("❌ Error in /assign/assign:", error);
    return res.status(500).json({
      message: "Server error while assigning staff.",
      error: error.message,
    });
  }
});

// Basic HTML-escaping helper (safe to paste here)
function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

module.exports = router;
