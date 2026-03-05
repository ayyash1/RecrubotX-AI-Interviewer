import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";

const faqs = [
  {
    q: "What's included in the free trial?",
    a: "Our free trial gives you full access to basic AI interview features including 5 candidate screenings, video interview capabilities, and automated scoring. No credit card required.",
  },
  {
    q: "What is RecruBotX?",
    a: "RecruBotX is an AI-powered interview automation platform that uses advanced language models and facial analysis to conduct, evaluate, and score candidate interviews automatically, saving HR teams up to 70% of their time.",
  },
  {
    q: "How does RecruBotX track candidate activity?",
    a: "It analyzes verbal responses using NLP, tracks facial expressions and body language through computer vision, and compiles comprehensive evaluation reports—all while maintaining strict privacy and security standards.",
  },
  {
    q: "Can RecruBotX be used for teams?",
    a: "Yes! RecruBotX is built for collaboration. HR teams can share candidate profiles, compare evaluations, add notes, and make collective hiring decisions through our intuitive dashboard.",
  },
  {
    q: "Is my data secure with RecruBotX?",
    a: "Absolutely. We use end-to-end encryption, comply with GDPR and other data protection regulations, and employ role-based access control to ensure your data remains private and secure.",
  },
  {
    q: "What integrations does RecruBotX support?",
    a: "RecruBotX integrates seamlessly with popular ATS platforms, Google Calendar, Outlook, Zoom, and major HRIS systems. Custom API integrations are also available for enterprise clients.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section
      id="faq"
      className="relative px-6 md:px-16 py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-100/50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 border border-blue-200 rounded-full text-blue-600 text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" />
            Got Questions?
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about RecruBotX
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`bg-white rounded-2xl shadow-md border transition-all duration-300 overflow-hidden ${openIndex === i
                ? "border-blue-200 shadow-lg shadow-blue-500/10"
                : "border-gray-100 hover:border-blue-100 hover:shadow-lg"
                }`}
            >
              <button
                className="flex items-center justify-between w-full text-left p-6 group"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${openIndex === i
                      ? "bg-gradient-to-br from-blue-500 to-indigo-500"
                      : "bg-blue-50 group-hover:bg-blue-100"
                      }`}
                  >
                    <MessageCircle
                      className={`w-5 h-5 transition-colors duration-300 ${openIndex === i ? "text-white" : "text-blue-500"
                        }`}
                    />
                  </div>
                  <span
                    className={`font-semibold text-lg transition-colors duration-300 ${openIndex === i ? "text-blue-600" : "text-gray-800"
                      }`}
                  >
                    {item.q}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${openIndex === i
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500"
                    }`}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 pt-0">
                      <div className="pl-14 border-l-2 border-blue-100 ml-5">
                        <p className="text-gray-600 leading-relaxed pl-4">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          className="mt-12 text-center bg-gradient-to-br from-[#0a1f44] via-[#0a2a5e] to-[#1a3a6e] rounded-2xl p-8 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-white mb-2">
            Still have questions?
          </h3>
          <p className="text-blue-200/80 mb-6">
            Our team is here to help you get started
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-[#0a2a5e] px-6 py-3 rounded-xl font-medium hover:bg-blue-50 transition-colors duration-300 shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
