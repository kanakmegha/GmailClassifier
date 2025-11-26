export async function fetchEmails(accessToken, maxResults = 10) {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const data = await res.json();
  if (!data.messages) return [];

  const emails = await Promise.all(
    data.messages.map(async (msg) => {
      const msgData = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      ).then((r) => r.json());

      const subjectHeader = msgData.payload.headers.find(h => h.name === "Subject");

      return {
        subject: subjectHeader?.value || "(No Subject)",
        snippet: msgData.snippet || "",
      };
    })
  );

  return emails;
}
