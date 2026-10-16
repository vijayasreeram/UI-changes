"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Utensils,
  FolderOpen,
  LayoutGrid,
  Pencil,
  Trash2,
} from "lucide-react";
import api from "@/lib/api";
import { FoodItem, Category, PortionPrice, PreparationPrice } from "@/lib/mockData";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

const STATUS_FILTERS = ["All", "Available", "Sold Out", "Specials", "Seasonal"];
const SEASONAL_KEYWORDS = [
  "season",
  "summer",
  "winter",
  "monsoon",
  "festive",
  "mango",
  "spring",
  "holiday",
  "autumn",
];

const isSeasonal = (tag?: string) => {
  if (!tag || typeof tag !== "string") return false;
  const lower = tag.trim().toLowerCase();
  return (
    !["jain", "vegan", "gluten-free"].includes(lower) &&
    SEASONAL_KEYWORDS.some((kw) => lower.includes(kw))
  );
};

const isSpecial = (tag?: string) => {
  if (!tag || typeof tag !== "string") return false;
  const lower = tag.trim().toLowerCase();
  return !["jain", "vegan", "gluten-free"].includes(lower) && !isSeasonal(tag);
};

function DishSkeleton() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 flex gap-4",
        isLight ? "bg-white border-[#ebdccb]" : "bg-[#031409]/90 border-emerald-900/40"
      )}
    >
      <Skeleton className={cn("w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex-shrink-0", isLight && "bg-[#ebdccb]/60")} />
      <div className="flex-1 space-y-2 min-w-0">
        <Skeleton className={cn("h-4 w-3/4", isLight && "bg-[#ebdccb]/60")} />
        <Skeleton className={cn("h-3 w-1/3", isLight && "bg-[#ebdccb]/60")} />
        <Skeleton className={cn("h-3 w-1/2", isLight && "bg-[#ebdccb]/60")} />
        <div className="flex items-center gap-2 mt-3 pt-2">
          <Skeleton className={cn("h-7 w-16 rounded-full", isLight && "bg-[#ebdccb]/60")} />
          <Skeleton className={cn("h-7 w-7 rounded-lg ml-auto", isLight && "bg-[#ebdccb]/60")} />
          <Skeleton className={cn("h-7 w-7 rounded-lg", isLight && "bg-[#ebdccb]/60")} />
        </div>
      </div>
    </div>
  );
}

function DishCard({
  item,
  onToggle,
  onEdit,
  onDelete,
}: {
  item: FoodItem;
  onToggle: (id: string, isAvailable: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (item: FoodItem) => void;
}) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [updating, setUpdating] = useState(false);
  const itemId = item.id || item._id || "";

  // Parse portion prices
  const portions = (() => {
    if (!item.portionPrices) return null;
    try {
      const p: PortionPrice =
        typeof item.portionPrices === "string"
          ? JSON.parse(item.portionPrices)
          : item.portionPrices;
      if (p && typeof p === "object") {
        const arr = [];
        if (p.quarter && Number(p.quarter) > 0)
          arr.push({ label: "Quarter", short: "1/4", price: Number(p.quarter) });
        if (p.half && Number(p.half) > 0)
          arr.push({ label: "Half", short: "1/2", price: Number(p.half) });
        if (p.full && Number(p.full) > 0)
          arr.push({ label: "Full", short: "Full", price: Number(p.full) });
        if (p.regular && Number(p.regular) > 0)
          arr.push({ label: "Regular", short: "Regular", price: Number(p.regular) });
        if (p.special && Number(p.special) > 0)
          arr.push({ label: "Special", short: "Special", price: Number(p.special) });
        if (arr.length > 0) return arr;
      }
    } catch {}
    return null;
  })();

  // Parse preparation prices
  const prepStyles = (() => {
    if (!item.preparationPrices) return null;
    try {
      const p: PreparationPrice =
        typeof item.preparationPrices === "string"
          ? JSON.parse(item.preparationPrices)
          : item.preparationPrices;
      if (p && typeof p === "object") {
        const arr = [];
        if (p.dry && Number(p.dry) > 0)
          arr.push({ label: "Dry", short: "🍗 Dry", price: Number(p.dry) });
        if (p.gravy && Number(p.gravy) > 0)
          arr.push({ label: "Gravy", short: "🍲 Gravy", price: Number(p.gravy) });
        if (p.semiGravy && Number(p.semiGravy) > 0)
          arr.push({ label: "Semi-Gravy", short: "🥣 Semi", price: Number(p.semiGravy) });
        if (arr.length > 0) return arr;
      }
    } catch {}
    return null;
  })();

  const handleToggleAvailability = async () => {
    setUpdating(true);
    const newStatus = !item.isAvailable;
    onToggle(itemId, newStatus);
    try {
      await api.patch(`/api/restaurant/foods/${itemId}/availability`, {
        isAvailable: newStatus,
      });
      toast.success(
        newStatus ? `${item.name} marked Available` : `${item.name} marked Sold Out`
      );
    } catch {
      onToggle(itemId, !newStatus);
      toast.error("Failed to update dish availability");
    } finally {
      setUpdating(false);
    }
  };

  const mainPhoto = item.imageUrl || item.image;
  const topPhoto = item.topViewImageUrl || item.top_view_image_url;
  const photo = mainPhoto || topPhoto;
  const hasTwoViews = !!(mainPhoto && topPhoto);
  const isSeasonalTag = isSeasonal(item.specialTags);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-2xl border transition-all overflow-hidden flex flex-col justify-between",
        isLight
          ? "bg-white border-[#ebdccb] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#c59a4c]/60"
          : "bg-[#031409]/90 border-emerald-900/40 hover:border-emerald-600/50 shadow-sm",
        !item.isAvailable && "opacity-75"
      )}
    >
      <div className="flex gap-3 sm:gap-4 p-4">
        {/* Photo Box */}
        <div
          className={cn(
            "w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 relative border",
            isLight ? "bg-[#f7f3ea] border-[#ebdccb]" : "bg-[#020805] border-emerald-950"
          )}
        >
          {photo ? (
            <>
              <Image
                src={photo}
                alt={item.name}
                fill
                sizes="96px"
                className={cn(
                  "object-cover transition-opacity",
                  !item.isAvailable && "opacity-60"
                )}
                onError={(e) => {
                  (e.currentTarget as any).style.display = "none";
                }}
              />
              {hasTwoViews && (
                <span className="absolute bottom-1 right-1 z-10 text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-xs">
                  2 Views
                </span>
              )}
              {!mainPhoto && topPhoto && (
                <span className="absolute bottom-1 right-1 z-10 text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/80 text-white backdrop-blur-xs">
                  Top View
                </span>
              )}
              {item.specialTags && (
                <span
                  className={cn(
                    "absolute top-1 left-1 z-10 text-[8px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded shadow-xs backdrop-blur-xs",
                    isSeasonalTag
                      ? "bg-black/90 text-emerald-300 border border-emerald-400/50"
                      : "bg-black/90 text-amber-300 border border-amber-400/50"
                  )}
                >
                  {isSeasonalTag ? `🍁 ${item.specialTags}` : item.specialTags}
                </span>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-emerald-800">
              <Utensils className={cn("w-6 h-6 sm:w-7 sm:h-7", isLight ? "text-[#c59a4c]" : "text-emerald-800")} />
              <span className={cn("text-[9px] mt-1 font-medium", isLight ? "text-gray-400" : "text-emerald-600/70")}>No photo</span>
            </div>
          )}
        </div>

        {/* Content Box */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <span
              className={cn(
                "mt-1 w-3.5 h-3.5 rounded-sm border-2 flex-shrink-0 flex items-center justify-center",
                item.isVeg ? "border-emerald-500" : "border-rose-500"
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  item.isVeg ? "bg-emerald-500" : "bg-rose-500"
                )}
              />
            </span>
            <h3
              className={cn(
                "font-bold text-sm sm:text-base leading-snug truncate",
                !item.isAvailable
                  ? "text-gray-400"
                  : isLight
                  ? "text-[#111827]"
                  : "text-white"
              )}
            >
              {item.name}
            </h3>
          </div>

          {/* Pricing Display */}
          {prepStyles ? (
            <div className="space-y-1 mt-0.5 mb-1">
              <p className={cn("font-extrabold text-sm sm:text-base", isLight ? "text-[#034d28]" : "text-emerald-400")}>
                ₹{Math.min(...prepStyles.map((s) => s.price))}
                {Math.min(...prepStyles.map((s) => s.price)) !==
                  Math.max(...prepStyles.map((s) => s.price)) &&
                  ` – ₹${Math.max(...prepStyles.map((s) => s.price))}`}
              </p>
              <div className="flex flex-wrap gap-1">
                {prepStyles.map((s) => (
                  <span
                    key={s.label}
                    className={cn(
                      "inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded border",
                      isLight
                        ? "bg-[#f7f3ea] text-[#4b5563] border-[#ebdccb]"
                        : "bg-[#062012] text-emerald-300 border-emerald-800/60"
                    )}
                  >
                    {s.short}: ₹{s.price}
                  </span>
                ))}
              </div>
            </div>
          ) : portions ? (
            <div className="space-y-1 mt-0.5 mb-1">
              <p className={cn("font-extrabold text-sm sm:text-base", isLight ? "text-[#034d28]" : "text-emerald-400")}>
                ₹{Math.min(...portions.map((p) => p.price))}
                {Math.min(...portions.map((p) => p.price)) !==
                  Math.max(...portions.map((p) => p.price)) &&
                  ` – ₹${Math.max(...portions.map((p) => p.price))}`}
              </p>
              <div className="flex flex-wrap gap-1">
                {portions.map((p) => (
                  <span
                    key={p.label}
                    className={cn(
                      "inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded border",
                      isLight
                        ? "bg-[#f7f3ea] text-[#4b5563] border-[#ebdccb]"
                        : "bg-[#062012] text-emerald-300 border-emerald-800/60"
                    )}
                  >
                    {p.short}: ₹{p.price}
                  </span>
                ))}
              </div>
            </div>
          ) : Number(item.price) > 0 ? (
            <p className={cn("font-extrabold text-sm sm:text-base", isLight ? "text-[#034d28]" : "text-emerald-400")}>
              ₹{item.price}
            </p>
          ) : (
            <p className={cn("font-medium text-xs", isLight ? "text-gray-400" : "text-gray-400")}>Price not set</p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {item.specialTags ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border",
                  isSeasonalTag
                    ? isLight
                      ? "bg-emerald-50 text-[#034d28] border-emerald-200"
                      : "bg-emerald-950 text-emerald-300 border-emerald-700/50"
                    : isLight
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-amber-950/80 text-amber-300 border-amber-700/50"
                )}
              >
                {isSeasonalTag ? `🍁 ${item.specialTags}` : `⭐ ${item.specialTags}`}
              </span>
            ) : null}

            {item.category?.name && (
              <span
                className={cn(
                  "inline-block text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md truncate max-w-full border",
                  isLight
                    ? "bg-[#f7f3ea] text-[#4b5563] border-[#ebdccb]"
                    : "text-emerald-200/70 bg-[#062012] border-emerald-900/50"
                )}
              >
                {item.category.name}
              </span>
            )}

            {!prepStyles && item.preparationType === "dry" && (
              <span
                className={cn(
                  "inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md border",
                  isLight
                    ? "bg-[#f7f3ea] text-[#4b5563] border-[#ebdccb]"
                    : "bg-[#062012] text-emerald-300 border-emerald-800/60"
                )}
              >
                🍗 Dry
              </span>
            )}
            {!prepStyles && item.preparationType === "gravy" && (
              <span
                className={cn(
                  "inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md border",
                  isLight
                    ? "bg-[#f7f3ea] text-[#4b5563] border-[#ebdccb]"
                    : "bg-[#062012] text-emerald-300 border-emerald-800/60"
                )}
              >
                🍲 Gravy
              </span>
            )}
            {!prepStyles && item.preparationType === "semi-gravy" && (
              <span
                className={cn(
                  "inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md border",
                  isLight
                    ? "bg-[#f7f3ea] text-[#4b5563] border-[#ebdccb]"
                    : "bg-[#062012] text-emerald-300 border-emerald-800/60"
                )}
              >
                🥣 Semi-Gravy
              </span>
            )}
            {!prepStyles && item.preparationType === "both" && (
              <span
                className={cn(
                  "inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md border",
                  isLight
                    ? "bg-[#f7f3ea] text-[#4b5563] border-[#ebdccb]"
                    : "bg-[#062012] text-emerald-300 border-emerald-800/60"
                )}
              >
                🔄 Dry & Gravy
              </span>
            )}
          </div>

          {item.description && (
            <p className={cn("text-xs line-clamp-2 mt-1.5 leading-relaxed", isLight ? "text-[#4b5563]" : "text-gray-400")}>
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div
        className={cn(
          "px-4 py-3 border-t flex items-center justify-between gap-2 transition-colors",
          isLight ? "bg-[#fcfaf6] border-[#ebdccb]" : "bg-[#020a06] border-emerald-950"
        )}
      >
        <div className="flex items-center gap-2">
          <Switch
            checked={item.isAvailable}
            onCheckedChange={handleToggleAvailability}
            disabled={updating}
          />
          <span
            className={cn(
              "text-[11px] sm:text-xs font-bold tracking-wide uppercase",
              item.isAvailable
                ? isLight
                  ? "text-[#034d28]"
                  : "text-emerald-400"
                : isLight
                ? "text-[#991b1b]"
                : "text-rose-400"
            )}
          >
            {item.isAvailable ? "Available" : "Sold Out"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(itemId)}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg border transition-colors cursor-pointer",
              isLight
                ? "bg-white border-[#ebdccb] text-gray-600 hover:text-[#034d28] hover:border-[#034d28]"
                : "bg-[#04150b] border-emerald-900/60 text-emerald-300 hover:text-white hover:border-emerald-600"
            )}
            title="Edit dish"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg border transition-colors cursor-pointer",
              isLight
                ? "bg-white border-[#ebdccb] text-rose-500 hover:text-rose-700 hover:border-rose-400"
                : "bg-[#04150b] border-emerald-900/60 text-rose-400 hover:text-rose-300 hover:border-rose-500/60"
            )}
            title="Delete dish"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MenuPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [groupingMode, setGroupingMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemToDelete, setItemToDelete] = useState<FoodItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMenu = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get("/api/restaurant/foods"),
      api.get("/api/restaurant/categories").catch(() => ({ data: { categories: [] } })),
    ])
      .then(([foodRes, catRes]) => {
        const foodList = foodRes.data?.foods || foodRes.data || [];
        const catList = catRes.data?.categories || catRes.data || [];
        setFoods(Array.isArray(foodList) ? foodList : []);
        setCategories(Array.isArray(catList) ? catList : []);
      })
      .catch((err) => {
        if (err.response?.status !== 401) {
          toast.error("Failed to load menu dishes");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleToggleState = (id: string, isAvailable: boolean) => {
    setFoods((prev) =>
      prev.map((f) => (f.id === id || f._id === id ? { ...f, isAvailable } : f))
    );
  };

  const handleDeleteDish = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete.id || itemToDelete._id;
    setDeleting(true);
    try {
      await api.delete(`/api/restaurant/foods/${id}`);
      setFoods((prev) => prev.filter((f) => f.id !== id && f._id !== id));
      toast.success(`"${itemToDelete.name}" deleted from menu`);
      setItemToDelete(null);
    } catch {
      toast.error("Failed to delete dish");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered Dishes
  const filteredFoods = useMemo(() => {
    return foods.filter((f) => {
      const matchStatus =
        statusFilter === "All" ||
        (statusFilter === "Available"
          ? f.isAvailable
          : statusFilter === "Sold Out"
          ? !f.isAvailable
          : statusFilter === "Specials"
          ? isSpecial(f.specialTags)
          : statusFilter === "Seasonal"
          ? isSeasonal(f.specialTags)
          : true);

      const matchCategory =
        selectedCategory === "all" ||
        f.categoryId === selectedCategory ||
        f.category?.id === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        f.name?.toLowerCase().includes(q) ||
        f.category?.name?.toLowerCase().includes(q) ||
        f.description?.toLowerCase().includes(q);

      return matchStatus && matchCategory && matchQuery;
    });
  }, [foods, statusFilter, selectedCategory, searchQuery]);

  // Grouped by Categories
  const categoryGroups = useMemo(() => {
    if (!groupingMode || selectedCategory !== "all") return [];
    const groups: { id: string; name: string; items: FoodItem[] }[] = [];
    const usedIds = new Set<string>();

    [...categories]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .forEach((cat) => {
        const catItems = filteredFoods.filter((f) => {
          const match = f.categoryId === cat.id || f.category?.id === cat.id;
          if (match) usedIds.add(f.id || f._id || "");
          return match;
        });
        if (catItems.length > 0) {
          groups.push({
            id: cat.id,
            name: cat.name,
            items: catItems,
          });
        }
      });

    const otherItems = filteredFoods.filter((f) => !usedIds.has(f.id || f._id || ""));
    if (otherItems.length > 0) {
      groups.push({
        id: "uncategorized",
        name: "Other Dishes",
        items: otherItems,
      });
    }

    return groups;
  }, [categories, filteredFoods, groupingMode, selectedCategory]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 rounded-2xl border transition-colors shadow-sm",
          isLight
            ? "bg-white border-[#ebdccb] shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            : "bg-[#031409]/90 border-emerald-900/40"
        )}
      >
        <div>
          <h2
            className={cn(
              "font-serif text-2xl sm:text-3xl font-medium tracking-tight",
              isLight ? "text-[#111827]" : "text-white"
            )}
          >
            Menu Dishes & Stock
          </h2>
          <p className={cn("text-xs mt-1", isLight ? "text-[#4b5563]" : "text-gray-400")}>
            {filteredFoods.length !== foods.length
              ? `Showing ${filteredFoods.length} of ${foods.length} dishes • `
              : `Total ${foods.length} dishes • `}
            <span className={cn("font-semibold", isLight ? "text-[#034d28]" : "text-emerald-400")}>
              {foods.filter((f) => f.isAvailable).length} Available
            </span>{" "}
            •{" "}
            <span className={cn("font-semibold", isLight ? "text-[#991b1b]" : "text-rose-400")}>
              {foods.filter((f) => !f.isAvailable).length} Sold Out
            </span>{" "}
            • {foods.filter((f) => isSpecial(f.specialTags)).length} Specials •{" "}
            {foods.filter((f) => isSeasonal(f.specialTags)).length} Seasonal
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => router.push("/menu/new")}
            variant={isLight ? "primary" : "mint"}
            className={cn(
              "w-full sm:w-auto justify-center gap-2 rounded-xl px-5 py-2.5 h-auto text-xs sm:text-sm font-bold cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]",
              isLight && "bg-gradient-to-r from-[#065b34] to-[#044728] text-white hover:from-[#087342] hover:to-[#055732]"
            )}
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </Button>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search
              className={cn(
                "w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2",
                isLight ? "text-[#c59a4c]" : "text-emerald-400/60"
              )}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes by name, category, or ingredients..."
              className={cn(
                "w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none focus:ring-2",
                isLight
                  ? "bg-white border-[#ebdccb] text-[#111827] placeholder-gray-400 focus:ring-[#034d28]/20 focus:border-[#034d28]"
                  : "bg-[#031409]/90 border-emerald-900/50 text-emerald-100 placeholder-emerald-400/40 focus:ring-emerald-500/30 focus:border-emerald-400"
              )}
            />
          </div>

          {/* Grouping Mode Toggle */}
          <div
            className={cn(
              "flex items-center gap-1 p-1 rounded-xl border w-full sm:w-auto transition-colors",
              isLight ? "bg-white border-[#ebdccb]" : "bg-[#031409]/90 border-emerald-900/50"
            )}
          >
            <button
              type="button"
              onClick={() => setGroupingMode(true)}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                groupingMode && selectedCategory === "all"
                  ? isLight
                    ? "bg-[#065b34] text-white shadow-xs"
                    : "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : isLight
                  ? "text-[#4b5563] hover:text-[#111827] hover:bg-[#f7f3ea]"
                  : "text-emerald-300/70 hover:text-white hover:bg-emerald-950/60"
              )}
              title="Group dishes by category sections"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>By Category</span>
            </button>
            <button
              type="button"
              onClick={() => setGroupingMode(false)}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                !groupingMode || selectedCategory !== "all"
                  ? isLight
                    ? "bg-[#065b34] text-white shadow-xs"
                    : "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : isLight
                  ? "text-[#4b5563] hover:text-[#111827] hover:bg-[#f7f3ea]"
                  : "text-emerald-300/70 hover:text-white hover:bg-emerald-950/60"
              )}
              title="Show all dishes in single grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All Grid</span>
            </button>
          </div>

          {/* Status Filter Pills */}
          <div
            className={cn(
              "flex gap-1 p-1 rounded-xl border w-full sm:w-auto overflow-x-auto transition-colors",
              isLight ? "bg-white border-[#ebdccb]" : "bg-[#031409]/90 border-emerald-900/50"
            )}
          >
            {STATUS_FILTERS.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={cn(
                  "flex-1 sm:flex-none py-1.5 px-3 rounded-lg text-xs font-semibold transition-all text-center cursor-pointer whitespace-nowrap",
                  statusFilter === st
                    ? isLight
                      ? "bg-[#065b34] text-white font-bold shadow-xs"
                      : "bg-emerald-500 text-[#020905] font-bold shadow-md shadow-emerald-500/20"
                    : isLight
                    ? "text-[#4b5563] hover:text-[#111827] hover:bg-[#f7f3ea]"
                    : "text-emerald-300/70 hover:text-white hover:bg-emerald-950/60"
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Horizontal Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "flex-shrink-0 inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border",
              selectedCategory === "all"
                ? isLight
                  ? "bg-[#065b34] text-white border-[#065b34] shadow-xs"
                  : "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30"
                : isLight
                ? "bg-white text-[#4b5563] hover:text-[#111827] border-[#ebdccb]"
                : "bg-[#031409]/90 text-emerald-200/70 hover:text-white border-emerald-900/50"
            )}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>All Categories</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                selectedCategory === "all"
                  ? "bg-white/20 text-white"
                  : isLight
                  ? "bg-[#f7f3ea] text-[#4b5563]"
                  : "bg-emerald-950 text-emerald-300"
              )}
            >
              {foods.length}
            </span>
          </button>

          {categories.map((c) => {
            const count = foods.filter(
              (f) => f.categoryId === c.id || f.category?.id === c.id
            ).length;
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={cn(
                  "flex-shrink-0 inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border",
                  isSelected
                    ? isLight
                      ? "bg-[#065b34] text-white border-[#065b34] shadow-xs"
                      : "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30"
                    : isLight
                    ? "bg-white text-[#4b5563] hover:text-[#111827] border-[#ebdccb]"
                    : "bg-[#031409]/90 text-emerald-200/70 hover:text-white border-emerald-900/50"
                )}
              >
                <span>{c.name}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                    isSelected
                      ? "bg-white/20 text-white"
                      : isLight
                      ? "bg-[#f7f3ea] text-[#4b5563]"
                      : "bg-emerald-950 text-emerald-300"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dishes Display Area */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <DishSkeleton key={i} />
            ))}
          </div>
        ) : filteredFoods.length === 0 ? (
          <div
            className={cn(
              "rounded-2xl border p-12 flex flex-col items-center justify-center text-center transition-colors",
              isLight ? "bg-white border-[#ebdccb]" : "bg-[#031409]/90 border-emerald-900/40"
            )}
          >
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border",
                isLight
                  ? "bg-[#f7f3ea] border-[#ebdccb] text-[#c59a4c]"
                  : "bg-emerald-950/60 border-emerald-900/60 text-emerald-400"
              )}
            >
              <Utensils className="w-8 h-8" />
            </div>
            <h3
              className={cn(
                "font-serif text-lg font-medium mb-1",
                isLight ? "text-[#111827]" : "text-white"
              )}
            >
              {searchQuery
                ? "No matching dishes found"
                : selectedCategory !== "all"
                ? "No dishes in this category"
                : statusFilter === "All"
                ? "No food items in menu yet"
                : `No ${statusFilter.toLowerCase()} dishes`}
            </h3>
            <p
              className={cn(
                "text-xs max-w-sm mb-6 leading-relaxed",
                isLight ? "text-[#4b5563]" : "text-gray-400"
              )}
            >
              {searchQuery || selectedCategory !== "all" || statusFilter !== "All"
                ? "Try resetting your search, category selection, or filters."
                : "Start showcasing your food to diners by adding your signature recipes."}
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setStatusFilter("All");
              }}
              variant={isLight ? "primary" : "mint"}
              className={cn(
                "gap-2 rounded-xl text-xs font-bold cursor-pointer",
                isLight && "bg-gradient-to-r from-[#065b34] to-[#044728] text-white hover:from-[#087342] hover:to-[#055732]"
              )}
            >
              Reset Filters
            </Button>
          </div>
        ) : groupingMode && selectedCategory === "all" && categoryGroups.length > 0 ? (
          /* Grouped by category sections */
          <div className="space-y-8">
            {categoryGroups.map((group) => (
              <section key={group.id} className="space-y-4">
                <div
                  className={cn(
                    "flex items-center gap-3 pb-2 border-b",
                    isLight ? "border-[#ebdccb]" : "border-emerald-950"
                  )}
                >
                  <h3
                    className={cn(
                      "font-serif text-lg sm:text-xl font-medium tracking-tight",
                      isLight ? "text-[#111827]" : "text-white"
                    )}
                  >
                    {group.name}
                  </h3>
                  <span
                    className={cn(
                      "text-[11px] font-bold px-2 py-0.5 rounded-full border",
                      isLight
                        ? "text-[#034d28] bg-[#f7f3ea] border-[#ebdccb]"
                        : "text-emerald-400 bg-[#062012] border-emerald-800/60"
                    )}
                  >
                    {group.items.length} {group.items.length === 1 ? "dish" : "dishes"}
                  </span>
                  <div
                    className={cn(
                      "h-px flex-1 bg-gradient-to-r",
                      isLight
                        ? "from-[#ebdccb] to-transparent"
                        : "from-emerald-800/40 to-transparent"
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {group.items.map((item) => (
                    <DishCard
                      key={item.id || item._id}
                      item={item}
                      onToggle={handleToggleState}
                      onEdit={(id) => router.push(`/menu/${id}/edit`)}
                      onDelete={setItemToDelete}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Single Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredFoods.map((item) => (
              <DishCard
                key={item.id || item._id}
                item={item}
                onToggle={handleToggleState}
                onEdit={(id) => router.push(`/menu/${id}/edit`)}
                onDelete={setItemToDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent
          className={cn(
            "max-w-md p-6 rounded-2xl border",
            isLight
              ? "bg-white border-[#ebdccb] text-[#111827]"
              : "bg-[#04150b] border-emerald-500/25 text-white"
          )}
        >
          <DialogHeader>
            <DialogTitle
              className={cn(
                "text-base font-serif font-bold",
                isLight ? "text-[#111827]" : "text-white"
              )}
            >
              Delete &quot;{itemToDelete?.name}&quot;?
            </DialogTitle>
            <DialogDescription
              className={cn(
                "text-xs leading-relaxed mt-1",
                isLight ? "text-[#4b5563]" : "text-emerald-200/60"
              )}
            >
              This action cannot be undone. This food item will be permanently removed from your digital menu and table QR display.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setItemToDelete(null)}
              disabled={deleting}
              className={cn(
                "rounded-xl text-xs font-semibold cursor-pointer",
                isLight && "border-[#ebdccb] text-[#4b5563] hover:bg-[#f7f3ea]"
              )}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDish}
              disabled={deleting}
              className="rounded-xl text-xs font-bold cursor-pointer"
            >
              {deleting ? "Deleting..." : "Delete Dish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
