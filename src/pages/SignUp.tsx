"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, User, ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

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
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSignUp({ email, password, firstName, lastName });
    setIsLoading(false);
  };

  const passwordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Back</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-800" padding="none">
          <div className="p-8">
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                <Brain className="w-7 h-7 text-blue-400" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-display font-bold text-white mb-2">
                Create Your Account
              </h1>
              <p className="text-slate-400">
                Start your AI-powered learning journey
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      required
                      className={cn(
                        "w-full pl-12 pr-4 py-3 rounded-xl",
                        "bg-slate-800 border border-slate-700",
                        "text-white placeholder-slate-500",
                        "focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
                        "outline-none transition-all"
                      )}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                    className={cn(
                      "w-full px-4 py-3 rounded-xl",
                      "bg-slate-800 border border-slate-700",
                      "text-white placeholder-slate-500",
                      "focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
                      "outline-none transition-all"
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className={cn(
                      "w-full pl-12 pr-4 py-3 rounded-xl",
                      "bg-slate-800 border border-slate-700",
                      "text-white placeholder-slate-500",
                      "focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
                      "outline-none transition-all"
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    minLength={8}
                    className={cn(
                      "w-full pl-12 pr-12 py-3 rounded-xl",
                      "bg-slate-800 border border-slate-700",
                      "text-white placeholder-slate-500",
                      "focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
                      "outline-none transition-all"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength */}
                {password && (
                  <div className="mt-3">
                    <div className="flex gap-1 mb-2">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-colors",
                            i < passwordStrength() ? strengthColors[passwordStrength() - 1] : "bg-slate-700"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      Password strength: {strengthLabels[passwordStrength() - 1] || 'Too weak'}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  required
                  className="w-4 h-4 mt-0.5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-400">
                  I agree to the{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
                </span>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-6"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            {/* Features */}
            <div className="mt-6 space-y-2">
              {['AI-personalized learning paths', 'Spaced repetition system', 'Progress tracking & analytics'].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-slate-400">
                  <Check className="w-4 h-4 text-green-400" />
                  {feature}
                </div>
              ))}
            </div>

            {/* Sign In Link */}
            <p className="text-center text-slate-400 mt-6">
              Already have an account?{' '}
              <button 
                onClick={onBack}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
