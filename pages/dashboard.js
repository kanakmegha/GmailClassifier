import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Dashboard() {
  const { data: session } = useSession();
  const [emailsInput, setEmailsInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!session) {
    return (
      <div>
        <p>You are not logged in</p>
        <button onClick={() => signIn("google")}>Login with Google</button>
      </div>
    );
  }

  const handleGenerate = async () => {
    const emails = emailsInput.split(",").map((e) => e.trim()).filter(Boolean);
    if (emails.length === 0) {
      alert("Please enter at least one email");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      
          body: JSON.stringify({ emails: ["First email text", "Second email text"] })
      
        ,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(JSON.stringify(data.categories, null, 2));
      } else {
        setResult("❌ Server error: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      setResult("⚠️ Something went wrong: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>
      <p>Welcome, {session.user.email}</p>

      <textarea
        placeholder="Enter emails separated by commas"
        value={emailsInput}
        onChange={(e) => setEmailsInput(e.target.value)}
        rows={6}
        cols={50}
      />

      <br /><br />

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>

      <br /><br />

      {result && (
        <pre style={{ background: "#eee", padding: "10px" }}>{result}</pre>
      )}

      <br />
      <button onClick={() => signOut()}>Logout</button>
    </div>
  );
}
