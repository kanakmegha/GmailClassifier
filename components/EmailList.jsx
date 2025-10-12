// components/EmailList.js
export default function EmailList({ emails }) {
    if (!emails || emails.length === 0) return <p>No emails found</p>;
  
    return (
      <ul className="space-y-2">
        {emails.map((email) => (
          <li
            key={email.id}
            className="border p-3 rounded shadow hover:bg-gray-50 transition"
          >
            <p className="font-bold">{email.subject}</p>
            <p className="text-gray-600">{email.snippet}</p>
          </li>
        ))}
      </ul>
    );
  }
  