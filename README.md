# NexFood - Haute Cuisine Multi-Role Logistics Network

This is a premium, multi-role delivery marketplace built with **Vite, React, TypeScript, and Tailwind CSS v4**.

## 🛡️ High-Level Protection & Security
- **Security Guard**: A global monitor that ensures users only access paths assigned to their role. It detects session tampering and local storage manipulation.
- **Admin Approval Workflow**: Merchants (Owners) and Logistics Partners must be approved by an Admin before they can access their respective dashboards.
- **Protected Routes**: React Router guards prevent unauthorized entry to internal pages.

## ⚙️ Admin Approval Process
1. **Registration**: Owners/Partners register via the **Merchant Hub** or **Logistics Fleet** options on the Login page.
2. **Review**: Admins log in (User: `shahinsha`, Pass: `262007`) and navigate to the **Approval Queue**.
3. **Activation**: Clicking "Approve & Activate" updates the user's status. Only then can the user log in with their credentials (or Google OAuth).

## 🚀 Deployment Instructions

### Deploy to Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the root directory.
3. Configure the following **Environment Variables**:
   - `VITE_GOOGLE_CLIENT_ID`: `946437330680-9r4mutghresee1heq36ailmtrh7drtv1.apps.googleusercontent.com`
4. The `vercel.json` included handles the Single Page Application (SPA) routing correctly.

### Local Production Build
```bash
npm install
npm run build
npm run preview
```

## 🛠️ Tech Stack
- **Framework**: Vite + React
- **Styling**: Tailwind CSS v4 (Glassmorphism & Haute Cuisine Theme)
- **Auth**: Google OAuth + Custom Role-Based System
- **Icons**: Lucide React
- **Routing**: React Router Dom v6
