// pages/api/gemini.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { emails } = req.body;
  if (!emails || !emails.length) return res.status(400).json({ error: "No emails provided" });

  try {
    const apiKey = process.env.GEMINI_API_KEY; // set in Vercel
    const response = await fetch("https://api.generative.google/v1beta/models/gemini-3-pro-preview:generateText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: emails.join("\n\n"),
        temperature: 0.7,
        maxOutputTokens: 200
      })
    });

    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Gemini processing failed:", err);
    res.status(500).json({ error: "Gemini processing failed" });
  }
}
