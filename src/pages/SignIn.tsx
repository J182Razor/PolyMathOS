import React, { useState } from 'react';
import { Brain, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';

interface SignInProps {
  onSignIn: (email: string, password: string) => void;
  onBack: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onSignIn, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSignIn(email, password);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-dark-base flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center text-silver-medium hover:text-silver-light mb-8 transition-colors"
        >
          <Icon icon={ArrowLeft} size="sm" className="mr-2" />
          Back to Home
        </button>

        <Card className="p-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-silver-base/20 to-silver-dark/20 border border-silver-base/30 rounded-xl flex items-center justify-center mr-3">
              <Icon icon={Brain} size="lg" className="text-silver-light" />
            </div>
            <span className="text-2xl font-display font-bold text-shimmer">NeuroAscend</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-text-primary mb-2">
              Welcome Back
            </h1>
            <p className="text-text-secondary">
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-silver-base mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon icon={Mail} size="sm" className="text-silver-medium" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus-silver transition-all duration-300 ${
                    errors.email 
                      ? 'border-red-500/50 bg-red-500/5' 
                      : 'border-silver-dark/30 bg-dark-surface/50'
                  } text-text-primary placeholder-text-tertiary focus:border-silver-base/50 focus:bg-dark-surface`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-silver-base mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon icon={Lock} size="sm" className="text-silver-medium" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus-silver transition-all duration-300 ${
                    errors.password 
                      ? 'border-red-500/50 bg-red-500/5' 
                      : 'border-silver-dark/30 bg-dark-surface/50'
                  } text-text-primary placeholder-text-tertiary focus:border-silver-base/50 focus:bg-dark-surface`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <Icon 
                    icon={showPassword ? EyeOff : Eye} 
                    size="sm" 
                    className="text-silver-medium hover:text-silver-light transition-colors" 
                  />
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-silver-base focus:ring-silver-base border-silver-dark/30 rounded bg-dark-surface/50"
                />
                <span className="ml-2 text-sm text-text-secondary">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-silver-base hover:text-silver-light transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 glass rounded-lg border border-silver-dark/20">
            <p className="text-sm text-silver-light font-medium mb-2">Demo Credentials:</p>
            <p className="text-sm text-text-secondary">
              Email: demo@neuroascend.com<br />
              Password: demo123
            </p>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              Don't have an account?{' '}
              <button className="text-silver-base hover:text-silver-light font-medium transition-colors">
                Sign up for free
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

