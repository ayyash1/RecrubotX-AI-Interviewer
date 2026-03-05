import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  MessageCircle,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Users,
  Clock,
  Target,
  Zap,
} from "lucide-react";

const HowItWorksPage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const steps = [
    {
      icon: FileText,
      title: "CV Analysis",
      description:
        "Upload resumes and let our AI analyze, parse, and rank them using NLP algorithms.",
      features: [
        "Keyword matching",
        "Skills assessment",
        "Experience evaluation",
        "Cultural fit analysis",
      ],
    },
    {
      icon: MessageCircle,
      title: "AI Interviewing",
      description:
        "Candidates interact with our AI interviewer, customized for roles and company needs.",
      features: ["Role-specific questions", "Natural dialogue", "Adaptive questioning", "Video analysis"],
    },
    {
      icon: BarChart3,
      title: "Smart Evaluation",
      description:
        "Detailed scoring reports analyzing responses, communication, and expressions.",
      features: ["Performance metrics", "Strengths analysis", "Hiring recommendations", "Comprehensive reports"],
    },
  ];

  const benefits = [
    "70% faster hiring process",
    "Eliminate unconscious bias",
    "24/7 interview availability",
    "Consistent evaluation",
    "Scalable recruitment",
    "Better candidate experience",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 md:py-20 px-4 bg-[#0a2a5e] text-white text-center">
        <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
            How RecruBotX Works
          </h1>
          <p className="text-base md:text-lg max-w-2xl mx-auto text-blue-200/80">
            See how our AI-powered system transforms every step of recruitment
          </p>
        </motion.div>
      </section>

      {/* Process Steps */}
      <section className="py-12 md:py-20 px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="space-y-12 md:space-y-20 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              {...fadeInUp}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
            >
              {/* Content - Order changes on alternate rows for desktop */}
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-[#0a2a5e] rounded-full flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-[#0a2a5e]">{step.title}</h2>
                </div>
                <p className="text-gray-600 mb-4 text-sm md:text-base">{step.description}</p>
                <ul className="space-y-2">
                  {step.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-700 text-sm md:text-base">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card - Order changes on alternate rows for desktop */}
              <div className={`shadow-lg rounded-xl p-6 md:p-8 text-center bg-white ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center mb-4 md:mb-6">
                  <step.icon className="w-16 h-16 md:w-20 md:h-20 text-[#0a2a5e]" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-[#0a2a5e] mb-2 md:mb-3">Step {index + 1}</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Experience the power of AI automation in recruitment.
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-20 bg-gray-50 px-4 sm:px-6 md:px-12 lg:px-20">
        <motion.div {...fadeInUp} className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0a2a5e] mb-3 md:mb-4">Why Choose RecruBotX</h2>
          <p className="text-gray-600 text-sm md:text-base">
            Transform your hiring process with measurable improvements
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
          {/* Benefits List */}
          <ul className="space-y-3">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-center text-gray-700 text-sm md:text-base">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-2 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>

          {/* Stats Grid - Responsive */}
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <div className="shadow-md rounded-xl p-4 md:p-6 text-center bg-white">
              <Clock className="w-8 h-8 md:w-12 md:h-12 text-[#0a2a5e] mx-auto mb-2 md:mb-4" />
              <p className="text-xl md:text-2xl font-bold">70%</p>
              <p className="text-xs md:text-sm text-gray-600">Faster Hiring</p>
            </div>
            <div className="shadow-md rounded-xl p-4 md:p-6 text-center bg-white">
              <Users className="w-8 h-8 md:w-12 md:h-12 text-[#0a2a5e] mx-auto mb-2 md:mb-4" />
              <p className="text-xl md:text-2xl font-bold">24/7</p>
              <p className="text-xs md:text-sm text-gray-600">Availability</p>
            </div>
            <div className="shadow-md rounded-xl p-4 md:p-6 text-center bg-white">
              <Target className="w-8 h-8 md:w-12 md:h-12 text-[#0a2a5e] mx-auto mb-2 md:mb-4" />
              <p className="text-xl md:text-2xl font-bold">90%</p>
              <p className="text-xs md:text-sm text-gray-600">Accuracy</p>
            </div>
            <div className="shadow-md rounded-xl p-4 md:p-6 text-center bg-white">
              <Zap className="w-8 h-8 md:w-12 md:h-12 text-[#0a2a5e] mx-auto mb-2 md:mb-4" />
              <p className="text-xl md:text-2xl font-bold">2x</p>
              <p className="text-xs md:text-sm text-gray-600">Efficiency</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-[#0a2a5e] text-white text-center px-4">
        <motion.div {...fadeInUp} className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Ready to Transform Your Hiring?</h2>
          <p className="text-base md:text-lg mb-6 md:mb-8 text-blue-200/80">
            Experience the power of AI-driven recruitment. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/recruiter/signup"
              className="flex items-center justify-center bg-white text-[#0a2a5e] hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-[#0a2a5e] font-semibold py-3 px-6 rounded-lg transition"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HowItWorksPage;
