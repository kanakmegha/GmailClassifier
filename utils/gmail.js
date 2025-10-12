export async function fetchEmails(accessToken, maxResults = 10) {
    if (!accessToken) {
      console.error("No access token provided");
      return [];
    }
  
    try {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await res.json();
  
      console.log("Gmail list response:", data);
  
      if (!data.messages) return [];
  
      const emails = await Promise.all(
        data.messages.map(async (msg) => {
          const msgRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          const msgData = await msgRes.json();
  
          const subjectHeader = msgData.payload.headers.find(
            (h) => h.name === "Subject"
          );
  
          return {
            id: msg.id,
            subject: subjectHeader?.value || "(No Subject)",
            snippet: msgData.snippet || "(No Content)",
          };
        })
      );
  
      console.log("Fetched emails:", emails);
  
      return emails;
    } catch (err) {
      console.error("Error fetching emails:", err);
      return [];
    }
  }
  