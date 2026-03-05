import React, { useState, useEffect } from "react";
import { Section, Input, Textarea, AddButton, WordCounter } from "../../components/ResumeFormComponents";
import ResumePreview from "../../components/ResumePreview";

const ModernBuilder = ({ user, handleLogout, showPreview, setShowPreview }) => {
    const [resume, setResume] = useState({
        name: "",
        role: "",
        email: "",
        phone: "",
        address: "",
        linkedin: "",
        profileImage: "", // For Modern template
        summary: "",
        skills: [""],
        education: [{ degree: "", institute: "", year: "", description: "" }],
        experience: [{ role: "", company: "", duration: "", description: "" }],
        projects: [{ title: "", description: "" }],
        certifications: [""],
        references: "",
    });

    useEffect(() => {
        const saved = sessionStorage.getItem("currentResume");
        if (saved) {
            try {
                setResume(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved resume", e);
            }
        }
    }, []);

    useEffect(() => {
        const resumeData = {
            ...resume,
            name: resume.name || user?.firstName + " " + user?.lastName
        };
        sessionStorage.setItem("currentResume", JSON.stringify(resumeData));
    }, [resume, user]);

    const handleChange = (e) =>
        setResume({ ...resume, [e.target.name]: e.target.value });

    const handleArrayChange = (section, index, field, value) => {
        const updated = [...resume[section]];
        if (!updated[index]) updated[index] = {};
        updated[index][field] = value;
        setResume({ ...resume, [section]: updated });
    };

    const addItem = (section, item) =>
        setResume({ ...resume, [section]: [...resume[section], item] });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setResume({ ...resume, profileImage: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const safeResume = {
        name: resume.name || "",
        role: resume.role || "",
        email: resume.email || "",
        phone: resume.phone || "",
        address: resume.address || "",
        linkedin: resume.linkedin || "",
        profileImage: resume.profileImage || "",
        summary: resume.summary || "",
        skills: Array.isArray(resume.skills) ? resume.skills : [],
        education: Array.isArray(resume.education) ? resume.education : [],
        experience: Array.isArray(resume.experience) ? resume.experience : [],
        projects: Array.isArray(resume.projects) ? resume.projects : [],
        certifications: Array.isArray(resume.certifications) ? resume.certifications : [],
        references: resume.references || "",
    };

    if (showPreview) {
        return (
            <div className="h-full overflow-y-auto bg-white rounded-2xl shadow-lg p-8">
                <ResumePreview resume={safeResume} template="modern" />
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto pr-2">
            <div className="space-y-6 pb-6">
                <Section title="Personal Information">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {resume.profileImage && (
                            <img src={resume.profileImage} alt="Profile" className="mt-2 w-24 h-24 rounded-full object-cover border-2 border-blue-600" />
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input name="name" placeholder="Full Name" value={resume.name} onChange={handleChange} />
                        <Input name="role" placeholder="Job Title / Role" value={resume.role} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input name="email" placeholder="Email" value={resume.email} onChange={handleChange} />
                        <Input name="phone" placeholder="Phone" value={resume.phone} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input name="address" placeholder="Address" value={resume.address} onChange={handleChange} />
                        <Input name="linkedin" placeholder="LinkedIn Profile" value={resume.linkedin} onChange={handleChange} />
                    </div>
                </Section>

                <Section title="Professional Summary">
                    <div>
                        <Textarea
                            name="summary"
                            rows="4"
                            placeholder="Brief summary highlighting your strengths..."
                            value={resume.summary}
                            onChange={handleChange}
                        />
                        <WordCounter text={resume.summary} minWords={20} maxWords={40} />
                    </div>
                </Section>

                <Section title="Skills">
                    <div className="grid grid-cols-3 gap-3">
                        {safeResume.skills.map((skill, i) => (
                            <Input
                                key={i}
                                value={skill}
                                placeholder={`Skill ${i + 1}`}
                                onChange={(e) => {
                                    const skills = [...safeResume.skills];
                                    skills[i] = e.target.value;
                                    setResume({ ...resume, skills });
                                }}
                            />
                        ))}
                    </div>
                    <AddButton label="Add Skill" onClick={() => addItem("skills", "")} />
                </Section>

                <Section title="Education">
                    {safeResume.education.map((edu, i) => (
                        <div key={i} className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Input placeholder="Degree" value={edu.degree} onChange={(e) =>
                                    handleArrayChange("education", i, "degree", e.target.value)
                                } />
                                <Input placeholder="Institute" value={edu.institute} onChange={(e) =>
                                    handleArrayChange("education", i, "institute", e.target.value)
                                } />
                                <Input placeholder="Year" value={edu.year} onChange={(e) =>
                                    handleArrayChange("education", i, "year", e.target.value)
                                } />
                            </div>
                            <div>
                                <Textarea placeholder="Description (e.g., GPA, relevant coursework, achievements)" rows="2" value={edu.description} onChange={(e) =>
                                    handleArrayChange("education", i, "description", e.target.value)
                                } />
                                {edu.degree && <WordCounter text={edu.description} minWords={20} maxWords={40} />}
                            </div>
                        </div>
                    ))}
                    <AddButton label="Add Education" onClick={() =>
                        addItem("education", { degree: "", institute: "", year: "", description: "" })
                    } />
                </Section>

                <Section title="Experience">
                    {safeResume.experience.map((exp, i) => (
                        <div key={i} className="space-y-2">
                            <Input placeholder="Role" value={exp.role} onChange={(e) =>
                                handleArrayChange("experience", i, "role", e.target.value)
                            } />
                            <Input placeholder="Company" value={exp.company} onChange={(e) =>
                                handleArrayChange("experience", i, "company", e.target.value)
                            } />
                            <Input placeholder="Duration" value={exp.duration} onChange={(e) =>
                                handleArrayChange("experience", i, "duration", e.target.value)
                            } />
                            <div>
                                <Textarea placeholder="What did you achieve?" rows="3" value={exp.description}
                                    onChange={(e) =>
                                        handleArrayChange("experience", i, "description", e.target.value)
                                    }
                                />
                                {exp.role && <WordCounter text={exp.description} minWords={20} maxWords={40} />}
                            </div>
                        </div>
                    ))}
                    <AddButton label="Add Experience" onClick={() =>
                        addItem("experience", { role: "", company: "", duration: "", description: "" })
                    } />
                </Section>

                <Section title="Projects">
                    {safeResume.projects.map((proj, i) => (
                        <div key={i} className="space-y-2">
                            <Input placeholder="Project Title" value={proj.title} onChange={(e) =>
                                handleArrayChange("projects", i, "title", e.target.value)
                            } />
                            <div>
                                <Textarea placeholder="Project Description" rows="3" value={proj.description}
                                    onChange={(e) =>
                                        handleArrayChange("projects", i, "description", e.target.value)
                                    }
                                />
                                {proj.title && <WordCounter text={proj.description} minWords={25} label="Project description" />}
                            </div>
                        </div>
                    ))}
                    <AddButton label="Add Project" onClick={() =>
                        addItem("projects", { title: "", description: "" })
                    } />
                </Section>

                <Section title="Certifications">
                    <div className="grid grid-cols-2 gap-3">
                        {safeResume.certifications.map((c, i) => (
                            <Input
                                key={i}
                                placeholder={`Certification ${i + 1}`}
                                value={c}
                                onChange={(e) => {
                                    const certs = [...safeResume.certifications];
                                    certs[i] = e.target.value;
                                    setResume({ ...resume, certifications: certs });
                                }}
                            />
                        ))}
                    </div>
                    <AddButton label="Add Certification" onClick={() =>
                        addItem("certifications", "")
                    } />
                </Section>

                <Section title="References (Optional)">
                    <Textarea
                        name="references"
                        rows="2"
                        placeholder="Available upon request"
                        value={resume.references}
                        onChange={handleChange}
                    />
                </Section>
            </div>
        </div>
    );
};

export default ModernBuilder;
