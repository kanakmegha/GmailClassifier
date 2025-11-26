// pages/dashboard.js
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchEmails } from "../utils/gmail";

const categoryConfig = {
  technical_issue: { color: "red", icon: "🐞" },
  billing_question: { color: "yellow", icon: "💰" },
  feature_request: { color: "blue", icon: "✨" },
  general_inquiry: { color: "green", icon: "📩" },
};

// Helper to safely compute Tailwind color classes
const getColorClass = (color, type) => {
  switch (color) {
    case "red":
      return type === "border" ? "border-red-500" : "bg-red-500";
    case "yellow":
      return type === "border" ? "border-yellow-500" : "bg-yellow-500";
    case "blue":
      return type === "border" ? "border-blue-500" : "bg-blue-500";
    case "green":
      return type === "border" ? "border-green-500" : "bg-green-500";
    default:
      return type === "border" ? "border-gray-300" : "bg-gray-300";
  }
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

    const loadEmails = async () => {
      try {
        setLoading(true);
        setProgress(10);

        // FETCH EMAILS
        const fetched = await fetchEmails(session.accessToken, 10);
        setEmails(fetched);
        setProgress(40);

        // SEND EMAILS TO BACKEND FOR AI CLASSIFICATION
        const aiRes = await fetch("/api/auth/gemini", {

          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emails: fetched.map((e) => e.snippet ?? e.subject ?? "")
          })
        });

        if (!aiRes.ok) {
          const text = await aiRes.text();
          throw new Error(`OpenAI API error: ${text}`);
        }

        const data = await aiRes.json();
        setCategories(data.categories || {});
        setProgress(100);
        setLoading(false);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
        setCategories({});
        setProgress(100);
        setLoading(false);
      }
    };

    loadEmails();
  }, [session]);

  if (!session) {
    return <div className="text-center mt-20">Please login first</div>;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
          <h2 className="text-lg font-semibold mb-4">Loading Emails</h2>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2 relative">
            <div
              className="h-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 rounded-full animate-pulse"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-gray-500 font-medium">{progress}%</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="text-red-500 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Email Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(categories || {}).map(([cat, list]) => {
          const { color, icon } = categoryConfig[cat] || {};
          const isOpen = openCategory === cat;

          return (
            <div
              key={cat}
              className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-2xl"
            >
              <div
                className={`flex items-center justify-between p-4 border-b-2 ${getColorClass(color, "border")}`}
                onClick={() => setOpenCategory(isOpen ? null : cat)}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{icon}</span>
                  <h2 className="font-semibold text-lg capitalize">
                    {cat.replace(/_/g, " ")}
                  </h2>
                </div>
                <span className={`${getColorClass(color, "bg")} text-white text-sm px-2 py-1 rounded-full`}>
                  {list?.length || 0}
                </span>
              </div>

              <div
                className={`transition-all duration-500 overflow-hidden ${
                  isOpen ? "max-h-96" : "max-h-0"
                }`}
              >
                <ul className="p-4 space-y-2">
                  {list?.map((emailObj, i) => (
                    <li key={i} className="p-2 rounded-lg hover:bg-gray-100">
                      <strong className="text-gray-800">{emailObj.email ?? emailObj.subject}</strong>
                      <p className="text-sm text-gray-500 italic mt-1">
                        AI Reply: {emailObj.response ?? "No response"}
                      </p>
                    </li>
                  )) || <li className="text-gray-500 italic">No emails in this category</li>}
                </ul>
              </div>
            </div>
          );
        })}

        {Object.keys(categories || {}).length === 0 && (
          <p className="text-gray-500 italic text-center col-span-full">
            No categories found
          </p>
        )}
      </div>
    </div>
  );
}
