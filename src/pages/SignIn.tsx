"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SignInProps {
  onSignIn: (email: string, password: string) => void;
  onBack: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onSignIn, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Integrate with backend auth API
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSignIn(email, password);
    setIsLoading(false);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background-light dark:bg-background-dark font-display antialiased">
      {/* Background decorative SVG */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <svg 
          className="absolute bottom-0 left-0 w-full h-auto text-primary/5" 
          fill="none" 
          height="100%" 
          preserveAspectRatio="xMidYMid slice" 
          viewBox="0 0 1440 800" 
          width="100%" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M-200 800L1640 0V800H-200Z" stroke="currentColor" strokeWidth="1" />
          <path d="M-200 400L1640 400" stroke="currentColor" strokeWidth="1" />
          <path d="M-200 600L1640 200" stroke="currentColor" strokeWidth="1" />
          <path d="M-200 200L1640 600" stroke="currentColor" strokeWidth="1" />
          <path d="M620 -100L620 900" stroke="currentColor" strokeWidth="1" />
          <path d="M1020 -100L1020 900" stroke="currentColor" strokeWidth="1" />
          <path d="M220 -100L220 900" stroke="currentColor" strokeWidth="1" />
          <path d="M1420 -100L1420 900" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        {/* Logo and Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-primary/10 rounded-full border border-primary/20">
            <span className="material-symbols-outlined text-primary text-4xl">
              neurology
            </span>
          </div>
          <h1 className="text-white tracking-light text-[32px] font-bold leading-tight">PolyMathOS</h1>
          <p className="text-white/60 text-base font-normal leading-normal pt-2">Unlock Your Potential</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <label className="flex flex-col w-full">
            <p className="text-white text-base font-medium leading-normal pb-2">Email Address</p>
            <input 
              className="form-input flex w-full resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-white/10 bg-white/5 h-14 placeholder:text-white/40 p-4 text-base font-normal leading-normal transition-shadow duration-200" 
              placeholder="Enter your email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col w-full">
            <p className="text-white text-base font-medium leading-normal pb-2">Password</p>
            <div className="relative flex w-full items-stretch">
              <input 
                className="form-input flex w-full resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-white/10 bg-white/5 h-14 placeholder:text-white/40 p-4 pr-12 text-base font-normal leading-normal transition-shadow duration-200" 
                placeholder="Enter your password" 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/40 hover:text-white/80 transition-colors"
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </label>

          {/* CTA and Biometric Login */}
          <div className="flex w-full items-center gap-4 mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-5 flex-1 bg-primary text-white text-base font-bold leading-normal tracking-wide hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <span className="truncate">{isLoading ? 'Signing in...' : 'Sign In'}</span>
            </button>
            <button
              type="button"
              className="flex h-14 w-14 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-3xl">
                fingerprint
              </span>
            </button>
          </div>
        </form>

        {/* Secondary Links */}
        <div className="mt-8 flex w-full justify-between text-sm">
          <a className="font-medium text-white/50 hover:text-primary transition-colors" href="#">
            Forgot Password?
          </a>
          <a 
            onClick={(e) => {
              e.preventDefault();
              onBack();
            }}
            className="font-medium text-white/50 hover:text-primary transition-colors cursor-pointer" 
            href="#"
          >
            Don't have an account? <span className="font-bold text-white/80 hover:text-primary">Sign Up</span>
          </a>
        </div>
      </div>
    </div>
  );
};
