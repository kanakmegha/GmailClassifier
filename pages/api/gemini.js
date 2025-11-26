import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const categories = {
    technical_issue: [],
    billing_question: [],
    feature_request: [],
    general_inquiry: []
  };

  try {
    for (const email of req.body.emails) {
      const prompt = `
      Classify and reply to this email:
      Subject: ${email.subject}
      Content: ${email.snippet}

      Respond ONLY valid JSON:
      {
        "category": "",
        "response": ""
      }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const json = JSON.parse(text);
      const key = json.category.toLowerCase().replace(/ /g, "_") || "general_inquiry";

      if (!categories[key]) categories.general_inquiry.push(json);
      else categories[key].push(json);
    }

    return res.status(200).json({ success: true, categories });

  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ error: "Gemini AI error" });
  }
}
