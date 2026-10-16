"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Utensils,
  ChefHat,
  QrCode,
  BarChart3,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CircleAlert,
  ArrowRight,
  Shield,
  Sparkles,
} from "lucide-react";
import api from "@/lib/api";
import { setToken, isAuthenticated } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPos, setRememberPos] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post("/api/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;
      if (user?.role && user.role !== "restaurant_admin" && user.role !== "admin") {
        const msg = "Access restricted. Restaurant manager credentials required.";
        toast.error(msg);
        setErrorMsg(msg);
        setLoading(false);
        return;
      }

      setToken(token);
      toast.success(`Welcome back, ${user?.name || "Manager"}!`);
      router.replace("/dashboard");
    } catch (err: any) {
      const serverErr =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Incorrect email or password";
      setErrorMsg(serverErr);
      toast.error(serverErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#020905] flex flex-col lg:flex-row font-sans text-emerald-100 selection:bg-emerald-500 selection:text-black overflow-hidden relative">
      {/* Background Ambient Radial Glows */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/[0.05] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-emerald-600/[0.04] rounded-full blur-[160px] pointer-events-none" />

      {/* Left Column: Visual Brand Banner (Desktop) */}
      <div className="relative hidden lg:flex lg:w-7/12 flex-col justify-between p-8 xl:p-14 h-full overflow-hidden border-r border-emerald-950/80 bg-gradient-to-br from-[#020905] via-[#04190e] to-[#020905]">
        {/* Glow Spheres */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-12 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <Utensils className="w-5 h-5 text-[#020905]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-serif font-bold tracking-tight text-white">Scanzaa</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#062012] text-emerald-400 font-semibold border border-emerald-700/50 uppercase tracking-wider">
                Partner Hub
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Digital Dining & Kitchen Portal</p>
          </div>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 my-auto py-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#041d0f]/80 border border-emerald-500/30 text-xs font-semibold text-emerald-300 mb-4 backdrop-blur-sm shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kitchen Operations & Digital QR Suite</span>
          </div>

          <h1 className="font-serif text-3xl xl:text-5xl font-medium text-white tracking-tight leading-[1.18] mb-4">
            Command Your Kitchen &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300">
              Live Dining Menus
            </span>
          </h1>

          <p className="text-gray-300 text-sm xl:text-base leading-relaxed mb-6">
            Keep your digital menu synchronized, toggle out-of-stock items in real time, generate high-definition table QR stands, and deliver seamless contactless dining.
          </p>

          <div className="space-y-3">
            {/* Feature 1 */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#031409]/90 border border-emerald-900/40 backdrop-blur-sm hover:border-emerald-600/50 transition-all">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5 border border-emerald-900/60">
                <ChefHat className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">
                    Instant Stock & 86-Item Control
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium bg-[#062012] px-2 py-0.5 rounded-full border border-emerald-700/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live sync
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                  Mark sold-out dishes in a single tap to instantly prevent diner disappointment across all active tables.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#031409]/90 border border-emerald-900/40 backdrop-blur-sm hover:border-emerald-600/50 transition-all">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5 border border-emerald-900/60">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Table & Counter QR Code Studio</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                  Generate crisp, print-ready SVG & PNG QR stands for each dining table and billing counter.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#031409]/90 border border-emerald-900/40 backdrop-blur-sm hover:border-emerald-600/50 transition-all">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5 border border-emerald-900/60">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Live Diner Menu Intelligence</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                  Gain instant visibility into diner menu scans, popular dish views, and peak meal rush hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-emerald-950 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-200 font-medium">Kitchen POS & QR Network Active</span>
          </div>
          <span>v2.4 Partner Edition</span>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="w-full lg:w-5/12 flex flex-col justify-between p-6 sm:p-8 xl:p-12 h-full bg-[#020a06]/95 relative overflow-y-auto lg:overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-emerald-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-md">
              <Utensils className="w-4 h-4 text-[#020905]" />
            </div>
            <div>
              <span className="text-lg font-serif font-bold text-white">Scanzaa</span>
              <span className="text-[10px] ml-1.5 text-gray-400">Partner Hub</span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-300 bg-[#062012] px-2.5 py-1 rounded-full border border-emerald-700/50">
            Restaurant Admin
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="my-auto max-w-sm w-full mx-auto"
        >
          <div className="mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#062012] border border-emerald-700/60 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
              <ChefHat className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-white tracking-tight">
              Restaurant Sign In
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Enter your manager credentials to access your restaurant kitchen portal.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-emerald-300"
              >
                Manager Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/60" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  placeholder="admin@restaurant.com"
                  autoComplete="email"
                  autoFocus
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#031409] border border-emerald-900/60 rounded-xl text-sm text-white placeholder-emerald-400/30 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-emerald-300"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/60" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className={cn(
                    "w-full pl-10 pr-11 py-2.5 bg-[#031409] rounded-xl text-sm text-white placeholder-emerald-400/30 transition-all shadow-inner focus:outline-none font-mono text-xs border",
                    errorMsg
                      ? "border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-emerald-900/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400/60 hover:text-emerald-300 p-1 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-semibold animate-in fade-in duration-200">
                <CircleAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Remember Device */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberPos}
                  onChange={(e) => setRememberPos(e.target.checked)}
                  className="w-4 h-4 rounded border-emerald-900/60 bg-[#031409] text-emerald-500 focus:ring-emerald-400"
                />
                <span className="text-xs text-gray-400">Remember this POS / Device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 bg-[#22c55e] hover:bg-[#16a34a] text-[#022c15] font-bold rounded-xl shadow-lg shadow-emerald-900/40 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#022c15] border-t-transparent rounded-full animate-spin" />
                  <span>Entering Kitchen Portal...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-5 p-3.5 rounded-xl bg-[#031409] border border-emerald-950 flex items-start gap-2.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Secure Restaurant Environment • Real-time 86-item stock availability sync and multi-tenant data isolation active.
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="pt-3 text-center text-xs text-gray-500">
          Scanzaa © 2026 • All rights reserved
        </div>
      </div>
    </div>
  );
}
