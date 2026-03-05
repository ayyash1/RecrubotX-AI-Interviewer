import React, { useState } from "react";

const Simple = ({ resume: initialResume = {} }) => {
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

      {/* ================= LEFT : FORMS ================= */}
      <div className="p-6 overflow-y-auto border-r">

        <Section title="Personal Details">
          <Input placeholder="Full Name" value={resume.personal.name} onChange={(e) => updatePersonal("name", e.target.value)} />
          <Input placeholder="Job Title" value={resume.personal.role} onChange={(e) => updatePersonal("role", e.target.value)} />
          <Input placeholder="Email" value={resume.personal.email} onChange={(e) => updatePersonal("email", e.target.value)} />
          <Input placeholder="Phone" value={resume.personal.phone} onChange={(e) => updatePersonal("phone", e.target.value)} />
          <Input placeholder="LinkedIn URL" value={resume.personal.linkedin} onChange={(e) => updatePersonal("linkedin", e.target.value)} />
        </Section>

        <Section title="Professional Summary">
          <textarea
            className="input h-24"
            value={resume.summary}
            onChange={(e) => setResume({ ...resume, summary: e.target.value })}
          />
        </Section>

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

        <Section title="Experience">
          {resume.experience.map((ex, i) => (
            <Box key={i}>
              <Input placeholder="Job Title" value={ex.role} onChange={(e) => updateItem("experience", i, "role", e.target.value)} />
              <Input placeholder="Company" value={ex.company} onChange={(e) => updateItem("experience", i, "company", e.target.value)} />
              <Input placeholder="Duration" value={ex.duration} onChange={(e) => updateItem("experience", i, "duration", e.target.value)} />
              <textarea
                className="input h-20"
                value={ex.description}
                onChange={(e) => updateItem("experience", i, "description", e.target.value)}
              />
            </Box>
          ))}
          <AddButton onClick={() => addItem("experience", { role: "", company: "", duration: "", description: "" })}>
            + Add Experience
          </AddButton>
        </Section>

        <Section title="Projects">
          {resume.projects.map((p, i) => (
            <Box key={i}>
              <Input placeholder="Project Title" value={p.title} onChange={(e) => updateItem("projects", i, "title", e.target.value)} />
              <textarea
                className="input h-20"
                placeholder="Project description"
                value={p.description}
                onChange={(e) => updateItem("projects", i, "description", e.target.value)}
              />
            </Box>
          ))}
          <AddButton onClick={() => addItem("projects", { title: "", description: "" })}>
            + Add Project
          </AddButton>
        </Section>

        <Section title="Education">
          {resume.education.map((ed, i) => (
            <Box key={i}>
              <Input placeholder="Degree" value={ed.degree} onChange={(e) => updateItem("education", i, "degree", e.target.value)} />
              <Input placeholder="Institute" value={ed.institute} onChange={(e) => updateItem("education", i, "institute", e.target.value)} />
              <Input placeholder="Year" value={ed.year} onChange={(e) => updateItem("education", i, "year", e.target.value)} />
            </Box>
          ))}
          <AddButton onClick={() => addItem("education", { degree: "", institute: "", year: "" })}>
            + Add Education
          </AddButton>
        </Section>

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

      {/* ================= RIGHT : A4 FIXED RESUME ================= */}
      <div className="bg-gray-100 p-6 overflow-y-auto">
        <div
          className="mx-auto bg-white border text-black shadow"
          style={{ width: "210mm", minHeight: "297mm", padding: "20mm" }}
        >

          <div className="text-center">
            <h1 className="text-3xl font-bold uppercase">{resume.personal.name || "YOUR NAME"}</h1>
            <p className="text-sm mt-1">
              {resume.personal.phone} • {resume.personal.email} • {resume.personal.linkedin}
            </p>
          </div>

          <Divider />

          {resume.summary && (
            <>
              <SectionTitle>Professional Summary</SectionTitle>
              <p className="text-sm">{resume.summary}</p>
              <Divider />
            </>
          )}

          <SectionTitle>Work Experience</SectionTitle>
          {resume.experience.map((ex, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between font-semibold">
                <span>{ex.role} — {ex.company}</span>
                <span className="text-sm">{ex.duration}</span>
              </div>
              <ul className="list-disc list-inside text-sm">
                {ex.description?.split("\n").map((d, idx) => <li key={idx}>{d}</li>)}
              </ul>
            </div>
          ))}

          <Divider />

          <SectionTitle>Projects</SectionTitle>
          {resume.projects.map((p, i) => (
            <p key={i} className="text-sm mb-2">
              <span className="font-semibold">{p.title}</span> — {p.description}
            </p>
          ))}

          <Divider />

          <SectionTitle>Education</SectionTitle>
          {resume.education.map((ed, i) => (
            <div key={i} className="text-sm">
              <span className="font-semibold">{ed.degree}</span> — {ed.institute}
              <span className="float-right">{ed.year}</span>
            </div>
          ))}

          <Divider />

          <SectionTitle>Skills</SectionTitle>
          <ul className="list-disc list-inside text-sm grid grid-cols-2">
            {resume.skills.map((s, i) => <li key={i}>{s}</li>)}
          </ul>

          <Divider />

          <SectionTitle>Certifications</SectionTitle>
          <ul className="list-disc list-inside text-sm">
            {resume.certifications.map((c, i) => <li key={i}>{c}</li>)}
          </ul>

        </div>

        <div className="text-center mt-4">
          <button onClick={() => window.print()} className="bg-black text-white px-6 py-2">
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

const SectionTitle = ({ children }) => (
  <h2 className="text-sm font-bold uppercase mb-2">{children}</h2>
);

const Divider = () => <hr className="my-4 border-gray-400" />;
const Input = (props) => <input {...props} className="input" />;
const Box = ({ children }) => <div className="border p-3 mb-3 rounded">{children}</div>;
const AddButton = ({ children, ...props }) => <button {...props} className="btn">{children}</button>;

export default Simple;
