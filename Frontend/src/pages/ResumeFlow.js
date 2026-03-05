import React, { useState } from "react";

// import all steps correctly
import TemplateSelect from "./TemplateSelect";
import ResumeBuilder from "./ResumeBuilder";

const ResumeFlow = () => {
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState("");

  return (
    <>
      {step === 1 && (
        <TemplateSelect
          onNext={(selectedTemplate) => {
            setTemplate(selectedTemplate);
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <ResumeBuilder
          template={template}
        />
      )}
    </>
  );
};

export default ResumeFlow;
