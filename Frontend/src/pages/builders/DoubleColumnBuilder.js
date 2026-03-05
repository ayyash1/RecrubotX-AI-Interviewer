import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";

const DoubleColumnBuilder = ({ user, showPreview }) => {
    const [resume, setResume] = useState({
        personal: {
            name: "",
            role: "",
            email: "",
            phone: "",
            location: "",
            instagram: "",
        },
        experience: [],
        education: [],
        strengths: [],
        achievements: [],
        languages: [],
        certifications: [],
        industryExpertise: [],
        skills: [],
        projects: [],
    });

    // Save resume data to sessionStorage whenever it changes
    useEffect(() => {
        const resumeData = {
            ...resume,
            name: resume.personal.name || user?.firstName + " " + user?.lastName
        };
        sessionStorage.setItem("currentResume", JSON.stringify(resumeData));
    }, [resume, user]);

    const updatePersonal = (k, v) =>
        setResume({ ...resume, personal: { ...resume.personal, [k]: v } });

    const addItem = (key, item) =>
        setResume({ ...resume, [key]: [...resume[key], item] });

    const updateItem = (key, i, field, value) => {
        const copy = [...resume[key]];
        copy[i][field] = value;
        setResume({ ...resume, [key]: copy });
    };

    const removeItem = (key, i) => {
        const copy = [...resume[key]];
        copy.splice(i, 1);
        setResume({ ...resume, [key]: copy });
    };

    return (
        <div className="h-full flex gap-6 overflow-hidden">
            {/* LEFT PANEL - FORMS (Always visible or hidden based on showPreview) */}
            {!showPreview && (
                <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-lg p-8">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">Resume Details</h1>

                    <Section title="Personal Details">
                        <Input
                            placeholder="Full Name"
                            value={resume.personal.name}
                            onChange={(e) => updatePersonal("name", e.target.value)}
                        />
                        <Input
                            placeholder="Job Title"
                            value={resume.personal.role}
                            onChange={(e) => updatePersonal("role", e.target.value)}
                        />
                        <Input
                            placeholder="Phone"
                            value={resume.personal.phone}
                            onChange={(e) => updatePersonal("phone", e.target.value)}
                        />
                        <Input
                            placeholder="Email"
                            value={resume.personal.email}
                            onChange={(e) => updatePersonal("email", e.target.value)}
                        />
                        <Input
                            placeholder="Instagram/Website"
                            value={resume.personal.instagram}
                            onChange={(e) => updatePersonal("instagram", e.target.value)}
                        />
                        <Input
                            placeholder="Location (City, State)"
                            value={resume.personal.location}
                            onChange={(e) => updatePersonal("location", e.target.value)}
                        />
                    </Section>

                    <Section title="Experience">
                        {resume.experience.map((ex, i) => (
                            <Box key={i}>
                                <Input
                                    placeholder="Job Title"
                                    value={ex.role}
                                    onChange={(e) =>
                                        updateItem("experience", i, "role", e.target.value)
                                    }
                                />
                                <Input
                                    placeholder="Company Name"
                                    value={ex.company}
                                    onChange={(e) =>
                                        updateItem("experience", i, "company", e.target.value)
                                    }
                                />
                                <Input
                                    placeholder="Location"
                                    value={ex.location}
                                    onChange={(e) =>
                                        updateItem("experience", i, "location", e.target.value)
                                    }
                                />
                                <Input
                                    placeholder="Duration (e.g., 2018 - Ongoing)"
                                    value={ex.duration}
                                    onChange={(e) =>
                                        updateItem("experience", i, "duration", e.target.value)
                                    }
                                />
                                <textarea
                                    className="input h-32"
                                    placeholder="Job description and achievements (one bullet per line)"
                                    value={ex.description}
                                    onChange={(e) =>
                                        updateItem("experience", i, "description", e.target.value)
                                    }
                                />
                                <WordCounter text={ex.description} minWords={20} maxWords={40} />
                                <button
                                    onClick={() => removeItem("experience", i)}
                                    className="text-red-600 text-sm mt-2 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </Box>
                        ))}
                        <AddButton
                            onClick={() =>
                                addItem("experience", {
                                    role: "",
                                    company: "",
                                    location: "",
                                    duration: "",
                                    description: "",
                                })
                            }
                        >
                            Add Experience
                        </AddButton>
                    </Section>

                    <Section title="Industry Expertise">
                        {resume.industryExpertise.map((item, i) => (
                            <Box key={i}>
                                <Input
                                    placeholder="Skill Name"
                                    value={item.skill}
                                    onChange={(e) =>
                                        updateItem("industryExpertise", i, "skill", e.target.value)
                                    }
                                />
                                <Input
                                    placeholder="Proficiency (1-5)"
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={item.level}
                                    onChange={(e) =>
                                        updateItem("industryExpertise", i, "level", e.target.value)
                                    }
                                />
                                <button
                                    onClick={() => removeItem("industryExpertise", i)}
                                    className="text-red-600 text-sm mt-2 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </Box>
                        ))}
                        <AddButton
                            onClick={() => addItem("industryExpertise", { skill: "", level: 3 })}
                        >
                            Add Expertise
                        </AddButton>
                    </Section>

                    <Section title="Skills">
                        <Input
                            placeholder="Type skill & press Enter"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && e.target.value.trim()) {
                                    addItem("skills", e.target.value.trim());
                                    e.target.value = "";
                                }
                            }}
                        />
                        <div className="mt-2 space-y-1">
                            {resume.skills.map((skill, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <span>• {skill}</span>
                                    <button
                                        onClick={() => removeItem("skills", i)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section title="Projects">
                        {resume.projects.map((item, i) => (
                            <Box key={i}>
                                <Input
                                    placeholder="Project Title"
                                    value={item.title}
                                    onChange={(e) =>
                                        updateItem("projects", i, "title", e.target.value)
                                    }
                                />
                                <textarea
                                    className="input h-20"
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={(e) =>
                                        updateItem("projects", i, "description", e.target.value)
                                    }
                                />
                                <WordCounter text={item.description} minWords={20} maxWords={40} />
                                <button
                                    onClick={() => removeItem("projects", i)}
                                    className="text-red-600 text-sm mt-2 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </Box>
                        ))}
                        <AddButton
                            onClick={() =>
                                addItem("projects", { title: "", description: "" })
                            }
                        >
                            Add Project
                        </AddButton>
                    </Section>

                    <Section title="Education">
                        {resume.education.map((ed, i) => (
                            <Box key={i}>
                                <Input
                                    placeholder="Degree"
                                    value={ed.degree}
                                    onChange={(e) =>
                                        updateItem("education", i, "degree", e.target.value)
                                    }
                                />
                                <Input
                                    placeholder="University"
                                    value={ed.university}
                                    onChange={(e) =>
                                        updateItem("education", i, "university", e.target.value)
                                    }
                                />
                                <Input
                                    placeholder="Duration (e.g., 2007 - Ongoing)"
                                    value={ed.duration}
                                    onChange={(e) =>
                                        updateItem("education", i, "duration", e.target.value)
                                    }
                                />
                                <Input
                                    placeholder="GPA (optional)"
                                    value={ed.gpa}
                                    onChange={(e) =>
                                        updateItem("education", i, "gpa", e.target.value)
                                    }
                                />
                                <button
                                    onClick={() => removeItem("education", i)}
                                    className="text-red-600 text-sm mt-2 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </Box>
                        ))}
                        <AddButton
                            onClick={() =>
                                addItem("education", {
                                    degree: "",
                                    university: "",
                                    duration: "",
                                    gpa: "",
                                })
                            }
                        >
                            Add Education
                        </AddButton>
                    </Section>

                    <Section title="Strengths">
                        {resume.strengths.map((item, i) => (
                            <Box key={i}>
                                <Input
                                    placeholder="Strength Title"
                                    value={item.title}
                                    onChange={(e) =>
                                        updateItem("strengths", i, "title", e.target.value)
                                    }
                                />
                                <textarea
                                    className="input h-20"
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={(e) =>
                                        updateItem("strengths", i, "description", e.target.value)
                                    }
                                />
                                <button
                                    onClick={() => removeItem("strengths", i)}
                                    className="text-red-600 text-sm mt-2 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </Box>
                        ))}
                        <AddButton
                            onClick={() => addItem("strengths", { title: "", description: "" })}
                        >
                            Add Strength
                        </AddButton>
                    </Section>

                    <Section title="Achievements">
                        {resume.achievements.map((item, i) => (
                            <Box key={i}>
                                <Input
                                    placeholder="Achievement Title"
                                    value={item.title}
                                    onChange={(e) =>
                                        updateItem("achievements", i, "title", e.target.value)
                                    }
                                />
                                <textarea
                                    className="input h-20"
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={(e) =>
                                        updateItem("achievements", i, "description", e.target.value)
                                    }
                                />
                                <button
                                    onClick={() => removeItem("achievements", i)}
                                    className="text-red-600 text-sm mt-2 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </Box>
                        ))}
                        <AddButton
                            onClick={() =>
                                addItem("achievements", { title: "", description: "" })
                            }
                        >
                            Add Achievement
                        </AddButton>
                    </Section>

                    <Section title="Languages">
                        {resume.languages.map((item, i) => (
                            <Box key={i}>
                                <Input
                                    placeholder="Language"
                                    value={item.language}
                                    onChange={(e) =>
                                        updateItem("languages", i, "language", e.target.value)
                                    }
                                />
                                <Input
                                    placeholder="Proficiency (e.g., Native, Proficient)"
                                    value={item.level}
                                    onChange={(e) =>
                                        updateItem("languages", i, "level", e.target.value)
                                    }
                                />
                                <button
                                    onClick={() => removeItem("languages", i)}
                                    className="text-red-600 text-sm mt-2 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </Box>
                        ))}
                        <AddButton
                            onClick={() => addItem("languages", { language: "", level: "" })}
                        >
                            Add Language
                        </AddButton>
                    </Section>

                    <Section title="Certifications">
                        {resume.certifications.map((cert, i) => (
                            <Box key={i}>
                                <Input
                                    placeholder="Certification Name"
                                    value={cert.name}
                                    onChange={(e) =>
                                        updateItem("certifications", i, "name", e.target.value)
                                    }
                                />
                                <Input
                                    placeholder="Year"
                                    value={cert.year}
                                    onChange={(e) =>
                                        updateItem("certifications", i, "year", e.target.value)
                                    }
                                />
                                <button
                                    onClick={() => removeItem("certifications", i)}
                                    className="text-red-600 text-sm mt-2 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </Box>
                        ))}
                        <AddButton
                            onClick={() => addItem("certifications", { name: "", year: "" })}
                        >
                            Add Certification
                        </AddButton>
                    </Section>
                </div>
            )}

            {/* RIGHT PANEL - RESUME PREVIEW (Only shows when showPreview is true) */}
            {showPreview && (
                <div className="flex-1 overflow-y-auto bg-gray-200 rounded-xl p-6">
                    <div
                        id="resume-preview-content"
                        className="mx-auto bg-white shadow-lg"
                        style={{
                            width: "210mm",
                            minHeight: "297mm",
                            fontFamily: "Arial, sans-serif",
                        }}
                    >
                        <div className="grid grid-cols-3" style={{ minHeight: "297mm" }}>
                            {/* LEFT COLUMN - MAIN CONTENT */}
                            <div className="col-span-2 p-8">
                                {/* HEADER */}
                                <div className="mb-6">
                                    <h1 className="text-3xl font-bold text-gray-900 uppercase">
                                        {resume.personal.name || "YOUR NAME"}
                                    </h1>
                                    <p className="text-blue-600 font-semibold text-lg">
                                        {resume.personal.role || "Job Title"}
                                    </p>
                                    <div className="text-xs text-gray-600 mt-2 space-y-1">
                                        <p>📞 {resume.personal.phone}</p>
                                        <p>✉ {resume.personal.email}</p>
                                        <p>📷 {resume.personal.instagram}</p>
                                        <p>📍 {resume.personal.location}</p>
                                    </div>
                                </div>

                                {/* EXPERIENCE */}
                                {resume.experience.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-sm font-bold uppercase border-b-2 border-gray-800 pb-1 mb-3">
                                            EXPERIENCE
                                        </h2>
                                        {resume.experience.map((ex, i) => (
                                            <div key={i} className="mb-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold text-sm">{ex.role}</p>
                                                        <p className="text-blue-600 text-xs font-medium">
                                                            {ex.company}
                                                        </p>
                                                    </div>
                                                    <div className="text-right text-xs">
                                                        <p>{ex.duration}</p>
                                                        <p className="text-gray-600">{ex.location}</p>
                                                    </div>
                                                </div>
                                                {ex.description && (
                                                    <ul className="list-disc ml-4 mt-2 text-xs space-y-1">
                                                        {ex.description
                                                            .split("\n")
                                                            .filter((line) => line.trim())
                                                            .map((line, idx) => (
                                                                <li key={idx}>{line.trim()}</li>
                                                            ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* INDUSTRY EXPERTISE */}
                                {resume.industryExpertise.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-sm font-bold uppercase border-b-2 border-gray-800 pb-1 mb-3">
                                            INDUSTRY EXPERTISE
                                        </h2>
                                        <div className="space-y-2">
                                            {resume.industryExpertise.map((item, i) => (
                                                <div key={i}>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="font-medium">{item.skill}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-300 h-1.5 rounded">
                                                        <div
                                                            className="bg-blue-600 h-1.5 rounded"
                                                            style={{ width: `${(item.level / 5) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* SKILLS */}
                                {resume.skills.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-sm font-bold uppercase border-b-2 border-gray-800 pb-1 mb-3">
                                            SKILLS
                                        </h2>
                                        <p className="text-xs">{resume.skills.join(" • ")}</p>
                                    </div>
                                )}

                                {/* PROJECTS */}
                                {resume.projects.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-sm font-bold uppercase border-b-2 border-gray-800 pb-1 mb-3">
                                            PROJECTS
                                        </h2>
                                        {resume.projects.map((item, i) => (
                                            <div key={i} className="mb-3">
                                                <p className="font-bold text-sm">{item.title}</p>
                                                <p className="text-xs text-gray-700 mt-1">
                                                    {item.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* RIGHT COLUMN - SIDEBAR */}
                            <div className="bg-slate-700 text-white p-6">
                                {/* EDUCATION */}
                                {resume.education.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-sm font-bold uppercase border-b-2 border-white pb-1 mb-3">
                                            EDUCATION
                                        </h2>
                                        {resume.education.map((ed, i) => (
                                            <div key={i} className="mb-4 text-xs">
                                                <p className="font-bold">{ed.degree}</p>
                                                <p className="text-gray-300 text-xs">{ed.university}</p>
                                                <p className="text-xs mt-1">{ed.duration}</p>
                                                {ed.gpa && (
                                                    <p className="text-xs mt-1">
                                                        <span className="font-semibold">GPA:</span> {ed.gpa}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* STRENGTHS */}
                                {resume.strengths.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-sm font-bold uppercase border-b-2 border-white pb-1 mb-3">
                                            STRENGTHS
                                        </h2>
                                        {resume.strengths.map((item, i) => (
                                            <div key={i} className="mb-3">
                                                <p className="font-bold text-xs flex items-center">
                                                    <span className="mr-2">✓</span> {item.title}
                                                </p>
                                                <p className="text-xs text-gray-300 ml-4">
                                                    {item.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ACHIEVEMENTS */}
                                {resume.achievements.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-sm font-bold uppercase border-b-2 border-white pb-1 mb-3">
                                            ACHIEVEMENTS
                                        </h2>
                                        {resume.achievements.map((item, i) => (
                                            <div key={i} className="mb-3">
                                                <p className="font-bold text-xs flex items-center">
                                                    <span className="mr-2">★</span> {item.title}
                                                </p>
                                                <p className="text-xs text-gray-300 ml-4">
                                                    {item.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* LANGUAGES */}
                                {resume.languages.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-sm font-bold uppercase border-b-2 border-white pb-1 mb-3">
                                            LANGUAGES
                                        </h2>
                                        {resume.languages.map((item, i) => (
                                            <div key={i} className="flex justify-between text-xs mb-2">
                                                <span>{item.language}</span>
                                                <span className="text-gray-300">{item.level}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* CERTIFICATIONS */}
                                {resume.certifications.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-sm font-bold uppercase border-b-2 border-white pb-1 mb-3">
                                            CERTIFICATION
                                        </h2>
                                        {resume.certifications.map((cert, i) => (
                                            <div key={i} className="mb-2 text-xs">
                                                <p>{cert.name}</p>
                                                {cert.year && <p className="text-gray-400">{cert.year}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #resume-preview, #resume-preview * {
            visibility: visible;
          }
          #resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            height: 297mm;
            margin: 0;
            box-shadow: none;
          }
        }
        
        .input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        
        .btn {
          background-color: #3b82f6;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          border: none;
          width: 100%;
        }
        
        .btn:hover {
          background-color: #2563eb;
        }
      `}</style>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div className="mb-6">
        <h2 className="font-bold text-lg mb-3 text-gray-800">{title}</h2>
        {children}
    </div>
);

const Input = (props) => <input {...props} className="input" />;

const Box = ({ children }) => (
    <div className="border border-gray-300 p-4 mb-3 rounded bg-white shadow-sm">
        {children}
    </div>
);

const AddButton = ({ children, ...props }) => (
    <button
        {...props}
        className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors py-2"
    >
        <Plus className="w-4 h-4" /> {children}
    </button>
);

const WordCounter = ({ text, minWords, maxWords }) => {
    const wordCount = (text || "").trim().split(/\s+/).filter(Boolean).length;
    const isMinMet = !minWords || wordCount >= minWords;
    const isMaxMet = !maxWords || wordCount <= maxWords;
    const isPerfect = isMinMet && isMaxMet;

    if (wordCount === 0) return null;

    return (
        <div className={`text-[10px] mt-1 px-2 py-0.5 rounded-md inline-flex items-center gap-1 font-medium ${isPerfect ? "bg-green-100 text-green-700" :
            !isMinMet ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
            }`}>
            <span>{wordCount} words</span>
            {minWords && maxWords ? (
                <span>(Goal: {minWords}-{maxWords})</span>
            ) : minWords ? (
                <span>(Min: {minWords})</span>
            ) : maxWords ? (
                <span>(Max: {maxWords})</span>
            ) : null}
            {isPerfect ? "✓" : ""}
        </div>
    );
};

export default DoubleColumnBuilder;
