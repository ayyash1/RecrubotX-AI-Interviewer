import { Plus } from "lucide-react";

export const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    <div className="space-y-3">{children}</div>
  </div>
);

export const Input = (props) => (
  <input
    {...props}
    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
);

export const Textarea = (props) => (
  <textarea
    {...props}
    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
);

export const AddButton = ({ onClick, label }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors py-2"
  >
    <Plus className="w-4 h-4" /> {label}
  </button>
);

// Word counter component with min/max requirements
export const WordCounter = ({ text, minWords, maxWords, label }) => {
  const wordCount = (text || "").trim().split(/\s+/).filter(Boolean).length;
  const isMinMet = !minWords || wordCount >= minWords;
  const isMaxMet = !maxWords || wordCount <= maxWords;
  const isPerfect = isMinMet && isMaxMet;

  return (
    <div className={`text-[10px] mt-1 px-2 py-0.5 rounded-md inline-flex items-center gap-1 font-medium ${isPerfect ? "bg-green-100 text-green-700" :
        !isMinMet ? "bg-yellow-100 text-yellow-700" :
          "bg-red-100 text-red-700"
      }`}>
      <span>{wordCount} words</span>
      {minWords && maxWords ? (
        <span>(Goal: {minWords}-{maxWords})</span>
      ) : minWords ? (
        <span>(Min: {minWords})</span>
      ) : maxWords ? (
        <span>(Max: {maxWords})</span>
      ) : null}
      {isPerfect ? "✓" : ""}
    </div>
  );
};
