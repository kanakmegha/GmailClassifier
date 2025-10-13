import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // server-only
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { emails } = req.body;
  if (!emails) return res.status(400).json({ error: "No emails provided" });

  const categories = { work: [], personal: [], promotions: [], updates: [] };

  try {
    for (const email of emails) {
      const prompt = `
        Categorize this email into Work, Personal, Promotions, Updates.
        Subject: ${email.subject}
        Snippet: ${email.snippet}
        Respond only with the category name.
      `;

      const response = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });

      const cat = response.choices[0]?.message?.content?.trim()?.toLowerCase();
      categories[cat in categories ? cat : "updates"].push(email);
    }

    res.status(200).json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI API error" });
  }
}
