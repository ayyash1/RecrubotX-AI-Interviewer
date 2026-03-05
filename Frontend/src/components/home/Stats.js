import React from "react";
import { motion } from "framer-motion";
import { TrendingDown, Clock, Users, Award, Target, Zap } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Stats = () => {
  const data = [
    {
      value: "95%",
      label: "Bias Reduction",
      icon: TrendingDown,
      gradient: "from-emerald-500 to-teal-400",
      description: "Fairer hiring decisions",
    },
    {
      value: "70%",
      label: "Time Saved",
      icon: Clock,
      gradient: "from-blue-500 to-cyan-400",
      description: "Faster recruitment process",
    },
    {
      value: "10k+",
      label: "Interviews Conducted",
      icon: Users,
      gradient: "from-violet-500 to-purple-400",
      description: "Successful placements",
    },
    {
      value: "98%",
      label: "Client Satisfaction",
      icon: Award,
      gradient: "from-amber-500 to-orange-400",
      description: "Happy customers",
    },
    {
      value: "50+",
      label: "Enterprise Clients",
      icon: Target,
      gradient: "from-pink-500 to-rose-400",
      description: "Trusted partnerships",
    },
    {
      value: "24/7",
      label: "AI Availability",
      icon: Zap,
      gradient: "from-indigo-500 to-blue-400",
      description: "Always ready to assist",
    },
  ];

  return (
    <section className="relative px-6 md:px-16 py-20 bg-gradient-to-br from-[#0a1f44] via-[#0a2a5e] to-[#1a3a6e] overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div className="text-center mb-12" {...fadeInUp}>
          <span className="inline-block px-4 py-1.5 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full text-blue-300 text-sm font-medium mb-4">
            Our Impact
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Numbers That{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Speak
            </span>
          </h2>
          <p className="text-lg text-blue-200/70 max-w-2xl mx-auto">
            Real results from our AI-powered recruitment platform
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {data.map((item, i) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.05 }}
                className="group bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:bg-white/10 transition-all duration-500 text-center relative overflow-hidden"
              >
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                {/* Icon */}
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                >
                  <IconComponent className="w-6 h-6 text-white" strokeWidth={2} />
                </div>

                {/* Value */}
                <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-1">
                  {item.value}
                </h3>

                {/* Label */}
                <p className="text-blue-100 font-medium text-sm mb-1">
                  {item.label}
                </p>

                {/* Description */}
                <p className="text-blue-200/50 text-xs">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Stats;
