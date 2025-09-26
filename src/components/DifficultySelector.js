import React, { useState, useEffect, useRef } from "react";

export default function DifficultySlider() {
  const [value, setValue] = useState(5);
  const rangeRef = useRef(null);
  const bubbleRef = useRef(null);

  useEffect(() => {
    console.log('useEffect', value)
    const range = rangeRef.current;
    const bubble = bubbleRef.current;
    if (!range || !bubble) return;

    const min = parseFloat(range.min) || 0;
    const max = parseFloat(range.max) || 100;
    const val = parseFloat(range.value);
    const pct = ((val - min) / (max - min)) * 100;

    // move bubble
    bubble.style.left = `${pct}%`;

    // update gradient track
    const accent = "#111827"; // gray-900
    const track = "#e5e7eb"; // gray-200
    range.style.background = `linear-gradient(90deg, ${accent} 0%, ${accent} ${pct}%, ${track} ${pct}%, ${track} 100%)`;
  }, [value]);

  return (
    <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-6">
      <div className="mb-4">
        <h1 className="text-lg font-medium text-gray-900">Select difficulty</h1>
        <p className="text-sm text-gray-500">
          Choose a value between <span className="font-medium">1</span> and{" "}
          <span className="font-medium">10</span>.
        </p>
      </div>

      <div className="relative py-8">
        {/* Value bubble */}
        <div
          ref={bubbleRef}
          className="bubble absolute -top-2 transform -translate-x-1/2 px-3 py-1 rounded-full text-sm font-semibold bg-white shadow-xs border border-gray-200"
        >
          {value}
        </div>

        {/* Slider */}
        <input
          ref={rangeRef}
          type="range"
          min="1"
          max="10"
          step="1"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label="Difficulty"
          className="w-full range-gradient"
        />

        {/* Labels */}
        <div className="mt-4">
          <div className="w-full flex justify-between text-sm text-gray-600 px-1">
            <div>Easy</div>
            <div>Medium</div>
            <div>Hard</div>
          </div>
          <div className="w-full flex justify-between text-xs text-gray-400 mt-1 px-1">
            <div>1</div>
            <div>5</div>
            <div>10</div>
          </div>
        </div>
      </div>
    </div>
  );
}
