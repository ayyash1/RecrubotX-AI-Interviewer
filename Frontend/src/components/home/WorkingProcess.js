import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  CalendarCheck,
  Video,
  Bot,
  Smile,
  BarChart3,
  RefreshCw,
  Database,
} from "lucide-react";

// ✅ Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

// ✅ Steps Data with Lucide icons
const howItWorksSteps = [
  {
    title: "CV Parsing & Screening",
    description:
      "Uses NLP to extract key information from resumes and filter candidates based on job-specific requirements.",
    icon: FileText,
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    title: "Interview Scheduling",
    description:
      "Automatically schedules interviews using Google Calendar / Outlook API and sends invites via email.",
    icon: CalendarCheck,
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    title: "Interview Session Launch",
    description:
      "Initiates a video interview using integrated platforms like Zoom, Jitsi, or Twilio Video SDK at the scheduled time.",
    icon: Video,
    gradient: "from-violet-500 to-purple-400",
  },
  {
    title: "LLM-Powered Interviewing",
    description:
      "A large language model (LLM) agent asks dynamic, role-based questions tailored to the candidate's profile.",
    icon: Bot,
    gradient: "from-orange-500 to-amber-400",
  },
  {
    title: "Facial Expression Analysis",
    description:
      "Uses AI tools like OpenCV, DeepFace, or MediaPipe to assess non-verbal cues such as confidence, engagement, and emotions.",
    icon: Smile,
    gradient: "from-pink-500 to-rose-400",
  },
  {
    title: "Response Evaluation",
    description:
      "Analyzes verbal and visual data to generate a comprehensive evaluation report with objective scoring.",
    icon: BarChart3,
    gradient: "from-indigo-500 to-blue-400",
  },
  {
    title: "Dual Mode Support",
    description:
      "Supports real interviews for companies and practice simulations for job seekers using the same intelligent flow.",
    icon: RefreshCw,
    gradient: "from-cyan-500 to-sky-400",
  },
  {
    title: "Data Logging",
    description:
      "Stores all session data and reports in a secure database (MongoDB / PostgreSQL) for HR review, analytics, and feedback.",
    icon: Database,
    gradient: "from-slate-500 to-gray-400",
  },
];

const WorkingProcess = () => {
  return (
    <section className="bg-gradient-to-br from-[#0a1f44] via-[#0a2a5e] to-[#1a3a6e] text-white py-16 md:py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div className="text-center mb-14" {...fadeInUp}>
          <span className="inline-block px-4 py-1.5 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full text-blue-300 text-sm font-medium mb-4">
            Our Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-lg text-blue-200/80 max-w-2xl mx-auto">
            Our AI-powered system automates every step of the recruitment
            process with cutting-edge technology
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {howItWorksSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-white/10 transition-all duration-500 p-7 text-center relative overflow-hidden"
              >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                {/* Icon */}
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                >
                  <IconComponent className="w-8 h-8 text-white" strokeWidth={1.8} />
                </div>

                {/* Step number */}
                <span className="absolute top-4 right-4 text-xs font-semibold text-white/30 bg-white/5 px-2 py-1 rounded-full">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Title */}
                <h3 className="text-lg font-semibold mb-3 text-white group-hover:text-cyan-300 transition-colors duration-300">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-blue-200/70 text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default WorkingProcess;
