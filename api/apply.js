import { email, db } from "hatchable";

export const access = "public";
export const methods = ["POST"];

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));

export default async function (req, res) {
  const body = req.body || {};
  const type = String(body.type || "application");
  const name = String(body.name || "").trim();
  const applicantEmail = String(body.email || "").trim();
  const role = String(body.role || "").trim();
  const topic = String(body.topic || "").trim();
  const experience = String(body.experience || "").trim();
  const portfolio = String(body.portfolio || "").trim();
  const message = String(body.message || "").trim();

  if (!["application", "contact"].includes(type)) return res.status(400).json({ error: "Invalid form type." });
  if (name.length < 2 || name.length > 120) return res.status(400).json({ error: "Please enter your name (at least 2 characters)." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicantEmail) || applicantEmail.length > 254) return res.status(400).json({ error: "Please enter a valid email address." });
  if (message.length < 5 || message.length > 3000) return res.status(400).json({ error: "Please enter a message between 5 and 3000 characters." });
  if (type === "application" && !["Content Writer", "Web Developer", "Research Assistant", "Graphic Designer", "UI/UX Designer", "Social Media Manager", "SEO Specialist", "AI Content Assistant", "Data Analyst", "QA Tester", "Virtual Assistant", "Other / Future opportunity"].includes(role)) return res.status(400).json({ error: "Please choose a role from the list." });
  if (type === "contact" && !["Project enquiry", "Career interest", "Partnership / collaboration", "Learning AI", "Something else"].includes(topic)) return res.status(400).json({ error: "Please choose what your message is about." });
  if (portfolio && (!/^https?:\/\//i.test(portfolio) || portfolio.length > 500)) return res.status(400).json({ error: "Please enter a valid portfolio or LinkedIn URL starting with https:// or http://." });

  try {
    await db.query(
      "INSERT INTO qelvairo_submissions (form_type, name, email, topic, role, experience, portfolio, message) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [type, name, applicantEmail, topic || null, role || null, experience || null, portfolio || null, message]
    );
  } catch (error) {
    console.log("Qelvairo database save error:", String(error?.message || error));
    return res.status(500).json({ error: "We couldn't save your submission right now. Please try again." });
  }

  const label = type === "application" ? "Career application" : "Website contact message";
  const detail = type === "application"
    ? "<b>Role:</b> " + escapeHtml(role) + "<br><b>Experience:</b> " + escapeHtml(experience || "Not provided") + "<br><b>Portfolio / LinkedIn:</b> " + escapeHtml(portfolio || "Not provided")
    : "<b>Topic:</b> " + escapeHtml(topic);
  const html = "<div style=\"font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#20251f\">" +
    "<div style=\"padding:20px;background:#17191f;color:#c7f36b;font-size:22px;font-weight:bold\">Qelvairo.</div>" +
    "<div style=\"padding:24px;border:1px solid #e4e5de\"><h2>" + escapeHtml(label) + "</h2>" +
    "<p><b>Name:</b> " + escapeHtml(name) + "</p><p><b>Email:</b> " + escapeHtml(applicantEmail) + "</p>" +
    "<p>" + detail + "</p><p><b>Message:</b><br>" + escapeHtml(message).replace(/\n/g, "<br>") + "</p>" +
    "<hr><small>Sent through the Qelvairo website form.</small></div></div>";
  const subject = type === "application" ? "Qelvairo career application — " + role : "Qelvairo website enquiry — " + topic;
  const plainText = label + " | Name: " + name + " | Email: " + applicantEmail + " | " + (type === "application" ? "Role: " + role : "Topic: " + topic) + " | Message: " + message;

  try {
    await email.send({ to: "silverfr162@gmail.com", subject, html, text: plainText });
    return res.json({ ok: true, saved: true, emailed: true, message: type === "application" ? "Application sent successfully. Thanks for reaching out!" : "Message sent successfully. We'll be in touch!" });
  } catch (error) {
    console.log("Qelvairo platform email delivery error:", String(error?.message || error));
    // Free-plan platform email may block recipients that are not on its allowlist.
    // Fall back to FormSubmit's free AJAX email relay. The owner must activate
    // the address by clicking the first confirmation email before notifications arrive.
    try {
      const relay = await fetch("https://formsubmit.co/ajax/silverfr162@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json", "Referer": "https://qelvairo.hatchable.site/" },
        body: JSON.stringify({
          _subject: subject,
          _template: "table",
          _replyto: applicantEmail,
          form: "Qelvairo website",
          type: label,
          name,
          email: applicantEmail,
          role: role || "Not applicable",
          topic: topic || "Not applicable",
          experience: experience || "Not provided",
          portfolio: portfolio || "Not provided",
          message
        })
      });
      const relayResult = await relay.json().catch(() => ({}));
      if (relay.ok && String(relayResult.success) === "true") {
        return res.json({ ok: true, saved: true, emailed: true, message: type === "application" ? "Application sent successfully. Thanks for reaching out!" : "Message sent successfully. We'll be in touch!" });
      }
      console.log("Qelvairo email relay not activated or rejected:", JSON.stringify(relayResult), "HTTP", relay.status);
      return res.status(202).json({ ok: true, saved: true, emailed: false, message: "Thanks — your submission has been saved, but email notifications are not connected yet. Your details were recorded securely on the site." });
    } catch (relayError) {
      console.log("Qelvairo email relay error:", String(relayError?.message || relayError));
      return res.status(202).json({ ok: true, saved: true, emailed: false, message: "Thanks — your submission has been saved, but email delivery is not configured yet. Your details were recorded on the site." });
    }
  }
}