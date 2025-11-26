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
    if (!emailsInput.trim()) {
      alert("Please enter emails first");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/processEmails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails: emailsInput.split(",").map((e) => e.trim()),
        }),
      });

      const data = await response.json();
      console.log("Server response:", data);

      if (data.error) {
        setResult("❌ Server error: " + data.error);
      } else {
        setResult(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setResult("⚠️ Something went wrong: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, {session.user.email}</p>

      <textarea
        placeholder="Enter emails separated by commas"
        value={emailsInput}
        onChange={(e) => setEmailsInput(e.target.value)}
        rows={4}
        cols={40}
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
