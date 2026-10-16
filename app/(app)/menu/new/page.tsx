"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { Category } from "@/lib/mockData";
import FoodForm from "@/components/FoodForm";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

export default function AddFoodPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    api
      .get("/api/restaurant/categories")
      .then((res) => {
        const list = res.data?.categories || res.data || [];
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, []);

  const handleCreateFood = async (data: FormData) => {
    setSubmitting(true);
    setUploadProgress(0);
    try {
      await api.post("/api/restaurant/foods", data, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(
              Math.round((100 * progressEvent.loaded) / progressEvent.total)
            );
          }
        },
      });
      toast.success("Food item added!");
      router.push("/menu");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to add food item";
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
          <div>
            <h2
              className={cn(
                "font-serif text-2xl sm:text-3xl font-medium tracking-tight",
                isLight ? "text-[#111827]" : "text-white"
              )}
            >
              Add Food Item
            </h2>
            <p className={cn("text-xs mt-1", isLight ? "text-[#4b5563]" : "text-gray-400")}>
              Upload dish photography, specify pricing, dietary flags, and nutritional details for diners.
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

      <FoodForm
        categories={categories}
        onSubmit={handleCreateFood}
        submitting={submitting}
        uploadProgress={uploadProgress}
        submitLabel="Save Food Item"
      />
    </div>
  );
}
