import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 md:py-16 px-4 sm:px-6">
      <motion.div
        className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6 sm:p-8 md:p-10"
        {...fadeInUp}
      >
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 md:mb-6 text-center">
          Get in Touch
        </h2>
        <p className="text-center text-gray-600 mb-8 md:mb-12 text-sm md:text-base max-w-2xl mx-auto">
          Have questions or need help? Fill out the form below and our team will
          get back to you shortly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {/* Contact Info */}
          <div className="order-2 md:order-1">
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">
              Contact Information
            </h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#0a2a5e] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <a
                    href="mailto:recrubotx@uettaxila.edu.pk"
                    className="text-sm md:text-base text-[#0a2a5e] font-medium hover:underline"
                  >
                    recrubotx@uettaxila.edu.pk
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#0a2a5e] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <a
                    href="tel:+925119232333"
                    className="text-sm md:text-base text-[#0a2a5e] font-medium hover:underline"
                  >
                    +92 51 9232333
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-[#0a2a5e] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm md:text-base text-gray-800">
                    UET Taxila, Rawalpindi<br />
                    Punjab, Pakistan
                  </p>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="mt-6 md:mt-8 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-800 mb-2 text-sm md:text-base">Office Hours</h4>
              <p className="text-xs md:text-sm text-gray-600">
                Monday - Friday: 9:00 AM - 5:00 PM (PKT)<br />
                Saturday - Sunday: Closed
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <form className="space-y-4 md:space-y-5 order-1 md:order-2">
            <div>
              <label className="block text-gray-700 mb-1 text-sm md:text-base">Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-4 py-2.5 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2a5e] focus:border-transparent text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm md:text-base">Email</label>
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-2.5 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2a5e] focus:border-transparent text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm md:text-base">Subject</label>
              <input
                type="text"
                placeholder="How can we help?"
                className="w-full px-4 py-2.5 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2a5e] focus:border-transparent text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm md:text-base">Message</label>
              <textarea
                placeholder="Write your message here..."
                rows="4"
                className="w-full px-4 py-2.5 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2a5e] focus:border-transparent resize-none text-sm md:text-base"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-[#0a2a5e] text-white py-3 rounded-lg hover:bg-[#0a1f44] transition flex items-center justify-center gap-2 font-medium"
            >
              <Send className="w-4 h-4" />
              Send Message
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;
