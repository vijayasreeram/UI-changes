"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FolderOpen,
  Check,
  X,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
} from "lucide-react";
import api from "@/lib/api";
import { Category, FoodItem } from "@/lib/mockData";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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

function CategorySkeleton() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 flex items-center gap-4",
        isLight ? "bg-white border-[#ebdccb]" : "bg-[#031409]/90 border-emerald-900/40"
      )}
    >
      <Skeleton className={cn("w-10 h-10 rounded-xl", isLight && "bg-[#ebdccb]/60")} />
      <div className="flex-1 space-y-1.5">
        <Skeleton className={cn("h-4 w-36", isLight && "bg-[#ebdccb]/60")} />
        <Skeleton className={cn("h-3 w-20", isLight && "bg-[#ebdccb]/60")} />
      </div>
      <Skeleton className={cn("w-8 h-8 rounded-lg", isLight && "bg-[#ebdccb]/60")} />
      <Skeleton className={cn("w-8 h-8 rounded-lg", isLight && "bg-[#ebdccb]/60")} />
    </div>
  );
}

export default function CategoriesPage() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [updating, setUpdating] = useState(false);

  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fetchCategories = useCallback(() => {
    setLoading(true);
    api
      .get("/api/restaurant/categories")
      .then((res) => {
        const list = res.data?.categories || res.data || [];
        setCategories(
          Array.isArray(list)
            ? list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            : []
        );
      })
      .catch(() => toast.error("Failed to load categories"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreateCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      const res = await api.post("/api/restaurant/categories", {
        name: trimmed,
        sortOrder: categories.length,
      });
      const created = res.data?.category || res.data;
      setCategories((prev) => [...prev, created]);
      setNewCategoryName("");
      setShowAddForm(false);
      toast.success("Category created");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to add category";
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateCategory = async (cat: Category) => {
    const trimmed = editingName.trim();
    const id = cat.id || cat._id;
    if (!trimmed || trimmed === cat.name) {
      setEditingId(null);
      return;
    }
    setUpdating(true);
    try {
      await api.put(`/api/restaurant/categories/${id}`, {
        name: trimmed,
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === id || c._id === id ? { ...c, name: trimmed } : c))
      );
      toast.success("Category updated");
      setEditingId(null);
    } catch {
      toast.error("Failed to update category");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    const id = categoryToDelete.id || categoryToDelete._id;
    setDeleting(true);
    try {
      await api.delete(`/api/restaurant/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id && c._id !== id));
      toast.success(`"${categoryToDelete.name}" deleted`);
      setCategoryToDelete(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to delete category";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const nextList = [...categories];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= nextList.length) return;

    [nextList[index], nextList[targetIndex]] = [nextList[targetIndex], nextList[index]];
    setCategories(nextList);

    const updatePromises = nextList.map((c, idx) => {
      const id = c.id || c._id;
      return api.put(`/api/restaurant/categories/${id}`, { sortOrder: idx }).catch(() => {});
    });
    await Promise.all(updatePromises);
  };

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
            Menu Categories
          </h2>
          <p className={cn("text-xs mt-1", isLight ? "text-[#4b5563]" : "text-gray-400")}>
            Organize the sections of your menu (e.g. Starters, Main Course, Biryani, Desserts, Drinks)
          </p>
        </div>

        <Button
          onClick={() => {
            setShowAddForm(true);
            setNewCategoryName("");
          }}
          variant={isLight ? "primary" : "mint"}
          className={cn(
            "w-full sm:w-auto justify-center gap-2 rounded-xl px-5 py-2.5 h-auto text-xs sm:text-sm font-bold cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]",
            isLight && "bg-gradient-to-r from-[#065b34] to-[#044728] text-white hover:from-[#087342] hover:to-[#055732]"
          )}
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Inline Create Category Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-2xl p-5 sm:p-6 shadow-sm space-y-3 sm:space-y-4 border transition-colors",
            isLight
              ? "bg-white border-[#ebdccb] shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
              : "bg-[#041d0f]/90 border-emerald-500/30"
          )}
        >
          <h3
            className={cn(
              "text-xs font-bold uppercase tracking-wider",
              isLight ? "text-[#034d28]" : "text-emerald-300"
            )}
          >
            Create New Category
          </h3>
          <Input
            placeholder="Category name (e.g. Tandoori Starters, Biryani, Beverages, Desserts)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
            autoFocus
            className="rounded-xl text-xs sm:text-sm h-11"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleCreateCategory}
              disabled={creating || !newCategoryName.trim()}
              variant={isLight ? "primary" : "mint"}
              className={cn(
                "flex-1 sm:flex-none text-xs font-bold h-9 cursor-pointer",
                isLight && "bg-gradient-to-r from-[#065b34] to-[#044728] text-white hover:from-[#087342] hover:to-[#055732]"
              )}
            >
              {creating ? "Creating..." : "Save Category"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setNewCategoryName("");
              }}
              disabled={creating}
              className={cn(
                "flex-1 sm:flex-none rounded-xl text-xs font-semibold h-9 cursor-pointer",
                isLight && "border-[#ebdccb] text-[#4b5563] hover:bg-[#f7f3ea]"
              )}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* Category List */}
      <div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div
            className={cn(
              "rounded-2xl border p-8 sm:p-12 flex flex-col items-center justify-center text-center transition-colors",
              isLight ? "bg-white border-[#ebdccb]" : "bg-[#031409]/90 border-emerald-900/40"
            )}
          >
            <div
              className={cn(
                "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border flex items-center justify-center mb-4",
                isLight
                  ? "bg-[#f7f3ea] border-[#ebdccb] text-[#c59a4c]"
                  : "bg-emerald-950/80 border-emerald-900/60 text-emerald-400"
              )}
            >
              <FolderOpen className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h3
              className={cn(
                "font-serif text-lg font-medium mb-1",
                isLight ? "text-[#111827]" : "text-white"
              )}
            >
              No categories added yet
            </h3>
            <p
              className={cn(
                "text-xs max-w-sm mb-6 leading-relaxed",
                isLight ? "text-[#4b5563]" : "text-gray-400"
              )}
            >
              Categories create sticky navigation pills on diners&apos; phones to help them browse easily.
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              variant={isLight ? "primary" : "mint"}
              className={cn(
                "rounded-xl gap-2 text-xs font-bold cursor-pointer",
                isLight && "bg-gradient-to-r from-[#065b34] to-[#044728] text-white hover:from-[#087342] hover:to-[#055732]"
              )}
            >
              <Plus className="w-4 h-4" />
              <span>Add First Category</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((cat, index) => {
              const id = cat.id || cat._id || "";
              const isEditing = editingId === id;
              const foodCount = cat._count?.foodItems ?? cat.foodCount ?? 0;
              const isExpanded = expandedCategories.has(id);
              const assignedFoods = cat.foodItems || [];

              return (
                <motion.div
                  key={id}
                  layout
                  className={cn(
                    "rounded-2xl border p-4 sm:p-5 transition-all space-y-3 shadow-sm",
                    isLight
                      ? "bg-white border-[#ebdccb] hover:border-[#c59a4c]/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                      : "bg-[#031409]/90 border-emerald-900/40 hover:border-emerald-600/50"
                  )}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Index Badge */}
                    <div
                      className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center font-bold text-xs flex-shrink-0",
                        isLight
                          ? "bg-[#f7f3ea] text-[#034d28] border-[#ebdccb]"
                          : "bg-[#062012] text-emerald-400 border-emerald-800/60"
                      )}
                    >
                      #{index + 1}
                    </div>

                    {/* Category Title / Rename */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleUpdateCategory(cat)}
                            autoFocus
                            className="h-8 sm:h-9 text-xs rounded-xl"
                          />
                          <button
                            onClick={() => handleUpdateCategory(cat)}
                            disabled={updating}
                            className={cn(
                              "p-1.5 sm:p-2 rounded-lg border cursor-pointer transition-colors",
                              isLight
                                ? "bg-[#065b34] text-white border-[#065b34] hover:bg-[#087342]"
                                : "bg-emerald-950 text-emerald-400 border-emerald-700/60 hover:bg-emerald-900"
                            )}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className={cn(
                              "p-1.5 sm:p-2 rounded-lg border cursor-pointer transition-colors",
                              isLight
                                ? "bg-[#f7f3ea] text-[#4b5563] border-[#ebdccb] hover:text-[#111827]"
                                : "bg-[#020805] text-gray-400 border-emerald-950 hover:text-white"
                            )}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleExpand(id)}
                          className="w-full text-left min-w-0 group cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5">
                            <h3
                              className={cn(
                                "font-bold text-sm sm:text-base truncate transition-colors",
                                isLight
                                  ? "text-[#111827] group-hover:text-[#034d28]"
                                  : "text-white group-hover:text-emerald-300"
                              )}
                            >
                              {cat.name}
                            </h3>
                            <ChevronRight
                              className={cn(
                                "w-3.5 h-3.5 transition-transform duration-200",
                                isLight
                                  ? isExpanded
                                    ? "rotate-90 text-[#034d28]"
                                    : "text-gray-400"
                                  : isExpanded
                                  ? "rotate-90 text-emerald-400"
                                  : "text-gray-400"
                              )}
                            />
                          </div>
                          <p
                            className={cn(
                              "text-[10px] sm:text-[11px] mt-0.5 truncate",
                              isLight ? "text-[#4b5563]" : "text-gray-400"
                            )}
                          >
                            {foodCount} {foodCount === 1 ? "dish" : "dishes"} in this section • click to {isExpanded ? "hide" : "view"}
                          </p>
                        </button>
                      )}
                    </div>

                    {/* Move Order Controls */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleMoveOrder(index, "up")}
                        disabled={index === 0}
                        className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-lg border disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer",
                          isLight
                            ? "border-[#ebdccb] bg-[#fcfaf6] text-[#034d28] hover:bg-[#f7f3ea]"
                            : "border-emerald-900/60 bg-[#020805] text-emerald-400/80 hover:bg-[#062012]"
                        )}
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(index, "down")}
                        disabled={index === categories.length - 1}
                        className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-lg border disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer",
                          isLight
                            ? "border-[#ebdccb] bg-[#fcfaf6] text-[#034d28] hover:bg-[#f7f3ea]"
                            : "border-emerald-900/60 bg-[#020805] text-emerald-400/80 hover:bg-[#062012]"
                        )}
                        title="Move down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Action Buttons */}
                    {!isEditing && (
                      <div
                        className={cn(
                          "flex items-center gap-1.5 pl-2 border-l flex-shrink-0",
                          isLight ? "border-[#ebdccb]" : "border-emerald-950"
                        )}
                      >
                        <button
                          onClick={() => {
                            setEditingId(id);
                            setEditingName(cat.name);
                          }}
                          className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-lg border transition-colors cursor-pointer",
                            isLight
                              ? "bg-white border-[#ebdccb] text-[#034d28] hover:border-[#034d28]"
                              : "bg-[#04150b] border-emerald-900/60 text-emerald-300 hover:text-white hover:border-emerald-600"
                          )}
                          title="Rename category"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setCategoryToDelete(cat)}
                          className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-lg border transition-colors cursor-pointer",
                            isLight
                              ? "bg-white border-[#ebdccb] text-rose-500 hover:text-rose-700 hover:border-rose-400"
                              : "bg-[#04150b] border-emerald-900/60 text-rose-400 hover:text-rose-300 hover:border-rose-500/60"
                          )}
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expandable Assigned Dishes Drawer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={cn(
                          "pt-3 border-t",
                          isLight ? "border-[#ebdccb]" : "border-emerald-950"
                        )}
                      >
                        {assignedFoods.length > 0 ? (
                          <div className="space-y-1.5">
                            <p
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-wider mb-2",
                                isLight ? "text-[#034d28]" : "text-emerald-400/80"
                              )}
                            >
                              Assigned Dishes ({assignedFoods.length})
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {assignedFoods.map((f) => (
                                <div
                                  key={f.id || f._id}
                                  className={cn(
                                    "flex items-center justify-between gap-2 p-2.5 rounded-xl border text-xs",
                                    isLight
                                      ? "bg-[#fcfaf6] border-[#ebdccb] text-[#111827]"
                                      : "bg-[#020805] border-emerald-900/60"
                                  )}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span
                                      className={cn(
                                        "w-2 h-2 rounded-full flex-shrink-0",
                                        f.isVeg
                                          ? isLight
                                            ? "bg-emerald-600"
                                            : "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                                          : "bg-rose-500"
                                      )}
                                      title={f.isVeg ? "Vegetarian" : "Non-Vegetarian"}
                                    />
                                    <span
                                      className={cn(
                                        "font-semibold truncate",
                                        isLight ? "text-[#111827]" : "text-white"
                                      )}
                                    >
                                      {f.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <span
                                      className={cn(
                                        "font-bold",
                                        isLight ? "text-[#034d28]" : "text-emerald-400"
                                      )}
                                    >
                                      ₹{f.price}
                                    </span>
                                    <span
                                      className={cn(
                                        "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
                                        f.isAvailable
                                          ? isLight
                                            ? "bg-emerald-50 text-[#034d28] border-emerald-200"
                                            : "bg-emerald-950 text-emerald-300 border-emerald-700/50"
                                          : isLight
                                          ? "bg-rose-50 text-[#991b1b] border-rose-200"
                                          : "bg-rose-950 text-rose-300 border-rose-700/50"
                                      )}
                                    >
                                      {f.isAvailable ? "Avail" : "Out"}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p
                            className={cn(
                              "text-xs py-2 italic text-center",
                              isLight ? "text-[#4b5563]" : "text-gray-400"
                            )}
                          >
                            No dishes assigned to this section yet. Add dishes from the Menu page.
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Category Modal */}
      <Dialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
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
              Delete &quot;{categoryToDelete?.name}&quot;?
            </DialogTitle>
            <DialogDescription
              className={cn(
                "text-xs leading-relaxed mt-1",
                isLight ? "text-[#4b5563]" : "text-emerald-200/60"
              )}
            >
              Are you sure you want to delete this category? Dishes inside this category will remain in your menu and become uncategorized.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setCategoryToDelete(null)}
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
              onClick={handleDeleteCategory}
              disabled={deleting}
              className="rounded-xl text-xs font-bold cursor-pointer"
            >
              {deleting ? "Deleting..." : "Delete Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
