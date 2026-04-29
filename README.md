# FoodDash - Food Ordering Platform

A full-stack food ordering application built with **React + TypeScript** (frontend) and **Node.js + Express + TypeScript** (backend), featuring real-time order tracking, cart management, and a clean layered architecture.

---

## 🚀 Features

### Customer Features
- **Browse Menu** - View available food items with images, descriptions, and prices
- **Search & Filter** - Real-time search with debouncing (300ms) and price range filters
- **Shopping Cart** - Add/remove items, adjust quantities with real-time total calculation
- **Checkout** - Secure order placement with delivery details validation
- **Order Tracking** - Real-time order status updates (Order Received → Preparing → Out for Delivery → Delivered)
- **Order History** - View all past orders with details
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Mobile-first design that works on all devices

### Technical Features
- **Real-time Updates** - Order status polling with automatic UI updates
- **Toast Notifications** - Non-intrusive delivery notifications
- **Form Validation** - Client-side and server-side validation with Zod
- **Error Handling** - Graceful error states with user-friendly messages
- **Loading States** - Skeleton loaders for better UX
- **Optimistic Updates** - Instant UI feedback for user actions
- **Debounced Search** - 300ms debounce on search input to reduce unnecessary filtering
- **Memoized Filtering** - Efficient filtering with React.useMemo to avoid re-renders

---

## 🏗️ Architecture

### Layered Architecture (Backend)

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│  (Routes, Controllers, Middleware, Validators)          │
│  - Express routes with middleware                        │
│  - Request/response handling                             │
│  - Input validation (Zod schemas)                        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Application Layer                      │
│  (Services, Business Logic, Simulators)                 │
│  - Order processing                                      │
│  - Status simulation                                     │
│  - Business rules                                        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                     Domain Layer                         │
│  (Models, Interfaces, Types)                            │
│  - Core business entities                                │
│  - Type definitions                                      │
│  - Domain interfaces                                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                 Infrastructure Layer                     │
│  (Store, Repositories, HTTP Clients)                    │
│  - Data persistence (in-memory)                          │
│  - External API communication                            │
│  - Repository implementations                            │
└─────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
src/
├── presentation/          # UI Layer
│   ├── features/         # Feature-based modules
│   │   ├── menu/
│   │   │   ├── MenuPage.tsx           # UI component
│   │   │   ├── context/
│   │   │   │   └── MenuContext.tsx    # State management only
│   │   │   └── hooks/
│   │   │       └── useMenuData.ts     # API calls + business logic
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── orders/
│   │       ├── OrdersPage.tsx
│   │       ├── context/
│   │       │   └── OrderContext.tsx   # State management only
│   │       └── hooks/
│   │           ├── useOrdersData.ts   # Fetch orders
│   │           ├── useOrderActions.ts # Place orders
│   │           └── useOrderStatus.ts  # Poll order status
│   ├── shared/          # Shared components
│   │   ├── atoms/       # Basic UI elements
│   │   ├── molecules/   # Composite components
│   │   ├── organisms/   # Complex components
│   │   └── contexts/    # Shared contexts (Cart)
│   └── routes/          # Route configuration
├── application/          # Business Logic Layer
│   └── features/
│       ├── menu/
│       │   └── MenuService.ts        # Menu business logic
│       └── orders/
│           └── OrderService.ts       # Order business logic
├── domain/              # Core Models Layer
│   ├── models/
│   │   └── types.ts                  # Type definitions
│   └── interfaces/
│       ├── menu/
│       │   ├── IMenuService.ts       # Service contract
│       │   └── IMenuRepository.ts    # Repository contract
│       └── order/
│           ├── IOrderService.ts
│           └── IOrderRepository.ts
└── infrastructure/      # External Services Layer
    ├── api/
    │   ├── menu/
    │   │   └── MenuRepository.ts     # HTTP calls to backend
    │   └── order/
    │       └── OrderRepository.ts
    └── utils/
        └── http/
            ├── FetchHttpClient.ts    # HTTP client wrapper
            └── httpClientFactory.ts  # Client factory
```

**Data Flow:**
```
Component → Hook → Service → Repository → API
   ↓         ↓        ↓          ↓
  UI    Business  Validation  HTTP
        Logic                 Calls
```

**Separation of Concerns:**
- **Context**: State storage only (no API calls)
- **Hooks**: API calls + state updates via context setters
- **Services**: Business logic + validation
- **Repositories**: HTTP communication with backend

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Icon library
- **Jest + Testing Library** - Unit & integration tests

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Zod** - Schema validation
- **UUID** - Unique ID generation
- **Jest + Supertest** - API testing
- **Fast-check** - Property-based testing

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Git

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd fooddash

# Install dependencies for both client and server
npm install --prefix client
npm install --prefix server

# Start the backend server (runs on http://localhost:3001)
npm run dev --prefix server

# In a new terminal, start the frontend (runs on http://localhost:5173)
npm run dev --prefix client
```

The application will open automatically in your browser at `http://localhost:5173`

---

## 🧪 Testing

### Backend Tests

```bash
cd server

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npx jest src/application/services/__tests__/orderService.test.ts
```

**Test Coverage:**
- Unit tests for services (orderService, menuService)
- Unit tests for validators (middleware)
- Unit tests for status simulator
- Integration tests for API endpoints (supertest)
- Property-based tests (fast-check)

### Frontend Tests

```bash
cd client

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test
npx jest src/presentation/shared/contexts/__tests__/CartContext.test.tsx
```

**Test Coverage:**
- Unit tests for services (OrderService)
- Unit tests for contexts (CartContext)
- Unit tests for hooks (useTheme, useOrderStatus)
- Component tests (MenuItemCard, CartItemRow)
- E2E-style integration tests (CartFlow)

---

## 📡 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Menu
```http
GET /menu
```
Returns all available menu items.

**Response:** `200 OK`
```json
[
  {
    "id": "1",
    "name": "Margherita Pizza",
    "description": "Classic San Marzano tomato...",
    "price": 12.99,
    "imageUrl": "https://..."
  }
]
```

#### Orders

**Create Order**
```http
POST /orders
Content-Type: application/json

{
  "items": [
    { "menuItemId": "1", "quantity": 2 }
  ],
  "delivery": {
    "name": "John Doe",
    "address": "123 Main St",
    "phone": "+1234567890"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "items": [...],
  "deliveryDetails": {...},
  "totalPrice": 25.98,
  "status": "Order Received",
  "createdAt": "2024-04-29T12:00:00.000Z"
}
```

**Get All Orders**
```http
GET /orders
```

**Get Order by ID**
```http
GET /orders/:id
```

**Update Order Status** (Internal/Admin)
```http
PATCH /orders/:id
Content-Type: application/json

{
  "status": "Preparing"
}
```

---

## 🎨 Design Decisions

### Why Layered Architecture?
- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Easy to mock dependencies and test in isolation
- **Maintainability**: Changes in one layer don't affect others
- **Scalability**: Easy to swap implementations (e.g., in-memory → PostgreSQL)

### Why Validators in Presentation Layer?
- **Early Validation**: Catch invalid requests before hitting business logic
- **Middleware Pattern**: Reusable validation across routes
- **Clean Services**: Business logic stays pure and focused
- **Better Error Messages**: Structured validation errors from Zod

### Why Context + Hooks Pattern?
- **State Management**: Context stores state, hooks handle logic
- **Separation of Concerns**: Context = storage, Hooks = API calls + updates
- **Component Composition**: Easy to share state across components
- **Type Safety**: Full TypeScript support
- **Testing**: Easy to mock contexts and test hooks in isolation
- **Reusability**: Hooks can be used across multiple components

### Why In-Memory Store?
- **Simplicity**: No database setup required for demo
- **Fast Development**: Instant feedback during development
- **Easy Testing**: Tests don't need database cleanup
- **Production Ready**: Easy to swap with real database (interface-based design)

---

## 🔄 Order Status Flow

```
Order Received (0s)
      ↓
   Preparing (10s)
      ↓
Out for Delivery (20s)
      ↓
   Delivered (30s)
```

The status simulator automatically advances orders through these stages every 10 seconds. In production, this would be triggered by real events (kitchen completion, driver pickup, etc.).

---

## 🚧 Known Limitations & Future Enhancements

### Current Limitations
- In-memory storage (data lost on server restart)
- No authentication/authorization
- No payment processing
- Single restaurant (no multi-tenant support)
- No admin panel

### Planned Enhancements
- [ ] PostgreSQL database with TypeORM
- [ ] User authentication (JWT)
- [ ] Payment integration (Stripe)
- [ ] Admin dashboard
- [ ] Email/SMS notifications
- [ ] Order cancellation
- [ ] Favorites & order history
- [ ] Promo codes & discounts
- [ ] Restaurant management
- [ ] Driver tracking (real-time map)

---

## 📝 Scripts Reference

### Backend (`server/`)
```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Run compiled production build
npm test             # Run all tests
```

### Frontend (`client/`)
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production (runs tests first)
npm run preview      # Preview production build
npm test             # Run all tests
npm run test:coverage # Run tests with coverage report
```

---

## 🤝 Contributing

This is a portfolio/demo project, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Unsplash for food images
- Lucide for icons
- shadcn/ui for component inspiration
- The open-source community

---

**Built with ❤️ using React, TypeScript, and Node.js**
