"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutGrid,
  Utensils,
  Layers,
  User,
  LogOut,
  Menu as MenuIcon,
  X,
  ExternalLink,
  Sun,
  Moon,
} from "lucide-react";
import api from "@/lib/api";
import { isAuthenticated, removeToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import PageTransition from "@/components/PageTransition";
import { useTheme } from "@/context/ThemeContext";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Menu & Stock", href: "/menu", icon: Utensils },
  { label: "Categories", href: "/categories", icon: Layers },
  { label: "Profile", href: "/profile", icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  const [profile, setProfile] = useState<{
    name: string;
    slug: string;
    status: string;
    cuisineType: string;
  }>({
    name: "",
    slug: "",
    status: "",
    cuisineType: "",
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    api
      .get("/api/restaurant/profile")
      .then((res) => {
        const data = res.data?.restaurant || res.data || {};
        if (data.name) {
          setProfile({
            name: data.name,
            slug: data.slug || "",
            status: data.status || "setup",
            cuisineType: data.cuisineType || "",
          });
        }
      })
      .catch(() => {});

    // Listen to real-time custom event when profile updates
    const handleProfileUpdate = (e: any) => {
      if (e?.detail) {
        setProfile((prev) => ({
          ...prev,
          ...(e.detail.name ? { name: e.detail.name } : {}),
          ...(e.detail.slug ? { slug: e.detail.slug } : {}),
        }));
      }
    };

    window.addEventListener("restaurant-profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("restaurant-profile-updated", handleProfileUpdate);
    };
  }, [router]);

  const handleLogout = () => {
    removeToken();
    toast.success("Logged out successfully");
    router.replace("/login");
  };

  const activeHref = pathname.startsWith("/menu")
    ? "/menu"
    : pathname.startsWith("/categories")
    ? "/categories"
    : pathname.startsWith("/profile")
    ? "/profile"
    : "/dashboard";

  const menuUrl = profile.slug
    ? `${process.env.NEXT_PUBLIC_MENU_URL || "https://renza-menu.vercel.app"}/menu/${profile.slug}`
    : "";

  const pageTitle = pathname.startsWith("/menu/new")
    ? "Add Dish"
    : pathname.includes("/edit")
    ? "Edit Dish"
    : pathname.startsWith("/menu")
    ? "Menu & Stock"
    : pathname.startsWith("/categories")
    ? "Categories"
    : pathname.startsWith("/profile")
    ? "Profile"
    : "Dashboard";

  return (
    <div
      className={cn(
        "flex h-screen w-full font-sans relative overflow-hidden transition-colors duration-200 selection:bg-emerald-500 selection:text-black",
        isLight ? "bg-[#f7f3ea] text-[#111827]" : "bg-[#020905] text-[#ecfdf5]"
      )}
    >
      {/* Background Ambient Glows */}
      {isLight ? (
        <>
          <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-[#c59a4c]/[0.05] rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#034d28]/[0.04] rounded-full blur-[150px] pointer-events-none -z-10" />
        </>
      ) : (
        <>
          <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-emerald-500/[0.04] rounded-full blur-[120px] pointer-events-none -z-10" />
          <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />
        </>
      )}

      {/* Desktop Sidebar (Full-height on left - royal forest in both themes, pine contrast in light mode) */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:w-60 xl:w-64 select-none flex-shrink-0 h-full transition-colors duration-200",
          isLight
            ? "bg-[#032516] border-r border-[#083d23]"
            : "bg-[#020805] border-r border-emerald-950/80"
        )}
      >
        {/* Navigation Links starting cleanly at the top */}
        <nav className="flex-1 px-3 pt-6 pb-4 space-y-2 overflow-y-auto sidebar-scroll">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 group relative",
                  isActive
                    ? isLight
                      ? "bg-gradient-to-r from-[#065b34] to-[#044728] text-white shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
                      : "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                    : isLight
                    ? "text-[#9ebfae] hover:bg-[#06331f] hover:text-white"
                    : "text-emerald-100/70 hover:bg-emerald-950/40 hover:text-white"
                )}
              >
                {/* Gold vertical bar for active item in light mode matching screenshot */}
                {isActive && isLight && (
                  <div className="w-1 h-5 rounded-full bg-[#d4af37] -ml-2 mr-0.5 shadow-[0_0_6px_rgba(212,175,55,0.6)]" />
                )}
                <Icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0 transition-colors",
                    isActive
                      ? "text-white"
                      : isLight
                      ? "text-[#8db8a1] group-hover:text-emerald-200"
                      : "text-emerald-400/80 group-hover:text-emerald-300"
                  )}
                />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div
          className={cn(
            "p-4 border-t space-y-2.5 transition-colors",
            isLight ? "border-[#083d23]" : "border-emerald-950/80"
          )}
        >
          {menuUrl && (
            <a
              href={menuUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border",
                isLight
                  ? "text-[#9ebfae] bg-[#021f12] hover:bg-[#05321c] hover:text-white border-[#0a4328]"
                  : "text-emerald-300/80 bg-[#04150b] hover:bg-[#062012] hover:text-white border-emerald-900/60"
              )}
            >
              <span className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-400" />
                Live Diner Menu
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
            </a>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border",
              isLight
                ? "text-[#8db8a1] hover:bg-[#06331f] hover:text-white border-[#083d23]"
                : "text-emerald-400/80 hover:bg-emerald-950/60 hover:text-emerald-300 border-emerald-900/40 hover:border-emerald-700/60"
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Column: Header at top, then scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Sticky Header inside main column, aligning with content below */}
        <header
          className={cn(
            "sticky top-0 z-30 backdrop-blur-md flex-shrink-0 transition-colors duration-200",
            isLight
              ? "bg-[#fcfaf6]/95 border-b border-[#ebdccb]"
              : "bg-[#020905]/95 border-b border-emerald-950/80"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={cn(
                  "lg:hidden p-2 rounded-xl transition-colors flex-shrink-0 cursor-pointer border",
                  isLight
                    ? "text-[#034d28] border-[#ebdccb] hover:bg-[#f3ece0]"
                    : "text-emerald-400 border-emerald-900/40 hover:bg-emerald-950/60"
                )}
                aria-label="Open navigation menu"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
              <h1
                className={cn(
                  "font-serif font-medium text-2xl sm:text-3xl tracking-tight truncate",
                  isLight ? "text-[#111827]" : "text-white"
                )}
              >
                {pageTitle}
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Quick Theme Switcher Pill */}
              <button
                onClick={toggleTheme}
                className={cn(
                  "p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center",
                  isLight
                    ? "border-[#dfc2a2] bg-[#faefe1] text-[#784f27] hover:bg-[#f3e1cc] hover:text-[#553314]"
                    : "border-emerald-800/60 bg-[#041d0f] text-emerald-300 hover:bg-emerald-900/60 hover:text-white"
                )}
                title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
                aria-label="Toggle Theme"
              >
                {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              {/* Status Badge */}
              <div
                className={cn(
                  "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium border shadow-sm transition-colors",
                  isLight
                    ? "border-[#dfc2a2] bg-[#faefe1] text-[#784f27]"
                    : "border border-emerald-500/40 bg-[#041d0f]/80 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                )}
              >
                {profile.status === "active" ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Mode
                  </span>
                ) : (
                  <span>Setup Mode (Vikram Paused)</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with Smooth Transition */}
        <main className="flex-1 min-w-0 overflow-y-auto pb-28 sm:pb-24 lg:pb-12">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>

      {/* Mobile Drawer (lg:hidden) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative flex flex-col w-72 max-w-[85vw] bg-[#020805] h-full shadow-2xl border-r border-emerald-950">
            {/* Mobile Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center">
                  <Utensils className="w-4 h-4 text-[#020905]" />
                </div>
                <span className="font-serif font-bold text-white text-base">Scanzaa</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-emerald-400/70 hover:text-white p-1.5 rounded-lg flex-shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Drawer Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeHref === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all",
                      isActive
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                        : "text-emerald-100/70 hover:bg-emerald-950/60 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Drawer Footer */}
            <div className="p-3 border-t border-emerald-950 space-y-2">
              {menuUrl && (
                <a
                  href={menuUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-[#04150b] border border-emerald-900/60"
                >
                  <span className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-emerald-400" />
                    Live Diner Menu
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                </a>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-950/60 transition-all cursor-pointer border border-emerald-900/40"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (lg:hidden) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#020805]/95 backdrop-blur-md border-t border-emerald-950 shadow-2xl">
        <div
          className="flex items-center justify-around h-16 max-w-lg mx-auto px-2"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative flex-1 min-h-[48px]",
                  isActive ? "text-emerald-400 font-bold" : "text-emerald-200/50 hover:text-emerald-100"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    isActive && "bg-emerald-950/80 text-emerald-400"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-transform",
                      isActive && "scale-110 text-emerald-400"
                    )}
                  />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-4 h-0.5 bg-emerald-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
