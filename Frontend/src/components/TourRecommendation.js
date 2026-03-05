import React, { useState, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, X } from "lucide-react";

const TourRecommendation = ({ targetSelector, onDismiss }) => {
  const [targetRect, setTargetRect] = useState(null);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const updatePosition = () => {
      const target = document.querySelector(targetSelector);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect({ top: rect.top, left: rect.left, width: rect.width });
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [targetSelector]);

  useEffect(() => {
    if (!visible) {
      setTargetRect(null);
    }
  }, [visible]);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible || !targetRect) return null;

  const offsetY = 80;
  const pointerX = targetRect.left + targetRect.width / 2;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-none"
          style={{
            position: "fixed",
            zIndex: 10020,
            top: Math.max(targetRect.top - offsetY, 16),
            left: pointerX,
            transform: "translate(-50%, -100%)",
          }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative bg-[#0a2a5e] text-white rounded-lg shadow-2xl p-4 w-max pointer-events-auto"
          >
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="text-sm font-semibold mb-2 pr-6">Get Started!</p>
            <p className="text-xs text-blue-100 mb-3">
              Click the button below to take a guided tour of all features
            </p>

            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <ArrowUp className="w-5 h-5 text-[#0a2a5e] rotate-180" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TourRecommendation;
