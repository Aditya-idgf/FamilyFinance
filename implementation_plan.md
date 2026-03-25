# FamilyFinance App — 6 Feature Enhancements

## Proposed Changes

### 1. Database Migration — Add profile fields
We need [age](file:///c:/Users/adity/OneDrive/Desktop/Projects/rough%20work/NEW_PRO/src/pages/DashboardPage.jsx#21-287), `role`, and `avatar_url` columns on `profiles` for the profile page.

#### [MIGRATE] Supabase `profiles` table
- Add columns: [age](file:///c:/Users/adity/OneDrive/Desktop/Projects/rough%20work/NEW_PRO/src/pages/DashboardPage.jsx#21-287) (integer, nullable), `role` (text, nullable), `avatar_url` (text, nullable)

---

### 2. Delete Expense — Objective 1

#### [MODIFY] [DashboardPage.jsx](file:///c:/Users/adity/OneDrive/Desktop/Projects/rough%20work/NEW_PRO/src/pages/DashboardPage.jsx)
- Add a delete button (trash icon) on each expense row
- Implement `handleDeleteExpense(id)` that calls `supabase.from('expenses').delete().eq('id', id)` then re-fetches
- Show confirmation toast before/after deletion

---

### 3. Floating Add Expense Button — Objective 2

#### [MODIFY] [DashboardPage.jsx](file:///c:/Users/adity/OneDrive/Desktop/Projects/rough%20work/NEW_PRO/src/pages/DashboardPage.jsx)
- Remove the "Add Expense" `<Button>` from the header area
- Add a fixed floating action button (FAB) at bottom-right corner with a `+` icon
- Style with `fixed bottom-6 right-6 z-50` + gradient styling + circular shape + shadow

---

### 4. Bigger Logo — Objective 3

#### [MODIFY] [Layout.jsx](file:///c:/Users/adity/OneDrive/Desktop/Projects/rough%20work/NEW_PRO/src/components/Layout.jsx)
- Increase sidebar logo: icon `w-11 h-11`, text `text-xl`
- Increase mobile header logo: icon `w-7 h-7`, text `text-base font-bold`

---

### 5. Date & Family Name in Dashboard Header — Objective 4

#### [MODIFY] [DashboardPage.jsx](file:///c:/Users/adity/OneDrive/Desktop/Projects/rough%20work/NEW_PRO/src/pages/DashboardPage.jsx)
- Replace the old "Add Expense" button location (top-right) with a display showing:
  - Today's full date (e.g., "Monday, 24 March 2026")
  - Family name (e.g., "Sharma Family")
- Styled as a subtle info card in the top-right

---

### 6. Profile Page — Objective 5

#### [NEW] [ProfilePage.jsx](file:///c:/Users/adity/OneDrive/Desktop/Projects/rough%20work/NEW_PRO/src/pages/ProfilePage.jsx)
- Layout: Big avatar/photo on the left, editable details on the right
- Editable fields: Name, Age, Role (father/mom/son etc.), Email, Phone
- Save button updates `profiles` table via Supabase
- Avatar shows initials if no photo; upload support via Supabase Storage (stretch)

#### [MODIFY] [App.jsx](file:///c:/Users/adity/OneDrive/Desktop/Projects/rough%20work/NEW_PRO/src/App.jsx)
- Add route: `<Route path="profile" element={<ProfilePage />} />`

#### [MODIFY] [Layout.jsx](file:///c:/Users/adity/OneDrive/Desktop/Projects/rough%20work/NEW_PRO/src/components/Layout.jsx)
- Add "Profile" nav item linking to `/profile`
- Make the user avatar/name in sidebar clickable → navigates to profile

---

### 7. Family Member List (WhatsApp/Discord style) — Objective 6

#### [MODIFY] [Layout.jsx](file:///c:/Users/adity/OneDrive/Desktop/Projects/rough%20work/NEW_PRO/src/components/Layout.jsx)
- Replace the current family info card (shows name, member count, currency) with:
  - Family name as a header
  - Scrollable list of members with avatar (initials-based) + name, styled like a WhatsApp/Discord member list
  - Each member shows their photo/initials circle and name

---

## Verification Plan

### Browser Testing
- Open dashboard → verify delete button appears on each expense row and works
- Verify floating "+" button at bottom-right opens the Add Expense modal
- Check logo size is larger on both desktop and mobile viewports
- Verify date and family name display at top-right of dashboard
- Navigate to Profile page → edit fields → save → verify data persists
- Check family member list in sidebar shows avatars and names

### Manual Verification
- Resize browser to mobile width to check responsiveness of all changes
- The user should verify the profile data saves correctly to Supabase
