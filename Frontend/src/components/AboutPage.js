import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    Target,
    Users,
    Award,
    Lightbulb,
    Heart,
    Shield,
    ArrowRight,
    MapPin,
    Mail,
    Linkedin,
    Twitter,
    Github
} from "lucide-react";

// Team member images
import mentorImg from "../assets/images/team/mentor.png";
import mirzanImg from "../assets/images/team/mirzan.png";
import ayyashImg from "../assets/images/team/ayyash.png";
import fathimaImg from "../assets/images/team/fathima.png";

const AboutPage = () => {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
    };

    const values = [
        {
            icon: Lightbulb,
            title: "Innovation",
            description: "We constantly push the boundaries of AI technology to create smarter, more efficient hiring solutions.",
            color: "from-amber-400 to-orange-500"
        },
        {
            icon: Heart,
            title: "Fairness",
            description: "Our AI is designed to eliminate bias and ensure every candidate gets an equal opportunity to succeed.",
            color: "from-rose-400 to-pink-500"
        },
        {
            icon: Shield,
            title: "Trust",
            description: "We prioritize data security and privacy, building trust with both employers and candidates.",
            color: "from-emerald-400 to-teal-500"
        },
        {
            icon: Users,
            title: "Collaboration",
            description: "We believe in working closely with HR teams to understand and solve their unique challenges.",
            color: "from-blue-400 to-indigo-500"
        }
    ];

    const team = [
        {
            name: "Dr. Naveed Khan Baloch",
            role: "Project Mentor",
            description: "Guiding the team with expertise in AI, machine learning, and software engineering. Providing invaluable mentorship and technical direction for RecruBotX.",
            department: "Assistant Professor, Department of Computer Engineering",
            institution: "UET Taxila",
            color: "from-[#0a2a5e] to-[#1a4a8e]",
            image: mentorImg,
            isMentor: true
        },
        {
            name: "Mohammed Mirzan",
            role: "AI & Data Engineer",
            description: "Architecting the backend infrastructure and integrating large language models for intelligent interview conversations.",
            color: "from-blue-500 to-indigo-600",
            image: mirzanImg
        },
        {
            name: "Ahamed Ayyash",
            role: "AI & Computer Vision Engineer",
            description: "Developed an AI-powered intelligent interviewer system integrating advanced facial expression analysis and real-time emotion detection to enable comprehensive, data-driven candidate evaluation.",
            color: "from-emerald-500 to-teal-600",
            image: ayyashImg
        },
        {
            name: "Fathima Nadeem",
            role: "Frontend Developer",
            description: "Crafting beautiful, responsive user interfaces that deliver exceptional experiences for candidates and recruiters.",
            color: "from-rose-500 to-pink-600",
            image: fathimaImg
        }
    ];

    const milestones = [
        { year: "2024", event: "RecruBotX concept developed at UET Taxila" },
        { year: "2024", event: "AI-powered video interview system launched" },
        { year: "2025", event: "Advanced emotion and expression analysis added" },
        { year: "2025", event: "Resume builder and analysis features released" },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-[#0a1f44] via-[#0a2a5e] to-[#1a3a6e] text-white">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div {...fadeInUp}>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                            About RecruBotX
                        </h1>
                        <p className="text-lg md:text-xl text-blue-200/80 max-w-3xl mx-auto leading-relaxed">
                            We're on a mission to revolutionize the hiring process through intelligent AI,
                            making recruitment faster, fairer, and more efficient for everyone.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 md:py-20 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div {...fadeInUp}>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                                <Target className="w-4 h-4" />
                                Our Mission
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#0a2a5e] mb-6">
                                Transforming Recruitment Through AI
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                RecruBotX was born from a simple observation: traditional hiring processes are slow,
                                biased, and often fail to identify the best candidates. We set out to change that.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Our AI-powered platform automates the entire interview process, from CV screening
                                to video interviews and candidate evaluation. By leveraging advanced natural language
                                processing and emotion analysis, we help HR teams make data-driven hiring decisions
                                while ensuring a fair and consistent experience for every candidate.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                                    <Award className="w-5 h-5 text-[#0a2a5e]" />
                                    <span className="text-sm font-medium">AI-Powered</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                                    <Shield className="w-5 h-5 text-[#0a2a5e]" />
                                    <span className="text-sm font-medium">Bias-Free</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                                    <Users className="w-5 h-5 text-[#0a2a5e]" />
                                    <span className="text-sm font-medium">Candidate-Focused</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            {...fadeInUp}
                            className="relative"
                        >
                            <div className="bg-gradient-to-br from-[#0a2a5e] to-[#1a4a8e] rounded-2xl p-8 text-white">
                                <h3 className="text-2xl font-bold mb-6">Why We Built RecruBotX</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-sm font-bold">1</span>
                                        </div>
                                        <p className="text-blue-100">70% of recruiters' time is spent on repetitive screening tasks</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-sm font-bold">2</span>
                                        </div>
                                        <p className="text-blue-100">Unconscious bias affects 78% of hiring decisions</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-sm font-bold">3</span>
                                        </div>
                                        <p className="text-blue-100">Candidates deserve fair, consistent evaluation</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-sm font-bold">4</span>
                                        </div>
                                        <p className="text-blue-100">AI can make hiring smarter, not replace humans</p>
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 md:py-20 px-4 sm:px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <motion.div {...fadeInUp} className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0a2a5e] mb-4">Our Core Values</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            These principles guide everything we do at RecruBotX
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                {...fadeInUp}
                                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                            >
                                <div className={`w-12 h-12 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center mb-4`}>
                                    <value.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-[#0a2a5e] mb-2">{value.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-16 md:py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div {...fadeInUp} className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0a2a5e] mb-4">Our Journey</h2>
                        <p className="text-gray-600">From concept to reality</p>
                    </motion.div>

                    <div className="relative">
                        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-blue-200 transform md:-translate-x-1/2" />

                        {milestones.map((milestone, index) => (
                            <motion.div
                                key={index}
                                {...fadeInUp}
                                className={`relative flex items-center gap-4 mb-8 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                                    }`}
                            >
                                <div className={`flex-1 ${index % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"} pl-12 md:pl-0`}>
                                    <div className="bg-white p-4 rounded-xl shadow-md inline-block">
                                        <span className="text-sm font-bold text-blue-600">{milestone.year}</span>
                                        <p className="text-gray-700 mt-1">{milestone.event}</p>
                                    </div>
                                </div>
                                <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-[#0a2a5e] rounded-full transform md:-translate-x-1/2 z-10" />
                                <div className="flex-1 hidden md:block" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 md:py-20 px-4 sm:px-6 bg-gray-50">
                <div className="max-w-5xl mx-auto">
                    <motion.div {...fadeInUp} className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0a2a5e] mb-4">Meet Our Team</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            The talented individuals behind RecruBotX, bringing together expertise in AI,
                            computer vision, and software engineering.
                        </p>
                    </motion.div>

                    {/* Mentor Card - Featured at top */}
                    {team.filter(m => m.isMentor).map((mentor, index) => (
                        <motion.div
                            key={index}
                            {...fadeInUp}
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 mb-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-2xl" />
                            <div className="relative flex flex-col md:flex-row items-center gap-6">
                                <div className="relative">
                                    <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg ring-4 ring-blue-200">
                                        <img
                                            src={mentor.image}
                                            alt={mentor.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="text-center md:text-left flex-1">
                                    <h3 className="text-2xl font-bold text-[#0a2a5e] mb-1">{mentor.name}</h3>
                                    <p className="text-[#0a2a5e]/70 font-medium mb-3">{mentor.role}</p>
                                    <p className="text-gray-600 mb-4 max-w-lg">{mentor.description}</p>
                                    <div className="inline-flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-500">
                                        <span className="font-medium text-[#0a2a5e]">{mentor.department}</span>
                                        <span className="hidden sm:inline text-gray-400">•</span>
                                        <span>{mentor.institution}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Team Members Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {team.filter(m => !m.isMentor).map((member, index) => (
                            <motion.div
                                key={index}
                                {...fadeInUp}
                                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 text-center group"
                            >
                                <div className="relative inline-block mb-4">
                                    <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg ring-4 ring-gray-100 group-hover:ring-blue-200 group-hover:scale-105 transition-all duration-300">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-[#0a2a5e] mb-1">{member.name}</h3>
                                <p className="text-sm font-medium text-blue-600 mb-3">{member.role}</p>
                                <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Location Section */}
            <section className="py-16 md:py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div {...fadeInUp}>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0a2a5e] mb-6">Where to Find Us</h2>
                        <div className="bg-gradient-to-br from-[#0a2a5e] to-[#1a4a8e] rounded-2xl p-8 text-white">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-6 h-6" />
                                    <div className="text-left">
                                        <p className="font-medium">UET Taxila</p>
                                        <p className="text-blue-200 text-sm">Rawalpindi, Punjab, Pakistan</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-6 h-6" />
                                    <div className="text-left">
                                        <p className="font-medium">Email Us</p>
                                        <a href="mailto:recrubotx@uettaxila.edu.pk" className="text-blue-200 text-sm hover:text-white transition-colors">
                                            recrubotx@uettaxila.edu.pk
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4 mt-8">
                                <button type="button" className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
                                    <Twitter className="w-5 h-5" />
                                </button>
                                <button type="button" className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
                                    <Linkedin className="w-5 h-5" />
                                </button>
                                <button type="button" className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
                                    <Github className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-20 px-4 bg-gray-50">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div {...fadeInUp}>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0a2a5e] mb-4">
                            Ready to Transform Your Hiring?
                        </h2>
                        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                            Join hundreds of companies already using RecruBotX to find the best talent faster and fairer.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                to="/recruiter/signin"
                                className="inline-flex items-center justify-center gap-2 bg-[#0a2a5e] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#0a1f44] transition-colors"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/contact"
                                className="inline-flex items-center justify-center gap-2 border-2 border-[#0a2a5e] text-[#0a2a5e] px-8 py-2.5 rounded-xl font-medium hover:bg-[#0a2a5e] hover:text-white transition-colors"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
