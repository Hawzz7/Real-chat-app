// components/SummaryModal.jsx

import { X } from "lucide-react"; // for cross button (you can replace with fontawesome or simple text)

const SummaryModal = ({ show, summary, onClose }) => {
  if (!show || !summary) return null; // don't render if no summary

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-lg w-full relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl text-black font-semibold mb-4 text-center">Chat Summary</h2>
        <div className="text-gray-700 whitespace-pre-line">{summary}</div>
      </div>
    </div>
  );
};

export default SummaryModal;
