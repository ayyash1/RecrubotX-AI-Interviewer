import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, User, Briefcase } from "lucide-react";
import Img1 from "../../assets/images/general/1.png";
import Img2 from "../../assets/images/general/2.png";
import Img3 from "../../assets/images/general/3.png";
import Img4 from "../../assets/images/general/5.png";

const Hero = () => {
  return (
    <section className="relative px-6 md:px-16 py-16 md:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-100/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-14 items-center relative z-10">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-7"
          >
            <div className="inline-block">
              <span className="text-sm font-medium text-blue-600 tracking-wide">
                ✦ AI-Powered Recruitment Platform
              </span>
              <div className="h-px bg-gradient-to-r from-blue-600 to-transparent mt-2" />
            </div>
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Redefining Hiring
            </span>{" "}
            Through Intelligent Conversations
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl">
            RecruBotX empowers you with AI-driven video interviews to hire faster,
            smarter, and fairer. From screening to selection, it streamlines the
            journey for HR and candidates alike—your all-in-one solution for
            finding the right talent at any scale.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-10">
            <Link
              to="/candidate/signin"
              className="group inline-flex items-center justify-center gap-2 min-w-[180px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <User className="w-5 h-5" />
              Candidate
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            <Link
              to="/recruiter/signin"
              className="group inline-flex items-center justify-center gap-2 min-w-[180px] bg-white text-gray-800 px-6 py-3.5 rounded-xl font-medium border border-gray-200 shadow-md hover:shadow-lg hover:border-blue-200 hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Briefcase className="w-5 h-5 text-blue-600" />
              Recruiter
              <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

        </motion.div>

        {/* Right Image Grid */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative w-full"
        >
          {/* Decorative glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl opacity-10 blur-xl" />

          <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { src: Img1, alt: "Team Meeting" },
              { src: Img2, alt: "AI Recruitment" },
              { src: Img3, alt: "AI Handshake" },
              { src: Img4, alt: "Candidate Review" },
            ].map((img, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-2xl shadow-lg aspect-[4/3]"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
