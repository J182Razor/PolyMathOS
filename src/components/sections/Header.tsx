"use client";

import React from 'react';

interface User {
  email: string;
  firstName: string;
  lastName: string;
}

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onSignIn: () => void;
  onGetStarted: () => void;
  user: User | null;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSignIn,
  user,
  onSignOut
}) => {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-background-dark/80 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-3xl">hub</span>
        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">PolyMathOS</h2>
      </div>
      {user ? (
        <button
          onClick={onSignOut}
          className="text-[#B3B3B3] hover:text-white transition-colors text-sm font-bold leading-normal tracking-[0.015em]"
        >
          Sign Out
        </button>
      ) : (
        <a
          onClick={(e) => {
            e.preventDefault();
            onSignIn();
          }}
          className="text-[#B3B3B3] hover:text-white transition-colors text-sm font-bold leading-normal tracking-[0.015em] cursor-pointer"
          href="#"
        >
          Sign In
        </a>
      )}
    </header>
  );
};
