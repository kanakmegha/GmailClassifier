import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchEmails } from "../utils/gmail";

const categoryConfig = {
  technical_issue: { color: "red", icon: "🐞" },
  billing_question: { color: "yellow", icon: "💰" },
  feature_request: { color: "blue", icon: "✨" },
  general_inquiry: { color: "green", icon: "📩" },
};

export default function Dashboard() {
  const { data: session } = useSession();
  const [emails, setEmails] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [openCategory, setOpenCategory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session?.accessToken) return;

    const loadData = async () => {
      try {
        setProgress(10);
        const fetched = await fetchEmails(session.accessToken);
        setEmails(fetched);
        setProgress(50);

        const aiRes = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emails: fetched })
        });

        if (!aiRes.ok) throw new Error(await aiRes.text());
        const data = await aiRes.json();
        setCategories(data.categories || {});
        setProgress(100);

      } catch (err) {
        setError("Error loading dashboard: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session]);

  if (!session) return <p className="text-center mt-20">Please login first</p>;

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-lg">
        Loading emails... {progress}%
      </div>
    );

  if (error)
    return <div className="text-center text-red-600 font-bold">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-5">Email Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(categories).map(([cat, list]) => (
          <div key={cat} className="border rounded-xl shadow-lg">
            <div
              className={`p-4 cursor-pointer bg-${categoryConfig[cat]?.color}-200`}
              onClick={() => setOpenCategory(openCategory === cat ? null : cat)}
            >
              {categoryConfig[cat].icon} {cat.replace(/_/g, " ")} ({list.length})
            </div>

            {openCategory === cat && (
              <ul className="p-4 space-y-3">
                {list.map((item, i) => (
                  <li key={i} className="border rounded p-3">
                    <strong>{item.subject}</strong>
                    <p className="text-sm text-gray-600 italic mt-1">
                      AI: {item.response}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
