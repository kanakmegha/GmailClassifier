// pages/api/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      console.log("❌ No emails from frontend");
      return res.status(400).json({ error: "No emails provided" });
    }

    console.log("📨 Received emails:", emails.length);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const categories = {
      technical_issue: [],
      billing_question: [],
      feature_request: [],
      general_inquiry: []
    };

    for (const email of emails) {
      const prompt = `
Classify the following email into exactly one label:

- Technical Issue  
- Billing Question  
- Feature Request  
- General Inquiry  

And generate a short reply.

Return ONLY JSON strictly as:
{
 "category": "...",
 "response": "..."
}

EMAIL:
"${email}"
`;

      const aiRes = await model.generateContent(prompt);
      const output = aiRes.response.text().trim();

      console.log("📦 Gemini raw output:", output);

      const first = output.indexOf("{");
      const last = output.lastIndexOf("}");
      const jsonString = output.substring(first, last + 1);

      const parsed = JSON.parse(jsonString);

      const key = parsed.category.toLowerCase().replace(/ /g, "_");
      const finalKey = categories[key] ? key : "general_inquiry";

      categories[finalKey].push({
        email,
        response: parsed.response
      });
    }

    return res.status(200).json({ categories });

  } catch (error) {
    console.error("🔥 API Crash:", error);
    return res.status(500).json({
      error: "Gemini processing failed",
      detail: error.message
    });
  }
}
