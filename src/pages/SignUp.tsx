"use client";

import React, { useState } from 'react';

interface SignUpProps {
  onSignUp: (userData: { email: string; password: string; firstName: string; lastName: string }) => void;
  onBack: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onSignUp, onBack }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Integrate with backend user registration API
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSignUp({ email, password, firstName, lastName });
    setIsLoading(false);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark text-white p-4">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]"></div>
      
      <div className="w-full max-w-sm relative z-10">
        <header className="flex flex-col items-center justify-center text-center pb-8">
          {/* Star icon */}
          <svg className="mb-4" fill="none" height="40" viewBox="0 0 40 40" width="40" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0L24.4721 15.5279L40 20L24.4721 24.4721L20 40L15.5279 24.4721L0 20L15.5279 15.5279L20 0Z" fill="white" fillOpacity="0.8" />
          </svg>
          <h1 className="text-white tracking-tight text-[32px] font-bold leading-tight">Begin Your Ascent</h1>
        </header>

        <main className="flex flex-col gap-3">
          {/* Full Name */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-white/80 text-base font-medium leading-normal pb-2">Full Name</p>
              <input 
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-white/5 h-14 placeholder:text-[#888888] p-4 text-base font-normal leading-normal" 
                placeholder="Enter your full name" 
                value={`${firstName} ${lastName}`.trim()}
                onChange={(e) => {
                  const parts = e.target.value.split(' ');
                  setFirstName(parts[0] || '');
                  setLastName(parts.slice(1).join(' ') || '');
                }}
                required
              />
            </label>
          </div>

          {/* Email Address */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-white/80 text-base font-medium leading-normal pb-2">Email Address</p>
              <input 
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-white/5 h-14 placeholder:text-[#888888] p-4 text-base font-normal leading-normal" 
                placeholder="Enter your email address" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
          </div>

          {/* Password */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-white/80 text-base font-medium leading-normal pb-2">Password</p>
              <div className="flex w-full flex-1 items-stretch rounded-lg">
                <input 
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-white/5 h-14 placeholder:text-[#888888] p-4 pr-2 text-base font-normal leading-normal" 
                  placeholder="Enter your password" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="flex items-center justify-center bg-white/5 pr-4 rounded-r-lg">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="material-symbols-outlined text-[#888888] cursor-pointer"
                    style={{ fontSize: '24px' }}
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </button>
                </div>
              </div>
            </label>
          </div>

          {/* Create Account Button */}
          <div className="pt-5 pb-3">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-lg bg-primary h-14 text-white text-base font-bold leading-normal transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background-dark disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          {/* Terms & Privacy */}
          <p className="text-[#888888] text-center text-sm font-normal leading-normal">
            By creating an account, you agree to our{' '}
            <a className="font-medium text-white/90 hover:underline" href="#">
              Terms & Privacy
            </a>.
          </p>
        </main>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-[#888888] text-sm">
            Already a member?{' '}
            <a 
              onClick={(e) => {
                e.preventDefault();
                onBack();
              }}
              className="font-medium text-white/90 hover:underline cursor-pointer" 
              href="#"
            >
              Sign In
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};
