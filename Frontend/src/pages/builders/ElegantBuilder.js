import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";

const ElegantBuilder = ({ user, showPreview }) => {
  const [resume, setResume] = useState({
    personal: {
      name: "",
      role: "",
      email: "",
      phone: "",
      location: "",
      website: "",
    },
    profile: "",
    profilePhoto: null,
    experience: [],
    education: [],
    skills: [],
    projects: [],
    languages: [],
    certifications: [],
    references: [],
  });

  // Save resume data to sessionStorage whenever it changes
  useEffect(() => {
    const resumeData = {
      ...resume,
      name: resume.personal.name || user?.firstName + " " + user?.lastName
    };
    sessionStorage.setItem("currentResume", JSON.stringify(resumeData));
  }, [resume, user]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResume({ ...resume, profilePhoto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

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
      {/* LEFT PANEL - FORMS */}
      {!showPreview && (
        <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Resume Details</h1>

          <Section title="Personal Details">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
              {resume.profilePhoto && (
                <div className="mt-3">
                  <img
                    src={resume.profilePhoto}
                    alt="Profile preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-teal-600"
                  />
                </div>
              )}
            </div>
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
              placeholder="Website"
              value={resume.personal.website}
              onChange={(e) => updatePersonal("website", e.target.value)}
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
                  placeholder="Duration (e.g., Jan 2020 - Present)"
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

          <Section title="Skills">
            <Input
              placeholder="Type skill & press Enter"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  addItem("skills", { name: e.target.value.trim(), level: 80 });
                  e.target.value = "";
                }
              }}
            />
            <div className="mt-2 space-y-2">
              {resume.skills.map((skill, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm flex-1">{skill.name}</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={skill.level}
                    onChange={(e) =>
                      updateItem("skills", i, "level", parseInt(e.target.value) || 0)
                    }
                    className="w-16 px-2 py-1 border rounded text-sm mx-2"
                  />
                  <span className="text-xs text-gray-500 w-8">%</span>
                  <button
                    onClick={() => removeItem("skills", i)}
                    className="text-red-600 hover:text-red-700 ml-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
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
                  placeholder="Location"
                  value={ed.location}
                  onChange={(e) =>
                    updateItem("education", i, "location", e.target.value)
                  }
                />
                <Input
                  placeholder="Duration (e.g., 2015 - 2019)"
                  value={ed.duration}
                  onChange={(e) =>
                    updateItem("education", i, "duration", e.target.value)
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
                  location: "",
                  duration: "",
                })
              }
            >
              Add Education
            </AddButton>
          </Section>

          <Section title="Profile">
            <textarea
              className="input h-32"
              placeholder="Write a brief professional summary about yourself..."
              value={resume.profile}
              onChange={(e) => setResume({ ...resume, profile: e.target.value })}
            />
            <WordCounter text={resume.profile} minWords={20} maxWords={40} />
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
                  placeholder="Proficiency (e.g., Native, Fluent, Intermediate)"
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
                  placeholder="Publisher"
                  value={cert.year}
                  onChange={(e) =>
                    updateItem("certifications", i, "Publisher", e.target.value)
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
              onClick={() => addItem("certifications", { name: "", Publisher: "" })}
            >
              Add Certification
            </AddButton>
          </Section>

          <Section title="References (Optional)">
            {resume.references.map((ref, i) => (
              <Box key={i}>
                <Input
                  placeholder="Reference Name"
                  value={ref.name}
                  onChange={(e) =>
                    updateItem("references", i, "name", e.target.value)
                  }
                />
                <Input
                  placeholder="Title/Position"
                  value={ref.position}
                  onChange={(e) =>
                    updateItem("references", i, "position", e.target.value)
                  }
                />
                <Input
                  placeholder="Email"
                  value={ref.email}
                  onChange={(e) =>
                    updateItem("references", i, "email", e.target.value)
                  }
                />
                <Input
                  placeholder="Phone (Optional)"
                  value={ref.phone}
                  onChange={(e) =>
                    updateItem("references", i, "phone", e.target.value)
                  }
                />
                <button
                  onClick={() => removeItem("references", i)}
                  className="text-red-600 text-sm mt-2 hover:text-red-700"
                >
                  Remove
                </button>
              </Box>
            ))}
            <AddButton
              onClick={() =>
                addItem("references", { name: "", position: "", email: "", phone: "" })
              }
            >
              Add Reference
            </AddButton>
          </Section>
        </div>
      )}

      {/* RIGHT PANEL - RESUME PREVIEW - MATCHING UPLOADED IMAGE */}
      {showPreview && (
        <div className="flex-1 overflow-y-auto bg-gray-100 rounded-xl p-6">
          <div
            id="resume-preview-content"
            className="mx-auto bg-white shadow-2xl"
            style={{
              width: "210mm",
              minHeight: "297mm",
              fontFamily: "'Arial', sans-serif",
            }}
          >
            <div className="grid grid-cols-3" style={{ minHeight: "297mm" }}>
              {/* LEFT COLUMN - DARK TEAL SIDEBAR */}
              <div className="col-span-1 bg-teal-800 text-white p-8 flex flex-col">
                {/* PROFILE IMAGE */}
                <div className="mb-6">
                  <div className="w-40 h-40 mx-auto rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {resume.profilePhoto ? (
                      <img
                        src={resume.profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23f0f0f0'/%3E%3Cpath d='M100 110c-16.5 0-30-13.5-30-30s13.5-30 30-30 30 13.5 30 30-13.5 30-30 30zm0 10c33 0 60 16.5 60 37v13H40v-13c0-20.5 27-37 60-37z' fill='%23999'/%3E%3C/svg%3E"
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* NAME AND TITLE */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">
                    {resume.personal.name || "PRESLEY WITTING"}
                  </h1>
                  <p className="text-sm uppercase tracking-wide text-teal-200">
                    {resume.personal.role || "Graphic & Web Designer"}
                  </p>
                </div>

                {/* CONTACT */}
                <div className="mb-6">
                  <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b border-teal-600">
                    CONTACT
                  </h2>
                  <div className="space-y-2 text-xs">
                    {resume.personal.phone && (
                      <div className="flex items-start gap-2">
                        <span className="text-teal-300">📞</span>
                        <span>{resume.personal.phone}</span>
                      </div>
                    )}
                    {resume.personal.location && (
                      <div className="flex items-start gap-2">
                        <span className="text-teal-300">📍</span>
                        <span>{resume.personal.location}</span>
                      </div>
                    )}
                    {resume.personal.website && (
                      <div className="flex items-start gap-2">
                        <span className="text-teal-300">🌐</span>
                        <span className="break-all">{resume.personal.website}</span>
                      </div>
                    )}
                    {resume.personal.email && (
                      <div className="flex items-start gap-2">
                        <span className="text-teal-300">✉️</span>
                        <span className="break-all">{resume.personal.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SKILLS */}
                {resume.skills.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b border-teal-600">
                      SKILLS
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {resume.skills.slice(0, 6).map((skill, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className="relative w-16 h-16 mb-2">
                            <svg className="transform -rotate-90 w-16 h-16">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="4"
                                fill="none"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="white"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 28}`}
                                strokeDashoffset={`${2 * Math.PI * 28 * (1 - skill.level / 100)}`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold">{skill.level}%</span>
                            </div>
                          </div>
                          <p className="text-xs text-center leading-tight">{skill.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LANGUAGES */}
                {resume.languages.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b border-teal-600">
                      LANGUAGES
                    </h2>
                    {resume.languages.map((item, i) => (
                      <div key={i} className="mb-2">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-semibold">{item.language}</span>
                          <span className="text-teal-200 text-xs">{item.level}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CERTIFICATIONS */}
                {resume.certifications.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b border-teal-600">
                      CERTIFICATIONS
                    </h2>
                    {resume.certifications.map((cert, i) => (
                      <div key={i} className="mb-2">
                        <p className="text-xs font-semibold">{cert.name}</p>
                        {cert.Publisher && <p className="text-xs text-teal-200">{cert.Publisher}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN - MAIN CONTENT (CREAM/BEIGE BACKGROUND) */}
              <div className="col-span-2 bg-amber-50 p-8">
                {/* PROFILE */}
                {resume.profile && (
                  <div className="mb-8">
                    <h2 className="text-base font-bold uppercase tracking-wider mb-4 text-teal-800 pb-2 border-b-2 border-teal-800">
                      PROFILE
                    </h2>
                    <p className="text-xs leading-relaxed text-gray-700">
                      {resume.profile}
                    </p>
                  </div>
                )}

                {/* WORK EXPERIENCE */}
                {resume.experience.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-base font-bold uppercase tracking-wider mb-4 text-teal-800 pb-2 border-b-2 border-teal-800">
                      WORK EXPERIENCE
                    </h2>
                    <div className="space-y-5">
                      {resume.experience.map((ex, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex-1">
                              <h3 className="font-bold text-sm text-gray-800">{ex.role || "Position Title"}</h3>
                              <p className="text-xs text-teal-700 font-semibold">{ex.company}</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-xs text-gray-600 font-semibold">{ex.duration}</p>
                              <p className="text-xs text-gray-500">{ex.location}</p>
                            </div>
                          </div>
                          {ex.description && (
                            <ul className="list-disc ml-5 mt-2 text-xs space-y-1 text-gray-700">
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
                  </div>
                )}

                {/* EDUCATION */}
                {resume.education.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-base font-bold uppercase tracking-wider mb-4 text-teal-800 pb-2 border-b-2 border-teal-800">
                      EDUCATION
                    </h2>
                    <div className="space-y-4">
                      {resume.education.map((ed, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-bold text-sm text-gray-800">{ed.degree || "Degree"}</h3>
                              <p className="text-xs text-teal-700 font-semibold">{ed.university}</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-xs text-gray-600 font-semibold">{ed.duration}</p>
                              <p className="text-xs text-gray-500">{ed.location}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PROJECTS */}
                {resume.projects.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-base font-bold uppercase tracking-wider mb-4 text-teal-800 pb-2 border-b-2 border-teal-800">
                      PROJECTS
                    </h2>
                    <div className="space-y-4">
                      {resume.projects.map((item, i) => (
                        <div key={i}>
                          <h3 className="font-bold text-sm text-gray-800">{item.title}</h3>
                          <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* REFERENCES */}
                {resume.references.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-base font-bold uppercase tracking-wider mb-4 text-teal-800 pb-2 border-b-2 border-teal-800">
                      REFERENCES
                    </h2>
                    <div className="space-y-4">
                      {resume.references.map((ref, i) => (
                        <div key={i}>
                          <h3 className="font-bold text-sm text-gray-800">{ref.name}</h3>
                          <p className="text-xs text-teal-700">{ref.position}</p>
                          {ref.email && <p className="text-xs text-gray-600">Email: {ref.email}</p>}
                          {ref.phone && <p className="text-xs text-gray-600">Phone: {ref.phone}</p>}
                        </div>
                      ))}
                    </div>
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
          border-color: #0d9488;
          box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.1);
        }
        
        .btn {
          background-color: #0d9488;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          border: none;
          width: 100%;
        }
        
        .btn:hover {
          background-color: #0f766e;
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
  <div className="border border-gray-300 p-4 mb-3 rounded bg-gray-50 shadow-sm">
    {children}
  </div>
);

const AddButton = ({ children, ...props }) => (
  <button
    {...props}
    className="flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors py-2"
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

export default ElegantBuilder;
