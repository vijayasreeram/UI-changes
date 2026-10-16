"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { FoodItem, Category } from "@/lib/mockData";
import FoodForm from "@/components/FoodForm";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

export default function EditFoodPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const params = useParams();
  const id = params?.id as string;

  const [food, setFood] = useState<FoodItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/api/restaurant/foods/${id}`),
      api.get("/api/restaurant/categories"),
    ])
      .then(([foodRes, catRes]) => {
        const item = foodRes.data?.food || foodRes.data;
        setFood(item || null);
        const catList = catRes.data?.categories || catRes.data || [];
        setCategories(Array.isArray(catList) ? catList : []);
      })
      .catch(() => {
        toast.error("Failed to load item");
        router.back();
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleUpdateFood = async (data: FormData) => {
    setSubmitting(true);
    setUploadProgress(0);
    try {
      await api.put(`/api/restaurant/foods/${id}`, data, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(
              Math.round((100 * progressEvent.loaded) / progressEvent.total)
            );
          }
        },
      });
      toast.success("Food item updated!");
      router.push("/menu");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to update food item";
      toast.error(msg);
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => router.back()}
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-semibold transition-colors group cursor-pointer",
            isLight
              ? "text-[#034d28] hover:text-[#065b34]"
              : "text-emerald-400/80 hover:text-emerald-300"
          )}
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Menu & Stock</span>
        </button>

        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border transition-colors shadow-sm",
            isLight
              ? "bg-white border-[#ebdccb] shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
              : "bg-[#031409]/90 border-emerald-900/40"
          )}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2
                className={cn(
                  "font-serif text-2xl sm:text-3xl font-medium tracking-tight truncate",
                  isLight ? "text-[#111827]" : "text-white"
                )}
              >
                {food?.name ? `Edit: ${food.name}` : "Edit Food Item"}
              </h2>
              {food && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border",
                    food.isAvailable
                      ? isLight
                        ? "bg-emerald-50 text-[#034d28] border-emerald-300 shadow-xs"
                        : "bg-emerald-950 text-emerald-400 border-emerald-500/40 shadow-xs"
                      : isLight
                      ? "bg-rose-50 text-[#991b1b] border-rose-300"
                      : "bg-rose-950 text-rose-400 border-rose-500/40"
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      food.isAvailable
                        ? isLight
                          ? "bg-emerald-600 animate-pulse"
                          : "bg-emerald-400 animate-pulse"
                        : "bg-rose-500"
                    )}
                  />
                  {food.isAvailable ? "Live on Menu" : "Sold Out"}
                </span>
              )}
            </div>
            <p className={cn("text-xs mt-1", isLight ? "text-[#4b5563]" : "text-gray-400")}>
              Update dish photography, pricing, culinary details, and live diner availability.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => router.back()}
              className={cn(
                "inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer",
                isLight
                  ? "bg-[#f7f3ea] text-[#4b5563] border-[#ebdccb] hover:text-[#111827] hover:bg-[#ebdccb]/50"
                  : "text-emerald-200/80 bg-[#062012] hover:bg-[#0a2e1c] border-emerald-800/60"
              )}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-7 space-y-5">
            <Skeleton className={cn("h-72 w-full rounded-3xl", isLight && "bg-[#ebdccb]/60")} />
            <Skeleton className={cn("h-24 w-full rounded-2xl", isLight && "bg-[#ebdccb]/60")} />
            <Skeleton className={cn("h-44 w-full rounded-2xl", isLight && "bg-[#ebdccb]/60")} />
          </div>
          <div className="lg:col-span-5 space-y-5">
            <Skeleton className={cn("aspect-[4/3] w-full rounded-3xl", isLight && "bg-[#ebdccb]/60")} />
            <Skeleton className={cn("h-48 w-full rounded-3xl", isLight && "bg-[#ebdccb]/60")} />
          </div>
        </div>
      ) : (
        <FoodForm
          initialData={food}
          categories={categories}
          onSubmit={handleUpdateFood}
          submitting={submitting}
          uploadProgress={uploadProgress}
          submitLabel="Update Food Item"
        />
      )}
    </div>
  );
}
