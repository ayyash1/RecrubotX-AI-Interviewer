import React, { useState, useLayoutEffect, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

const TOOLTIP_W = 280;
const GAP = 16;
const MARGIN = 12;

/** Choose the best placement: RIGHT → LEFT → BELOW → ABOVE → CENTER */
const placeTooltip = (targetRect, tooltipH) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tr = targetRect.left + targetRect.width;
  const tb = targetRect.top + targetRect.height;

  const clampX = (x) => Math.max(MARGIN, Math.min(x, vw - TOOLTIP_W - MARGIN));
  const clampY = (y) => Math.max(MARGIN, Math.min(y, vh - tooltipH - MARGIN));
  const centredY = clampY(targetRect.top + targetRect.height / 2 - tooltipH / 2);
  const centredX = clampX(targetRect.left + targetRect.width / 2 - TOOLTIP_W / 2);

  if (tr + GAP + TOOLTIP_W <= vw - MARGIN)
    return { left: tr + GAP, top: centredY };
  if (targetRect.left - GAP - TOOLTIP_W >= MARGIN)
    return { left: targetRect.left - GAP - TOOLTIP_W, top: centredY };
  if (tb + GAP + tooltipH <= vh - MARGIN)
    return { top: tb + GAP, left: centredX };
  if (targetRect.top - GAP - tooltipH >= MARGIN)
    return { top: targetRect.top - GAP - tooltipH, left: centredX };

  return { top: vh / 2 - tooltipH / 2, left: vw / 2 - TOOLTIP_W / 2 };
};

const PAD = 8;
const buildSpotlight = (r) =>
  `M0,0 H${window.innerWidth} V${window.innerHeight} H0 Z ` +
  `M${r.left - PAD},${r.top - PAD} ` +
  `h${r.width + PAD * 2} ` +
  `a8,8 0 0 1 8,8 ` +
  `v${r.height + PAD * 2 - 16} ` +
  `a8,8 0 0 1 -8,8 ` +
  `h-${r.width + PAD * 2} ` +
  `a8,8 0 0 1 -8,-8 ` +
  `V${r.top - PAD + 8} ` +
  `a8,8 0 0 1 8,-8 Z`;

const TourOverlay = ({ steps, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipH, setTooltipH] = useState(220);
  const [ready, setReady] = useState(false); // only show tooltip once target rect available
  const tooltipRef = useRef(null);

  const step = steps[currentStep];

  // Scroll target into view, then measure
  useLayoutEffect(() => {
    setReady(false);
    const el = step?.target ? document.querySelector(step.target) : null;
    if (el) {
      el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
      const timer = setTimeout(() => {
        const r = el.getBoundingClientRect();
        setTargetRect({ left: r.left, top: r.top, width: r.width, height: r.height });
        setReady(true);
      }, 130);
      return () => clearTimeout(timer);
    } else {
      setTargetRect(null);
    }
  }, [currentStep, step]);

  // Remeasure tooltip height after every render
  useEffect(() => {
    if (tooltipRef.current) {
      const h = tooltipRef.current.offsetHeight;
      if (h && h !== tooltipH) setTooltipH(h);
    }
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((c) => c + 1);
    else onFinish();
  };
  const handleBack = () => { if (currentStep > 0) setCurrentStep((c) => c - 1); };

  const pos = targetRect
    ? placeTooltip(targetRect, tooltipH)
    : { top: "50%", left: "50%", transform: "translate(-50%,-50%)" };

  const spotPath = targetRect ? buildSpotlight(targetRect) : null;
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0" style={{ zIndex: 9998, pointerEvents: "all" }}>
      {/* Dimmed backdrop with spotlight hole */}
      <svg className="absolute inset-0 w-full h-full" onClick={onFinish} style={{ cursor: "default" }}>
        {spotPath
          ? <path d={spotPath} fill="rgba(0,0,0,0.6)" fillRule="evenodd" />
          : <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" />}
      </svg>

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        {ready && (
          <motion.div
            key={currentStep}
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              transform: pos.transform ?? undefined,
              width: TOOLTIP_W,
              zIndex: 10000,
            }}
            className="bg-white rounded-2xl shadow-2xl p-5"
          >
            <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-1.5">
              {currentStep + 1} / {steps.length}
            </p>
            <h3 className="text-[15px] font-bold text-gray-900 mb-1 leading-snug">
              {step.title}
            </h3>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
              {step.description}
            </p>

            <div className="flex items-center justify-between">
              <button onClick={handleBack} disabled={currentStep === 0}
                className="flex items-center gap-0.5 text-[13px] text-gray-400 hover:text-gray-600 disabled:opacity-25 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={handleNext}
                className="flex items-center gap-1 bg-[#0a2a5e] text-white text-[13px] font-semibold px-4 py-1.5 rounded-lg hover:bg-[#0d3575] transition-colors">
                {isLast ? "Done" : "Next"}
                {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-3.5">
              {steps.map((_, i) => (
                <button key={i} onClick={() => setCurrentStep(i)}
                  className={`rounded-full transition-all duration-200 ${i === currentStep ? "w-5 h-1.5 bg-[#0a2a5e]" : "w-1.5 h-1.5 bg-gray-200 hover:bg-gray-300"}`}
                />
              ))}
            </div>

            <button onClick={onFinish}
              className="w-full mt-3 text-[13px] text-blue-600 hover:text-blue-700 transition-colors py-1.5 rounded-lg hover:bg-blue-50 font-medium">
              Skip Tour
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TourOverlay;
