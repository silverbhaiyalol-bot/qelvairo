import { db } from "hatchable";

export const access = "admin";
export const methods = ["GET"];

export default async function (req, res) {
  const { rows } = await db.query(
    "SELECT id, form_type, name, email, topic, role, experience, portfolio, message, created_at FROM qelvairo_submissions ORDER BY created_at DESC LIMIT 200"
  );
  return res.json({ submissions: rows });
}