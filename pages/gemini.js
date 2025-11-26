import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { emails } = req.body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: "No emails provided" });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const categories = {
    technical_issue: [],
    billing_question: [],
    feature_request: [],
    general_inquiry: []
  };

  try {
    for (const email of emails) {
      const prompt = `
Classify the email into one category:
Technical Issue, Billing Question, Feature Request, General Inquiry.

Then generate a helpful reply.

Return ONLY JSON:

{
  "category": "",
  "response": ""
}

Email: "${email}"
`;

      const result = await model.generateContent(prompt);
      const output = result.response.text();

      // Extract JSON safely
      const first = output.indexOf("{");
      const last = output.lastIndexOf("}");
      const json = output.substring(first, last + 1);

      const parsed = JSON.parse(json);
      const normalized = parsed.category.toLowerCase().replace(/ /g, "_");

      const key = categories[normalized] ? normalized : "general_inquiry";

      categories[key].push({
        email,
        response: parsed.response
      });
    }

    return res.status(200).json({ success: true, categories });
  } catch (err) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({ error: "Gemini server error" });
  }
}
