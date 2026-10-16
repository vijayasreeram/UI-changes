export interface PortionPrice {
  quarter?: number | string;
  half?: number | string;
  full?: number | string;
  regular?: number | string;
  special?: number | string;
  single?: number | string;
  [key: string]: any;
}

export interface PreparationPrice {
  dry?: number | string;
  gravy?: number | string;
  semiGravy?: number | string;
  [key: string]: any;
}

export interface FoodItem {
  id: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  foodType?: 'veg' | 'non-veg';
  isAvailable: boolean;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  imageUrl?: string | null;
  image?: string | null;
  topViewImageUrl?: string | null;
  top_view_image_url?: string | null;
  portionPrices?: PortionPrice | string | null;
  preparationPrices?: PreparationPrice | string | null;
  preparationType?: 'dry' | 'gravy' | 'semi-gravy' | 'both' | '';
  spiceLevel?: number;
  specialTags?: string;
  dietary?: string[];
  calories?: number | string;
  prepTime?: number | string;
  servingSize?: string;
  viewCount?: number;
  views?: number;
}

export interface Category {
  id: string;
  _id?: string;
  name: string;
  sortOrder: number;
  foodCount?: number;
  _count?: {
    foodItems: number;
  };
  foodItems?: FoodItem[];
}

export interface RestaurantProfile {
  name: string;
  slug: string;
  status: 'active' | 'setup';
  cuisineType: string;
  address: string;
  phone: string;
  description: string;
  logo: string | null;
  logoUrl?: string | null;
  googleReviewUrl: string;
  feedbackUrl: string;
  overrideFeedbackUrl?: boolean;
}

export const initialProfile: RestaurantProfile = {
  name: "Royal Spice Grand",
  slug: "royal-spice-grand",
  status: "active",
  cuisineType: "North Indian, Tandoori & Mughlai",
  address: "Plot 42, Hitech City Main Rd, Madhapur, Hyderabad, Telangana 500081",
  phone: "9876543210",
  description: "Authentic royal dum biryanis, slow-cooked tandoori kebabs, and curated multi-course delicacies prepared by master khansamas.",
  logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=300&fit=crop",
  googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
  feedbackUrl: "https://forms.gle/demo-feedback"
};

export const initialCategories: Category[] = [
  { id: "cat-1", name: "Starters & Appetizers", sortOrder: 0, foodCount: 4 },
  { id: "cat-2", name: "Tandoori & Kebabs", sortOrder: 1, foodCount: 3 },
  { id: "cat-3", name: "Signature Biryanis", sortOrder: 2, foodCount: 3 },
  { id: "cat-4", name: "Main Course Curries", sortOrder: 3, foodCount: 3 },
  { id: "cat-5", name: "Desserts & Mocktails", sortOrder: 4, foodCount: 2 },
];

export const initialFoods: FoodItem[] = [
  {
    id: "food-1",
    name: "Murgh Malai Tikka",
    description: "Tender chicken morsels marinated in rich cream, cardamom, hung curd, and charred to perfection in clay oven.",
    price: 360,
    isVeg: false,
    foodType: "non-veg",
    isAvailable: true,
    categoryId: "cat-2",
    category: { id: "cat-2", name: "Tandoori & Kebabs" },
    imageUrl: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&fit=crop",
    topViewImageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&fit=crop",
    portionPrices: { half: 220, full: 360 },
    preparationType: "dry",
    spiceLevel: 1,
    specialTags: "Chef's Special",
    dietary: [],
    viewCount: 148,
  },
  {
    id: "food-2",
    name: "Paneer Tikka Angara",
    description: "Char-grilled cottage cheese cubes coated with spicy pickled marinade, bell peppers, and royal spices.",
    price: 310,
    isVeg: true,
    foodType: "veg",
    isAvailable: true,
    categoryId: "cat-2",
    category: { id: "cat-2", name: "Tandoori & Kebabs" },
    imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&fit=crop",
    preparationType: "dry",
    spiceLevel: 2,
    specialTags: "Bestseller",
    dietary: ["Jain"],
    viewCount: 124,
  },
  {
    id: "food-3",
    name: "Hyderabadi Dum Gosht Biryani",
    description: "Long-grain aged basmati rice cooked on slow charcoal dum with succulent baby goat cuts, saffron, and fried onions.",
    price: 440,
    isVeg: false,
    foodType: "non-veg",
    isAvailable: true,
    categoryId: "cat-3",
    category: { id: "cat-3", name: "Signature Biryanis" },
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&fit=crop",
    portionPrices: { single: 290, regular: 440, special: 680 },
    spiceLevel: 2,
    specialTags: "House Specialty",
    viewCount: 235,
  },
  {
    id: "food-4",
    name: "Subz Dum Biryani",
    description: "Fresh garden vegetables, mint, caramelized shallots, and fragrant basmati layered with rose water and shahi jeera.",
    price: 290,
    isVeg: true,
    foodType: "veg",
    isAvailable: true,
    categoryId: "cat-3",
    category: { id: "cat-3", name: "Signature Biryanis" },
    imageUrl: "https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=500&fit=crop",
    spiceLevel: 1,
    specialTags: "Special",
    dietary: ["Vegan"],
    viewCount: 96,
  },
  {
    id: "food-5",
    name: "Butter Chicken Aslam Style",
    description: "Smoked tandoori chicken cooked in velvety tomato, butter, and cashew gravy infused with dried fenugreek leaves.",
    price: 390,
    isVeg: false,
    foodType: "non-veg",
    isAvailable: true,
    categoryId: "cat-4",
    category: { id: "cat-4", name: "Main Course Curries" },
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&fit=crop",
    preparationPrices: { dry: 350, gravy: 390, semiGravy: 380 },
    preparationType: "gravy",
    spiceLevel: 1,
    specialTags: "Must Try",
    viewCount: 182,
  },
  {
    id: "food-6",
    name: "Dal Makhani Bukhara",
    description: "Whole black lentils slow-simmered over charcoal embers for 18 hours with churned white butter and tomato puree.",
    price: 280,
    isVeg: true,
    foodType: "veg",
    isAvailable: true,
    categoryId: "cat-4",
    category: { id: "cat-4", name: "Main Course Curries" },
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&fit=crop",
    spiceLevel: 1,
    specialTags: "Bestseller",
    dietary: ["Gluten-Free"],
    viewCount: 165,
  },
  {
    id: "food-7",
    name: "Crispy Corn Pepper Salt",
    description: "Crispy American sweet corn kernels tossed with crushed peppercorns, scallions, and fresh green chili.",
    price: 240,
    isVeg: true,
    foodType: "veg",
    isAvailable: false,
    categoryId: "cat-1",
    category: { id: "cat-1", name: "Starters & Appetizers" },
    imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500&fit=crop",
    preparationType: "dry",
    spiceLevel: 2,
    dietary: ["Jain", "Vegan"],
    viewCount: 54,
  },
  {
    id: "food-8",
    name: "Kesari Shahi Phirni",
    description: "Creamy slow-cooked ground basmati rice pudding infused with saffron, pistachio silvers, and silver vark.",
    price: 160,
    isVeg: true,
    foodType: "veg",
    isAvailable: true,
    categoryId: "cat-5",
    category: { id: "cat-5", name: "Desserts & Mocktails" },
    imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&fit=crop",
    spiceLevel: 0,
    specialTags: "Seasonal Special",
    dietary: ["Gluten-Free"],
    viewCount: 88,
  }
];
