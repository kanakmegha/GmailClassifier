/* // pages/index.js
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-3xl font-bold mb-4">Welcome, {session.user.name} 👋</h1>
        <img
          src={session.user.image}
          alt="profile"
          className="rounded-full w-20 h-20 mb-4"
        />
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition mb-4"
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => signOut()}
          className="text-gray-500 underline"
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
 */
// pages/index.js
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-3xl font-bold mb-4">
          Welcome, {session.user.name || "User"} 👋
        </h1>
        {session.user.image && (
          <img
            src={session.user.image}
            alt="profile"
            className="rounded-full w-20 h-20 mb-4"
          />
        )}
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition mb-4"
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => signOut()}
          className="text-gray-500 underline"
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
