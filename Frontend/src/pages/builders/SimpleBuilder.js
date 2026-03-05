import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";

const SimpleBuilder = ({ user, handleLogout, showPreview, setShowPreview }) => {
  const [resume, setResume] = useState({
    personal: {
      name: "",
      role: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
    },
    summary: "",
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    projects: [],
    Skills: [],
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
    <div className="h-full">
      {/* LEFT PANEL - FORMS */}
      {!showPreview && (
        <div className="overflow-y-auto bg-white rounded-xl shadow-lg p-6 h-full">
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
              placeholder="City, State"
              value={resume.personal.location}
              onChange={(e) => updatePersonal("location", e.target.value)}
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
              placeholder="LinkedIn URL"
              value={resume.personal.linkedin}
              onChange={(e) => updatePersonal("linkedin", e.target.value)}
            />
          </Section>

          <Section title="Professional Summary">
            <textarea
              className="input h-32"
              placeholder="Brief professional summary..."
              value={resume.summary}
              onChange={(e) => setResume({ ...resume, summary: e.target.value })}
            />
            <WordCounter text={resume.summary} minWords={20} maxWords={40} />
          </Section>

          <Section title="Work Experience">
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
                  placeholder="Duration (e.g., May 2022 - Present)"
                  value={ex.duration}
                  onChange={(e) =>
                    updateItem("experience", i, "duration", e.target.value)
                  }
                />
                <textarea
                  className="input h-24"
                  placeholder="Bullet points (one per line)"
                  value={ex.description}
                  onChange={(e) =>
                    updateItem("experience", i, "description", e.target.value)
                  }
                />
                <WordCounter text={ex.description} minWords={20} maxWords={40} />
                <button
                  onClick={() => removeItem("experience", i)}
                  className="text-red-600 text-sm mt-2 hover:text-red-700 font-medium"
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
                  placeholder="University/Institution"
                  value={ed.institute}
                  onChange={(e) =>
                    updateItem("education", i, "institute", e.target.value)
                  }
                />
                <Input
                  placeholder="Graduation Year"
                  value={ed.year}
                  onChange={(e) =>
                    updateItem("education", i, "year", e.target.value)
                  }
                />
                <button
                  onClick={() => removeItem("education", i)}
                  className="text-red-600 text-sm mt-2 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </Box>
            ))}
            <AddButton
              onClick={() =>
                addItem("education", { degree: "", institute: "", year: "" })
              }
            >
              Add Education
            </AddButton>
          </Section>

          <Section title="Projects">
            {resume.projects.map((proj, i) => (
              <Box key={i}>
                <Input
                  placeholder="Project Name"
                  value={proj.name}
                  onChange={(e) =>
                    updateItem("projects", i, "name", e.target.value)
                  }
                />
                <Input
                  placeholder="Technologies Used (e.g., React, Node.js, MongoDB)"
                  value={proj.technologies}
                  onChange={(e) =>
                    updateItem("projects", i, "technologies", e.target.value)
                  }
                />
                <Input
                  placeholder="Duration (e.g., Jan 2024 - Mar 2024)"
                  value={proj.duration}
                  onChange={(e) =>
                    updateItem("projects", i, "duration", e.target.value)
                  }
                />
                <textarea
                  className="input h-24"
                  placeholder="Project description and key achievements (one per line)"
                  value={proj.description}
                  onChange={(e) =>
                    updateItem("projects", i, "description", e.target.value)
                  }
                />
                <WordCounter text={proj.description} minWords={20} maxWords={40} />
                <button
                  onClick={() => removeItem("projects", i)}
                  className="text-red-600 text-sm mt-2 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </Box>
            ))}
            <AddButton
              onClick={() =>
                addItem("projects", {
                  name: "",
                  technologies: "",
                  duration: "",
                  description: "",
                })
              }
            >
              Add Project
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
                  placeholder="Issuing Organization"
                  value={cert.issuer}
                  onChange={(e) =>
                    updateItem("certifications", i, "issuer", e.target.value)
                  }
                />
                <Input
                  placeholder="Date Issued (e.g., December 2024)"
                  value={cert.date}
                  onChange={(e) =>
                    updateItem("certifications", i, "date", e.target.value)
                  }
                />
                <Input
                  placeholder="Credential ID (optional)"
                  value={cert.credentialId}
                  onChange={(e) =>
                    updateItem("certifications", i, "credentialId", e.target.value)
                  }
                />
                <button
                  onClick={() => removeItem("certifications", i)}
                  className="text-red-600 text-sm mt-2 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </Box>
            ))}
            <AddButton
              onClick={() =>
                addItem("certifications", {
                  name: "",
                  issuer: "",
                  date: "",
                  credentialId: "",
                })
              }
            >
              Add Certification
            </AddButton>
          </Section>

          <Section title="Skills">
            <Input
              placeholder="Type info & press Enter"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  addItem("Skills", e.target.value.trim());
                  e.target.value = "";
                }
              }}
            />
            <div className="mt-2 space-y-1">
              {resume.Skills.map((info, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span>• {info}</span>
                  <button
                    onClick={() => removeItem("Skills", i)}
                    className="text-red-600 hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* RIGHT PANEL - A4 RESUME PREVIEW */}
      {showPreview && (
        <div className="overflow-y-auto bg-gray-100 rounded-xl p-6 h-full">
          <div
            id="resume-preview-content"
            data-resume-preview
            className="mx-auto bg-white shadow-lg"
            style={{
              width: "210mm",
              minHeight: "297mm",
              padding: "15mm 20mm",
              fontFamily: "Arial, sans-serif",
            }}
          >
            {/* HEADER */}
            <div className="text-center border-b-2 border-black pb-3">
              <h1 className="text-4xl font-bold uppercase tracking-wide">
                {resume.personal.name || "YOUR NAME"}
              </h1>
              <p className="text-sm mt-2">
                {[
                  resume.personal.location,
                  resume.personal.phone,
                  resume.personal.email,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
              {resume.personal.linkedin && (
                <p className="text-sm">{resume.personal.linkedin}</p>
              )}
            </div>

            {/* PROFESSIONAL SUMMARY */}
            {resume.summary && (
              <div className="mt-5">
                <SectionTitle>PROFESSIONAL SUMMARY</SectionTitle>
                <p className="text-sm leading-relaxed">{resume.summary}</p>
              </div>
            )}

            {/* WORK EXPERIENCE */}
            {resume.experience.length > 0 && (
              <div className="mt-5">
                <SectionTitle>WORK EXPERIENCE</SectionTitle>
                {resume.experience.map((ex, i) => (
                  <div key={i} className="mb-4">
                    <div className="flex justify-between items-baseline">
                      <p className="font-bold text-sm">
                        {ex.role} - {ex.company}
                        {ex.location && ` - ${ex.location}`}
                      </p>
                      <p className="text-sm italic">{ex.duration}</p>
                    </div>
                    {ex.description && (
                      <ul className="list-disc ml-5 mt-1 text-sm space-y-1">
                        {ex.description
                          .split("\n")
                          .filter((line) => line.trim())
                          .map((line, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {line.trim()}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* PROJECTS */}
            {resume.projects.length > 0 && (
              <div className="mt-5">
                <SectionTitle>PROJECTS</SectionTitle>
                {resume.projects.map((proj, i) => (
                  <div key={i} className="mb-4">
                    <div className="flex justify-between items-baseline">
                      <p className="font-bold text-sm">{proj.name}</p>
                      <p className="text-sm italic">{proj.duration}</p>
                    </div>
                    {proj.technologies && (
                      <p className="text-sm italic">
                        Technologies: {proj.technologies}
                      </p>
                    )}
                    {proj.description && (
                      <ul className="list-disc ml-5 mt-1 text-sm space-y-1">
                        {proj.description
                          .split("\n")
                          .filter((line) => line.trim())
                          .map((line, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {line.trim()}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* EDUCATION */}
            {resume.education.length > 0 && (
              <div className="mt-5">
                <SectionTitle>EDUCATION</SectionTitle>
                {resume.education.map((ed, i) => (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between items-baseline">
                      <p className="font-bold text-sm">{ed.degree}</p>
                      <p className="text-sm italic">{ed.year}</p>
                    </div>
                    <p className="text-sm">{ed.institute}</p>
                  </div>
                ))}
              </div>
            )}

            {/* CERTIFICATIONS */}
            {resume.certifications.length > 0 && (
              <div className="mt-5">
                <SectionTitle>CERTIFICATIONS</SectionTitle>
                {resume.certifications.map((cert, i) => (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between items-baseline">
                      <p className="font-bold text-sm">{cert.name}</p>
                      <p className="text-sm italic">{cert.date}</p>
                    </div>
                    <p className="text-sm">{cert.issuer}</p>
                    {cert.credentialId && (
                      <p className="text-sm text-gray-600">
                        Credential ID: {cert.credentialId}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {resume.Skills.length > 0 && (
              <div className="mt-5">
                <SectionTitle>Skills</SectionTitle>
                {resume.Skills.map((info, i) => (
                  <p key={i} className="text-sm mb-1">
                    • {info}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
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
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .btn {
          background-color: #3b82f6;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          border: none;
        }
        
        .btn:hover {
          background-color: #2563eb;
        }
        
        /* PDF Print Styles - Prevent awkward page breaks */
        @media print {
          #resume-preview-content > div {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          #resume-preview-content {
            page-break-after: auto;
          }
        }
        
        /* Additional styles to prevent breaks in resume sections */
        [data-resume-preview] > div {
          page-break-inside: avoid;
          break-inside: avoid;
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

const SectionTitle = ({ children }) => (
  <h2 className="text-sm font-bold uppercase border-b-2 border-black pb-1 mb-3">
    {children}
  </h2>
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

export default SimpleBuilder;
