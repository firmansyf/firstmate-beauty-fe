# Alfath Skin - Frontend

E-commerce frontend for **Alfath Skin**, a skincare product marketplace built with Next.js 15 and React 19.

## Tech Stack

- **Framework**: Next.js 15.5.6 (App Router + Turbopack)
- **Language**: TypeScript 5
- **UI**: React 19.1.0
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 4.4.7
- **HTTP Client**: Axios 1.6.2
- **Animations**: Framer Motion 11.15.0
- **Icons**: Lucide React 0.554.0
- **Notifications**: React Hot Toast 2.4.1

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, Register, OTP Verification
│   ├── (customer)/          # Homepage, Products, Cart, Checkout, Orders, Profile, Refunds
│   └── admin/               # Dashboard, Product/Category/Banner/Order/Refund/User Management
├── components/
│   ├── common/              # Navbar, Footer, Button, Input, Card, Modal, Loader
│   ├── customer/            # ProductCard, CartItem, BannerSlider, OrderCard
│   ├── admin/               # Sidebar
│   └── providers/           # AuthProvider
├── hooks/
│   └── useAuthCheck.ts      # Auth token validation & auto-logout
├── lib/
│   ├── api.ts               # Axios client with interceptors & API services
│   └── utils.ts             # Helpers (formatCurrency, status colors, etc.)
└── store/
    ├── authStore.ts          # Auth state (login, logout, token, user)
    └── cartStore.ts          # Cart state (items, totals, add/remove)
```

## Features

### Customer
- User registration with OTP email verification
- Product browsing with search, category filter, sort, and pagination
- Shopping cart with quantity management and item notes
- Checkout with shipping address and WhatsApp contact
- Order tracking with status updates
- QRIS payment with 24-hour deadline
- Refund requests for delivered orders
- User profile

### Admin
- Dashboard with revenue metrics, order stats, top products, low-stock alerts
- Product CRUD (images, pricing, stock, featured flag)
- Category management
- Banner management with scheduling
- Order management with status updates and payment verification
- Refund processing (approve/reject/complete with transfer proof)
- QRIS payment configuration
- User management

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (default: `http://localhost:5000`)

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Development

```bash
npm run dev
```

App runs at [http://localhost:3100](http://localhost:3100).

### Production Build

```bash
npm run build
npm start
```

## Deployment

This Next.js app can be deployed to [Vercel](https://vercel.com) or any Node.js hosting platform. Make sure to set the `NEXT_PUBLIC_API_URL` environment variable pointing to your backend API.
