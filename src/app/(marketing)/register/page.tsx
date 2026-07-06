"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mail, Lock, User, Building, ShieldCheck, ArrowRight } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";

export default function RegisterPage() {
  const { setUser, updateOrganization, addNotification } = useApp();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    if (!email || !name || !org || !password) {
      setErrorMsg("Please fill out all fields.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    try {
      if (isSupabaseConfigured) {
        // Actual Supabase Sign Up flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: "Admin",
            }
          }
        });
        if (error) throw error;
        
        if (data.user) {
          const userProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: name,
            role: "Admin" as const,
          };
          setUser(userProfile);
          localStorage.setItem("sf_user", JSON.stringify(userProfile));
          updateOrganization(org);
        }
      } else {
        // Fallback Sandbox logic
        const mockUser = {
          id: `usr-mock-${Date.now()}`,
          email,
          full_name: name,
          role: "Admin" as const,
        };
        setUser(mockUser);
        localStorage.setItem("sf_user", JSON.stringify(mockUser));
        updateOrganization(org);
      }

      addNotification("Workspace Initialized", `Registered ${name} as Admin of ${org}`, "success");
      
      // Trigger canvas confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ["#2563EB", "#10B981", "#1C1917"]
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 500);

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initialize workspace.");
    }

    setIsLoading(false);
  };

  return (
    <main className="min-h-[90vh] flex flex-col justify-center items-center px-6 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-neutral-100/50 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-blue-50/20 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Center Auth Card */}
      <div className="w-full max-w-[420px] z-10 space-y-6">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-charcoal">
            Create Your Workspace
          </h2>
          <p className="text-xs text-brand-stone mt-2">
            Build your team data workspace node in seconds.
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-card border border-border rounded-2xl shadow-popup p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-brand-rose text-xs rounded-lg p-3 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-serif uppercase tracking-wider text-brand-stone">Your Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-brand-stone" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  type="text"
                  className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-brand-blue"
                  required
                />
              </div>
            </div>

            {/* Company / Org Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-serif uppercase tracking-wider text-brand-stone">Company / Organization</label>
              <div className="relative">
                <Building className="absolute left-3 top-3 w-4 h-4 text-brand-stone" />
                <input
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  placeholder="SignalForge AI"
                  type="text"
                  className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-brand-blue"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
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

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-serif uppercase tracking-wider text-brand-stone">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-brand-stone" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-brand-blue"
                  required
                />
              </div>
            </div>

            <Button
              variant="accent"
              type="submit"
              isLoading={isLoading}
              className="w-full text-xs font-semibold py-2.5 mt-2 bg-brand-blue hover:bg-blue-600 text-white border-brand-blue shadow-premium"
            >
              Initialize Workspace Node
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </form>

          <div className="h-px bg-border my-6" />

          <p className="text-[10px] text-center text-brand-stone font-semibold">
            Already have an active workspace?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-brand-blue hover:text-blue-700 cursor-pointer transition-colors"
            >
              Log in instead
            </span>
          </p>
        </div>

        {/* Demo Notification */}
        {!isSupabaseConfigured && (
          <div className="flex items-center justify-center space-x-2 text-[10px] text-brand-stone font-medium bg-[#0C101B] border border-border rounded-lg py-2.5 px-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Running in Demo Sandbox (Supabase environment variables optional)</span>
          </div>
        )}
      </div>
    </main>
  );
}
