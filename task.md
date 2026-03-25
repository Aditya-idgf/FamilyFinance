# FamilyFinance - Phase 1: Core MVP

## 1. Project Initialization
- [ ] Initialize Vite + React 18 project
- [ ] Install & configure Tailwind CSS
- [ ] Install & configure Shadcn UI
- [ ] Install all dependencies (React Router, React Hook Form, Zod, date-fns, Recharts, Firebase)
- [ ] Set up project folder structure

## 2. Firebase Configuration
- [ ] Create Firebase config file (`src/lib/firebase.js`)
- [ ] Set up Firebase Auth provider
- [ ] Set up Firestore instance export
- [ ] Create basic Firestore security rules

## 3. Authentication System
- [ ] Build Login page (email/password)
- [ ] Build Register page
- [ ] Create Auth context/provider for session management
- [ ] Add protected route wrapper
- [ ] Add logout functionality

## 4. Family Management
- [ ] Build "Create Family" flow (after registration)
- [ ] Build "Join Family" flow (invite code mechanism)
- [ ] Create family context/provider
- [ ] Store family data in Firestore `families` collection

## 5. Monthly Budget Setup
- [ ] Build Monthly Budget Setup page/form
- [ ] Income section (total + member contributions)
- [ ] Fixed expenses section (rent, maid, etc.)
- [ ] Category budget allocations
- [ ] Savings goals
- [ ] Dynamic remaining/buffer calculation
- [ ] Save budget to Firestore `budgets` collection

## 6. Household Dashboard
- [ ] Build main dashboard layout
- [ ] Household budget progress bar (spent vs allocated)
- [ ] Recent shared expenses list (who paid)
- [ ] Quick stats cards (total income, spent, remaining)

## 7. Add Expense Flow
- [ ] Build "Add Expense" modal with Shadcn Dialog
- [ ] Form: Amount, Category, Paid By, Date, Note
- [ ] Household-only type for Phase 1
- [ ] Save to Firestore `expenses` collection
- [ ] Update dashboard on new expense

## 8. Verification
- [ ] Run dev server and verify all pages render
- [ ] Browser test: auth flow, family creation, budget setup, expense add
