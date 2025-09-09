// components/PollCard.jsx
import { useState } from "react";

const PollCard = ({ poll }) => {
  const [selected, setSelected] = useState(null);

console.log("Poll: ",poll);


  const handleVote = (option) => {
    setSelected(option);
    // 👉 Later you can emit vote to backend/socket
    console.log("Voted for:", option);
  };

  return (
    <div className="p-3 border rounded-lg bg-base-200">
      <h3 className="font-semibold mb-2">{poll.question}</h3>
      <ul className="space-y-2">
        {poll.options.map((opt, idx) => (
          <li key={idx}>
            <button
              onClick={() => handleVote(opt)}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                selected === opt
                  ? "bg-blue-500 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PollCard;
