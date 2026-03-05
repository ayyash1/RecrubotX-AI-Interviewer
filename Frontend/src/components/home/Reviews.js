import React from "react";
import { motion } from "framer-motion";
import { Star, Quote, Building2 } from "lucide-react";

// Utility for merging classNames
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// ✅ Card Components
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border bg-white text-gray-900 shadow-lg hover:shadow-2xl transition-all duration-500",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-7", className)} {...props} />
));
CardContent.displayName = "CardContent";

// Star rating component
const StarRating = ({ rating = 5 }) => (
  <div className="flex gap-1">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={cn(
          "w-5 h-5 transition-colors",
          i < rating ? "text-amber-400 fill-amber-400" : "text-gray-200"
        )}
      />
    ))}
  </div>
);

// ✅ Reviews Section
const Reviews = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "VP of Talent",
      company: "TechCorp",
      review:
        "RecruBotX reduced our hiring time by 30% while improving candidate quality. The AI-powered screening is incredibly accurate and saves our team countless hours.",
      rating: 5,
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      name: "David Smith",
      role: "Recruitment Lead",
      company: "Innovate Ltd",
      review:
        "A seamless and efficient process. The video interview analysis provides insights we never had before. Highly recommended for any growing team!",
      rating: 5,
      gradient: "from-violet-500 to-purple-500",
    },
    {
      name: "Emily Johnson",
      role: "HR Director",
      company: "HealthPlus",
      review:
        "The platform made hiring so much easier for our team. From scheduling to evaluation, everything is automated. We've seen a 50% reduction in time-to-hire!",
      rating: 5,
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <section className="relative w-full py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-indigo-100/50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Heading */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 border border-amber-200 rounded-full text-amber-700 text-sm font-medium mb-4">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            Customer Reviews
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Clients Say
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of companies transforming their hiring process
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
            >
              <Card className="h-full relative overflow-hidden group">
                {/* Gradient accent top */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${t.gradient}`}
                />

                {/* Quote icon */}
                <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <Quote className="w-16 h-16 text-blue-600" />
                </div>

                <CardContent className="flex flex-col h-full">
                  {/* Stars */}
                  <div className="mb-4">
                    <StarRating rating={t.rating} />
                  </div>

                  {/* Review */}
                  <p className="text-gray-700 leading-relaxed mb-6 flex-grow">
                    "{t.review}"
                  </p>

                  {/* Author info */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{t.role}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {t.company}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Hover glow effect */}
                <div
                  className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br ${t.gradient} opacity-0 group-hover:opacity-5 rounded-full blur-2xl transition-opacity duration-500`}
                />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust badges with horizontal scroll */}
        <motion.div
          className="mt-16 pt-8 border-t border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {/* Static heading */}
          <p className="text-gray-500 font-small text-center mb-10">
            Trusted by leading companies:
          </p>

          {/* Infinite scroll container */}
          <div className="relative overflow-hidden">
            {/* Gradient masks for smooth fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

            {/* Scrolling track */}
            <div className="flex animate-scroll-x">
              {/* First set of companies */}
              {[
                "TechCorp", "Innovate", "HealthPlus", "GlobalFinance", "RetailMax",
                "CloudSoft", "DataSync", "NetVision", "CyberEdge", "Quantico",
                "Bluepoint", "NovaTech"
              ].map((company, i) => (
                <div
                  key={`first-${i}`}
                  className="flex-shrink-0 mx-3 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 font-medium text-sm shadow-sm hover:shadow-lg hover:border-blue-300 hover:text-blue-600 transition-all duration-300 cursor-default"
                >
                  {company}
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {[
                "TechCorp", "Innovate", "HealthPlus", "GlobalFinance", "RetailMax",
                "CloudSoft", "DataSync", "NetVision", "CyberEdge", "Quantico",
                "Bluepoint", "NovaTech"
              ].map((company, i) => (
                <div
                  key={`second-${i}`}
                  className="flex-shrink-0 mx-3 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 font-medium text-sm shadow-sm hover:shadow-lg hover:border-blue-300 hover:text-blue-600 transition-all duration-300 cursor-default"
                >
                  {company}
                </div>
              ))}
            </div>
          </div>

          {/* CSS Animation */}
          <style>{`
            @keyframes scroll-x {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            .animate-scroll-x {
              animation: scroll-x 25s linear infinite;
            }
            .animate-scroll-x:hover {
              animation-play-state: paused;
            }
          `}</style>
        </motion.div>
      </div>
    </section>
  );
};

export default Reviews;
