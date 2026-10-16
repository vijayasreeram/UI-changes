# Scanzaa Restaurant Admin (Renza Partner Hub)

A high-performance Next.js 14 replication of the **Scanzaa Restaurant Admin** kitchen and digital menu management portal ([restaurantadmin.scanzaa.in](https://restaurantadmin.scanzaa.in/)).

---

## 🚀 Features

- **Split-Screen Authentication (`/login`)**:
  - Dark-mode responsive login with operational feature showcase (86-item stock sync, QR Code studio, diner menu analytics).
  - Password visibility toggle and "Remember this POS / Device" support.
  - Pre-configured demo credentials (`admin@restaurant.com` / any password) or live backend authentication.
- **Real-Time Operational Dashboard (`/dashboard`)**:
  - Live KPI metric cards: Total QR Scans, Today's QR Scans, Available Dishes, Sold Out Dishes.
  - Quick management shortcuts: Table QR Code, Add Dish, Manage Menu & Stock, Organize Categories.
  - Most Viewed Dishes Today popularity rankings with click counts.
  - Printable Table QR Stand Modal with 1-click link copy and high-res PNG download.
- **Menu & 86-Item Stock Management (`/menu`)**:
  - 1-click instant availability toggle switches (Available ↔ Sold Out) with optimistic UI updates.
  - Dual view modes: Grouped by category sections vs single All Grid layout.
  - Instant search filter (by dish name, category, or ingredients) and status filter pills (All, Available, Sold Out, Specials, Seasonal).
  - Comprehensive dish cards with photo fallbacks, dietary badges (Veg/Non-Veg), portion pricing tiers (Quarter, Half, Full, Regular, Special), and preparation styles (Dry, Gravy, Semi-Gravy).
  - Edit & delete dish actions with confirmation dialogs.
- **Food Item Studio (`/menu/new` & `/menu/[id]/edit`)**:
  - Dual photography upload: primary angled dish photo and optional flat-lay top-view photo.
  - Device camera capture or gallery picker with client-side canvas auto-optimization.
  - Dynamic pricing modes: Flat Rate vs Serving Portions vs Preparation Styles.
  - Flavor & dietary tagging: 4-tier spice scale (Zero to Spicy), dietary flags (Jain, Vegan, Gluten-Free), and marketing badges (Chef's Special, Bestseller, Seasonal).
  - Live interactive diner preview card reflecting real-time form changes.
- **Category Organization (`/categories`)**:
  - Drag / arrow reordering (Move Up / Down) with automatic index updates.
  - Inline category renaming and delete dialog.
  - Expandable drawer to inspect assigned dishes within each category section.
- **Restaurant Profile & Brand Hub (`/profile`)**:
  - Restaurant logo upload with live header simulation.
  - General info: Name, cuisine specialty, address, and Indian mobile phone validation (+91 format).
  - Google Maps 5-Star Review link configuration with test button and guide.
  - Customer Feedback Form (Google Form / Survey) link integration.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom slate & brand gradients
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **QR Code Engine**: node-qrcode
- **State & Cookies**: js-cookie, in-memory & persistent local storage fallback

---

## ⚙️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 🔐 Credentials & Environment Variables

Default environment variables are set in `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://renza-restaurant.vercel.app
NEXT_PUBLIC_MENU_URL=https://renza-menu.vercel.app
```

- When connected online to the Scanzaa API, requests route to `https://renza-restaurant.vercel.app`.
- If offline or testing locally, the built-in fallback store seamlessly handles login, food creation, availability toggles, category management, and profile editing without interruption.
