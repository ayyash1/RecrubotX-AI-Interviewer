import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, Star, ArrowRight, Zap, Building2, Crown } from "lucide-react";

// ✅ Minimal Button Component
const Button = ({ children, className = "", asChild, ...props }) => {
  const Comp = asChild ? Link : "button";
  return (
    <Comp
      className={`inline-flex items-center justify-center rounded-lg font-medium transition px-5 py-3 ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
};

// ✅ Minimal Card Component
const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl border bg-white shadow-md hover:shadow-lg transition ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 pt-8 pb-4 ${className}`}>{children}</div>
);
const CardContent = ({ children, className = "" }) => (
  <div className={`px-6 pb-8 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-2xl font-semibold ${className}`}>{children}</h3>
);

const PricingPage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.15 } },
  };

  const plans = [
    {
      name: "Basic",
      price: "$99",
      period: "per month",
      description: "Perfect for small teams getting started",
      icon: Zap,
      features: [
        "Up to 50 candidates per month",
        "Basic AI CV screening",
        "Standard interview templates",
        "Email support",
        "Basic analytics dashboard",
        "Single user account",
      ],
      notIncluded: [
        "Custom interview questions",
        "Advanced analytics",
        "API access",
        "White-label branding",
      ],
      popular: false,
      cta: "Start Basic Plan",
    },
    {
      name: "Professional",
      price: "$299",
      period: "per month",
      description: "Ideal for growing companies",
      icon: Building2,
      features: [
        "Up to 200 candidates per month",
        "Advanced AI CV screening",
        "Custom interview templates",
        "Priority email & chat support",
        "Advanced analytics & reports",
        "Up to 5 user accounts",
        "Facial expression analysis",
        "Custom scoring criteria",
        "Calendar integration",
      ],
      notIncluded: ["API access", "White-label branding"],
      popular: true,
      cta: "Start Professional Plan",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large organizations with custom needs",
      icon: Crown,
      features: [
        "Unlimited candidates",
        "Full AI suite access",
        "Custom interview workflows",
        "24/7 dedicated support",
        "White-label branding",
        "API access & integrations",
        "Unlimited user accounts",
        "Custom analytics & reporting",
        "SAML/SSO integration",
        "Dedicated account manager",
        "Custom training & onboarding",
      ],
      notIncluded: [],
      popular: false,
      cta: "Contact Sales",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-100/50 to-blue-50">
        <div className="max-w-3xl mx-auto text-center px-6">
          <motion.div {...fadeInUp}>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Choose the plan that fits your hiring needs. Start with a free trial
              and scale as you grow.
            </p>
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-5 py-2 rounded-full">
              <Star className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">
                14-day free trial • No credit card required
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {plans.map((plan) => (
              <motion.div key={plan.name} variants={fadeInUp}>
                <Card
                  className={`h-full relative flex flex-col ${plan.popular ? "ring-2 ring-blue-500 shadow-xl" : ""
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <div
                      className={`w-14 h-14 mx-auto mb-6 rounded-lg flex items-center justify-center ${plan.popular ? "bg-blue-500" : "bg-blue-400"
                        }`}
                    >
                      <plan.icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-gray-900">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-4 mb-2">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      <span className="text-gray-500 ml-2">{plan.period}</span>
                    </div>
                    <p className="text-gray-600">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start space-x-3">
                          <Check
                            className="w-5 h-5 text-green-500 mt-1"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                      {plan.notIncluded.map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-start space-x-3 opacity-60"
                        >
                          <X
                            className="w-5 h-5 text-gray-400 mt-1"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-gray-500">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-8">
                      <Button
                        className={`w-full py-3 text-lg ${plan.popular
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        asChild
                      >
                        <Link
                          to={
                            plan.name === "Enterprise"
                              ? "/contact"
                              : "/recruiter/signup"
                          }
                        >
                          {plan.cta}
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
