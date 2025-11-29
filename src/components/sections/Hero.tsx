"use client";

import React from "react";
import { Button } from "../ui/Button";

interface HeroProps {
  onStartJourney: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartJourney }) => {
  return (
    <div className="@container">
      <div className="@[480px]:px-4">
        <div 
          className="flex min-h-[520px] flex-col items-center justify-center gap-6 bg-cover bg-center bg-no-repeat p-4 text-center @[480px]:gap-8 @[480px]:rounded-xl" 
          data-alt="Abstract animation of a glowing quantum state or neural network"
          style={{
            backgroundImage: `linear-gradient(rgba(18, 18, 18, 0.5) 0%, rgba(18, 18, 18, 1) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBNhArxKYsmfBy_1num5qFfDqDzUNYs_215cRLz-DSfnwAG7KWoMoEBj7hrjknHeH8E1YPO4VW9NgN1_2cLjo5eK4XocYbIno_11NDsmRrhfuPPdJc463-D5VAcV4mTwPeT2RqHI-WjRiktiyIvs7Kro7nJS4oqaiP74KVjdWPVv0uz2jVm0ii6cqBcldmJGlJdj9FwrCX69vdQL23tfFqq7igjjwKr7id8jjMuimQyFf7eKBqfdOITTPMTFdQQATCndgPDmaeMmufE")`
          }}
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-4xl font-bold leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-bold @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
              The Evolution of Intelligence is Here
            </h1>
            <h2 className="text-[#B3B3B3] text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal max-w-lg mx-auto">
              Harnessing Quantum AI and Multi-Agent Systems for Hyper-Personalized Learning
            </h2>
          </div>
          <button
            onClick={onStartJourney}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-black text-base font-bold leading-normal tracking-[0.015em] shadow-[0_0_15px_rgba(0,242,255,0.4)] transition-shadow hover:shadow-[0_0_25px_rgba(0,242,255,0.6)]"
          >
            <span className="truncate">Sign Up for Free</span>
          </button>
        </div>
      </div>
    </div>
  );
};
