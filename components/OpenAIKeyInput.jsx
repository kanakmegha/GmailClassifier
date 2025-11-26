// components/AIAgentKeyInput.js
import { useState } from "react";

export default function AIAgentKeyInput({ onSave }) {
  const [apiKey, setApiKey] = useState("");

  const handleSave = () => {
    if (!apiKey) return alert("Please enter your Gemini API key");
    localStorage.setItem("GEMINI_API_KEY", apiKey);
    if (onSave) onSave(apiKey);
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="password"
        placeholder="Enter Gemini API Key"
        className="border p-2 rounded w-80 mb-4"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        Save Key
      </button>
    </div>
  );
}
