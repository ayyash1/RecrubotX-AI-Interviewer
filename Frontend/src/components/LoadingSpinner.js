/**
 * RecruBotX — Brand Loading Spinner
 *
 * Variants:
 *  <LoadingSpinner />              — full-page centered overlay
 *  <LoadingSpinner inline />       — compact inline block (for table cells / panels)
 *  <LoadingSpinner size="sm" />    — tiny spinner for buttons
 *  <LoadingSpinner label="..." />  — custom label text (full-page only)
 */

import React from "react";

/* ─────────────────────────── Full-page spinner ─────────────────────────── */
const FullPageSpinner = ({ label = "Loading…" }) => (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 select-none">
        <AtlasOrbit />
        {label && (
            <p className="recrubotx-label text-sm font-medium tracking-widest uppercase text-[#0a2a5e]/50">
                {label}
            </p>
        )}
    </div>
);

/* ─────────────────────────── Inline spinner ────────────────────────────── */
const InlineSpinner = () => (
    <div className="flex items-center justify-center py-12">
        <AtlasOrbit />
    </div>
);

/* ─────────────────────────── Button / tiny spinner ─────────────────────── */
const SmallSpinner = () => (
    <span
        className="recrubotx-small-spin inline-block rounded-full border-2 border-white/30 border-t-white"
        style={{ width: 18, height: 18 }}
    />
);

/* ─────────────────────────── Core orbit animation ──────────────────────── */
const AtlasOrbit = () => (
    <div className="recrubotx-orbit-root" aria-label="Loading" role="status">
        {/* Pulsing glow ring */}
        <span className="recrubotx-glow" />

        {/* Rotating arc track */}
        <span className="recrubotx-arc" />

        {/* Three chasing dots */}
        <span className="recrubotx-dot recrubotx-dot-1" />
        <span className="recrubotx-dot recrubotx-dot-2" />
        <span className="recrubotx-dot recrubotx-dot-3" />

        {/* Center pulse */}
        <span className="recrubotx-center" />
    </div>
);

/* ─────────────────────────── Main export ───────────────────────────────── */
const LoadingSpinner = ({ inline = false, size, label }) => {
    if (size === "sm") return <SmallSpinner />;
    if (inline) return <InlineSpinner />;
    return <FullPageSpinner label={label} />;
};

export default LoadingSpinner;
