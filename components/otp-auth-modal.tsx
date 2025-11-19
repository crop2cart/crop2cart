"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string) => void;
}

export function OTPAuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const { setUser, setToken } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [verifyStep, setVerifyStep] = useState(false);
  const [otp, setOtp] = useState("");

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user && isOpen) {
      onClose();
    }
  }, [isOpen]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Step 1: Create account
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create account");
        return;
      }

      setMessage("OTP sent to your email. Enter it to verify your account.");
      setVerifyStep(true);
    } catch (err) {
      setError("Failed to sign up. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-signup-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to verify OTP");
        return;
      }

      // Update AuthContext state (this will also update localStorage)
      setToken(data.token);
      setUser(data.user);

      setMessage("Account created successfully!");
      setTimeout(() => {
        onLogin(email);
        onClose();
        resetForm();
      }, 1500);
    } catch (err) {
      setError("Failed to verify OTP. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid email or password");
        return;
      }

      // Update AuthContext state (this will also update localStorage and cookies)
      setToken(data.token);
      setUser(data.user);

      setMessage("Signed in successfully!");
      setTimeout(() => {
        onLogin(email);
        onClose();
        resetForm();
      }, 1500);
    } catch (err) {
      setError("Failed to sign in. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setOtp("");
    setVerifyStep(false);
    setMode("signin");
    setError("");
    setMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-dashed rounded-lg max-w-md w-full shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dashed">
          <h2 className="text-xl font-bold">
            {verifyStep
              ? "Verify Email"
              : mode === "signin"
                ? "Sign In"
                : "Create Account"}
          </h2>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="p-1 hover:bg-muted rounded-lg transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {message && (
            <div className="p-3 bg-green-100 text-green-800 rounded-lg text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Verify OTP Step */}
          {verifyStep ? (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We've sent a verification code to <span className="font-medium">{email}</span>
              </p>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Enter 6-digit Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="w-full px-4 py-2 border border-dashed rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full gap-2"
                size="lg"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                Verify & Sign Up
              </Button>

              <button
                type="button"
                onClick={() => {
                  setVerifyStep(false);
                  setOtp("");
                }}
                className="w-full text-sm text-primary hover:underline"
              >
                Back to Signup
              </button>
            </form>
          ) : mode === "signin" ? (
            <form onSubmit={handleSignin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2 border border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2 border border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full gap-2"
                size="lg"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                Sign In
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                    setMessage("");
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  Sign Up
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Crop2cart"
                  required
                  className="w-full px-4 py-2 border border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2 border border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 6 characters
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full gap-2"
                size="lg"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                Create Account
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                    setMessage("");
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
