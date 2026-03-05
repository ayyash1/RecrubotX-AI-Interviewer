import React from "react";

const ResumePreview = ({ resume, template = "Simple" }) => {
  // Double Column Template - Matches DoubleColumn.jpg reference design
  // A4 page dimensions: 210mm × 297mm (aspect ratio ~1:1.414)
  if (template === "double-column") {
    return (
      <div id="resume-preview-content" className="w-full max-w-4xl mx-auto bg-white font-sans text-sm leading-relaxed shadow-lg flex flex-col" style={{ minHeight: '842px', height: '842px', maxHeight: '842px' }}>
        {/* Full-Width Header Section */}
        <div className="p-6 pb-4 flex-shrink-0">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {resume.name || "Your Name"}
              </h1>
              <p className="text-lg text-gray-600 font-medium mt-1">
                {resume.role || "Job Title / Role"}
              </p>
            </div>
            {/* Contact Info in Header */}
            <div className="text-right text-xs text-gray-600 space-y-1">
              <div className="flex items-center justify-end gap-2">
                <span>{resume.email || "email@example.com"}</span>
                <span className="text-blue-600">✉</span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <span>{resume.phone || "+1 234 567 890"}</span>
                <span className="text-blue-600">☎</span>
              </div>
              {resume.address && (
                <div className="flex items-center justify-end gap-2">
                  <span>{resume.address}</span>
                  <span className="text-blue-600">📍</span>
                </div>
              )}
              {resume.linkedin && (
                <div className="flex items-center justify-end gap-2">
                  <a
                    href={resume.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    LinkedIn
                  </a>
                  <span className="text-blue-600">🔗</span>
                </div>
              )}
            </div>
          </div>
          {/* Blue accent line */}
          <div className="h-1 bg-blue-600 w-full"></div>
        </div>

        {/* Two-Column Content Area - Fills remaining height */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column - Main Content (White Background) */}
          <div className="w-2/3 p-6 pt-2 overflow-hidden">
            {/* Profile Section - Always Visible */}
            <div className="mb-5">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">
                Profile
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed text-justify">
                {resume.summary || "A dedicated professional with a passion for excellence and a proven track record of delivering results."}
              </p>
            </div>

            {/* Experience Section - Always Visible */}
            <div className="mb-5">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">
                Experience
              </h2>
              <div className="space-y-4">
                {resume.experience && resume.experience.some((exp) => exp.role || exp.company) ? (
                  resume.experience
                    .filter((exp) => exp.role || exp.company)
                    .slice(0, 3)
                    .map((exp, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-900 text-sm">
                            {exp.role || "Role"}
                          </h3>
                          {exp.duration && (
                            <span className="text-xs text-gray-500">{exp.duration}</span>
                          )}
                        </div>
                        {exp.company && (
                          <p className="text-blue-700 text-xs font-medium">{exp.company}</p>
                        )}
                        {exp.description && (
                          <p className="text-gray-600 text-xs leading-relaxed mt-1">{exp.description}</p>
                        )}
                      </div>
                    ))
                ) : (
                  <p className="text-gray-400 text-xs italic">Add your work experience here</p>
                )}
              </div>
            </div>

            {/* Skills Section - Always Visible */}
            <div className="mb-5">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {resume.skills && resume.skills.filter(Boolean).length > 0 ? (
                  resume.skills.filter((skill) => skill.trim()).slice(0, 8).map((skill, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-xs italic">Add your skills here</span>
                )}
              </div>
            </div>

            {/* Projects Section - Only shown if data exists */}
            {resume.projects && resume.projects.some((proj) => proj.title || proj.description) && (
              <div className="mb-5">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">
                  Projects
                </h2>
                <div className="space-y-3">
                  {resume.projects
                    .filter((proj) => proj.title || proj.description)
                    .slice(0, 2)
                    .map((proj, idx) => (
                      <div key={idx}>
                        {proj.title && (
                          <h3 className="font-bold text-gray-900 text-sm">{proj.title}</h3>
                        )}
                        {proj.description && (
                          <p className="text-gray-600 text-xs leading-relaxed">{proj.description}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar (Dark Slate Background) */}
          <div className="w-1/3 bg-slate-800 text-white p-6 pt-2">
            {/* Education Section - Always Visible */}
            <div className="mb-5">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-600 pb-1 mb-2">
                Education
              </h2>
              <div className="space-y-3">
                {resume.education && resume.education.some((edu) => edu.degree || edu.institute) ? (
                  resume.education
                    .filter((edu) => edu.degree || edu.institute)
                    .slice(0, 2)
                    .map((edu, idx) => (
                      <div key={idx}>
                        <h3 className="font-semibold text-white text-sm">
                          {edu.degree || "Degree"}
                        </h3>
                        {edu.institute && (
                          <p className="text-slate-300 text-xs">{edu.institute}</p>
                        )}
                        {edu.year && (
                          <p className="text-slate-400 text-xs">{edu.year}</p>
                        )}
                      </div>
                    ))
                ) : (
                  <p className="text-slate-400 text-xs italic">Add your education here</p>
                )}
              </div>
            </div>

            {/* Certifications Section - Always Visible */}
            <div className="mb-5">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-600 pb-1 mb-2">
                Certifications
              </h2>
              <ul className="space-y-1">
                {resume.certifications && resume.certifications.filter(Boolean).length > 0 ? (
                  resume.certifications
                    .filter((cert) => cert.trim())
                    .slice(0, 4)
                    .map((cert, idx) => (
                      <li key={idx} className="text-slate-200 text-xs flex items-start gap-2">
                        <span className="text-slate-500">•</span>
                        {cert}
                      </li>
                    ))
                ) : (
                  <li className="text-slate-400 text-xs italic">Add certifications here</li>
                )}
              </ul>
            </div>

            {/* Languages Section - Always Visible */}
            <div className="mb-5">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-600 pb-1 mb-2">
                Languages
              </h2>
              {resume.languages && resume.languages.filter(Boolean).length > 0 ? (
                <div className="space-y-1">
                  {resume.languages.filter((lang) => lang.trim()).map((lang, idx) => (
                    <p key={idx} className="text-slate-300 text-xs">{lang}</p>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic">Add languages here</p>
              )}
            </div>

            {/* References Section */}
            <div className="mb-5">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-600 pb-1 mb-2">
                References
              </h2>
              <p className="text-slate-300 text-xs">
                {resume.references || "Available upon request"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }



  // Elegant Template - Matching uploaded reference design (Donna Stroupe style)
  if (template === "elegant") {
    return (
      <div id="resume-preview-content" className="w-full max-w-4xl mx-auto bg-white" style={{ minHeight: '842px', height: '842px', maxHeight: '842px' }}>
        {/* Header Section with Profile Photo and Curved Design */}
        <div className="relative flex items-center mb-4">
          {/* Profile Photo - Large circular with white frame */}
          <div className="relative z-10 flex-shrink-0">
            {resume.profileImage ? (
              <div className="w-56 h-56 rounded-full bg-white p-2 shadow-lg">
                <img
                  src={resume.profileImage}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="w-56 h-56 rounded-full bg-white p-2 shadow-lg flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Photo</span>
                </div>
              </div>
            )}
          </div>

          {/* Curved Header Background with Name */}
          <div className="flex-1 bg-gradient-to-r from-slate-300 to-slate-200 h-56 flex items-center pl-8 rounded-tr-[120px] -ml-28">
            <div className="ml-32">
              <h1 className="text-4xl font-bold text-gray-700 uppercase tracking-widest mb-2">
                {resume.name || "YOUR NAME"}
              </h1>
              <p className="text-xl text-gray-600 font-light">
                {resume.role || "Job Title / Role"}
              </p>
            </div>
          </div>
        </div>

        {/* Two-column content area */}
        <div className="flex gap-1">
          {/* Left Sidebar - Rounded light blue background */}
          <div className="w-[35%] bg-slate-200 px-6 py-12 pt-12 rounded-tl-[40px] rounded-tr-[40px]">
            {/* Contact Information */}
            <div className="mb-8">
              <div className="space-y-3 text-sm text-gray-700">
                {resume.email && (
                  <div className="flex items-start gap-3">
                    <span className="text-gray-600 text-base">✉</span>
                    <span className="break-all">{resume.email}</span>
                  </div>
                )}
                {resume.phone && (
                  <div className="flex items-start gap-3">
                    <span className="text-gray-600 text-base">☎</span>
                    <span>{resume.phone}</span>
                  </div>
                )}
                {resume.address && (
                  <div className="flex items-start gap-3">
                    <span className="text-gray-600 text-base">📍</span>
                    <span>{resume.address}</span>
                  </div>
                )}
                {resume.linkedin && (
                  <div className="flex items-start gap-3">
                    <span className="text-gray-600 text-base">🌐</span>
                    <a href={resume.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:underline break-all">
                      {resume.linkedin.replace('https://', '').replace('http://', '')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Education */}
            {resume.education && resume.education.some((edu) => edu.degree || edu.institute) && (
              <div className="mb-8">
                <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-4 pb-2 border-b-2 border-gray-400">
                  EDUCATION
                </h2>
                <div className="space-y-4">
                  {resume.education
                    .filter((edu) => edu.degree || edu.institute)
                    .map((edu, idx) => (
                      <div key={idx} className="text-sm">
                        <h3 className="font-bold text-gray-800">{edu.degree || "Degree"}</h3>
                        {edu.institute && <p className="text-gray-700 font-semibold mt-1">{edu.institute}</p>}
                        {edu.year && <p className="text-gray-600 text-xs mt-1">{edu.year}</p>}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {resume.skills && resume.skills.filter(Boolean).length > 0 && (
              <div className="mb-8">
                <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-4 pb-2 border-b-2 border-gray-400">
                  SKILLS
                </h2>
                <div className="space-y-2">
                  {resume.skills.filter((skill) => skill.trim()).map((skill, idx) => (
                    <div key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-gray-600">•</span>
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {resume.languages && resume.languages.filter(Boolean).length > 0 && (
              <div className="mb-8">
                <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-4 pb-2 border-b-2 border-gray-400">
                  LANGUAGE
                </h2>
                <div className="space-y-2">
                  {resume.languages.filter((lang) => lang.trim()).map((lang, idx) => (
                    <p key={idx} className="text-sm text-gray-700">{lang}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Main Content - White Background */}
          <div className="w-[65%] px-8 py-8">
            {/* About Me */}
            {resume.summary && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-300">
                  About Me
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed text-justify">{resume.summary}</p>
              </div>
            )}

            {/* Work Experience */}
            {resume.experience && resume.experience.some((exp) => exp.role || exp.company) && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-300">
                  WORK EXPERIENCE
                </h2>
                <div className="space-y-5">
                  {resume.experience
                    .filter((exp) => exp.role || exp.company)
                    .map((exp, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm text-gray-600 font-medium">
                            {exp.duration || "Date Range"}
                          </p>
                        </div>
                        {exp.company && (
                          <p className="text-sm text-gray-600 mb-1">{exp.company}</p>
                        )}
                        <h3 className="font-bold text-gray-800 text-base mb-2">{exp.role || "Role"}</h3>
                        {exp.description && (
                          <ul className="space-y-1">
                            {exp.description.split('\n').filter(line => line.trim()).map((line, i) => (
                              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-gray-500 mt-1">•</span>
                                <span className="flex-1">{line.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Projects (if any) */}
            {resume.projects && resume.projects.some((proj) => proj.title || proj.description) && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-300">
                  PROJECTS
                </h2>
                <div className="space-y-4">
                  {resume.projects
                    .filter((proj) => proj.title || proj.description)
                    .map((proj, idx) => (
                      <div key={idx}>
                        {proj.title && (
                          <h3 className="font-bold text-gray-800 text-sm mb-1">{proj.title}</h3>
                        )}
                        {proj.description && (
                          <p className="text-sm text-gray-700 leading-relaxed">{proj.description}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Certifications (if any) */}
            {resume.certifications && resume.certifications.filter(Boolean).length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-300">
                  CERTIFICATIONS
                </h2>
                <div className="space-y-2">
                  {resume.certifications
                    .filter((cert) => cert.trim())
                    .map((cert, idx) => (
                      <div key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-gray-500">•</span>
                        <span>{cert}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* References */}
            {resume.references && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-300">
                  REFERENCES
                </h2>
                <p className="text-sm text-gray-700">{resume.references}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Modern Template - Minimalist with accent colors
  if (template === "modern") {
    return (
      <div id="resume-preview-content" className="w-full max-w-4xl mx-auto bg-white font-sans text-sm leading-relaxed">
        {/* Header Section - Modern with accent */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 mb-6">
          <div className="flex items-center gap-6">
            {resume.profileImage && (
              <img
                src={resume.profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-wide mb-2">
                {resume.name || "Your Name"}
              </h1>
              <p className="text-lg opacity-90">
                {resume.role || "Job Title / Role"}
              </p>
              <div className="flex flex-wrap gap-4 mt-4 text-xs opacity-90">
                {resume.email && <span>📧 {resume.email}</span>}
                {resume.phone && <span>📞 {resume.phone}</span>}
                {resume.address && <span>📍 {resume.address}</span>}
                {resume.linkedin && (
                  <span>
                    🔗{" "}
                    <a href={resume.linkedin} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-75">
                      LinkedIn
                    </a>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6">
          {/* Professional Summary */}
          {resume.summary && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-blue-700 uppercase mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-700"></span>
                Professional Summary
              </h2>
              <p className="text-gray-700 text-justify">{resume.summary}</p>
            </div>
          )}

          {/* Skills */}
          {resume.skills && resume.skills.filter(Boolean).length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-blue-700 uppercase mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-700"></span>
                Skills
              </h2>
              <p className="text-gray-700">
                {resume.skills.filter((skill) => skill.trim()).join(", ")}
              </p>
            </div>
          )}

          {/* Experience */}
          {resume.experience && resume.experience.some((exp) => exp.role || exp.company) && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-blue-700 uppercase mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-700"></span>
                Professional Experience
              </h2>
              {resume.experience
                .filter((exp) => exp.role || exp.company)
                .map((exp, idx) => (
                  <div key={idx} className="mb-4 pl-4 border-l-2 border-blue-200">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-900">{exp.role || "Role"}</h3>
                      {exp.duration && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{exp.duration}</span>
                      )}
                    </div>
                    {exp.company && (
                      <p className="text-gray-700 text-sm font-medium mb-1">{exp.company}</p>
                    )}
                    {exp.description && (
                      <p className="text-gray-700 text-sm text-justify">{exp.description}</p>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Education */}
          {resume.education && resume.education.some((edu) => edu.degree || edu.institute) && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-blue-700 uppercase mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-700"></span>
                Education
              </h2>
              {resume.education
                .filter((edu) => edu.degree || edu.institute)
                .map((edu, idx) => (
                  <div key={idx} className="mb-4 pl-4 border-l-2 border-blue-200">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-900">{edu.degree || "Degree"}</h3>
                      {edu.year && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{edu.year}</span>
                      )}
                    </div>
                    {edu.institute && (
                      <p className="text-gray-700 text-sm font-medium">{edu.institute}</p>
                    )}
                    {edu.description && (
                      <p className="text-gray-700 text-sm text-justify mt-1">{edu.description}</p>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Projects */}
          {resume.projects && resume.projects.some((proj) => proj.title || proj.description) && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-blue-700 uppercase mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-700"></span>
                Projects
              </h2>
              {resume.projects
                .filter((proj) => proj.title || proj.description)
                .map((proj, idx) => (
                  <div key={idx} className="mb-3 pl-4 border-l-2 border-blue-200">
                    {proj.title && (
                      <h3 className="font-bold text-gray-900">{proj.title}</h3>
                    )}
                    {proj.description && (
                      <p className="text-gray-700 text-sm text-justify">{proj.description}</p>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Certifications */}
          {resume.certifications && resume.certifications.filter(Boolean).length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-blue-700 uppercase mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-700"></span>
                Certifications
              </h2>
              <ul className="list-disc list-inside space-y-1 pl-4">
                {resume.certifications
                  .filter((cert) => cert.trim())
                  .map((cert, idx) => (
                    <li key={idx} className="text-gray-700">{cert}</li>
                  ))}
              </ul>
            </div>
          )}

          {/* References */}
          {resume.references && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-blue-700 uppercase mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-700"></span>
                References
              </h2>
              <p className="text-gray-700 text-sm">{resume.references}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default Single Column Template (Simple)
  return (
    <div id="resume-preview-content" className="w-full max-w-4xl mx-auto bg-white p-8 font-sans text-sm leading-relaxed" style={{ minHeight: '842px', height: '842px', maxHeight: '842px' }}>
      {/* Header Section */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
          {resume.name || "Your Name"}
        </h1>
        <p className="text-lg text-gray-600 mt-1">
          {resume.role || "Job Title / Role"}
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs text-gray-700">
          {resume.email && <span>📧 {resume.email}</span>}
          {resume.phone && <span>📞 {resume.phone}</span>}
          {resume.address && <span>📍 {resume.address}</span>}
          {resume.linkedin && (
            <span>
              🔗{" "}
              <a
                href={resume.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                LinkedIn
              </a>
            </span>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {resume.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-400 pb-1 mb-3">
            Professional Summary
          </h2>
          <p className="text-gray-700 text-justify">{resume.summary}</p>
        </div>
      )}

      {/* Skills */}
      {resume.skills && resume.skills.filter(Boolean).length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-400 pb-1 mb-3">
            Skills
          </h2>
          <p className="text-gray-700">
            {resume.skills
              .filter((skill) => skill.trim())
              .join(", ")}
          </p>
        </div>
      )}

      {/* Education */}
      {resume.education &&
        resume.education.some((edu) => edu.degree || edu.institute) && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-400 pb-1 mb-3">
              Education
            </h2>
            {resume.education
              .filter((edu) => edu.degree || edu.institute)
              .map((edu, idx) => (
                <div key={idx} className="mb-4">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-gray-900">
                      {edu.degree || "Degree"}
                    </h3>
                    {edu.year && (
                      <span className="text-xs text-gray-600">{edu.year}</span>
                    )}
                  </div>
                  {edu.institute && (
                    <p className="text-gray-700 text-sm">{edu.institute}</p>
                  )}
                  {edu.description && (
                    <p className="text-gray-700 text-sm text-justify mt-1">{edu.description}</p>
                  )}
                </div>
              ))}
          </div>
        )}

      {/* Experience */}
      {resume.experience &&
        resume.experience.some((exp) => exp.role || exp.company) && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-400 pb-1 mb-3">
              Professional Experience
            </h2>
            {resume.experience
              .filter((exp) => exp.role || exp.company)
              .map((exp, idx) => (
                <div key={idx} className="mb-4">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-gray-900">
                      {exp.role || "Role"}
                    </h3>
                    {exp.duration && (
                      <span className="text-xs text-gray-600">
                        {exp.duration}
                      </span>
                    )}
                  </div>
                  {exp.company && (
                    <p className="text-gray-700 text-sm italic mb-1">
                      {exp.company}
                    </p>
                  )}
                  {exp.description && (
                    <p className="text-gray-700 text-sm text-justify">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
          </div>
        )}

      {/* Projects */}
      {resume.projects &&
        resume.projects.some((proj) => proj.title || proj.description) && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-400 pb-1 mb-3">
              Projects
            </h2>
            {resume.projects
              .filter((proj) => proj.title || proj.description)
              .map((proj, idx) => (
                <div key={idx} className="mb-3">
                  {proj.title && (
                    <h3 className="font-semibold text-gray-900">
                      {proj.title}
                    </h3>
                  )}
                  {proj.description && (
                    <p className="text-gray-700 text-sm text-justify">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
          </div>
        )}

      {/* Certifications */}
      {resume.certifications &&
        resume.certifications.filter(Boolean).length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-400 pb-1 mb-3">
              Certifications
            </h2>
            <ul className="list-disc list-inside space-y-1">
              {resume.certifications
                .filter((cert) => cert.trim())
                .map((cert, idx) => (
                  <li key={idx} className="text-gray-700">
                    {cert}
                  </li>
                ))}
            </ul>
          </div>
        )}

      {/* References */}
      {resume.references && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-400 pb-1 mb-3">
            References
          </h2>
          <p className="text-gray-700 text-sm">{resume.references}</p>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
