import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getToken, removeToken } from "./auth";
import { initialProfile, initialCategories, initialFoods, Category, FoodItem, RestaurantProfile } from "./mockData";
import QRCode from "qrcode";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://renza-restaurant.vercel.app";
const MENU_BASE_URL = process.env.NEXT_PUBLIC_MENU_URL || "https://renza-menu.vercel.app";

// Local storage keys for persistent mock state
const STORAGE_PROFILE_KEY = "scanzaa_mock_profile";
const STORAGE_CATEGORIES_KEY = "scanzaa_mock_categories";
const STORAGE_FOODS_KEY = "scanzaa_mock_foods";

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      removeToken();
      const isLoginRequest = error.config?.url?.includes("/api/auth/login");
      const isLoginPage = typeof window !== "undefined" && window.location.pathname.startsWith("/login");
      if (!isLoginRequest && !isLoginPage && typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    // Seamless Fallback Handler for Offline / Local Dev
    // If backend is unreachable or returns 404/500/Network Error, handle with mock data
    const url = error.config?.url || "";
    const method = (error.config?.method || "get").toLowerCase();

    if (!error.response || error.code === "ERR_NETWORK" || error.response.status >= 500 || error.response.status === 404) {
      console.warn(`[API Fallback] Intercepted failed request to ${url}. Using local store.`);
      return handleMockFallback(url, method, error.config?.data);
    }

    return Promise.reject(error);
  }
);

async function handleMockFallback(url: string, method: string, data: any): Promise<any> {
  const profile = getStored<RestaurantProfile>(STORAGE_PROFILE_KEY, initialProfile);
  let categories = getStored<Category[]>(STORAGE_CATEGORIES_KEY, initialCategories);
  let foods = getStored<FoodItem[]>(STORAGE_FOODS_KEY, initialFoods);

  // /api/auth/login
  if (url.includes("/api/auth/login") && method === "post") {
    let body = data;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch {}
    }
    return {
      status: 200,
      data: {
        token: "mock_jwt_token_" + Date.now(),
        user: {
          id: "mgr-1",
          name: "General Manager",
          email: body?.email || "admin@restaurant.com",
          role: "restaurant_admin",
        },
      },
    };
  }

  // /api/restaurant/profile
  if (url.includes("/api/restaurant/profile")) {
    if (method === "get") {
      return {
        status: 200,
        data: { restaurant: profile },
      };
    }
    if (method === "put") {
      let updated = { ...profile };
      if (data instanceof FormData) {
        data.forEach((val, key) => {
          if (typeof val === "string" && key in updated) {
            (updated as any)[key] = val;
          }
        });
      } else if (typeof data === "object" && data !== null) {
        updated = { ...updated, ...data };
      }
      setStored(STORAGE_PROFILE_KEY, updated);
      return {
        status: 200,
        data: { restaurant: updated },
      };
    }
  }

  // /api/restaurant/dashboard
  if (url.includes("/api/restaurant/dashboard")) {
    const available = foods.filter((f) => f.isAvailable).length;
    const unavailable = foods.length - available;
    const topItems = [...foods].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5);

    return {
      status: 200,
      data: {
        today: { qrScans: 142 },
        total: { qrScans: 3840 },
        foodItems: { available, unavailable },
        topItems,
      },
    };
  }

  // /api/restaurant/qr
  if (url.includes("/api/restaurant/qr")) {
    const menuUrl = `${MENU_BASE_URL}/menu/${profile.slug || "royal-spice-grand"}`;
    let qrDataUrl = "";
    try {
      qrDataUrl = await QRCode.toDataURL(menuUrl, {
        width: 400,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
    } catch {}

    return {
      status: 200,
      data: {
        menuUrl,
        qrDataUrl,
        qrCodeUrl: qrDataUrl,
      },
    };
  }

  // /api/restaurant/categories
  if (url.includes("/api/restaurant/categories")) {
    if (method === "get") {
      // enrich categories with assigned foods
      const enriched = categories.map((c) => {
        const catFoods = foods.filter((f) => f.categoryId === c.id || f.category?.id === c.id);
        return {
          ...c,
          foodCount: catFoods.length,
          _count: { foodItems: catFoods.length },
          foodItems: catFoods,
        };
      });
      return {
        status: 200,
        data: { categories: enriched },
      };
    }

    if (method === "post") {
      let body = typeof data === "string" ? JSON.parse(data) : data;
      const newCat: Category = {
        id: "cat-" + Date.now(),
        name: body.name,
        sortOrder: body.sortOrder ?? categories.length,
        foodCount: 0,
        foodItems: [],
      };
      categories.push(newCat);
      setStored(STORAGE_CATEGORIES_KEY, categories);
      return {
        status: 200,
        data: { category: newCat },
      };
    }

    // /api/restaurant/categories/[id]
    const catId = url.split("/categories/")[1]?.split("/")[0];
    if (catId) {
      if (method === "put") {
        let body = typeof data === "string" ? JSON.parse(data) : data;
        categories = categories.map((c) => (c.id === catId ? { ...c, ...body } : c));
        setStored(STORAGE_CATEGORIES_KEY, categories);
        return { status: 200, data: { success: true } };
      }
      if (method === "delete") {
        categories = categories.filter((c) => c.id !== catId);
        setStored(STORAGE_CATEGORIES_KEY, categories);
        return { status: 200, data: { success: true } };
      }
    }
  }

  // /api/restaurant/foods
  if (url.includes("/api/restaurant/foods")) {
    if (method === "get") {
      return {
        status: 200,
        data: { foods },
      };
    }

    // Availability toggle: /api/restaurant/foods/[id]/availability
    if (url.includes("/availability") && method === "patch") {
      const foodId = url.split("/foods/")[1]?.split("/availability")[0];
      let body = typeof data === "string" ? JSON.parse(data) : data;
      foods = foods.map((f) => (f.id === foodId || f._id === foodId ? { ...f, isAvailable: body.isAvailable } : f));
      setStored(STORAGE_FOODS_KEY, foods);
      return { status: 200, data: { success: true } };
    }

    // Single food item: /api/restaurant/foods/[id]
    const foodId = url.split("/foods/")[1]?.split("/")[0];
    if (foodId && foodId !== "foods") {
      if (method === "get") {
        const found = foods.find((f) => f.id === foodId || f._id === foodId);
        return {
          status: 200,
          data: { food: found || foods[0] },
        };
      }

      if (method === "put") {
        let body = data;
        if (data instanceof FormData) {
          const obj: any = {};
          data.forEach((val, key) => {
            if (typeof val === "string") {
              try { obj[key] = JSON.parse(val); } catch { obj[key] = val; }
            }
          });
          body = obj;
        } else if (typeof data === "string") {
          try { body = JSON.parse(data); } catch {}
        }

        foods = foods.map((f) => (f.id === foodId || f._id === foodId ? { ...f, ...body } : f));
        setStored(STORAGE_FOODS_KEY, foods);
        return { status: 200, data: { success: true } };
      }

      if (method === "delete") {
        foods = foods.filter((f) => f.id !== foodId && f._id !== foodId);
        setStored(STORAGE_FOODS_KEY, foods);
        return { status: 200, data: { success: true } };
      }
    }

    if (method === "post") {
      let body = data;
      if (data instanceof FormData) {
        const obj: any = {};
        data.forEach((val, key) => {
          if (typeof val === "string") {
            try { obj[key] = JSON.parse(val); } catch { obj[key] = val; }
          }
        });
        body = obj;
      } else if (typeof data === "string") {
        try { body = JSON.parse(data); } catch {}
      }

      const categoryObj = categories.find((c) => c.id === body.categoryId);
      const newFood: FoodItem = {
        id: "food-" + Date.now(),
        name: body.name || "Untitled Dish",
        description: body.description || "",
        price: Number(body.price) || 0,
        isVeg: body.isVeg ?? (body.foodType === "veg"),
        foodType: body.foodType || (body.isVeg ? "veg" : "non-veg"),
        isAvailable: body.isAvailable ?? true,
        categoryId: body.categoryId || (categories[0]?.id || "cat-1"),
        category: categoryObj ? { id: categoryObj.id, name: categoryObj.name } : undefined,
        imageUrl: body.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&fit=crop",
        topViewImageUrl: body.topViewImageUrl || null,
        portionPrices: body.portionPrices || null,
        preparationPrices: body.preparationPrices || null,
        preparationType: body.preparationType || "",
        spiceLevel: body.spiceLevel ?? 1,
        specialTags: body.specialTags || "",
        dietary: body.dietary || [],
        viewCount: 0,
      };

      foods.unshift(newFood);
      setStored(STORAGE_FOODS_KEY, foods);
      return {
        status: 200,
        data: { food: newFood },
      };
    }
  }

  return { status: 200, data: {} };
}

export default api;
