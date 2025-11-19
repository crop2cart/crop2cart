"use client";

import { X, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string) => void;
}

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulate Google login
    setTimeout(() => {
      const mockEmail = `user${Math.random().toString(36).substring(7)}@gmail.com`;
      onLogin(mockEmail);
      setIsLoading(false);
      setEmail("");
      setPassword("");
      setError("");
    }, 1000);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    // Simulate email login
    setTimeout(() => {
      onLogin(email);
      setIsLoading(false);
      setEmail("");
      setPassword("");
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-background rounded-xl border border-dashed shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dashed">
            <h2 className="text-xl font-bold">Sign In / Sign Up</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-dashed hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="font-medium">
                {isLoading ? "Connecting..." : "Login with Google"}
              </span>
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dashed" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-3">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-dashed bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-dashed bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Footer Text */}
            <p className="text-xs text-center text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
