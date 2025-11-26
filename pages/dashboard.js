import { useState } from "react";

export default function Dashboard() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleGenerate = async () => {
    if (!emails.length) {
      alert("Please enter at least one email!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("OpenAI API error:", data);
        return alert(data.error || "API Error");
      }

      setResult(data.generatedText);
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong!");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>

      <textarea
        placeholder="Enter emails (comma separated)"
        onChange={(e) => setEmails(e.target.value.split(","))}
        style={{ width: "80%", height: "100px" }}
      />

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>

      {result && (
        <pre style={{ marginTop: "20px", background: "#eee", padding: "10px" }}>
          {result}
        </pre>
      )}
    </div>
  );
}
