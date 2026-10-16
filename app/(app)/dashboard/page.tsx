"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  QrCode,
  Plus,
  Copy,
  Download,
  ExternalLink,
  Check,
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Modal";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

interface StatCardProps {
  label: string;
  value: number | string | undefined;
  loading: boolean;
  subtitle: string;
  isLight?: boolean;
}

function StatCard({ label, value, loading, subtitle, isLight }: StatCardProps) {
  const isSoldOut = label.includes("SOLD OUT");
  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all border",
        isLight
          ? "bg-white border-[#ebdccb] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#c59a4c]/60"
          : "bg-[#031409]/90 border-emerald-900/40 hover:border-emerald-600/50 shadow-sm"
      )}
    >
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ) : (
        <div>
          <p
            className={cn(
              "text-[11px] font-semibold uppercase tracking-wider mb-1",
              isLight ? "text-[#4b5563]" : "text-gray-400"
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              "text-3xl sm:text-4xl font-black tracking-tight my-1",
              isSoldOut
                ? isLight
                  ? "text-[#991b1b]"
                  : "text-rose-400"
                : isLight
                ? "text-[#034d28]"
                : "text-emerald-400"
            )}
          >
            {value ?? 0}
          </p>
          <p
            className={cn(
              "text-xs mt-1",
              isLight ? "text-[#6b7280]" : "text-gray-400"
            )}
          >
            {subtitle}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/api/restaurant/dashboard").catch(() => ({ data: null })),
      api.get("/api/restaurant/profile").catch(() => ({ data: null })),
      api.get("/api/restaurant/qr").catch(() => ({ data: null })),
    ])
      .then(([dashRes, profRes, qrRes]) => {
        if (dashRes.data) setDashboardData(dashRes.data);
        if (profRes.data) setProfileData(profRes.data?.restaurant || profRes.data);
        if (qrRes.data) setQrData(qrRes.data);
      })
      .catch(() => {
        toast.error("Failed to load dashboard data");
      })
      .finally(() => setLoading(false));
  }, []);

  const today = dashboardData?.today || {};
  const total = dashboardData?.total || dashboardData?.allTime || {};
  const foodItems = dashboardData?.foodItems || {};
  const topItems = dashboardData?.topItems || [];

  const restaurantName = profileData?.name || "Kareem Nawab";
  const cuisineType = profileData?.cuisineType || "B I R Y A N I";
  const formattedCuisine = cuisineType.toUpperCase().includes("B I R Y A N I")
    ? cuisineType.toUpperCase()
    : cuisineType.toUpperCase().split("").join(" ");

  const slug = profileData?.slug || "";
  const menuUrl =
    qrData?.menuUrl ||
    profileData?.customMenuUrl ||
    (slug
      ? `${process.env.NEXT_PUBLIC_MENU_URL || "https://renza-menu.vercel.app"}/menu/${slug}`
      : "");
  const qrImage = qrData?.qrDataUrl || qrData?.qrCodeUrl;

  const handleCopyLink = () => {
    if (!menuUrl) return;
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    toast.success("Diner Menu URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrImage) {
      toast.error("QR code not available");
      return;
    }
    const a = document.createElement("a");
    a.href = qrImage;
    a.download = `${restaurantName.toLowerCase().replace(/\s+/g, "-")}-table-qr.png`;
    a.click();
    toast.success("Table QR Code downloaded!");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Setup Mode Notice Banner */}
      <div
        className={cn(
          "rounded-xl px-4 py-3 text-xs leading-relaxed shadow-sm border transition-colors",
          isLight
            ? "border-[#ebd2b8] bg-[#f6ebd9] text-[#704e2a]"
            : "border-emerald-900/60 bg-[#021308] text-emerald-200/90"
        )}
      >
        <span
          className={cn(
            "font-semibold",
            isLight ? "text-[#63431f]" : "text-emerald-300"
          )}
        >
          Setup Mode Active:
        </span>{" "}
        You can add dishes and test QR codes freely. Diner view counts are paused until Super Admin launches this restaurant to Live Mode.
      </div>

      {/* Hero Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={cn(
          "relative overflow-hidden rounded-2xl p-6 sm:p-8 shadow-xl transition-all",
          isLight
            ? "bg-gradient-to-r from-[#043e22] via-[#03311b] to-[#022313] border border-emerald-700/30"
            : "bg-gradient-to-r from-[#063b20] via-[#042816] to-[#02130a] border border-emerald-500/20"
        )}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 min-w-0">
            <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-[0.2em]">
              KITCHEN OPERATIONS
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal tracking-wide truncate">
              Welcome to {restaurantName}
            </h2>
            <div className="flex items-center gap-3 pt-1">
              <span className="w-8 h-[1px] bg-emerald-400/60 inline-block" />
              <p className="text-xs font-semibold text-emerald-300/80 tracking-[0.25em]">
                {formattedCuisine}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 md:pt-0">
            <Button
              onClick={() => setQrModalOpen(true)}
              variant={isLight ? "outline" : "mint"}
              className={cn(
                "text-xs sm:text-sm px-5 py-2.5 rounded-xl gap-2 font-bold cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]",
                isLight ? "bg-[#fcfbf7] text-[#04331a] hover:bg-white border-transparent" : ""
              )}
            >
              <QrCode className="w-4 h-4 flex-shrink-0" />
              <span>Table QR</span>
            </Button>
            <Button
              onClick={() => router.push("/menu/new")}
              variant="outline"
              className={cn(
                "text-xs sm:text-sm px-5 py-2.5 rounded-xl gap-2 font-medium cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]",
                isLight
                  ? "bg-[#021d10] text-[#f4eee4] border-[#a27b3b]/80 hover:border-[#d4af37]"
                  : "bg-[#02150a]/90 text-white border-emerald-800/80 hover:border-emerald-500"
              )}
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span>Add Dish</span>
            </Button>
          </div>
        </div>

        {/* Ambient Glow in the background of hero */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

      {/* Today's Operations Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2
            className={cn(
              "text-xs font-bold uppercase tracking-wider",
              isLight ? "text-[#374151]" : "text-gray-400"
            )}
          >
            TODAY&apos;S OPERATIONS
          </h2>
          <span
            className={cn(
              "text-xs font-bold flex items-center gap-1.5",
              isLight ? "text-[#034d28]" : "text-emerald-400"
            )}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                isLight ? "bg-[#034d28]" : "bg-emerald-400"
              )}
            />
            Live
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="TOTAL QR SCANS"
            value={total.qrScans ?? 0}
            loading={loading}
            subtitle="All-time scanner scan events"
            isLight={isLight}
          />
          <StatCard
            label="TODAY'S QR SCANS"
            value={today.qrScans ?? 0}
            loading={loading}
            subtitle="Common scan events today"
            isLight={isLight}
          />
          <StatCard
            label="AVAILABLE DISHES"
            value={foodItems.available ?? 334}
            loading={loading}
            subtitle="Visible on table menu"
            isLight={isLight}
          />
          <StatCard
            label="SOLD OUT DISHES"
            value={foodItems.unavailable ?? 0}
            loading={loading}
            subtitle="Hidden / Sold out"
            isLight={isLight}
          />
        </div>
      </div>

      {/* Bottom Grid: Quick Management & Most Viewed Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Quick Management (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <h2
            className={cn(
              "text-xs font-bold uppercase tracking-wider",
              isLight ? "text-[#374151]" : "text-gray-400"
            )}
          >
            QUICK MANAGEMENT
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Table QR Code */}
            <motion.div
              whileHover={{ y: -2 }}
              onClick={() => setQrModalOpen(true)}
              className={cn(
                "rounded-xl p-4 sm:p-5 flex items-stretch gap-3.5 transition-all cursor-pointer group border",
                isLight
                  ? "bg-white border-[#ebdccb] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#c59a4c]/60 hover:bg-[#fffdfa]"
                  : "bg-[#031409]/90 border-emerald-900/40 hover:border-emerald-600/60 hover:bg-[#051c0e]"
              )}
            >
              <div
                className={cn(
                  "w-1 self-stretch rounded-full flex-shrink-0 transition-colors",
                  isLight
                    ? "bg-[#c59a4c] shadow-[0_0_8px_rgba(197,154,76,0.4)]"
                    : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                )}
              />
              <div className="min-w-0">
                <h3
                  className={cn(
                    "font-bold text-sm transition-colors",
                    isLight ? "text-[#111827] group-hover:text-[#034d28]" : "text-white group-hover:text-emerald-300"
                  )}
                >
                  Table QR Code
                </h3>
                <p className={cn("text-xs mt-1 leading-relaxed", isLight ? "text-[#4b5563]" : "text-gray-400")}>
                  Download high-res printable QR code for table stands and billing counters.
                </p>
              </div>
            </motion.div>

            {/* Add New Dish */}
            <motion.div
              whileHover={{ y: -2 }}
              onClick={() => router.push("/menu/new")}
              className={cn(
                "rounded-xl p-4 sm:p-5 flex items-stretch gap-3.5 transition-all cursor-pointer group border",
                isLight
                  ? "bg-white border-[#ebdccb] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#c59a4c]/60 hover:bg-[#fffdfa]"
                  : "bg-[#031409]/90 border-emerald-900/40 hover:border-emerald-600/60 hover:bg-[#051c0e]"
              )}
            >
              <div
                className={cn(
                  "w-1 self-stretch rounded-full flex-shrink-0 transition-colors",
                  isLight
                    ? "bg-[#c59a4c] shadow-[0_0_8px_rgba(197,154,76,0.4)]"
                    : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                )}
              />
              <div className="min-w-0">
                <h3
                  className={cn(
                    "font-bold text-sm transition-colors",
                    isLight ? "text-[#111827] group-hover:text-[#034d28]" : "text-white group-hover:text-emerald-300"
                  )}
                >
                  Add New Dish
                </h3>
                <p className={cn("text-xs mt-1 leading-relaxed", isLight ? "text-[#4b5563]" : "text-gray-400")}>
                  Add photos, prepare pricing, vegetarian/egg tags, allergens, and spices.
                </p>
              </div>
            </motion.div>

            {/* Manage Menu & Stock */}
            <motion.div
              whileHover={{ y: -2 }}
              onClick={() => router.push("/menu")}
              className={cn(
                "rounded-xl p-4 sm:p-5 flex items-stretch gap-3.5 transition-all cursor-pointer group border",
                isLight
                  ? "bg-white border-[#ebdccb] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#c59a4c]/60 hover:bg-[#fffdfa]"
                  : "bg-[#031409]/90 border-emerald-900/40 hover:border-emerald-600/60 hover:bg-[#051c0e]"
              )}
            >
              <div
                className={cn(
                  "w-1 self-stretch rounded-full flex-shrink-0 transition-colors",
                  isLight
                    ? "bg-[#c59a4c] shadow-[0_0_8px_rgba(197,154,76,0.4)]"
                    : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                )}
              />
              <div className="min-w-0">
                <h3
                  className={cn(
                    "font-bold text-sm transition-colors",
                    isLight ? "text-[#111827] group-hover:text-[#034d28]" : "text-white group-hover:text-emerald-300"
                  )}
                >
                  Manage Menu & Stock
                </h3>
                <p className={cn("text-xs mt-1 leading-relaxed", isLight ? "text-[#4b5563]" : "text-gray-400")}>
                  Instantly toggle dishes between Available and Sold Out in 1 click.
                </p>
              </div>
            </motion.div>

            {/* Organize Categories */}
            <motion.div
              whileHover={{ y: -2 }}
              onClick={() => router.push("/categories")}
              className={cn(
                "rounded-xl p-4 sm:p-5 flex items-stretch gap-3.5 transition-all cursor-pointer group border",
                isLight
                  ? "bg-white border-[#ebdccb] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#c59a4c]/60 hover:bg-[#fffdfa]"
                  : "bg-[#031409]/90 border-emerald-900/40 hover:border-emerald-600/60 hover:bg-[#051c0e]"
              )}
            >
              <div
                className={cn(
                  "w-1 self-stretch rounded-full flex-shrink-0 transition-colors",
                  isLight
                    ? "bg-[#c59a4c] shadow-[0_0_8px_rgba(197,154,76,0.4)]"
                    : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                )}
              />
              <div className="min-w-0">
                <h3
                  className={cn(
                    "font-bold text-sm transition-colors",
                    isLight ? "text-[#111827] group-hover:text-[#034d28]" : "text-white group-hover:text-emerald-300"
                  )}
                >
                  Organize Categories
                </h3>
                <p className={cn("text-xs mt-1 leading-relaxed", isLight ? "text-[#4b5563]" : "text-gray-400")}>
                  Arrange sections like Starters, Main Course, Biryani, and Beverages.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Most Viewed Dishes (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h2
            className={cn(
              "text-xs font-bold uppercase tracking-wider",
              isLight ? "text-[#374151]" : "text-gray-400"
            )}
          >
            MOST VIEWED DISHES TODAY
          </h2>

          <div
            className={cn(
              "rounded-xl p-6 sm:p-8 flex flex-col justify-center min-h-[220px] border transition-colors",
              isLight
                ? "bg-white border-[#ebdccb] shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                : "bg-[#031409]/90 border-emerald-900/40"
            )}
          >
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topItems.length === 0 ? (
              <div className="flex flex-col items-center text-center py-4">
                <h3
                  className={cn(
                    "font-serif text-lg sm:text-xl font-medium mb-2",
                    isLight ? "text-[#111827]" : "text-white"
                  )}
                >
                  No dish clicks recorded yet
                </h3>
                <p
                  className={cn(
                    "text-xs max-w-xs leading-relaxed",
                    isLight ? "text-[#6b7280]" : "text-gray-400"
                  )}
                >
                  As diners browse and tap dishes on their phones, popular by readings will appear here.
                </p>
              </div>
            ) : (
              <div className={cn("divide-y", isLight ? "divide-gray-100" : "divide-emerald-950/60")}>
                {topItems.slice(0, 5).map((item: any, idx: number) => (
                  <div
                    key={item.id || item._id || idx}
                    className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 border",
                        idx === 0
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                          : idx === 1
                          ? isLight
                            ? "bg-emerald-50 text-[#034d28] border-emerald-200"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : isLight
                          ? "bg-gray-100 text-gray-600 border-gray-200"
                          : "bg-emerald-950/40 text-emerald-200/70 border-emerald-900/40"
                      )}
                    >
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-semibold text-sm truncate", isLight ? "text-[#111827]" : "text-white")}>
                        {item.name}
                      </p>
                      <p className={cn("text-xs", isLight ? "text-[#6b7280]" : "text-gray-400")}>
                        {item.viewCount || item.views || 1} clicks today
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={cn("font-bold text-sm", isLight ? "text-[#034d28]" : "text-emerald-400")}>
                        ₹{item.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table QR Code Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md p-5 sm:p-6 bg-[#04150b] rounded-2xl sm:rounded-3xl border border-emerald-500/25">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-serif text-white text-center">
              Table QR Code
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-emerald-200/60">
              Customers scan this code with their phone camera to view your live digital menu instantly.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {qrImage ? (
              <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                <Image
                  src={qrImage}
                  alt={`${restaurantName} QR Code`}
                  width={220}
                  height={220}
                  unoptimized
                  className="h-44 w-44 sm:h-52 sm:w-52 object-contain"
                />
              </div>
            ) : (
              <div className="w-44 h-44 sm:w-52 sm:h-52 border-2 border-dashed border-emerald-800/60 rounded-2xl flex flex-col items-center justify-center text-emerald-400/60">
                <QrCode className="w-10 h-10 text-emerald-400 animate-pulse" />
                <span className="text-xs mt-2 font-medium">Generating QR code...</span>
              </div>
            )}

            <div className="text-center">
              <p className="font-bold text-white text-base">
                {restaurantName}
              </p>
              <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                Never expires • Syncs automatically
              </p>
            </div>

            <div className="w-full space-y-1.5">
              <span className="text-xs text-emerald-300 font-bold px-0.5">
                Live Menu Link
              </span>
              <div className="w-full flex items-center gap-2 p-2.5 bg-[#020905] rounded-xl border border-emerald-900/60">
                <p className="flex-1 text-xs text-emerald-200 truncate font-mono">
                  {menuUrl}
                </p>
                {menuUrl && (
                  <a
                    href={menuUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-lg hover:bg-emerald-950 text-emerald-400 hover:text-emerald-300 transition-colors"
                    title="Open menu"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 rounded-lg hover:bg-emerald-950 text-emerald-400 transition-colors cursor-pointer"
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-1">
            <Button
              onClick={handleDownloadQr}
              variant="mint"
              className="w-full rounded-xl gap-2 h-11 text-xs sm:text-sm font-bold cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Printable PNG</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
