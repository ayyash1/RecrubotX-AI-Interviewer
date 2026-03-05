import React from "react";
import teamImage from "../../assets/images/home/Rectangle-95.png";

const About = () => {
  return (
    <section className="bg-[#F7F7FF] py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-16 grid md:grid-cols-2 gap-12 items-center">

        {/* Left Side - Image with decorative dots */}
        <div className="relative">
          <img
            src={teamImage}
            alt="Team working together"
            className="rounded-xl shadow-lg"
          />
          {/* Decorative Dots - Top Left */}
          <div className="absolute -top-6 -left-6 w-20 h-20 grid grid-cols-5 gap-1 opacity-80">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-[#0a2a5e]" />
            ))}
          </div>
          {/* Decorative Dots - Bottom Right */}
          <div className="absolute -bottom-6 -right-6 w-20 h-20 grid grid-cols-5 gap-1 opacity-80">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-[#0a2a5e]" />
            ))}
          </div>
        </div>

        {/* Right Side - Text */}
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0a2a5e] mb-6">
            Hire Better with AI
          </h2>
          <p className="text-gray-700 leading-relaxed">
            RecruBotX is the leading AI-powered video interview platform
            designed to streamline the entire recruitment process from screening
            to final selection. With intelligent candidate analysis, automated
            assessments, and real-time evaluation features, RecruBotX empowers HR
            teams to make faster, data-driven hiring decisions.
            <br /><br />
            Our end-to-end system ensures a seamless experience for both recruiters and candidates —
            saving time, reducing bias, and enhancing talent acquisition like never before.
            Whether you're hiring at scale or seeking top talent, RecruBotX is your all-in-one solution
            for smarter, faster, and fairer hiring.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
