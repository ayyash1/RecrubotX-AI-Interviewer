import React, { useState } from "react";

const DoubleColumn = ({ resume: initialResume = {} }) => {
  const [resume, setResume] = useState({
    personal: {
      name: "",
      role: "",
      email: "",
      phone: "",
      linkedin: "",
      ...initialResume.personal,
    },
    summary: initialResume.summary || "",
    skills: initialResume.skills || [],
    experience: initialResume.experience || [],
    education: initialResume.education || [],
    certifications: initialResume.certifications || [],
    projects: initialResume.projects || [],
  });

  // ---------- HELPERS ----------
  const updatePersonal = (k, v) =>
    setResume({
      ...resume,
      personal: { ...resume.personal, [k]: v },
    });

  const addItem = (key, item) =>
    setResume({ ...resume, [key]: [...resume[key], item] });

  const updateItem = (key, i, field, value) => {
    const copy = [...resume[key]];
    copy[i][field] = value;
    setResume({ ...resume, [key]: copy });
  };

  return (
    <div className="grid grid-cols-2 h-screen font-sans">

      {/* ================= LEFT : STRUCTURED FORMS ================= */}
      <div className="p-6 overflow-y-auto border-r">
        {/* PERSONAL DETAILS */}
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
            placeholder="Email"
            value={resume.personal.email}
            onChange={(e) => updatePersonal("email", e.target.value)}
          />
          <Input
            placeholder="Phone"
            value={resume.personal.phone}
            onChange={(e) => updatePersonal("phone", e.target.value)}
          />
          <Input
            placeholder="LinkedIn URL"
            value={resume.personal.linkedin}
            onChange={(e) => updatePersonal("linkedin", e.target.value)}
          />
        </Section>

        {/* SUMMARY */}
        <Section title="Professional Summary">
          <textarea
            className="input h-24"
            placeholder="Write summary points (one per line)"
            value={resume.summary}
            onChange={(e) =>
              setResume({ ...resume, summary: e.target.value })
            }
          />
        </Section>

        {/* SKILLS */}
        <Section title="Skills">
          <Input
            placeholder="Type skill & press Enter"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value) {
                addItem("skills", e.target.value);
                e.target.value = "";
              }
            }}
          />
        </Section>

        {/* EXPERIENCE */}
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
                placeholder="Company"
                value={ex.company}
                onChange={(e) =>
                  updateItem("experience", i, "company", e.target.value)
                }
              />
              <Input
                placeholder="Duration"
                value={ex.duration}
                onChange={(e) =>
                  updateItem("experience", i, "duration", e.target.value)
                }
              />
              <textarea
                className="input h-20"
                placeholder="Achievements (one bullet per line)"
                value={ex.description}
                onChange={(e) =>
                  updateItem(
                    "experience",
                    i,
                    "description",
                    e.target.value
                  )
                }
              />
            </Box>
          ))}

          <AddButton
            onClick={() =>
              addItem("experience", {
                role: "",
                company: "",
                duration: "",
                description: "",
              })
            }
          >
            + Add Experience
          </AddButton>
        </Section>

        {/* PROJECTS */}
        <Section title="Projects">
          {resume.projects.map((proj, i) => (
            <Box key={i}>
              <Input
                placeholder="Project Title"
                value={proj.title}
                onChange={(e) =>
                  updateItem("projects", i, "title", e.target.value)
                }
              />
              <Input
                placeholder="Technologies Used"
                value={proj.technologies}
                onChange={(e) =>
                  updateItem("projects", i, "technologies", e.target.value)
                }
              />
              <textarea
                className="input h-20"
                placeholder="Project Description (one bullet per line)"
                value={proj.description}
                onChange={(e) =>
                  updateItem(
                    "projects",
                    i,
                    "description",
                    e.target.value
                  )
                }
              />
            </Box>
          ))}

          <AddButton
            onClick={() =>
              addItem("projects", { title: "", technologies: "", description: "" })
            }
          >
            + Add Project
          </AddButton>
        </Section>

        {/* EDUCATION */}
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
                placeholder="Institute"
                value={ed.institute}
                onChange={(e) =>
                  updateItem("education", i, "institute", e.target.value)
                }
              />
              <Input
                placeholder="Year"
                value={ed.year}
                onChange={(e) =>
                  updateItem("education", i, "year", e.target.value)
                }
              />
            </Box>
          ))}

          <AddButton
            onClick={() =>
              addItem("education", {
                degree: "",
                institute: "",
                year: "",
              })
            }
          >
            + Add Education
          </AddButton>
        </Section>

        {/* CERTIFICATIONS */}
        <Section title="Certifications">
          <Input
            placeholder="Type certificate & press Enter"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value) {
                addItem("certifications", e.target.value);
                e.target.value = "";
              }
            }}
          />
        </Section>
      </div>

      {/* ================= RIGHT : LOCKED RESUME ================= */}
      <div className="bg-gray-100 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto bg-white border">
          <div className="grid grid-cols-3 min-h-screen">

            {/* MAIN */}
            <div className="col-span-2 p-8">
              <h1 className="text-3xl font-bold">
                {resume.personal.name || "Your Name"}
              </h1>
              <p className="text-blue-600 font-semibold">
                {resume.personal.role || "Job Title"}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {resume.personal.phone} | {resume.personal.email}
              </p>
              <p className="text-sm text-blue-600">
                {resume.personal.linkedin}
              </p>

              {resume.summary && (
                <>
                  <h2 className="resume-title font-bold">Summary</h2>
                  <ul className="list-disc list-inside text-sm">
                    {resume.summary.split("\n").map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </>
              )}

              <h2 className="resume-title font-bold">Experience</h2>
              {resume.experience.map((ex, i) => (
                <div key={i} className="mb-4">
                  <p className="font-medium">
                    {ex.role} — {ex.company}
                  </p>
                  <p className="text-sm text-gray-500">{ex.duration}</p>
                  <ul className="list-disc list-inside text-sm">
                    {ex.description?.split("\n").map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                </div>
              ))}

              <h2 className="resume-title font-bold">Projects</h2>
              {resume.projects.map((proj, i) => (
                <div key={i} className="mb-4">
                  <p className="font-medium">{proj.title}</p>
                  <p className="text-sm text-gray-500">
                    {proj.technologies}
                  </p>
                  <ul className="list-disc list-inside text-sm">
                    {proj.description?.split("\n").map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* SIDEBAR */}
            <div className="bg-slate-800 text-white p-6">
              <Side title="Skills">
                <ul className="list-disc list-inside text-sm">
                  {resume.skills.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </Side>

              <Side title="Education">
                {resume.education.map((ed, i) => (
                  <div key={i} className="text-sm mb-2">
                    <p className="font-medium">{ed.degree}</p>
                    <p className="text-gray-300">{ed.institute}</p>
                    <p className="text-xs text-gray-400">{ed.year}</p>
                  </div>
                ))}
              </Side>

              <Side title="Certifications">
                <ul className="list-disc list-inside text-sm">
                  {resume.certifications.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </Side>
            </div>
          </div>
        </div>

        {/* ================= DOWNLOAD BUTTON ================= */}
        <div className="text-center mt-4">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            Download Resume
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- UI HELPERS ---------- */
const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="font-semibold mb-2">{title}</h2>
    {children}
  </div>
);

const Input = (props) => <input {...props} className="input" />;

const Box = ({ children }) => <div className="border p-3 mb-3 rounded">{children}</div>;

const AddButton = ({ children, ...props }) => <button {...props} className="btn">{children}</button>;

const Side = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="side-title">{title}</h2>
    {children}
  </div>
);

export default DoubleColumn;
