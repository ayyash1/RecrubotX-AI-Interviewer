import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/userDatabase";
import CandidateSidebar from "../components/CandidateSidebar";


import template1 from "./Double column.jpg";
import template2 from "./simple.jpg";
import template3 from "./Image.PNG";

const templates = [
  { id: "double-column", name: "Double Column", image: template1 },
  { id: "Simple", name: "Simple", image: template2 },
  { id: "elegant", name: "Elegant", image: template3 },
];

export default function TemplateSelect() {
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/candidate/signin");
    } else {
      setUser(currentUser);
    }
  }, [navigate]);



  const handleContinue = () => {
    if (!selected) {
      alert("Please select a template");
      return;
    }
    localStorage.setItem("selectedTemplate", selected);
    navigate("/candidate/resume/builder");
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2a5e] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-gray-50 fixed inset-0 overflow-hidden">
      {/* Sidebar */}
      <CandidateSidebar />

      {/* Main */}
      <main className="flex-1 h-screen flex flex-col overflow-hidden py-8 px-8">
        {/* Header */}
        <div className="mb-6 flex-shrink-0 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#0a2a5e]">
              Choose a CV Template
            </h2>
            <p className="text-gray-500 text-md mt-1 py-2">
              Select a professional template that best represents your style and career level.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md p-8 h-[calc(100%-90px)] flex flex-col">

          {/* ✅ REDUCED TEMPLATE HEIGHT */}
          <div className="grid grid-cols-3 gap-10 mb-6">
            {templates.map((tpl) => {
              const isActive = selected === tpl.id;
              return (
                <motion.div
                  key={tpl.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelected(tpl.id)}
                  className="cursor-pointer relative"
                >
                  <div
                    className={`h-[360px] border-2 rounded-lg p-2 transition ${isActive
                      ? "border-[#0a2a5e] ring-4 ring-[#0a2a5e] shadow-lg"
                      : "border-gray-200 hover:border-[#0a2a5e]/50"
                      }`}
                  >
                    <img
                      src={tpl.image}
                      alt={tpl.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <p className="text-center mt-3 font-semibold text-gray-700">
                    {tpl.name}
                  </p>

                  {isActive && (
                    <span className="absolute top-3 right-3 w-8 h-8 bg-[#0a2a5e] text-white rounded-full flex items-center justify-center">
                      <Check size={18} />
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Continue Button */}
          <div className="flex justify-end mt-auto">
            <button
              onClick={handleContinue}
              disabled={!selected}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition shadow
                ${selected
                  ? "bg-[#0a2a5e] text-white hover:bg-[#061a3d]"
                  : "bg-gray-400 text-white cursor-not-allowed"
                }`}
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
