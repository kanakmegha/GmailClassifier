import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // server-only
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { emails } = req.body;
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: "No emails provided" });
  }

  // NEW categories structure
  const categories = {
    technical_issue: [],
    billing_question: [],
    feature_request: [],
    general_inquiry: []
  };

  try {
    for (const email of emails) {
      const prompt = `
      You are an intelligent email classifier and responder.

      Given the email content below, do the following:
      
      1. Categorize the email into ONE of the following:
         - Technical Issue
         - Billing Question
         - Feature Request
         - General Inquiry
      
      2. Generate a friendly, helpful draft reply.
      
      3. Return ONLY valid JSON in this format:

      {
        "category": "...",
        "response": "..."
      }

      Email content:
      "${email}"
      `;

      const response = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0
      });

      const output = response.choices[0].message.content.trim();

      // Extract JSON only
      const first = output.indexOf("{");
      const last = output.lastIndexOf("}");
      const jsonString = output.substring(first, last + 1);

      const parsed = JSON.parse(jsonString);
      const categoryKey = parsed.category.toLowerCase().replace(/ /g, "_");

      // If model returns something unexpected, put into general
      const validKey = categories[categoryKey] ? categoryKey : "general_inquiry";

      categories[validKey].push({
        email,
        response: parsed.response
      });
    }

    return res.status(200).json({
      success: true,
      categories
    });

  } catch (error) {
    console.error("API ERROR:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
