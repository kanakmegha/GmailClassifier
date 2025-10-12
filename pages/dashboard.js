import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { fetchEmails } from "../utils/gmail";
import { classifyEmails } from "../utils/openai";

export default function Dashboard() {
  const { data: session } = useSession();
  const [emails, setEmails] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.accessToken) return;

    const apiKey = localStorage.getItem("OPENAI_API_KEY");
    if (!apiKey) {
      alert("Please enter your OpenAI API key first");
      return;
    }

    const loadEmails = async () => {
      setLoading(true);
      const fetched = await fetchEmails(session.accessToken, 10);
      setEmails(fetched);
      if (fetched.length > 0) {
        const classified = await classifyEmails(fetched, apiKey);
        setCategories(classified);
      }
      setLoading(false);
    };

    loadEmails();
  }, [session]);

  if (!session) return <div>Please login first</div>;
  if (loading)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="loader mb-4"></div>
      <p className="text-gray-500">Fetching your emails...</p>
    </div>
  );
 
  if (!emails.length) return <div>No emails found. Make sure you granted Gmail access.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {Object.entries(categories).map(([cat, list]) => (
        <div key={cat} className="mb-4">
          <h2 className="font-semibold">{cat} ({list.length})</h2>
          <ul>
            {list.map((email) => (
              <li key={email.id}>
                <strong>{email.subject}</strong> - {email.snippet}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
