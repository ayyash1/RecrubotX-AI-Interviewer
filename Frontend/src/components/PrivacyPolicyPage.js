import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Mail, ChevronDown } from "lucide-react";

const PrivacyPolicyPage = () => {
    const [openSections, setOpenSections] = useState([0]); // First section open by default

    const toggleSection = (index) => {
        setOpenSections(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
    };

    const lastUpdated = "January 15, 2025";

    const sections = [
        {
            title: "1. Introduction",
            content: [
                "Welcome to RecruBotX. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered recruitment platform.",
                "RecruBotX is developed and operated by the team at UET Taxila, Pakistan. By using our services, you agree to the collection and use of information in accordance with this policy."
            ]
        },
        {
            title: "2. Information We Collect",
            content: [
                {
                    heading: "Personal Information", items: [
                        "Name, email address, phone number, and contact details",
                        "Professional information (resume, work history, education, skills)",
                        "Login credentials and account information",
                        "Profile photos and video recordings from AI interviews"
                    ]
                },
                {
                    heading: "Interview Data", items: [
                        "Video recordings of AI interview sessions",
                        "Audio transcriptions and response analysis",
                        "Behavioral and performance metrics from interviews",
                        "Facial expression and emotion analysis data"
                    ]
                },
                {
                    heading: "Technical Information", items: [
                        "IP address, browser type, and device information",
                        "Usage patterns and interaction data",
                        "Cookies and similar tracking technologies",
                        "Log files and analytics data"
                    ]
                },
                {
                    heading: "Recruiter/Employer Data", items: [
                        "Company information and job posting details",
                        "Evaluation criteria and hiring preferences",
                        "Communication records with candidates"
                    ]
                }
            ]
        },
        {
            title: "3. How We Use Your Information",
            content: [
                {
                    heading: "For Candidates", items: [
                        "To facilitate AI-powered video interviews",
                        "To analyze responses and generate candidate reports",
                        "To match candidates with relevant job opportunities",
                        "To provide resume analysis and improvement suggestions",
                        "To communicate about application status and opportunities"
                    ]
                },
                {
                    heading: "For Recruiters/Employers", items: [
                        "To provide CV screening and candidate ranking",
                        "To conduct automated video interviews",
                        "To generate comprehensive candidate evaluation reports",
                        "To manage job postings and applicant tracking",
                        "To provide analytics and hiring insights"
                    ]
                },
                {
                    heading: "General Purposes", items: [
                        "To maintain and improve our platform",
                        "To develop new features and services",
                        "To ensure security and prevent fraud",
                        "To comply with legal obligations",
                        "To communicate important updates and changes"
                    ]
                }
            ]
        },
        {
            title: "4. AI and Automated Decision-Making",
            content: [
                "RecruBotX uses artificial intelligence to analyze interviews and provide candidate assessments. Important things to know:",
                {
                    items: [
                        "Our AI evaluates communication skills, technical knowledge, problem-solving ability, and cultural fit indicators",
                        "AI-generated scores are recommendations, not final hiring decisions",
                        "Human recruiters always make the final hiring decisions",
                        "Our AI is regularly tested and updated to minimize bias",
                        "Candidates can request human review of their AI assessment",
                        "We provide transparency about how AI scores are calculated"
                    ]
                },
                "We are committed to fair and ethical AI use. Our algorithms are designed to evaluate candidates based on job-relevant criteria only, without consideration of protected characteristics."
            ]
        },
        {
            title: "5. Data Sharing and Disclosure",
            content: [
                {
                    heading: "With Employers/Recruiters", items: [
                        "Candidate profiles and interview recordings are shared with the specific employers to whom candidates apply",
                        "This includes AI-generated reports and assessments"
                    ]
                },
                {
                    heading: "Service Providers", items: [
                        "We work with trusted third-party providers for hosting, analytics, payment processing, and email services",
                        "These providers are contractually bound to protect your data"
                    ]
                },
                {
                    heading: "Legal Requirements", items: [
                        "We may disclose information if required by law, court order, or governmental authority",
                        "To protect our rights, privacy, safety, or property"
                    ]
                },
                {
                    heading: "Business Transfers", items: [
                        "In the event of a merger, acquisition, or sale of assets, user data may be transferred to the acquiring entity"
                    ]
                },
                "We do NOT sell your personal information to third parties for marketing purposes."
            ]
        },
        {
            title: "6. Data Retention",
            content: [
                "We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this policy:",
                {
                    items: [
                        "Active accounts: Data is retained while your account is active",
                        "Interview recordings: Typically retained for 12 months after the interview, unless the employer specifies a shorter period",
                        "Application data: Retained for 24 months after the last application activity",
                        "Anonymized analytics: May be retained indefinitely for service improvement"
                    ]
                },
                "You can request deletion of your data at any time, subject to legal retention requirements. Upon account deletion, we will remove or anonymize your personal data within 30 days."
            ]
        },
        {
            title: "7. Data Security",
            content: [
                {
                    heading: "Technical Safeguards", items: [
                        "AES-256 encryption for data at rest",
                        "TLS 1.3 encryption for data in transit",
                        "Regular security audits and penetration testing",
                        "Multi-factor authentication for recruiter accounts",
                        "Role-based access controls"
                    ]
                },
                {
                    heading: "Organizational Measures", items: [
                        "Staff training on data protection",
                        "Access limited to authorized personnel only",
                        "Incident response procedures",
                        "Regular backup and disaster recovery testing"
                    ]
                },
                "While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but are committed to industry best practices."
            ]
        },
        {
            title: "8. Your Rights and Choices",
            content: [
                "Depending on your location, you may have the following rights:",
                {
                    items: [
                        "Access: Request a copy of the personal data we hold about you",
                        "Correction: Request correction of inaccurate or incomplete data",
                        "Deletion: Request deletion of your personal data",
                        "Portability: Request your data in a portable, machine-readable format",
                        "Objection: Object to certain processing of your data",
                        "Restriction: Request restriction of processing in certain circumstances",
                        "Withdraw Consent: Withdraw consent where processing is based on consent"
                    ]
                },
                "To exercise these rights, contact us at recrubotx@uettaxila.edu.pk. We will respond within 30 days."
            ]
        },
        {
            title: "9. Cookies and Tracking",
            content: [
                "We use cookies and similar technologies to enhance your experience:",
                {
                    items: [
                        "Essential Cookies: Required for platform functionality (login, security)",
                        "Analytics Cookies: Help us understand how users interact with our platform",
                        "Preference Cookies: Remember your settings and preferences"
                    ]
                },
                "You can manage cookie preferences through your browser settings. Disabling certain cookies may affect platform functionality."
            ]
        },
        {
            title: "10. International Data Transfers",
            content: [
                "RecruBotX is based in Pakistan. If you access our services from other countries, your data may be transferred to and processed in Pakistan or other countries where our service providers are located.",
                "We ensure appropriate safeguards are in place for international transfers, including compliance with applicable data protection laws and standard contractual clauses where required."
            ]
        },
        {
            title: "11. Children's Privacy",
            content: [
                "RecruBotX is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately at recrubotx@uettaxila.edu.pk."
            ]
        },
        {
            title: "12. Changes to This Policy",
            content: [
                "We may update this Privacy Policy from time to time. We will notify you of significant changes by:",
                {
                    items: [
                        "Posting a notice on our platform",
                        "Sending an email to registered users",
                        "Updating the \"Last Updated\" date at the top of this policy"
                    ]
                },
                "We encourage you to review this policy periodically. Continued use of our services after changes constitutes acceptance of the updated policy."
            ]
        },
        {
            title: "13. Contact Us",
            content: [
                "If you have questions about this Privacy Policy or our data practices, please contact us:",
                {
                    heading: "RecruBotX", items: [
                        "UET Taxila, Rawalpindi",
                        "Punjab, Pakistan",
                        "Email: recrubotx@uettaxila.edu.pk"
                    ]
                },
                "For privacy-specific inquiries, please include \"Privacy\" in your subject line."
            ]
        }
    ];

    const renderContent = (content) => {
        return content.map((item, idx) => {
            if (typeof item === 'string') {
                return <p key={idx} className="text-gray-600 leading-relaxed mb-3">{item}</p>;
            } else if (item.heading) {
                return (
                    <div key={idx} className="mb-4">
                        <h4 className="font-semibold text-[#0a2a5e] mb-2">{item.heading}</h4>
                        <ul className="space-y-1.5 ml-4">
                            {item.items.map((listItem, listIdx) => (
                                <li key={listIdx} className="text-gray-600 text-sm flex items-start gap-2">
                                    <span className="text-[#0a2a5e] mt-1.5">•</span>
                                    <span>{listItem}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            } else if (item.items) {
                return (
                    <ul key={idx} className="space-y-1.5 ml-4 mb-3">
                        {item.items.map((listItem, listIdx) => (
                            <li key={listIdx} className="text-gray-600 text-sm flex items-start gap-2">
                                <span className="text-[#0a2a5e] mt-1.5">•</span>
                                <span>{listItem}</span>
                            </li>
                        ))}
                    </ul>
                );
            }
            return null;
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="py-12 md:py-16 px-4 bg-gradient-to-br from-[#0a1f44] via-[#0a2a5e] to-[#1a3a6e] text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div {...fadeInUp}>
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-blue-200/80">
                            Last updated: {lastUpdated}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 md:py-16 px-4">
                <div className="max-w-3xl mx-auto">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-[#0a2a5e] hover:underline mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>

                    <div className="space-y-3">
                        {sections.map((section, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.03 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleSection(index)}
                                    className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                                >
                                    <h2 className="font-semibold text-[#0a2a5e]">{section.title}</h2>
                                    <motion.div
                                        animate={{ rotate: openSections.includes(index) ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    </motion.div>
                                </button>

                                <AnimatePresence>
                                    {openSections.includes(index) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="px-6 pb-5 border-t border-gray-100 pt-4">
                                                {renderContent(section.content)}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>

                    {/* Contact Card */}
                    <motion.div
                        {...fadeInUp}
                        className="mt-8 bg-gradient-to-br from-[#0a2a5e] to-[#1a4a8e] rounded-xl p-6 text-white text-center"
                    >
                        <Mail className="w-8 h-8 mx-auto mb-3 opacity-80" />
                        <h3 className="font-semibold mb-2">Questions about your privacy?</h3>
                        <p className="text-blue-200 text-sm mb-4">
                            Contact our team for any privacy-related inquiries
                        </p>
                        <a
                            href="mailto:recrubotx@uettaxila.edu.pk"
                            className="inline-flex items-center gap-2 bg-white text-[#0a2a5e] px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            recrubotx@uettaxila.edu.pk
                        </a>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPolicyPage;
