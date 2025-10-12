import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const { data: session } = useSession();
  const [apiKey, setApiKey] = useState("");
  const router = useRouter();

  const handleContinue = () => {
    if (!apiKey) {
      alert("Please enter your OpenAI API key");
      return;
    }
    localStorage.setItem("OPENAI_API_KEY", apiKey);
    router.push("/dashboard");
  };

  if (session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-3xl font-bold mb-4">Welcome, {session.user.name} 👋</h1>
        <img
          src={session.user.image}
          alt="profile"
          className="rounded-full w-20 h-20 mb-4"
        />
        <input
          type="password"
          placeholder="Enter your OpenAI API Key"
          className="border p-2 rounded w-80 mb-4"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <button
          onClick={handleContinue}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Continue
        </button>
        <button
          onClick={() => signOut()}
          className="text-gray-500 mt-3 underline"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">MagicMail ✉️</h1>
      <button
        onClick={() => signIn("google")}
        className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition"
      >
        Sign in with Google
      </button>
    </div>
  );
}
