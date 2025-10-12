// components/ClassifiedList.js
export default function ClassifiedList({ classifiedEmails }) {
    if (!classifiedEmails || classifiedEmails.length === 0)
      return <p>No classified emails</p>;
  
    return (
      <div className="space-y-4">
        {classifiedEmails.map((email) => (
          <div
            key={email.id}
            className="border p-3 rounded shadow hover:bg-gray-50 transition"
          >
            <p className="font-bold">{email.subject}</p>
            <p className="text-gray-600">{email.snippet}</p>
            <p className="mt-1 text-sm text-blue-600">
              Category: {email.category}
            </p>
          </div>
        ))}
      </div>
    );
  }
  