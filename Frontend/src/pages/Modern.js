import React, { useState } from "react";

const Modern = () => {
  const [resume, setResume] = useState({
    personal: {
      name: "",
      role: "",
      email: "",
      phone: "",
      linkedin: "",
      address: "",
      photo: "",
    },
    summary: "",
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    projects: [],
  });

  /* ---------- HELPERS ---------- */
  const updatePersonal = (k, v) =>
    setResume({ ...resume, personal: { ...resume.personal, [k]: v } });

  const addItem = (key, item) =>
    setResume({ ...resume, [key]: [...resume[key], item] });

  const updateItem = (key, i, field, value) => {
    const copy = [...resume[key]];
    copy[i][field] = value;
    setResume({ ...resume, [key]: copy });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersonal("photo", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-2 h-screen font-sans">

      {/* ================= LEFT : FORM ================= */}
      <div className="p-6 overflow-y-auto border-r">

        <Section title="Personal Details">
          <Input placeholder="Full Name" onChange={(e) => updatePersonal("name", e.target.value)} />
          <Input placeholder="Job Title" onChange={(e) => updatePersonal("role", e.target.value)} />
          <Input placeholder="Email" onChange={(e) => updatePersonal("email", e.target.value)} />
          <Input placeholder="Phone" onChange={(e) => updatePersonal("phone", e.target.value)} />
          <Input placeholder="Address" onChange={(e) => updatePersonal("address", e.target.value)} />
          <Input placeholder="LinkedIn URL" onChange={(e) => updatePersonal("linkedin", e.target.value)} />

          {/* PHOTO UPLOAD */}
          <input type="file" accept="image/*" onChange={handlePhotoUpload} />
        </Section>

        <Section title="About Me">
          <textarea
            className="input h-24"
            placeholder="Write about yourself"
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
              <Input placeholder="Job Title" onChange={(e) => updateItem("experience", i, "role", e.target.value)} />
              <Input placeholder="Company" onChange={(e) => updateItem("experience", i, "company", e.target.value)} />
              <Input placeholder="Duration" onChange={(e) => updateItem("experience", i, "duration", e.target.value)} />
              <textarea
                className="input h-20"
                placeholder="Achievements (one per line)"
                onChange={(e) => updateItem("experience", i, "description", e.target.value)}
              />
            </Box>
          ))}
          <AddButton onClick={() => addItem("experience", { role: "", company: "", duration: "", description: "" })}>
            + Add Experience
          </AddButton>
        </Section>

        <Section title="Education">
          {resume.education.map((ed, i) => (
            <Box key={i}>
              <Input placeholder="Degree" onChange={(e) => updateItem("education", i, "degree", e.target.value)} />
              <Input placeholder="Institute" onChange={(e) => updateItem("education", i, "institute", e.target.value)} />
              <Input placeholder="Year" onChange={(e) => updateItem("education", i, "year", e.target.value)} />
            </Box>
          ))}
          <AddButton onClick={() => addItem("education", { degree: "", institute: "", year: "" })}>
            + Add Education
          </AddButton>
        </Section>

        {/* PROJECTS SECTION */}
        <Section title="Projects">
          {resume.projects.map((pr, i) => (
            <Box key={i}>
              <Input placeholder="Project Title" onChange={(e) => updateItem("projects", i, "title", e.target.value)} />
              <Input placeholder="Tech Stack" onChange={(e) => updateItem("projects", i, "tech", e.target.value)} />
              <textarea
                className="input h-20"
                placeholder="Project Description"
                onChange={(e) => updateItem("projects", i, "description", e.target.value)}
              />
            </Box>
          ))}
          <AddButton onClick={() => addItem("projects", { title: "", tech: "", description: "" })}>
            + Add Project
          </AddButton>
        </Section>

      </div>

      {/* ================= RIGHT : RESUME PREVIEW ================= */}
      <div className="bg-gray-100 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white border">
          <div className="grid grid-cols-3 min-h-screen">

            {/* ===== LEFT SIDEBAR ===== */}
            <div className="bg-teal-200 p-6 text-sm">

              {/* PHOTO */}
              <div className="flex justify-center mb-4">
                {resume.personal.photo ? (
                  <img
                    src={resume.personal.photo}
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gray-300" />
                )}
              </div>

              <h3 className="font-semibold uppercase mb-2">Info</h3>
              <p><strong>Name:</strong> {resume.personal.name || "Your Name"}</p>
              <p><strong>Address:</strong> {resume.personal.address}</p>
              <p><strong>Phone:</strong> {resume.personal.phone}</p>
              <p><strong>Email:</strong> {resume.personal.email}</p>

              <p className="mt-2 text-blue-700 break-all">
                {resume.personal.linkedin}
              </p>

              <h3 className="font-semibold uppercase mt-6 mb-2">Skills</h3>
              {resume.skills.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  {s}
                </div>
              ))}
            </div>

            {/* ===== RIGHT CONTENT ===== */}
            <div className="col-span-2 bg-amber-50 p-8">

              {resume.summary && (
                <section className="mb-6">
                  <h2 className="text-lg font-bold uppercase mb-2">About Me</h2>
                  <p className="text-sm">{resume.summary}</p>
                </section>
              )}

              <section className="mb-6">
                <h2 className="text-lg font-bold uppercase mb-3">Education</h2>
                {resume.education.map((ed, i) => (
                  <div key={i} className="mb-3 pl-4 border-l-2 border-gray-400">
                    <p className="font-medium">{ed.degree}</p>
                    <p className="text-sm">{ed.institute}</p>
                    <p className="text-xs text-gray-500">{ed.year}</p>
                  </div>
                ))}
              </section>

              <section className="mb-6">
                <h2 className="text-lg font-bold uppercase mb-3">Experience</h2>
                {resume.experience.map((ex, i) => (
                  <div key={i} className="mb-4 pl-4 border-l-2 border-gray-400">
                    <p className="font-medium">{ex.role} — {ex.company}</p>
                    <p className="text-xs text-gray-500">{ex.duration}</p>
                    <ul className="list-disc list-inside text-sm">
                      {ex.description?.split("\n").map((d, idx) => (
                        <li key={idx}>{d}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>

              {/* PROJECTS PREVIEW */}
              {resume.projects.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold uppercase mb-3">Projects</h2>
                  {resume.projects.map((pr, i) => (
                    <div key={i} className="mb-4">
                      <p className="font-medium">{pr.title}</p>
                      <p className="text-xs text-gray-500">{pr.tech}</p>
                      <p className="text-sm">{pr.description}</p>
                    </div>
                  ))}
                </section>
              )}

            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
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

const Input = (props) => (
  <input {...props} className="input w-full mb-2 px-3 py-2 border rounded" />
);

const Box = ({ children }) => (
  <div className="border p-3 mb-3 rounded">{children}</div>
);

const AddButton = ({ children, ...props }) => (
  <button {...props} className="bg-black text-white px-4 py-2 rounded">
    {children}
  </button>
);

export default Modern;
