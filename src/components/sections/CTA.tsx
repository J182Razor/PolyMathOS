"use client";

import React from 'react';

interface CTAProps {
  onStartTrial: () => void;
}

export const CTA: React.FC<CTAProps> = ({ onStartTrial }) => {
  return (
    <div className="mt-12 flex flex-col items-center gap-4 bg-[#1a1a1a] p-8 text-center sm:rounded-t-xl">
      <h2 className="text-white text-3xl font-bold leading-tight tracking-[-0.015em]">Begin Your Journey.</h2>
      <p className="text-[#B3B3B3] max-w-md">Unlock your full intellectual potential and redefine the boundaries of knowledge.</p>
      <button
        onClick={onStartTrial}
        className="mt-2 flex w-full max-w-xs cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-black text-base font-bold leading-normal tracking-[0.015em] shadow-[0_0_15px_rgba(0,242,255,0.4)] transition-shadow hover:shadow-[0_0_25px_rgba(0,242,255,0.6)]"
      >
        <span className="truncate">Create Your Account</span>
      </button>
    </div>
  );
};
