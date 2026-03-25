<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
</p>

<h1 align="center">💰 FamilyFinance — Hybrid Budget Manager</h1>

<p align="center">
  <strong>A modern, full-stack household finance management application that lets families collaboratively track expenses, set budgets, and manage savings — all in real time.</strong>
</p>

---

## 📖 About the Project

**FamilyFinance** is a collaborative household budget management web application designed to solve a common real-world problem: making shared family finances transparent, organized, and stress-free. Instead of relying on scattered spreadsheets or individual apps, FamilyFinance provides a single, unified platform where every family member can contribute to and track the household budget.

The app follows a **"hybrid" budgeting model** — it supports both household-level (shared) budgets and individual member contributions, letting families manage fixed recurring expenses (rent, utilities, EMIs), flexible category-based spending (groceries, transport, entertainment), and savings goals all from one dashboard.

### What Does It Do?

- **🔐 User Authentication** — Secure email/password sign-up and login powered by Supabase Auth with PKCE flow, session persistence, and automatic token refresh.
- **👨‍👩‍👧‍👦 Family Management** — Create a new family unit or join an existing one using a unique family code. Each family has an admin and members, all stored in a JSONB structure for flexibility.
- **📊 Dashboard Overview** — A rich, real-time dashboard showing total income, total spent, remaining budget, savings, and a visual progress bar with warnings when budget thresholds are crossed.
- **💸 Expense Tracking** — Add household expenses with category, amount, who paid, date, and optional notes. Expenses can be deleted with optimistic client-side updates (no page reload).
- **📅 Monthly Budget Setup** — A comprehensive budget configuration page where families can define their total income, member contributions, fixed expenses with due dates, flexible category budgets, and savings goals with targets.
- **👤 User Profiles** — Profile pages for each member with personal info and family association.
- **📱 Responsive Design** — A fully responsive layout with a collapsible sidebar, mobile-friendly navigation, and a premium dark-mode UI with glassmorphism effects.
- **🔄 Real-Time Sync** — Supabase Realtime channels keep family data synchronized across all connected clients.

---

## 🏗️ How We Built It

### Architecture

FamilyFinance follows a modern **JAMstack-inspired architecture** with a clear separation between the frontend and the backend:

1. **Frontend (this repository)** — A single-page application (SPA) built with **React 19** and bootstrapped using **Vite 8** for blazing-fast HMR and optimized production builds.

2. **Backend (Supabase)** — All server-side logic lives in Supabase. We use:
   - **Supabase Auth** for user authentication (PKCE flow, session management)
   - **Supabase Database (PostgreSQL)** for storing profiles, families, budgets, and expenses
   - **Supabase Realtime** for live data synchronization via Postgres Changes channels
   - **Row Level Security (RLS)** for data isolation between families

3. **State Management** — React Context API (`AuthContext`, `FamilyContext`) provides global state for authentication and family data without the overhead of external state management libraries.

4. **Routing** — React Router v7 with nested routes, protected routes, and family-gated routes ensures users are directed to the right page based on their auth state and family membership.

### Design Philosophy

- **Dark-first premium UI** — Deep dark backgrounds (`#0a0a0f`, `#12121a`) with glassmorphism cards, subtle gradients, and purple/indigo accent colors create a sleek, modern aesthetic.
- **Component-driven** — Built using **shadcn/ui** component primitives (cards, buttons, dialogs, tabs, badges, progress bars) customized with Tailwind CSS v4.
- **Optimistic updates** — Expense deletion updates the UI instantly without waiting for the server response, then rolls back on error.
- **Singleton Supabase client** — Prevents duplicate clients from React StrictMode or Vite HMR, avoiding authentication lock contention.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 19 | UI component library |
| **Build Tool** | Vite 8 | Dev server & bundler |
| **Styling** | Tailwind CSS 4 + tw-animate-css | Utility-first CSS with animations |
| **UI Components** | shadcn/ui + Radix UI | Accessible, customizable primitives |
| **Icons** | Lucide React | Beautiful open-source SVG icons |
| **Routing** | React Router DOM v7 | Client-side routing |
| **Backend** | Supabase (PostgreSQL) | Auth, database, and realtime |
| **Forms** | React Hook Form + Zod | Form state management & validation |
| **Charts** | Recharts | Data visualization |
| **Dates** | date-fns | Date formatting utilities |
| **Toasts** | Sonner | Toast notifications |
| **Typography** | Inter (Google Fonts) + Geist | Modern font pairing |
| **Variant Styling** | class-variance-authority + clsx + tailwind-merge | Dynamic class composition |

---

## 📁 Project Structure

```
FamilyFinance/
├── index.html                     # App entry point with SEO meta tags
├── vite.config.js                 # Vite configuration with React plugin & path aliases
├── package.json                   # Dependencies and scripts
├── eslint.config.js               # ESLint configuration
├── components.json                # shadcn/ui component configuration
│
├── public/
│   ├── favicon.svg                # App favicon
│   └── icons.svg                  # SVG icon sprite
│
└── src/
    ├── main.jsx                   # React app bootstrap (BrowserRouter, AuthProvider, etc.)
    ├── App.jsx                    # Root component with route definitions
    ├── index.css                  # Global styles & Tailwind directives
    │
    ├── assets/
    │   ├── hero.png               # Hero image asset
    │   ├── react.svg              # React logo
    │   └── vite.svg               # Vite logo
    │
    ├── lib/
    │   ├── supabase.js            # Supabase client singleton with auth config
    │   └── utils.js               # Utility functions (cn helper for class merging)
    │
    ├── contexts/
    │   ├── AuthContext.jsx         # Authentication state, login/register/logout logic
    │   └── FamilyContext.jsx       # Family data, member list, realtime subscriptions
    │
    ├── components/
    │   ├── Layout.jsx             # App shell with sidebar, navigation, member list
    │   ├── ProtectedRoute.jsx     # Auth guard HOC for protected pages
    │   ├── AddExpenseModal.jsx    # Dialog for adding new household expenses
    │   └── ui/                    # shadcn/ui component library
    │       ├── badge.jsx
    │       ├── button.jsx
    │       ├── card.jsx
    │       ├── dialog.jsx
    │       ├── input.jsx
    │       ├── label.jsx
    │       ├── progress.jsx
    │       ├── select.jsx
    │       ├── separator.jsx
    │       └── tabs.jsx
    │
    └── pages/
        ├── LoginPage.jsx          # Email/password login with animated gradient bg
        ├── RegisterPage.jsx       # User registration with profile auto-creation
        ├── FamilySetupPage.jsx    # Create or join a family (tabbed interface)
        ├── DashboardPage.jsx      # Main dashboard with stats, budget progress, expenses
        ├── BudgetSetupPage.jsx    # Monthly budget configuration wizard
        └── ProfilePage.jsx        # User profile management
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Supabase** project with the required tables (`profiles`, `families`, `budgets`, `expenses`)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/FamilyFinance.git
cd FamilyFinance

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Setup

Update `src/lib/supabase.js` with your own Supabase project URL and anon key:

```js
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';
```

### Build for Production

```bash
npm run build
npm run preview  # Preview the production build locally
```

---

## 📸 Key Screens

| Screen | Description |
|--------|-------------|
| **Login** | Animated gradient background with glassmorphic card, email/password fields |
| **Family Setup** | Tabbed interface to create a new family or join using a code |
| **Dashboard** | 4 stat cards (Income, Spent, Remaining, Savings), budget progress bar, recent expense list |
| **Budget Setup** | Multi-section form for income, fixed expenses, category budgets, and savings goals |
| **Profile** | User information and family association details |

---

## 🔮 Future Improvements

Here are several enhancements that could take FamilyFinance to the next level:

### Feature Enhancements
- **📈 Analytics & Charts** — Use Recharts (already installed) to add monthly spending trends, category breakdowns (pie charts), and income vs. expense bar charts.
- **👤 Personal Budgets** — Extend the hybrid model to allow individual members to track personal budgets alongside the household budget.
- **🔔 Push Notifications** — Notify family members when a new expense is added, when the budget crosses thresholds, or when bill due dates approach.
- **📝 Recurring Expenses** — Automate recurring expense entries (rent, subscriptions, EMIs) so they're logged automatically each month.
- **💳 Split Expenses** — Add the ability to split an expense between specific family members and track who owes what.
- **📤 Export Reports** — Export monthly summaries as PDF or CSV for record-keeping.

### Technical Improvements
- **🔒 Environment Variables** — Move Supabase credentials to `.env` files using `import.meta.env` for better security practices.
- **🧪 Testing** — Add unit tests with Vitest and component tests with React Testing Library.
- **📱 PWA Support** — Convert to a Progressive Web App with offline caching and install support for mobile devices.
- **🌐 i18n / Localization** — Support multiple languages and currency formats for international families.
- **🗄️ Database Migrations** — Use Supabase migrations for version-controlled schema changes.
- **⚡ Code Splitting** — Implement lazy loading for pages to reduce initial bundle size.
- **🔍 Search & Filters** — Add expense search, date range filtering, and category filtering on the dashboard.

### UX/UI Improvements
- **🌙 Light Mode Toggle** — Add a theme switcher for users who prefer light mode.
- **🎨 Customizable Themes** — Allow families to choose their accent color palette.
- **📊 Spending Insights AI** — Integrate AI-powered spending insights and savings suggestions.
- **📅 Calendar View** — Display expenses in a calendar layout for visual date-based tracking.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using React, Vite, Supabase & Tailwind CSS
</p>
