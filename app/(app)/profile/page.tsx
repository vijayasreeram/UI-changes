"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Utensils,
  Camera,
  Star,
  ExternalLink,
  Sparkles,
  MessageSquareText,
  Save,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

function sanitizeUrl(url?: string): string {
  if (!url || !url.trim()) return "";
  const t = url.trim();
  return t.startsWith("http://") || t.startsWith("https://") ? t : `https://${t}`;
}

function formatGoogleReviewUrl(input?: string): string {
  if (!input || !input.trim()) return "";
  const t = input.trim();
  const match = t.match(/[?&]placeid=([a-zA-Z0-9_-]+)/i);
  if (match) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(match[1])}`;
  }
  if (t.startsWith("ChIJ") || (!t.includes("/") && t.length > 20)) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(t)}`;
  }
  if (t.includes("g.page") && !t.includes("/review")) {
    return `${t.replace(/\/+$/, "")}/review`;
  }
  return sanitizeUrl(t);
}

function validateIndianPhone(phone?: string): { valid: boolean; error?: string; sanitized?: string } {
  if (!phone || !phone.trim()) return { valid: true };
  let sanitized = phone.trim().replace(/[\s\-()]/g, "");
  if (sanitized.startsWith("+91")) sanitized = sanitized.slice(3);
  else if (sanitized.startsWith("91") && sanitized.length === 12) sanitized = sanitized.slice(2);
  else if (sanitized.startsWith("0") && sanitized.length === 11) sanitized = sanitized.slice(1);

  if (/^[6-9]\d{9}$/.test(sanitized)) {
    if (/^(\d)\1{9}$/.test(sanitized)) {
      return { valid: false, error: "Phone number cannot have all identical digits." };
    }
    return { valid: true, sanitized };
  }
  return {
    valid: false,
    error: "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.",
  };
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  const isLight = theme === "light";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [phoneError, setPhoneError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    cuisineType: "",
    address: "",
    phone: "",
    googleReviewUrl: "",
    feedbackUrl: "",
  });

  useEffect(() => {
    api
      .get("/api/restaurant/profile")
      .then((res) => {
        const data = res.data?.restaurant || res.data || {};
        setForm({
          name: data.name || "",
          description: data.description || "",
          cuisineType: data.cuisineType || "",
          address: data.address || "",
          phone: data.phone || "",
          googleReviewUrl: data.googleReviewUrl || "",
          feedbackUrl: data.feedbackUrl || "",
        });
        const rawLogo = data.logoUrl || data.logo;
        if (rawLogo) setLogoPreview(rawLogo);
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleInputChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    window.dispatchEvent(
      new CustomEvent("restaurant-profile-updated", {
        detail: { logo: previewUrl },
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Restaurant name is required");
      return;
    }

    if (form.phone.trim()) {
      const check = validateIndianPhone(form.phone);
      if (!check.valid) {
        setPhoneError(check.error || "Invalid phone number");
        toast.error(check.error || "Invalid phone number");
        return;
      }
      setPhoneError("");
    }

    setSaving(true);
    try {
      const formattedGoogleReview = formatGoogleReviewUrl(form.googleReviewUrl);
      const formattedFeedback = sanitizeUrl(form.feedbackUrl);

      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("cuisineType", form.cuisineType.trim());
      formData.append("phone", form.phone.trim());
      formData.append("description", form.description.trim());
      formData.append("address", form.address.trim());
      formData.append("googleReviewUrl", formattedGoogleReview);
      formData.append("feedbackUrl", formattedFeedback);

      if (logoFile) {
        formData.append("image", logoFile);
        formData.append("logo", logoFile);
      }

      const res = await api.put("/api/restaurant/profile", formData);
      const updated = res.data?.restaurant || res.data || {};
      const newLogo = updated.logoUrl || updated.logo || logoPreview;

      window.dispatchEvent(
        new CustomEvent("restaurant-profile-updated", {
          detail: {
            name: updated.name || form.name,
            logo: newLogo,
          },
        })
      );

      toast.success("Restaurant profile saved to cloud!");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to save profile";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Header Card */}
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 rounded-2xl border shadow-sm transition-colors",
          isLight ? "bg-white border-[#ebdccb]" : "bg-[#031409]/90 border-emerald-900/40"
        )}
      >
        <div>
          <h2
            className={cn(
              "font-serif text-2xl sm:text-3xl font-medium tracking-tight",
              isLight ? "text-[#111827]" : "text-white"
            )}
          >
            Restaurant Profile & Settings
          </h2>
          <p className={cn("text-xs mt-1", isLight ? "text-[#4b5563]" : "text-gray-400")}>
            Brand logo, dashboard visual theme, contact details, and dining address.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div
            className={cn(
              "lg:col-span-4 p-6 rounded-2xl border shadow-sm space-y-4",
              isLight ? "bg-white border-[#ebdccb]" : "bg-[#031409]/90 border-emerald-900/40"
            )}
          >
            <Skeleton className="w-28 h-28 rounded-3xl mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
          <div
            className={cn(
              "lg:col-span-8 p-6 rounded-2xl border shadow-sm space-y-4",
              isLight ? "bg-white border-[#ebdccb]" : "bg-[#031409]/90 border-emerald-900/40"
            )}
          >
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Theme & Brand Identity (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Visual Theme Selection Card */}
            <div
              className={cn(
                "rounded-2xl sm:rounded-3xl border p-5 sm:p-6 shadow-sm space-y-4 transition-colors",
                isLight ? "bg-white border-[#ebdccb]" : "bg-[#031409]/90 border-emerald-900/40"
              )}
            >
              <div>
                <h3
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    isLight ? "text-[#374151]" : "text-emerald-300"
                  )}
                >
                  Dashboard Theme
                </h3>
                <p className={cn("text-[11px] mt-0.5", isLight ? "text-[#6b7280]" : "text-gray-400")}>
                  Select your visual dashboard appearance
                </p>
              </div>

              <div className="space-y-3">
                {/* Dark Theme Option */}
                <div
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 relative",
                    !isLight
                      ? "bg-[#041d0f] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      : "bg-[#fcfaf6] border-[#ebdccb] hover:border-[#d4af37]"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                      !isLight ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-100 text-gray-500"
                    )}
                  >
                    <Moon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-xs font-bold", !isLight ? "text-white" : "text-[#111827]")}>
                        Royal Emerald (Dark)
                      </span>
                      {!isLight && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          Active
                        </span>
                      )}
                    </div>
                    <p className={cn("text-[11px] mt-1 leading-snug", !isLight ? "text-emerald-200/70" : "text-[#6b7280]")}>
                      Deep forest pine with luminous emerald accents.
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#020905] border border-emerald-700/60 inline-block" />
                      <span className="w-3.5 h-3.5 rounded-full bg-[#062012] inline-block" />
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block" />
                    </div>
                  </div>
                </div>

                {/* Light Theme Option */}
                <div
                  onClick={() => setTheme("light")}
                  className={cn(
                    "p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 relative",
                    isLight
                      ? "bg-[#fffbf2] border-[#c59a4c] shadow-[0_0_15px_rgba(197,154,76,0.2)]"
                      : "bg-[#020d06] border-emerald-950 hover:border-emerald-900"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                      isLight ? "bg-[#c59a4c]/20 text-[#855e1c]" : "bg-emerald-950/60 text-emerald-400/60"
                    )}
                  >
                    <Sun className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-xs font-bold", isLight ? "text-[#111827]" : "text-white")}>
                        Ivory Linen (Light)
                      </span>
                      {isLight && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#c59a4c]/20 text-[#855e1c] border border-[#c59a4c]/40">
                          Active
                        </span>
                      )}
                    </div>
                    <p className={cn("text-[11px] mt-1 leading-snug", isLight ? "text-[#555]" : "text-gray-400")}>
                      Warm linen canvas with antique gold and dark pine sidebar.
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#f7f3ea] border border-[#ebdccb] inline-block" />
                      <span className="w-3.5 h-3.5 rounded-full bg-[#032516] inline-block" />
                      <span className="w-3.5 h-3.5 rounded-full bg-[#c59a4c] inline-block" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Identity Card */}
            <div
              className={cn(
                "rounded-2xl sm:rounded-3xl border p-5 sm:p-6 shadow-sm text-center space-y-4 transition-colors",
                isLight ? "bg-white border-[#ebdccb]" : "bg-[#031409]/90 border-emerald-900/40"
              )}
            >
              <h3
                className={cn(
                  "text-xs font-bold uppercase tracking-wider text-left",
                  isLight ? "text-[#374151]" : "text-emerald-300"
                )}
              >
                Brand Identity
              </h3>

              <div className="flex flex-col items-center py-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group focus:outline-none cursor-pointer"
                >
                  <div
                    className={cn(
                      "relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border-4 shadow-lg transition-all",
                      isLight
                        ? "border-[#ebdccb] bg-[#f7f3ea] group-hover:border-[#c59a4c]"
                        : "border-emerald-950 bg-[#020805] group-hover:border-emerald-500/60"
                    )}
                  >
                    {logoPreview ? (
                      <Image
                        src={logoPreview}
                        alt="Restaurant logo"
                        fill
                        sizes="112px"
                        unoptimized={logoPreview.startsWith("blob:")}
                        className="object-cover"
                      />
                    ) : (
                      <Utensils className={cn("w-12 h-12", isLight ? "text-[#c59a4c]/60" : "text-emerald-800")} />
                    )}
                  </div>
                  <div
                    className={cn(
                      "absolute -bottom-1 -right-1 w-9 h-9 rounded-2xl flex items-center justify-center shadow-md border-2 transition-transform group-hover:scale-110",
                      isLight
                        ? "bg-[#c59a4c] hover:bg-[#b58c42] text-white border-white"
                        : "bg-emerald-500 hover:bg-emerald-400 text-[#020905] border-[#020905]"
                    )}
                  >
                    <Camera className="w-4 h-4" />
                  </div>
                </button>

                <p className={cn("text-xs font-bold mt-3", isLight ? "text-[#111827]" : "text-white")}>
                  Restaurant Brand Logo
                </p>
                <p className={cn("text-[10px] mt-0.5", isLight ? "text-[#6b7280]" : "text-gray-400")}>
                  Square PNG, JPG, or WebP • max 5MB
                </p>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "mt-3 text-xs font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer",
                    isLight ? "text-[#034d28] hover:text-[#05321c]" : "text-emerald-400 hover:text-emerald-300"
                  )}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change Logo</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoSelect}
                />
              </div>

              {/* Live Diner Header Preview Card */}
              <div
                className={cn(
                  "rounded-2xl border p-3.5 space-y-2 text-left transition-colors",
                  isLight ? "border-[#ebdccb] bg-[#fcfaf6]" : "border-emerald-900/60 bg-[#020805]"
                )}
              >
                <p className={cn("text-[10px] font-bold uppercase tracking-wider", isLight ? "text-[#6b7280]" : "text-gray-400")}>
                  Live Diner Header Preview
                </p>
                <div
                  className={cn(
                    "rounded-xl p-3 border shadow-sm flex items-center gap-3 transition-colors",
                    isLight ? "bg-white border-[#ebdccb]" : "bg-[#04150b] border-emerald-900/50"
                  )}
                >
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl overflow-hidden relative flex-shrink-0 flex items-center justify-center border",
                      isLight ? "bg-[#f7f3ea] border-[#ebdccb]" : "bg-[#020805] border-emerald-900/60"
                    )}
                  >
                    {logoPreview ? (
                      <Image
                        src={logoPreview}
                        alt="Preview"
                        fill
                        sizes="44px"
                        unoptimized={logoPreview.startsWith("blob:")}
                        className="object-cover"
                      />
                    ) : (
                      <Utensils className={cn("w-5 h-5", isLight ? "text-[#c59a4c]" : "text-emerald-700")} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("font-bold text-xs truncate", isLight ? "text-[#111827]" : "text-white")}>
                      {form.name || "Restaurant Name"}
                    </p>
                    <p className={cn("text-[10px] truncate mt-0.5", isLight ? "text-[#034d28]" : "text-emerald-400")}>
                      {form.cuisineType || "Cuisine Specialty"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: General Information Form (8 cols) */}
          <div
            className={cn(
              "lg:col-span-8 rounded-2xl sm:rounded-3xl border p-5 sm:p-8 shadow-sm space-y-5 transition-colors",
              isLight ? "bg-white border-[#ebdccb]" : "bg-[#031409]/90 border-emerald-900/40"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between pb-3 border-b",
                isLight ? "border-[#ebdccb]" : "border-emerald-950"
              )}
            >
              <div>
                <h3
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    isLight ? "text-[#374151]" : "text-emerald-300"
                  )}
                >
                  General & Dining Information
                </h3>
                <p className={cn("text-[11px] mt-0.5", isLight ? "text-[#6b7280]" : "text-gray-400")}>
                  These details will be shown to diners on the mobile menu header and footer.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Restaurant Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Restaurant Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Royal Spice Grand"
                  value={form.name}
                  onChange={handleInputChange("name")}
                  required
                  className="rounded-xl text-xs sm:text-sm h-11 font-semibold"
                />
              </div>

              {/* Cuisine & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cuisineType">Cuisine Specialty</Label>
                  <Input
                    id="cuisineType"
                    placeholder="e.g. North Indian, Tandoori, Mughlai"
                    value={form.cuisineType}
                    onChange={handleInputChange("cuisineType")}
                    className="rounded-xl text-xs sm:text-sm h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((prev) => ({ ...prev, phone: val }));
                      if (phoneError) {
                        const check = validateIndianPhone(val);
                        setPhoneError(check.valid ? "" : check.error || "");
                      }
                    }}
                    className={cn(
                      "rounded-xl text-xs sm:text-sm h-11",
                      phoneError
                        ? "border-rose-500 focus:border-rose-400 focus:ring-rose-500/20"
                        : "border-emerald-800/50"
                    )}
                  />
                  {phoneError && (
                    <p className="text-[11px] font-semibold text-rose-400 mt-1">
                      {phoneError}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description">Description & Dining Tagline</Label>
                <Textarea
                  id="description"
                  placeholder="Tell diners what makes your restaurant special..."
                  value={form.description}
                  onChange={handleInputChange("description")}
                  rows={3}
                  className="rounded-xl text-xs leading-relaxed resize-none"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <Label htmlFor="address">Dining Location & Address</Label>
                <Textarea
                  id="address"
                  placeholder="Full restaurant location and landmark for diners..."
                  value={form.address}
                  onChange={handleInputChange("address")}
                  rows={2}
                  className="rounded-xl text-xs leading-relaxed resize-none"
                />
              </div>

              {/* Google Maps Review Link */}
              <div
                className={cn(
                  "space-y-2 pt-3 border-t",
                  isLight ? "border-[#ebdccb]" : "border-emerald-950"
                )}
              >
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="googleReviewUrl"
                    className="flex items-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Google Maps Review Link</span>
                  </Label>
                  {form.googleReviewUrl?.trim() && (
                    <a
                      href={formatGoogleReviewUrl(form.googleReviewUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-bold hover:underline",
                        isLight ? "text-[#034d28] hover:text-[#05321c]" : "text-emerald-400 hover:text-emerald-300"
                      )}
                      title="Open this link to verify it opens the review prompt"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Test Review Link</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    id="googleReviewUrl"
                    type="url"
                    placeholder="https://g.page/r/.../review or Place ID (ChIJ...)"
                    value={form.googleReviewUrl}
                    onChange={handleInputChange("googleReviewUrl")}
                    className="rounded-xl text-xs sm:text-sm h-11"
                  />
                  {form.googleReviewUrl?.trim() && (
                    <a
                      href={formatGoogleReviewUrl(form.googleReviewUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "shrink-0 inline-flex items-center gap-1 px-3 h-11 rounded-xl text-xs font-semibold transition-colors border",
                        isLight
                          ? "bg-[#fcfaf6] hover:bg-[#f3ece0] border-[#ebdccb] text-[#034d28]"
                          : "bg-[#062012] hover:bg-[#0a2e1c] border-emerald-800/60 text-emerald-200"
                      )}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test</span>
                    </a>
                  )}
                </div>

                {/* Instructions Box */}
                <div
                  className={cn(
                    "rounded-xl border p-3.5 text-[11px] leading-relaxed space-y-1.5 transition-colors",
                    isLight
                      ? "border-[#ebd2b8] bg-[#fbf5ec] text-[#704e2a]"
                      : "border-emerald-800/60 bg-[#021008] text-emerald-200/90"
                  )}
                >
                  <p
                    className={cn(
                      "font-bold flex items-center gap-1",
                      isLight ? "text-[#63431f]" : "text-emerald-300"
                    )}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>How to get your direct 5-star Google Review link:</span>
                  </p>
                  <ol
                    className={cn(
                      "list-decimal list-inside space-y-0.5 text-[10.5px]",
                      isLight ? "text-[#704e2a]/90" : "text-emerald-200/80"
                    )}
                  >
                    <li>
                      Open your{" "}
                      <strong className={isLight ? "text-[#111827]" : "text-white"}>
                        Google Business Profile
                      </strong>{" "}
                      or search your restaurant on Google Maps.
                    </li>
                    <li>
                      Click{" "}
                      <strong className={isLight ? "text-[#111827]" : "text-white"}>
                        “Ask for reviews”
                      </strong>{" "}
                      or{" "}
                      <strong className={isLight ? "text-[#111827]" : "text-white"}>
                        “Share review form”
                      </strong>{" "}
                      to copy your review link.
                    </li>
                    <li>
                      Paste the link above (e.g., <code>https://g.page/r/.../review</code> or Place ID <code>ChIJ...</code>).
                    </li>
                  </ol>
                </div>
              </div>

              {/* Customer Feedback Form Link */}
              <div
                className={cn(
                  "space-y-3 pt-3 border-t",
                  isLight ? "border-[#ebdccb]" : "border-emerald-950"
                )}
              >
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="feedbackUrl"
                    className="flex items-center gap-1.5"
                  >
                    <MessageSquareText className={cn("w-3.5 h-3.5", isLight ? "text-[#034d28]" : "text-emerald-400")} />
                    <span>Customer Feedback Form Link (Google Form / Survey)</span>
                  </Label>
                  {form.feedbackUrl?.trim() && (
                    <a
                      href={sanitizeUrl(form.feedbackUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-bold hover:underline",
                        isLight ? "text-[#034d28] hover:text-[#05321c]" : "text-emerald-400 hover:text-emerald-300"
                      )}
                      title="Open your feedback form in a new tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Test Form Link</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    id="feedbackUrl"
                    type="url"
                    placeholder="https://forms.gle/xyz or https://docs.google.com/forms/..."
                    value={form.feedbackUrl}
                    onChange={handleInputChange("feedbackUrl")}
                    className="rounded-xl text-xs sm:text-sm h-11"
                  />
                  {form.feedbackUrl?.trim() && (
                    <a
                      href={sanitizeUrl(form.feedbackUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "shrink-0 inline-flex items-center gap-1 px-3 h-11 rounded-xl text-xs font-semibold transition-colors border",
                        isLight
                          ? "bg-[#fcfaf6] hover:bg-[#f3ece0] border-[#ebdccb] text-[#034d28]"
                          : "bg-[#062012] hover:bg-[#0a2e1c] border-emerald-800/60 text-emerald-200"
                      )}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div
                className={cn(
                  "pt-4 border-t flex justify-end",
                  isLight ? "border-[#ebdccb]" : "border-emerald-950"
                )}
              >
                <Button
                  type="submit"
                  disabled={saving}
                  variant={isLight ? "primary" : "mint"}
                  className="font-bold text-xs sm:text-sm h-11 px-7 rounded-xl shadow-lg gap-2 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
