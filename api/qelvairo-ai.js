import { ai } from "hatchable";

export const access = "public";
export const methods = ["POST"];

const systemPrompt = "You are Qelvairo AI, the friendly built-in assistant for Qelvairo, a creative studio and AI learning/workforce platform. Help visitors learn AI, plan and build professional websites, understand AI-assisted research, content writing, website development, and workflow automation. Be practical, concise, encouraging, and honest. Do not claim Qelvairo has confirmed jobs, deployed autonomous agents, prices, certifications, or course schedules unless the visitor provides that information. Explain that AI outputs need human review. For project enquiries or learning support, direct visitors to the Contact section on the Qelvairo website. Never ask for passwords, payment card details, or sensitive personal information.";

export default async function (req, res) {
  const body = req.body || {};
  const message = String(body.message || "").trim();
  if (message.length < 1 || message.length > 2000) {
    return res.status(400).json({ error: "Please enter a message under 2,000 characters." });
  }
  try {
    const result = await ai.generateText({
      model: "gemini",
      purpose: "qelvairo-chat",
      system: systemPrompt,
      prompt: message,
      maxTokens: 700
    });
    const reply = typeof result === "string" ? result : (result?.text || result?.outputText || "");
    if (!reply) throw new Error("The AI provider returned an empty reply.");
    return res.json({ ok: true, reply: String(reply).slice(0, 8000) });
  } catch (error) {
    const detail = String(error?.message || error);
    console.log("Qelvairo AI error:", detail);
    if (/insufficient_quota|credit_balance_exhausted|no credits remaining/i.test(detail)) {
      return res.status(503).json({
        error: "Qelvairo AI is connected, but the OpenAI API account has no credits remaining. Add API billing/credits in the OpenAI Platform, or connect a provider with available credits in Hatchable, then try again."
      });
    }
    if (/invalid_api_key|incorrect api key|authentication_error|unauthorized/i.test(detail)) {
      return res.status(503).json({
        error: "The AI provider rejected its API key. Check that the key is valid and active in Hatchable settings, then try again."
      });
    }
    return res.status(503).json({
      error: "Qelvairo AI could not get a reply from the AI provider. Check the provider connection, available credits, and Hatchable AI usage limits, then try again."
    });
  }
}