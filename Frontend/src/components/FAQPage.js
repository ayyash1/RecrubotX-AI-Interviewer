import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
    ChevronDown,
    HelpCircle,
    MessageCircle,
    Search,
    Users,
    Shield,
    CreditCard,
    Settings,
    Video,
    FileText
} from "lucide-react";

const FAQPage = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [activeCategory, setActiveCategory] = useState("all");

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
    };

    const categories = [
        { id: "all", label: "All Questions", icon: HelpCircle },
        { id: "general", label: "General", icon: Search },
        { id: "candidates", label: "For Candidates", icon: Users },
        { id: "recruiters", label: "For Recruiters", icon: Settings },
        { id: "interviews", label: "AI Interviews", icon: Video },
        { id: "security", label: "Security & Privacy", icon: Shield },
        { id: "billing", label: "Billing", icon: CreditCard },
    ];

    const faqs = [
        {
            category: "general",
            q: "What is RecruBotX?",
            a: "RecruBotX is an AI-powered recruitment platform that automates the entire hiring process. From CV screening and interview scheduling to conducting AI video interviews and providing detailed candidate evaluations, RecruBotX helps HR teams hire faster, smarter, and without bias. Our platform uses advanced natural language processing and emotion analysis to assess candidates objectively."
        },
        {
            category: "general",
            q: "How does RecruBotX differ from traditional recruitment software?",
            a: "Unlike traditional ATS (Applicant Tracking Systems) that simply manage applications, RecruBotX actively participates in the hiring process. Our AI conducts video interviews, analyzes candidate responses in real-time, evaluates communication skills, body language, and emotional intelligence, and provides comprehensive scoring reports. This means recruiters spend less time screening and more time making strategic hiring decisions."
        },
        {
            category: "general",
            q: "Is RecruBotX suitable for companies of all sizes?",
            a: "Yes! RecruBotX is designed to scale with your needs. Small businesses can use our Basic plan for up to 50 candidates per month, while enterprise organizations can handle unlimited candidates with custom workflows. Whether you're hiring 5 people a year or 5,000, RecruBotX adapts to your requirements."
        },
        {
            category: "candidates",
            q: "How do I prepare for an AI interview?",
            a: "Preparing for a RecruBotX AI interview is similar to preparing for any professional interview. Ensure you're in a quiet, well-lit environment with a stable internet connection. Test your camera and microphone beforehand. Dress professionally and speak clearly. Our AI is designed to make you feel comfortable – it will guide you through each question and give you time to think before responding."
        },
        {
            category: "candidates",
            q: "Can I retake the AI interview if I make a mistake?",
            a: "This depends on the employer's settings. Some companies allow candidates to re-record responses within the interview session, while others prefer one-take recordings for authenticity. You'll be informed of the specific rules before starting your interview. Don't worry about minor mistakes – our AI evaluates your overall performance, not individual slip-ups."
        },
        {
            category: "candidates",
            q: "How is my interview data used and stored?",
            a: "Your interview recordings and data are securely stored and only accessible to the hiring organization. We use enterprise-grade encryption and comply with GDPR and other data protection regulations. Your data is never sold to third parties or used for any purpose other than the specific job vacancy. You can request deletion of your data at any time."
        },
        {
            category: "candidates",
            q: "What happens after I complete my AI interview?",
            a: "Once you complete your interview, our AI analyzes your responses and generates a comprehensive report for the recruiter. This includes scores for communication, technical knowledge, problem-solving, and cultural fit. The recruiter will then review your application and contact you directly about next steps. You'll typically hear back within 3-7 business days."
        },
        {
            category: "recruiters",
            q: "How do I set up interview questions for a job posting?",
            a: "Setting up interviews is simple. When creating a job posting, you can either select from our library of pre-built questions tailored to various roles and industries, or create custom questions specific to your needs. You can also let our AI generate relevant questions based on the job description. Each question can be weighted differently based on importance."
        },
        {
            category: "recruiters",
            q: "Can I customize the AI interviewer's behavior?",
            a: "Absolutely! You can customize the AI's tone (formal/conversational), the types of follow-up questions it asks, time limits for responses, and evaluation criteria. Enterprise customers can even add custom branding and have the AI mention specific company values or culture points during the interview."
        },
        {
            category: "recruiters",
            q: "How accurate is the AI evaluation?",
            a: "Our AI evaluation has been trained on millions of interview samples and achieves over 90% correlation with human interviewer assessments. However, we always recommend using AI scores as one component of your decision-making process, not the sole factor. The detailed reports help you identify candidates worth interviewing further, saving significant time in initial screening."
        },
        {
            category: "interviews",
            q: "What technology powers the AI interviews?",
            a: "RecruBotX uses a combination of advanced technologies: Natural Language Processing (NLP) for understanding and evaluating verbal responses, Computer Vision for analyzing facial expressions and body language, Speech Recognition for accurate transcription, and Machine Learning models trained specifically for recruitment contexts. All processing happens in real-time during the interview."
        },
        {
            category: "interviews",
            q: "Can the AI detect if someone is cheating or reading from notes?",
            a: "Yes, our AI can detect various integrity signals including unusual eye movements (suggesting reading from a screen), inconsistent audio patterns, and response timing anomalies. While we flag these behaviors rather than automatically disqualifying candidates, recruiters receive this information to make informed decisions. Our goal is ensuring fair evaluation for all candidates."
        },
        {
            category: "interviews",
            q: "What happens if there's a technical issue during the interview?",
            a: "If you experience technical issues (internet drops, browser crashes), don't panic. Our system automatically saves your progress. You can resume from where you left off within a specified time window. If issues persist, candidates can request a new interview link through the system, and recruiters are notified of any technical disruptions."
        },
        {
            category: "security",
            q: "Is RecruBotX GDPR compliant?",
            a: "Yes, RecruBotX is fully GDPR compliant. We provide data processing agreements, support data subject rights (access, deletion, portability), maintain detailed processing records, and have appointed a Data Protection Officer. Our infrastructure is hosted on secure, certified data centers with regular security audits."
        },
        {
            category: "security",
            q: "How is candidate data protected?",
            a: "We implement multiple layers of security: AES-256 encryption for data at rest, TLS 1.3 for data in transit, regular penetration testing, multi-factor authentication for recruiter accounts, role-based access controls, and comprehensive audit logs. Video recordings are stored separately from personal identifiable information and can be auto-deleted after configurable periods."
        },
        {
            category: "security",
            q: "Can hiring decisions be audited for bias?",
            a: "Yes! RecruBotX includes built-in bias detection and reporting tools. You can analyze hiring patterns across demographics, identify potential bias in AI scoring, and generate compliance reports. Our AI is regularly tested for bias using diverse datasets, and we continuously update our models to minimize any unintended discrimination."
        },
        {
            category: "billing",
            q: "What payment methods do you accept?",
            a: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans. Enterprise customers can arrange custom billing arrangements including purchase orders and net-30/60 payment terms. All transactions are processed securely through our PCI-compliant payment providers."
        },
        {
            category: "billing",
            q: "Can I upgrade or downgrade my plan at any time?",
            a: "Yes, you can change your plan at any time. Upgrades take effect immediately, and you'll be charged a prorated amount for the remainder of your billing cycle. Downgrades take effect at the start of your next billing cycle. You won't lose any data when changing plans, though some features may become unavailable on lower tiers."
        },
        {
            category: "billing",
            q: "Is there a free trial available?",
            a: "Yes! We offer a 14-day free trial with full access to all Professional plan features. No credit card is required to start your trial. You can conduct up to 20 AI interviews during the trial period. At the end of the trial, you can choose to subscribe or your account will automatically convert to our limited free tier."
        }
    ];

    const filteredFaqs = activeCategory === "all"
        ? faqs
        : faqs.filter(faq => faq.category === activeCategory);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="py-16 md:py-20 px-4 bg-gradient-to-br from-[#0a1f44] via-[#0a2a5e] to-[#1a3a6e] text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div {...fadeInUp}>
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <HelpCircle className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-lg text-blue-200/80 max-w-2xl mx-auto">
                            Everything you need to know about RecruBotX. Can't find your answer? Contact our support team.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-8 px-4 border-b border-gray-200 bg-white sticky top-0 z-40">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id
                                        ? "bg-[#0a2a5e] text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                <cat.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ List */}
            <section className="py-12 md:py-16 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="space-y-4">
                        {filteredFaqs.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                    className="w-full text-left px-6 py-5 flex items-start justify-between gap-4"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <FileText className="w-4 h-4 text-[#0a2a5e]" />
                                        </div>
                                        <span className="font-medium text-gray-900">{item.q}</span>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: openIndex === i ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex-shrink-0 mt-1"
                                    >
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
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
                                            <div className="px-6 pb-5 pt-0">
                                                <div className="pl-12 border-l-2 border-blue-100 ml-4">
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
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-12 md:py-16 px-4">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        {...fadeInUp}
                        className="bg-gradient-to-br from-[#0a1f44] via-[#0a2a5e] to-[#1a3a6e] rounded-2xl p-8 text-center text-white"
                    >
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
                        <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
                        <p className="text-blue-200/80 mb-6">
                            Our support team is here to help you get started
                        </p>
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 bg-white text-[#0a2a5e] px-6 py-3 rounded-xl font-medium hover:bg-blue-50 transition-colors"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Contact Support
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default FAQPage;
