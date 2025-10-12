export async function classifyEmails(emails, apiKey) {
    if (!emails || emails.length === 0) return {};
    if (!apiKey) {
      console.error("No OpenAI API key provided");
      return {};
    }
  
    const categories = {
      Important: [],
      Promotions: [],
      Social: [],
      Marketing: [],
      Spam: [],
      General: [],
    };
  
    for (const email of emails) {
      const prompt = `
  Classify this email into one of the following categories: Important, Promotions, Social, Marketing, Spam, General.
  Email Subject: ${email.subject}
  Email Content: ${email.snippet}
  Return only the category name.
  `;
  
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
          }),
        });
  
        const data = await res.json();
        const category = data.choices?.[0]?.message?.content?.trim() || "General";
  
        categories[category] = categories[category] || [];
        categories[category].push(email);
      } catch (err) {
        console.error("Error classifying email:", err);
        categories.General.push(email);
      }
    }
  
    console.log("Classified emails:", categories);
  
    return categories;
  }
  