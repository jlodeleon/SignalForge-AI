"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ShieldCheck, User } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function LoginPage() {
  const { setUser, addNotification } = useApp();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Validate forms
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    if (!email) {
      setErrorMsg("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    if (activeTab === "login") {
      if (!password || password.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        setIsLoading(false);
        return;
      }

      try {
        if (isSupabaseConfigured) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          
          if (data.user) {
            const userProfile = {
              id: data.user.id,
              email: data.user.email || email,
              full_name: data.user.user_metadata.full_name || "Alex Mercer",
              role: (data.user.user_metadata.role || "Admin"),
            };
            setUser(userProfile as any);
            localStorage.setItem("sf_user", JSON.stringify(userProfile));
          }
        } else {
          // Local storage failover login
          const mockUser = {
            id: "usr-mock-1",
            email,
            full_name: name || "Alex Mercer",
            role: "Admin" as const,
          };
          setUser(mockUser);
          localStorage.setItem("sf_user", JSON.stringify(mockUser));
        }

        addNotification("Welcome back", `Logged in as ${email}`, "success");
        router.push("/dashboard");
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to sign in. Please verify credentials.");
      }
    } else {
      // Forgot Password flow
      try {
        if (isSupabaseConfigured) {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/login`,
          });
          if (error) throw error;
        }
        addNotification("Password Reset Sent", `Recovery instructions sent to ${email}`, "success");
        setActiveTab("login");
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to initiate recovery.");
      }
    }
    
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-background flex flex-col justify-between items-center p-6 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-[-300px] left-[-300px] w-[800px] h-[800px] bg-neutral-100/50 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-300px] right-[-300px] w-[800px] h-[800px] bg-blue-50/20 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Top Header branding */}
      <div className="w-full flex items-center justify-between max-w-7xl z-10">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="SignalForge Logo" className="w-8 h-8 object-contain shrink-0" />
          <span className="font-serif font-bold text-sm tracking-tight text-foreground">
            SignalForge AI
          </span>
        </div>

      </div>

      {/* Center Auth Card */}
      <div className="w-full max-w-[420px] my-auto z-10">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-charcoal">
            Welcome to SignalForge
          </h2>
          <p className="text-xs text-brand-stone mt-2">
            Turning Data into Smarter Decisions
          </p>
        </div>

        {/* Auth form box */}
        <div className="bg-card border border-border rounded-2xl shadow-popup p-6 md:p-8">
          {/* Tab selector */}
          <div className="flex bg-slate-950 border border-border/80 rounded-lg p-0.5 mb-6 relative">
            <button
              onClick={() => { setActiveTab("login"); setErrorMsg(""); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md relative z-10 transition-colors ${activeTab === "login" ? "text-white" : "text-brand-slate hover:text-white"}`}
            >
              {activeTab === "login" && (
                <motion.div
                  layoutId="auth-tab-active"
                  className="absolute inset-0 bg-brand-blue rounded-md shadow-premium z-0"
                />
              )}
              <span className="relative z-10">Log In</span>
            </button>
            <button
              onClick={() => { setActiveTab("forgot"); setErrorMsg(""); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md relative z-10 transition-colors ${activeTab === "forgot" ? "text-white" : "text-brand-slate hover:text-white"}`}
            >
              {activeTab === "forgot" && (
                <motion.div
                  layoutId="auth-tab-active"
                  className="absolute inset-0 bg-brand-blue rounded-md shadow-premium z-0"
                />
              )}
              <span className="relative z-10">Forgot Password</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-red-50 border border-red-200 text-brand-rose text-xs rounded-lg p-3 font-medium"
                >
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Simulated Demo Profile Init Name */}
            {activeTab === "login" && !isSupabaseConfigured && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-serif uppercase tracking-wider text-brand-stone">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-brand-stone" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    type="text"
                    className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-brand-blue"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-serif uppercase tracking-wider text-brand-stone">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-brand-stone" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.mercer@signalforge.ai"
                  type="email"
                  className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-brand-blue"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            {activeTab === "login" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-serif uppercase tracking-wider text-brand-stone">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-brand-stone" />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-background border border-border rounded-lg pl-9 pr-10 py-2.5 text-xs outline-none focus:ring-1 focus:ring-brand-blue"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-brand-stone hover:text-brand-charcoal transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button
              variant="accent"
              type="submit"
              isLoading={isLoading}
              className="w-full text-xs font-semibold py-2.5 mt-2 bg-brand-blue hover:bg-blue-600 text-white border-brand-blue shadow-premium"
            >
              {activeTab === "login" ? "Enter Workspace" : "Send Recovery Link"}
            </Button>
          </form>
        </div>

        {/* Demo Mode Notice */}
        {!isSupabaseConfigured && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-[10px] text-brand-stone font-medium bg-[#0C101B] border border-border/80 rounded-lg py-2.5 px-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Running in Demo Sandbox (Supabase environment variables optional)</span>
          </div>
        )}
      </div>

      {/* Footer lockup */}
      <footer className="w-full text-center text-[10px] text-brand-stone font-semibold mt-auto pt-6 z-10">
        <p>© 2026 SignalForge AI. All rights reserved.</p>
        <p className="mt-1 flex items-center justify-center space-x-1">
          <span>Built by</span>
          <span className="font-serif font-extrabold text-foreground tracking-tight">KrissDevHub Technologies</span>
        </p>
      </footer>
    </main>
  );
}
