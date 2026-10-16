"use client";
import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import {
  Utensils,
  Camera,
  FolderOpen,
  Image as ImageIcon,
  Flame,
  Clock,
  Scale,
  Sparkles,
  Zap,
  RotateCcw,
  Trash2,
  ImagePlus,
  Loader2,
  X,
  Check,
  ChevronDown
} from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Textarea } from "./ui/Textarea";
import { Select, SelectItem } from "./ui/Select";
import { Switch } from "./ui/Switch";
import { FoodItem, Category, PortionPrice, PreparationPrice } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

interface FoodFormProps {
  initialData?: FoodItem | null;
  categories: Category[];
  onSubmit: (data: FormData | any) => Promise<void>;
  submitting: boolean;
  uploadProgress?: number;
  submitLabel?: string;
}

const SPICE_LEVELS = [
  { value: 0, label: "Zero Spice", icon: "—" },
  { value: 1, label: "Mild", icon: "🌶" },
  { value: 2, label: "Medium", icon: "🌶🌶" },
  { value: 3, label: "Spicy", icon: "🌶🌶🌶" },
];

const DIETARY_OPTIONS = [
  { name: "Jain", emoji: "🪔", color: "border-purple-200 bg-purple-50 text-purple-800" },
  { name: "Vegan", emoji: "🥗", color: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  { name: "Gluten-Free", emoji: "🌾", color: "border-amber-200 bg-amber-50 text-amber-800" },
];

const SPECIAL_TAGS = [
  "Chef's Special",
  "Today's Special",
  "Special",
  "Bestseller",
  "Must Try",
  "House Specialty",
];

const SEASONAL_TAGS = [
  "Seasonal Special",
  "Summer Special",
  "Winter Special",
  "Monsoon Special",
  "Festive Special",
  "Mango Season",
  "Limited Season",
  "Spring Special",
];

// Helper to optimize image using browser canvas
async function optimizeImage(file: File): Promise<File> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const i = new window.Image();
    i.onload = () => {
      URL.revokeObjectURL(url);
      resolve(i);
    };
    i.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image failed to load"));
    };
    i.src = url;
  });

  const maxDimension = Math.max(img.naturalWidth, img.naturalHeight);
  if (maxDimension <= 1600 && (file.type === "image/jpeg" || file.type === "image/webp")) {
    return file;
  }

  const scale = Math.min(1, 1600 / maxDimension);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.85));
  if (!blob) return file;

  const cleanName = (file.name || "dish_photo").replace(/\.[^.]+$/, "");
  return new File([blob], `${cleanName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

export default function FoodForm({
  initialData,
  categories,
  onSubmit,
  submitting,
  uploadProgress = 0,
  submitLabel = "Save Food Item",
}: FoodFormProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  // Parse initial portion prices
  const parsedPortionPrices: PortionPrice = (() => {
    if (!initialData?.portionPrices) return {};
    if (typeof initialData.portionPrices === "string") {
      try {
        return JSON.parse(initialData.portionPrices);
      } catch {
        return {};
      }
    }
    return initialData.portionPrices;
  })();

  // Parse initial prep prices
  const parsedPrepPrices: PreparationPrice = (() => {
    if (!initialData?.preparationPrices) return {};
    if (typeof initialData.preparationPrices === "string") {
      try {
        return JSON.parse(initialData.preparationPrices);
      } catch {
        return {};
      }
    }
    return initialData.preparationPrices;
  })();

  const initialPricingType: "standard" | "portion" | "preparation" =
    Object.keys(parsedPrepPrices).length > 0 && Object.values(parsedPrepPrices).some((v) => Number(v) > 0)
      ? "preparation"
      : Object.keys(parsedPortionPrices).length > 0 && Object.values(parsedPortionPrices).some((v) => Number(v) > 0)
      ? "portion"
      : "standard";

  // Form State
  const [name, setName] = useState(initialData?.name || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || (categories[0]?.id || ""));
  const [description, setDescription] = useState(initialData?.description || "");
  const [isVeg, setIsVeg] = useState(initialData?.isVeg ?? true);
  const [isAvailable, setIsAvailable] = useState(initialData?.isAvailable ?? true);

  // Pricing
  const [pricingType, setPricingType] = useState<"standard" | "portion" | "preparation">(initialPricingType);
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "");
  const [portionPrices, setPortionPrices] = useState<PortionPrice>({
    quarter: parsedPortionPrices.quarter ? String(parsedPortionPrices.quarter) : "",
    half: parsedPortionPrices.half ? String(parsedPortionPrices.half) : "",
    full: parsedPortionPrices.full ? String(parsedPortionPrices.full) : "",
    regular: parsedPortionPrices.regular ? String(parsedPortionPrices.regular) : "",
    special: parsedPortionPrices.special ? String(parsedPortionPrices.special) : "",
  });
  const [preparationPrices, setPreparationPrices] = useState<PreparationPrice>({
    dry: parsedPrepPrices.dry ? String(parsedPrepPrices.dry) : "",
    gravy: parsedPrepPrices.gravy ? String(parsedPrepPrices.gravy) : "",
    semiGravy: parsedPrepPrices.semiGravy ? String(parsedPrepPrices.semiGravy) : "",
  });
  const [preparationType, setPreparationType] = useState<string>(initialData?.preparationType || "");

  // Flavors & Dietary
  const [spiceLevel, setSpiceLevel] = useState<number>(initialData?.spiceLevel ?? 1);
  const [dietary, setDietary] = useState<string[]>(initialData?.dietary || []);
  const [specialTags, setSpecialTags] = useState<string>(initialData?.specialTags || "");

  // Kitchen Specs
  const [calories, setCalories] = useState(initialData?.calories ? String(initialData.calories) : "");
  const [prepTime, setPrepTime] = useState(initialData?.prepTime ? String(initialData.prepTime) : "");
  const [servingSize, setServingSize] = useState(initialData?.servingSize || "");

  // Main Photo
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(
    initialData?.imageUrl || initialData?.image || null
  );
  const [isProcessingMain, setIsProcessingMain] = useState(false);

  // Top View Photo
  const [topImageFile, setTopImageFile] = useState<File | null>(null);
  const [topImagePreview, setTopImagePreview] = useState<string | null>(
    initialData?.topViewImageUrl || initialData?.top_view_image_url || null
  );
  const [isProcessingTop, setIsProcessingTop] = useState(false);

  // File Inputs Ref
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const topCameraInputRef = useRef<HTMLInputElement>(null);
  const topFileInputRef = useRef<HTMLInputElement>(null);

  // Sync categoryId if categories load later
  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleMainFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPEG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be under 5MB");
      return;
    }

    setIsProcessingMain(true);
    try {
      const optimized = await optimizeImage(file);
      setMainImageFile(optimized);
      setMainImagePreview(URL.createObjectURL(optimized));
    } catch {
      toast.error("Could not process image");
    } finally {
      setIsProcessingMain(false);
    }
  };

  const handleTopFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setIsProcessingTop(true);
    try {
      const optimized = await optimizeImage(file);
      setTopImageFile(optimized);
      setTopImagePreview(URL.createObjectURL(optimized));
    } catch {
      toast.error("Could not process top view image");
    } finally {
      setIsProcessingTop(false);
    }
  };

  const toggleDietary = (item: string) => {
    setDietary((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a dish name");
      return;
    }
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("categoryId", categoryId);
    formData.append("description", description.trim());
    formData.append("isVeg", String(isVeg));
    formData.append("foodType", isVeg ? "veg" : "non-veg");
    formData.append("isAvailable", String(isAvailable));
    formData.append("spiceLevel", String(spiceLevel));
    formData.append("specialTags", specialTags);
    formData.append("calories", calories);
    formData.append("prepTime", prepTime);
    formData.append("servingSize", servingSize);

    if (dietary.length > 0) {
      formData.append("dietary", JSON.stringify(dietary));
    }

    if (pricingType === "standard") {
      formData.append("price", String(Number(price) || 0));
      formData.append("portionPrices", JSON.stringify({}));
      formData.append("preparationPrices", JSON.stringify({}));
      if (preparationType) formData.append("preparationType", preparationType);
    } else if (pricingType === "portion") {
      const cleanedPortions: any = {};
      Object.entries(portionPrices).forEach(([k, v]) => {
        if (v && Number(v) > 0) cleanedPortions[k] = Number(v);
      });
      formData.append("portionPrices", JSON.stringify(cleanedPortions));
      const prices = Object.values(cleanedPortions) as number[];
      formData.append("price", String(prices.length > 0 ? Math.min(...prices) : 0));
      formData.append("preparationPrices", JSON.stringify({}));
    } else if (pricingType === "preparation") {
      const cleanedPrep: any = {};
      Object.entries(preparationPrices).forEach(([k, v]) => {
        if (v && Number(v) > 0) cleanedPrep[k] = Number(v);
      });
      formData.append("preparationPrices", JSON.stringify(cleanedPrep));
      const prices = Object.values(cleanedPrep) as number[];
      formData.append("price", String(prices.length > 0 ? Math.min(...prices) : 0));
      formData.append("portionPrices", JSON.stringify({}));
    }

    if (mainImageFile) {
      formData.append("image", mainImageFile);
      formData.append("imageUrl", mainImagePreview || "");
    } else if (mainImagePreview) {
      formData.append("imageUrl", mainImagePreview);
    }

    if (topImageFile) {
      formData.append("topViewImage", topImageFile);
      formData.append("topViewImageUrl", topImagePreview || "");
    } else if (topImagePreview) {
      formData.append("topViewImageUrl", topImagePreview);
    }

    await onSubmit(formData);
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Form Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Culinary Basics */}
          <div
            className={cn(
              "rounded-2xl sm:rounded-3xl border p-5 sm:p-6 shadow-sm space-y-4 transition-colors",
              isLight
                ? "bg-white border-[#ebdccb] shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                : "bg-[#031409]/90 border-emerald-900/40"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between pb-3 border-b",
                isLight ? "border-[#ebdccb]" : "border-emerald-950"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl border flex items-center justify-center font-bold",
                    isLight
                      ? "bg-[#f7f3ea] text-[#034d28] border-[#ebdccb]"
                      : "bg-emerald-950 text-emerald-400 border-emerald-900/60"
                  )}
                >
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h3
                    className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      isLight ? "text-[#034d28]" : "text-emerald-300"
                    )}
                  >
                    Culinary Basics
                  </h3>
                  <p className={cn("text-[11px]", isLight ? "text-[#4b5563]" : "text-gray-400")}>
                    Core identity & dietary classification
                  </p>
                </div>
              </div>

              {/* Veg / Non-Veg Toggle Pill */}
              <div
                className={cn(
                  "flex items-center gap-1 p-1 rounded-xl border transition-colors",
                  isLight ? "bg-[#f7f3ea] border-[#ebdccb]" : "bg-[#020805] border-emerald-900/60"
                )}
              >
                <button
                  type="button"
                  onClick={() => setIsVeg(true)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    isVeg
                      ? isLight
                        ? "bg-white text-[#034d28] shadow-xs border border-[#ebdccb]"
                        : "bg-emerald-950 text-emerald-400 shadow-xs border border-emerald-500/50"
                      : isLight
                      ? "text-gray-500 hover:text-gray-800"
                      : "text-emerald-400/60 hover:text-white"
                  )}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isLight
                        ? "bg-emerald-600"
                        : "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                    )}
                  />
                  <span>Veg</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsVeg(false)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    !isVeg
                      ? isLight
                        ? "bg-white text-rose-700 shadow-xs border border-rose-200"
                        : "bg-rose-950 text-rose-400 shadow-xs border border-rose-500/50"
                      : isLight
                      ? "text-gray-500 hover:text-gray-800"
                      : "text-emerald-400/60 hover:text-white"
                  )}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                  <span>Non-Veg</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Dish Name */}
              <div className="space-y-1.5">
                <Label htmlFor="dishName">
                  Dish Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="dishName"
                  placeholder="e.g. Murgh Malai Tikka, Paneer Butter Masala"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11 font-medium"
                />
              </div>

              {/* Category Selector */}
              <div className="space-y-1.5">
                <Label htmlFor="category">
                  Menu Category <span className="text-rose-500">*</span>
                </Label>
                <Select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description">Menu Description & Ingredients</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the dish flavors, spices, textures, and marination to entice diners..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="resize-none text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Pricing Strategy */}
          <div
            className={cn(
              "rounded-2xl sm:rounded-3xl border p-5 sm:p-6 shadow-sm space-y-4 transition-colors",
              isLight
                ? "bg-white border-[#ebdccb] shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                : "bg-[#031409]/90 border-emerald-900/40"
            )}
          >
            <div
              className={cn(
                "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b",
                isLight ? "border-[#ebdccb]" : "border-emerald-950"
              )}
            >
              <div>
                <h3
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    isLight ? "text-[#034d28]" : "text-emerald-300"
                  )}
                >
                  Pricing & Portions
                </h3>
                <p className={cn("text-[11px]", isLight ? "text-[#4b5563]" : "text-gray-400")}>
                  Configure flat rate, portion tiers, or preparation variations
                </p>
              </div>

              {/* Pricing Tabs */}
              <div
                className={cn(
                  "flex items-center gap-1 p-1 rounded-xl text-xs font-bold border transition-colors",
                  isLight ? "bg-[#f7f3ea] border-[#ebdccb]" : "bg-[#020805] border-emerald-900/60"
                )}
              >
                <button
                  type="button"
                  onClick={() => setPricingType("standard")}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg transition-all cursor-pointer",
                    pricingType === "standard"
                      ? isLight
                        ? "bg-[#065b34] text-white shadow-xs"
                        : "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : isLight
                      ? "text-[#4b5563] hover:text-[#111827]"
                      : "text-emerald-300/70 hover:text-white"
                  )}
                >
                  Flat Price
                </button>
                <button
                  type="button"
                  onClick={() => setPricingType("portion")}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg transition-all cursor-pointer",
                    pricingType === "portion"
                      ? isLight
                        ? "bg-[#065b34] text-white shadow-xs"
                        : "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : isLight
                      ? "text-[#4b5563] hover:text-[#111827]"
                      : "text-emerald-300/70 hover:text-white"
                  )}
                >
                  Portions
                </button>
                <button
                  type="button"
                  onClick={() => setPricingType("preparation")}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg transition-all cursor-pointer",
                    pricingType === "preparation"
                      ? isLight
                        ? "bg-[#065b34] text-white shadow-xs"
                        : "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : isLight
                      ? "text-[#4b5563] hover:text-[#111827]"
                      : "text-emerald-300/70 hover:text-white"
                  )}
                >
                  Prep Styles
                </button>
              </div>
            </div>

            {/* Standard Price Mode */}
            {pricingType === "standard" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price">
                    Standard Price (₹) <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <span
                      className={cn(
                        "absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm",
                        isLight ? "text-[#034d28]" : "text-emerald-400"
                      )}
                    >
                      ₹
                    </span>
                    <Input
                      id="price"
                      type="number"
                      placeholder="e.g. 350"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="pl-8 h-11 text-base font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Preparation Style Tag (Optional)</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "", label: "Standard / None" },
                      { key: "dry", label: "🍗 Dry" },
                      { key: "gravy", label: "🍲 Gravy" },
                      { key: "semi-gravy", label: "🥣 Semi-Gravy" },
                      { key: "both", label: "🔄 Dry & Gravy" },
                    ].map((st) => (
                      <button
                        key={st.key}
                        type="button"
                        onClick={() => setPreparationType(st.key)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                          preparationType === st.key
                            ? isLight
                              ? "bg-emerald-50 text-[#034d28] border-emerald-300 shadow-xs"
                              : "bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-xs"
                            : isLight
                            ? "bg-[#f7f3ea] text-[#4b5563] border-[#ebdccb] hover:text-[#111827]"
                            : "bg-[#020805] text-emerald-200/70 border-emerald-900/60 hover:text-white"
                        )}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Portion Pricing Mode */}
            {pricingType === "portion" && (
              <div className="space-y-4">
                <p className={cn("text-[11px]", isLight ? "text-[#4b5563]" : "text-gray-400")}>
                  Specify prices for serving portions. Fill only the portions your kitchen serves.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: "quarter", label: "Quarter (1/4)" },
                    { key: "half", label: "Half (1/2)" },
                    { key: "full", label: "Full" },
                    { key: "regular", label: "Regular" },
                    { key: "special", label: "Special" },
                  ].map((p) => (
                    <div
                      key={p.key}
                      className={cn(
                        "space-y-1 p-2.5 rounded-xl border transition-colors",
                        isLight ? "bg-[#fcfaf6] border-[#ebdccb]" : "bg-[#020805] border-emerald-900/60"
                      )}
                    >
                      <Label className="text-[11px]">{p.label}</Label>
                      <div className="relative">
                        <span
                          className={cn(
                            "absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-xs",
                            isLight ? "text-[#034d28]" : "text-emerald-400"
                          )}
                        >
                          ₹
                        </span>
                        <Input
                          type="number"
                          placeholder="0"
                          value={(portionPrices as any)[p.key] || ""}
                          onChange={(e) =>
                            setPortionPrices({
                              ...portionPrices,
                              [p.key]: e.target.value,
                            })
                          }
                          className="pl-6 h-9 text-xs font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preparation Style Pricing Mode */}
            {pricingType === "preparation" && (
              <div className="space-y-4">
                <p className={cn("text-[11px]", isLight ? "text-[#4b5563]" : "text-gray-400")}>
                  Different preparation styles (Dry vs Gravy vs Semi-Gravy) with dedicated pricing:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: "dry", label: "🍗 Dry Price (₹)" },
                    { key: "gravy", label: "🍲 Gravy Price (₹)" },
                    { key: "semiGravy", label: "🥣 Semi-Gravy Price (₹)" },
                  ].map((p) => (
                    <div
                      key={p.key}
                      className={cn(
                        "space-y-1 p-3 rounded-xl border transition-colors",
                        isLight ? "bg-[#fcfaf6] border-[#ebdccb]" : "bg-[#020805] border-emerald-900/60"
                      )}
                    >
                      <Label className="text-[11px]">{p.label}</Label>
                      <div className="relative">
                        <span
                          className={cn(
                            "absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-xs",
                            isLight ? "text-[#034d28]" : "text-emerald-400"
                          )}
                        >
                          ₹
                        </span>
                        <Input
                          type="number"
                          placeholder="0"
                          value={(preparationPrices as any)[p.key] || ""}
                          onChange={(e) =>
                            setPreparationPrices({
                              ...preparationPrices,
                              [p.key]: e.target.value,
                            })
                          }
                          className="pl-6 h-9 text-xs font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Flavors & Dietary Tags */}
          <div
            className={cn(
              "rounded-2xl sm:rounded-3xl border p-5 sm:p-6 shadow-sm space-y-5 transition-colors",
              isLight
                ? "bg-white border-[#ebdccb] shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                : "bg-[#031409]/90 border-emerald-900/40"
            )}
          >
            <h3
              className={cn(
                "text-xs font-bold uppercase tracking-wider pb-2 border-b",
                isLight ? "text-[#034d28] border-[#ebdccb]" : "text-emerald-300 border-emerald-950"
              )}
            >
              Flavors, Badges & Dietary
            </h3>

            {/* Spice Level */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Flame className={cn("w-3.5 h-3.5", isLight ? "text-[#034d28]" : "text-emerald-400")} />
                <span>Spice Intensity</span>
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SPICE_LEVELS.map((sl) => (
                  <button
                    key={sl.value}
                    type="button"
                    onClick={() => setSpiceLevel(sl.value)}
                    className={cn(
                      "flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                      spiceLevel === sl.value
                        ? isLight
                          ? "bg-emerald-50 border-emerald-400 text-[#034d28] shadow-xs ring-2 ring-emerald-600/20"
                          : "bg-[#062012] border-emerald-400 text-emerald-300 shadow-xs ring-2 ring-emerald-500/20"
                        : isLight
                        ? "bg-[#f7f3ea] border-[#ebdccb] text-[#4b5563] hover:bg-emerald-50/50"
                        : "bg-[#020805] border-emerald-900/60 text-emerald-200/70 hover:bg-emerald-950/40"
                    )}
                  >
                    <span className="text-sm mb-0.5">{sl.icon}</span>
                    <span>{sl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Flags */}
            <div className="space-y-2">
              <Label>Dietary Certifications</Label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((opt) => {
                  const isChecked = dietary.includes(opt.name);
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => toggleDietary(opt.name)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                        isChecked
                          ? isLight
                            ? "bg-emerald-50 border-emerald-400 text-[#034d28] shadow-xs"
                            : "bg-emerald-950 border-emerald-500/60 text-emerald-300 shadow-2xs"
                          : isLight
                          ? "bg-[#f7f3ea] border-[#ebdccb] text-[#4b5563] hover:bg-emerald-50/50"
                          : "bg-[#020805] border-emerald-900/60 text-emerald-200/70 hover:bg-emerald-950/40"
                      )}
                    >
                      <span>{opt.emoji}</span>
                      <span>{opt.name}</span>
                      {isChecked && (
                        <Check className={cn("w-3 h-3 ml-0.5", isLight ? "text-[#034d28]" : "text-emerald-400")} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special & Seasonal Badges */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Sparkles className={cn("w-3.5 h-3.5", isLight ? "text-[#c59a4c]" : "text-emerald-400")} />
                <span>Marketing / Menu Badge</span>
              </Label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSpecialTags("")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                    !specialTags
                      ? isLight
                        ? "bg-[#065b34] text-white border-[#065b34] shadow-xs"
                        : "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                      : isLight
                      ? "bg-[#f7f3ea] text-[#4b5563] border-[#ebdccb] hover:text-[#111827]"
                      : "bg-[#020805] text-emerald-200/70 border-emerald-900/60 hover:text-white"
                  )}
                >
                  None
                </button>
                {SPECIAL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSpecialTags(tag)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                      specialTags === tag
                        ? isLight
                          ? "bg-amber-50 text-amber-800 border-amber-300 shadow-xs"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-2xs"
                        : isLight
                        ? "bg-[#f7f3ea] text-[#4b5563] border-[#ebdccb] hover:text-[#111827]"
                        : "bg-[#020805] text-emerald-200/70 border-emerald-900/60 hover:text-white"
                    )}
                  >
                    ⭐ {tag}
                  </button>
                ))}
                {SEASONAL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSpecialTags(tag)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                      specialTags === tag
                        ? isLight
                          ? "bg-emerald-50 text-[#034d28] border-emerald-300 shadow-xs"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-2xs"
                        : isLight
                        ? "bg-[#f7f3ea] text-[#4b5563] border-[#ebdccb] hover:text-[#111827]"
                        : "bg-[#020805] text-emerald-200/70 border-emerald-900/60 hover:text-white"
                    )}
                  >
                    🍁 {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: Kitchen Specs */}
          <div
            className={cn(
              "rounded-2xl sm:rounded-3xl border p-5 sm:p-6 shadow-sm space-y-4 transition-colors",
              isLight
                ? "bg-white border-[#ebdccb] shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                : "bg-[#031409]/90 border-emerald-900/40"
            )}
          >
            <h3
              className={cn(
                "text-xs font-bold uppercase tracking-wider pb-2 border-b",
                isLight ? "text-[#034d28] border-[#ebdccb]" : "text-emerald-300 border-emerald-950"
              )}
            >
              Kitchen & Serving Specs (Optional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="flex items-center gap-1 text-[11px]">
                  <Zap className={cn("w-3 h-3", isLight ? "text-[#034d28]" : "text-emerald-400")} />
                  <span>Calories (kcal)</span>
                </Label>
                <Input
                  type="number"
                  placeholder="e.g. 420"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="flex items-center gap-1 text-[11px]">
                  <Clock className={cn("w-3 h-3", isLight ? "text-[#034d28]" : "text-emerald-400")} />
                  <span>Prep Time (mins)</span>
                </Label>
                <Input
                  type="number"
                  placeholder="e.g. 18"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="flex items-center gap-1 text-[11px]">
                  <Scale className={cn("w-3 h-3", isLight ? "text-[#034d28]" : "text-emerald-400")} />
                  <span>Serving Portion</span>
                </Label>
                <Input
                  placeholder="e.g. 2-3 Persons"
                  value={servingSize}
                  onChange={(e) => setServingSize(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Photography & Live Diner Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Photography Box */}
          <div
            className={cn(
              "rounded-2xl sm:rounded-3xl border p-5 sm:p-6 shadow-sm space-y-4 transition-colors",
              isLight
                ? "bg-white border-[#ebdccb] shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                : "bg-[#031409]/90 border-emerald-900/40"
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
                    isLight ? "text-[#034d28]" : "text-emerald-300"
                  )}
                >
                  Dish Photography
                </h3>
                <p className={cn("text-[11px]", isLight ? "text-[#4b5563]" : "text-gray-400")}>
                  Primary angled camera shot
                </p>
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                  isLight
                    ? "bg-[#f7f3ea] text-[#034d28] border-[#ebdccb]"
                    : "bg-emerald-950 text-emerald-300 border-emerald-700/50"
                )}
              >
                Primary Photo
              </span>
            </div>

            {/* Hidden inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleMainFile(e.target.files[0])}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleMainFile(e.target.files[0])}
            />

            {/* Image Box */}
            <div
              className={cn(
                "relative aspect-[4/3] w-full rounded-2xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center group transition-all",
                isLight
                  ? "border-[#ebdccb] bg-[#fcfaf6] hover:border-[#c59a4c]"
                  : "border-emerald-900/60 bg-[#020805] hover:border-emerald-500/60"
              )}
            >
              {mainImagePreview ? (
                <>
                  <Image
                    src={mainImagePreview}
                    alt={name || "Dish Preview"}
                    fill
                    sizes="400px"
                    unoptimized={mainImagePreview.startsWith("blob:")}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="w-full max-w-[200px] py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#020905] text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Snap New Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full max-w-[200px] py-2 px-3 rounded-xl bg-[#062012] hover:bg-[#0a2e1c] text-emerald-100 border border-emerald-700/60 text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <FolderOpen className="w-4 h-4 text-emerald-400" />
                      <span>Choose from Gallery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMainImageFile(null);
                        setMainImagePreview(null);
                      }}
                      className="w-full max-w-[200px] py-1.5 px-3 rounded-xl bg-rose-600/90 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Photo</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-5 text-center">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl border flex items-center justify-center mb-2 shadow-inner",
                      isLight
                        ? "bg-[#f7f3ea] border-[#ebdccb] text-[#c59a4c]"
                        : "bg-emerald-950/80 border-emerald-900/60 text-emerald-400"
                    )}
                  >
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className={cn("text-xs font-bold", isLight ? "text-[#111827]" : "text-white")}>
                    Add Dish Photo
                  </p>
                  <p className={cn("text-[11px] mt-0.5", isLight ? "text-[#4b5563]" : "text-gray-400")}>
                    Snap instant camera photo or browse gallery
                  </p>
                  <div className="flex items-center gap-2 mt-3.5 w-full max-w-[260px]">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className={cn(
                        "flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer",
                        isLight
                          ? "bg-gradient-to-r from-[#065b34] to-[#044728] text-white hover:from-[#087342] hover:to-[#055732]"
                          : "bg-[#22c55e] hover:bg-[#16a34a] text-[#022c15] shadow-emerald-900/40"
                      )}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Camera</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                        isLight
                          ? "bg-white text-[#111827] border-[#ebdccb] hover:bg-[#f7f3ea]"
                          : "bg-[#062012] hover:bg-[#0a2e1c] text-emerald-100 border-emerald-800/60"
                      )}
                    >
                      <FolderOpen className={cn("w-3.5 h-3.5", isLight ? "text-[#c59a4c]" : "text-emerald-400")} />
                      <span>Browse</span>
                    </button>
                  </div>
                </div>
              )}

              {isProcessingMain && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-xs">
                  <div className="flex items-center gap-2 bg-[#04150b] border border-emerald-500/30 px-3 py-2 rounded-xl shadow-md text-xs font-bold text-emerald-200">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Optimizing photo...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Top View Optional Photo */}
            <div
              className={cn(
                "pt-3 border-t space-y-2",
                isLight ? "border-[#ebdccb]" : "border-emerald-950"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-bold flex items-center gap-1.5",
                    isLight ? "text-[#034d28]" : "text-emerald-300"
                  )}
                >
                  <ImagePlus className={cn("w-3.5 h-3.5", isLight ? "text-[#c59a4c]" : "text-emerald-400")} />
                  Top-View Photo (Flat Lay)
                </span>
                <span className={cn("text-[10px] font-semibold", isLight ? "text-gray-400" : "text-gray-400")}>
                  Optional
                </span>
              </div>

              <input
                ref={topCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleTopFile(e.target.files[0])}
              />
              <input
                ref={topFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleTopFile(e.target.files[0])}
              />

              {topImagePreview ? (
                <div
                  className={cn(
                    "relative h-24 rounded-xl overflow-hidden border group",
                    isLight ? "border-[#ebdccb]" : "border-emerald-900/60"
                  )}
                >
                  <Image
                    src={topImagePreview}
                    alt="Top View"
                    fill
                    sizes="200px"
                    unoptimized={topImagePreview.startsWith("blob:")}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => topFileInputRef.current?.click()}
                      className="px-2 py-1 rounded bg-white text-slate-900 text-[10px] font-bold cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTopImageFile(null);
                        setTopImagePreview(null);
                      }}
                      className="px-2 py-1 rounded bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => topFileInputRef.current?.click()}
                  className={cn(
                    "w-full py-2 px-3 rounded-xl border border-dashed text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                    isLight
                      ? "border-[#ebdccb] bg-[#fcfaf6] text-[#4b5563] hover:border-[#c59a4c]"
                      : "border-emerald-900/60 bg-[#020805] hover:border-emerald-500/60 text-emerald-200/70"
                  )}
                >
                  <ImagePlus className={cn("w-3.5 h-3.5", isLight ? "text-[#c59a4c]" : "text-emerald-400")} />
                  <span>Upload flat-lay top photo</span>
                </button>
              )}
            </div>
          </div>

          {/* Live Diner Card Preview */}
          <div
            className={cn(
              "rounded-2xl sm:rounded-3xl border p-5 sm:p-6 shadow-sm space-y-3 transition-colors",
              isLight
                ? "bg-white border-[#ebdccb] shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                : "bg-[#031409]/90 border-emerald-900/40"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between pb-2 border-b",
                isLight ? "border-[#ebdccb]" : "border-emerald-950"
              )}
            >
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", isLight ? "text-gray-500" : "text-gray-400")}>
                Live Diner Menu Card Preview
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                  isLight
                    ? "bg-[#f7f3ea] text-[#034d28] border-[#ebdccb]"
                    : "text-emerald-400 bg-[#062012] border-emerald-800/60"
                )}
              >
                Diner View
              </span>
            </div>

            <div
              className={cn(
                "rounded-2xl border p-3.5 flex gap-3 shadow-xs",
                isLight ? "border-[#ebdccb] bg-[#fcfaf6]" : "border-emerald-900/60 bg-[#020805]"
              )}
            >
              <div
                className={cn(
                  "w-20 h-20 rounded-xl overflow-hidden relative flex-shrink-0 border",
                  isLight ? "bg-[#f7f3ea] border-[#ebdccb]" : "bg-[#04150b] border-emerald-950"
                )}
              >
                {mainImagePreview ? (
                  <Image
                    src={mainImagePreview}
                    alt="Preview"
                    fill
                    sizes="80px"
                    unoptimized={mainImagePreview.startsWith("blob:")}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-emerald-800">
                    <Utensils className={cn("w-6 h-6", isLight ? "text-[#c59a4c]" : "text-emerald-800")} />
                  </div>
                )}
                {specialTags && (
                  <span className="absolute top-1 left-1 text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-black/80 text-emerald-300 border border-emerald-500/30">
                    {specialTags}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "w-3 h-3 rounded-xs border-2 flex items-center justify-center flex-shrink-0",
                      isVeg ? "border-emerald-500" : "border-rose-500"
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isVeg ? "bg-emerald-500" : "bg-rose-500"
                      )}
                    />
                  </span>
                  <h4
                    className={cn(
                      "font-bold text-xs sm:text-sm truncate",
                      isLight ? "text-[#111827]" : "text-white"
                    )}
                  >
                    {name || "Dish Name"}
                  </h4>
                </div>

                <p
                  className={cn(
                    "font-extrabold text-sm mt-0.5",
                    isLight ? "text-[#034d28]" : "text-emerald-400"
                  )}
                >
                  ₹{price || "0"}
                </p>

                <div className="flex items-center gap-1 mt-1">
                  {selectedCategory && (
                    <span
                      className={cn(
                        "text-[9px] font-medium px-1.5 py-0.5 rounded border",
                        isLight
                          ? "bg-[#f7f3ea] text-[#4b5563] border-[#ebdccb]"
                          : "text-emerald-200/80 bg-[#062012] border-emerald-900/60"
                      )}
                    >
                      {selectedCategory.name}
                    </span>
                  )}
                  {preparationType && (
                    <span
                      className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded border",
                        isLight
                          ? "bg-emerald-50 text-[#034d28] border-emerald-200"
                          : "text-emerald-300 bg-emerald-950 border-emerald-700/60"
                      )}
                    >
                      {preparationType}
                    </span>
                  )}
                </div>

                <p
                  className={cn(
                    "text-[11px] line-clamp-1 mt-1",
                    isLight ? "text-[#4b5563]" : "text-gray-400"
                  )}
                >
                  {description || "Flavorful spices and ingredients..."}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button & Upload Progress */}
          <div className="space-y-2 pt-2">
            {uploadProgress > 0 && (
              <div className="space-y-1">
                <div
                  className={cn(
                    "flex justify-between text-xs font-bold",
                    isLight ? "text-[#034d28]" : "text-emerald-300"
                  )}
                >
                  <span>Uploading photos...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div
                  className={cn(
                    "h-2 rounded-full overflow-hidden border",
                    isLight ? "bg-[#f7f3ea] border-[#ebdccb]" : "bg-[#020805] border-emerald-900/60"
                  )}
                >
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              variant={isLight ? "primary" : "mint"}
              className={cn(
                "w-full font-bold text-sm h-12 rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]",
                isLight
                  ? "bg-gradient-to-r from-[#065b34] to-[#044728] text-white hover:from-[#087342] hover:to-[#055732] shadow-emerald-950/20"
                  : "shadow-emerald-900/40"
              )}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className={cn("w-4 h-4 animate-spin", isLight ? "text-white" : "text-[#022c15]")} />
                  <span>Saving to Digital Menu...</span>
                </div>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
