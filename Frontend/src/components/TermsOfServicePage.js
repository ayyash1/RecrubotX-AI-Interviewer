import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, ArrowLeft, Mail, ChevronDown } from "lucide-react";

const TermsOfServicePage = () => {
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
            title: "1. Acceptance of Terms",
            content: [
                "By accessing or using RecruBotX (\"the Platform,\" \"our Service\"), you agree to be bound by these Terms of Service (\"Terms\"). If you disagree with any part of these terms, you may not access or use our services.",
                "These Terms apply to all visitors, users, candidates, and recruiters who access or use RecruBotX. By creating an account, you represent that you are at least 18 years old and have the legal capacity to enter into this agreement.",
                "RecruBotX is provided by the development team at UET Taxila, Pakistan."
            ]
        },
        {
            title: "2. Description of Service",
            content: [
                "RecruBotX is an AI-powered recruitment platform that provides:",
                {
                    heading: "For Candidates", items: [
                        "AI-conducted video interviews",
                        "Resume analysis and improvement suggestions",
                        "Job vacancy tracking",
                        "Resume builder tools"
                    ]
                },
                {
                    heading: "For Recruiters/Employers", items: [
                        "Automated CV screening and ranking",
                        "AI video interview scheduling and conducting",
                        "Candidate evaluation reports",
                        "Applicant tracking system features",
                        "Analytics and hiring insights"
                    ]
                },
                "We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time without prior notice."
            ]
        },
        {
            title: "3. Account Registration and Security",
            content: [
                {
                    heading: "Account Creation", items: [
                        "You must provide accurate, current, and complete information during registration",
                        "You are responsible for maintaining the confidentiality of your account credentials",
                        "You must notify us immediately of any unauthorized use of your account"
                    ]
                },
                {
                    heading: "Account Responsibilities", items: [
                        "You are solely responsible for all activities under your account",
                        "You may not share your account with others",
                        "You may not create multiple accounts without authorization",
                        "We reserve the right to suspend or terminate accounts that violate these Terms"
                    ]
                },
                {
                    heading: "Recruiter/Employer Accounts", items: [
                        "Company accounts must be registered by authorized representatives",
                        "You represent that you have authority to bind your organization to these Terms"
                    ]
                }
            ]
        },
        {
            title: "4. User Conduct and Prohibited Activities",
            content: [
                "You agree NOT to engage in the following:",
                {
                    heading: "General Prohibitions", items: [
                        "Violate any applicable laws or regulations",
                        "Impersonate any person or entity",
                        "Provide false, misleading, or fraudulent information",
                        "Interfere with or disrupt the Service or servers",
                        "Attempt to gain unauthorized access to any part of the Platform",
                        "Use the Service for any unlawful purpose"
                    ]
                },
                {
                    heading: "Interview-Specific Prohibitions", items: [
                        "Have another person complete interviews on your behalf",
                        "Use unauthorized assistance, scripts, or prompts during interviews",
                        "Record, distribute, or share interview content without authorization",
                        "Manipulate or attempt to deceive the AI evaluation system"
                    ]
                },
                {
                    heading: "Platform Integrity", items: [
                        "Attempt to reverse engineer, decompile, or copy any software",
                        "Use automated tools, bots, or scrapers without authorization",
                        "Circumvent any security or access controls",
                        "Interfere with other users' use of the Service"
                    ]
                }
            ]
        },
        {
            title: "5. Candidate Terms",
            content: [
                {
                    heading: "Interview Consent", items: [
                        "Video and audio recording of your interview session",
                        "AI analysis of your responses, expressions, and behavior",
                        "Sharing of your interview data and reports with the prospective employer"
                    ]
                },
                "By participating in an AI interview through RecruBotX, you consent to the above.",
                {
                    heading: "Accuracy of Information", items: [
                        "You represent that all information you provide is accurate and truthful",
                        "Your resume and application materials are your own work",
                        "You are authorized to share any information included in your application"
                    ]
                },
                {
                    heading: "Interview Integrity", items: [
                        "You will complete interviews independently and honestly",
                        "You will not use prohibited assistance or attempt to deceive the system",
                        "You understand that integrity violations may result in disqualification"
                    ]
                }
            ]
        },
        {
            title: "6. Recruiter/Employer Terms",
            content: [
                {
                    heading: "Lawful Use", items: [
                        "You will use RecruBotX only for lawful recruitment purposes",
                        "You will comply with all applicable employment and anti-discrimination laws",
                        "You will not use candidate data for purposes other than hiring evaluation"
                    ]
                },
                {
                    heading: "Fair Hiring Practices", items: [
                        "You acknowledge that AI evaluations are recommendations, not hiring decisions",
                        "You remain responsible for final hiring decisions and their compliance with law",
                        "You will not use the Platform to discriminate based on protected characteristics"
                    ]
                },
                {
                    heading: "Data Handling", items: [
                        "You will maintain appropriate confidentiality of candidate information",
                        "You will only share candidate data with authorized personnel",
                        "You will comply with data protection requirements in your jurisdiction"
                    ]
                },
                {
                    heading: "Job Postings", items: [
                        "All job postings must be for legitimate, existing positions",
                        "Descriptions must be accurate and not misleading",
                        "You may not post positions that violate any laws"
                    ]
                }
            ]
        },
        {
            title: "7. AI Evaluation and Automated Processing",
            content: [
                {
                    heading: "Understanding AI Assessments", items: [
                        "Our AI provides evaluations based on algorithms trained on recruitment data",
                        "AI scores are recommendations to assist hiring decisions",
                        "No AI system is perfect; human judgment should be applied",
                        "AI evaluations should not be the sole basis for hiring decisions"
                    ]
                },
                {
                    heading: "Bias and Fairness", items: [
                        "We design our AI to minimize bias, but no system is entirely bias-free",
                        "Recruiters are responsible for identifying potential bias in their hiring processes",
                        "We provide tools to analyze hiring patterns and identify potential issues"
                    ]
                },
                {
                    heading: "Limitations", items: [
                        "AI cannot assess all aspects of a candidate's suitability",
                        "Technical issues may affect interview quality or evaluation accuracy",
                        "Results should be considered alongside other hiring methods"
                    ]
                }
            ]
        },
        {
            title: "8. Intellectual Property",
            content: [
                {
                    heading: "Our Property", items: [
                        "RecruBotX and all associated technology, content, and branding are our property",
                        "You may not copy, modify, or create derivative works without permission",
                        "Our trademarks may not be used without prior written consent"
                    ]
                },
                {
                    heading: "Your Content", items: [
                        "You retain ownership of content you upload (resumes, videos, etc.)",
                        "By uploading content, you grant us a license to use it for providing our services",
                        "This license includes processing, storing, and sharing with relevant employers"
                    ]
                },
                {
                    heading: "Feedback", items: [
                        "Any suggestions or feedback you provide may be used without obligation to you"
                    ]
                }
            ]
        },
        {
            title: "9. Payment Terms",
            content: [
                {
                    heading: "Subscription Plans", items: [
                        "Pricing and features are as described on our website at the time of purchase",
                        "Subscriptions auto-renew unless cancelled before the renewal date",
                        "Changes to pricing will be communicated in advance"
                    ]
                },
                {
                    heading: "Billing", items: [
                        "You authorize us to charge your designated payment method",
                        "All fees are non-refundable except as expressly stated or required by law",
                        "You are responsible for any taxes applicable to your use of the Service"
                    ]
                },
                {
                    heading: "Cancellation", items: [
                        "You may cancel your subscription at any time through your account settings",
                        "Cancellation takes effect at the end of the current billing period",
                        "No partial refunds are provided for unused portions of billing periods"
                    ]
                }
            ]
        },
        {
            title: "10. Disclaimers and Limitations of Liability",
            content: [
                {
                    heading: "\"As Is\" Service", items: [
                        "THE SERVICE IS PROVIDED \"AS IS\" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED",
                        "WE DISCLAIM ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT"
                    ]
                },
                {
                    heading: "No Guarantee of Results", items: [
                        "We do not guarantee any particular hiring outcomes",
                        "AI evaluations are tools to assist, not replace, human judgment",
                        "We are not responsible for hiring decisions made using our Platform"
                    ]
                },
                {
                    heading: "Limitation of Liability", items: [
                        "TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES",
                        "This includes loss of profits, data, or goodwill, regardless of the cause of action",
                        "Our total liability shall not exceed the amount paid by you for the Service in the twelve (12) months preceding the claim"
                    ]
                }
            ]
        },
        {
            title: "11. Indemnification",
            content: [
                "You agree to indemnify, defend, and hold harmless RecruBotX, its team members, and affiliates from any claims, damages, losses, and expenses (including legal fees) arising from:",
                {
                    items: [
                        "Your use of the Service",
                        "Your violation of these Terms",
                        "Your violation of any rights of third parties",
                        "Content you submit or transmit through the Platform",
                        "Your hiring decisions or employment practices"
                    ]
                }
            ]
        },
        {
            title: "12. Termination",
            content: [
                {
                    heading: "Termination by You", items: [
                        "You may terminate your account at any time by contacting us or using account settings"
                    ]
                },
                {
                    heading: "Termination by Us", items: [
                        "We may suspend or terminate your account if you violate these Terms",
                        "Your use poses a security risk",
                        "Required by law",
                        "We discontinue the Service"
                    ]
                },
                {
                    heading: "Effect of Termination", items: [
                        "Your right to use the Service ends immediately",
                        "Provisions that should survive termination will remain in effect",
                        "We may retain certain data as required by law or for legitimate business purposes"
                    ]
                }
            ]
        },
        {
            title: "13. Dispute Resolution",
            content: [
                {
                    heading: "Governing Law", items: [
                        "These Terms are governed by the laws of Pakistan"
                    ]
                },
                {
                    heading: "Informal Resolution", items: [
                        "Before filing any formal claim, you agree to try resolving disputes informally by contacting us at recrubotx@uettaxila.edu.pk"
                    ]
                },
                {
                    heading: "Jurisdiction", items: [
                        "Any legal proceedings will be conducted in the courts of Rawalpindi, Punjab, Pakistan"
                    ]
                },
                {
                    heading: "Class Action Waiver", items: [
                        "You agree to resolve disputes individually and waive any right to participate in class actions"
                    ]
                }
            ]
        },
        {
            title: "14. Changes to Terms",
            content: [
                "We may update these Terms from time to time. We will notify you of material changes by:",
                {
                    items: [
                        "Posting a notice on the Platform",
                        "Sending an email to registered users",
                        "Updating the \"Last Updated\" date"
                    ]
                },
                "Your continued use after changes constitutes acceptance. If you disagree with updated Terms, you must stop using the Service."
            ]
        },
        {
            title: "15. General Provisions",
            content: [
                {
                    heading: "Entire Agreement", items: [
                        "These Terms constitute the entire agreement between you and RecruBotX regarding the Service"
                    ]
                },
                {
                    heading: "Severability", items: [
                        "If any provision is found unenforceable, the remaining provisions remain in effect"
                    ]
                },
                {
                    heading: "No Waiver", items: [
                        "Failure to enforce any right does not waive future enforcement"
                    ]
                },
                {
                    heading: "Assignment", items: [
                        "You may not assign these Terms. We may assign our rights without restriction"
                    ]
                }
            ]
        },
        {
            title: "16. Contact Information",
            content: [
                "For questions about these Terms of Service:",
                {
                    heading: "RecruBotX", items: [
                        "UET Taxila, Rawalpindi",
                        "Punjab, Pakistan",
                        "Email: recrubotx@uettaxila.edu.pk"
                    ]
                },
                "For legal inquiries, please include \"Legal\" in your subject line."
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
                            <FileText className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                            Terms of Service
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
                        <h3 className="font-semibold mb-2">Questions about our Terms?</h3>
                        <p className="text-blue-200 text-sm mb-4">
                            Contact our team for any legal inquiries
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

export default TermsOfServicePage;
