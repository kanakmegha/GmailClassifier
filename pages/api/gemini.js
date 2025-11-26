// pages/api/gemini.js
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client with API key from environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { emails } = req.body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: "No emails provided" });
  }

  try {
    const results = [];

    for (const email of emails) {
      // Send prompt to Gemini
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `
You are an intelligent email classifier and responder.

1. Categorize the email into ONE of these:
   - Technical Issue
   - Billing Question
   - Feature Request
   - General Inquiry

2. Generate a friendly, helpful draft reply.

3. Return ONLY valid JSON like this:
{
  "category": "...",
  "response": "..."
}

Email content:
"${email}"
        `,
      });

      // Push parsed result
      results.push({
        email,
        response: response.text,
      });
    }

    res.status(200).json({ success: true, results });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Gemini processing failed" });
  }
}
