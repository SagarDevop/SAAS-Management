# ShreeDev Paint Service - Labour Management SaaS

Production-ready, mobile-first Labour Management SaaS application designed for ShreeDev Paint Service. Built with a strict Navy & White enterprise design system, Inter typography, robust accounting ledger calculations, and PWA capabilities.

## Architecture

- **Frontend**: React.js, Vite, Tailwind CSS, React Router DOM, Lucide React, Recharts, jsPDF, vite-plugin-pwa.
- **Backend**: Node.js, Express.js, REST APIs, JWT authentication, HTTP-only secure cookies, bcrypt password hashing.
- **Database**: MongoDB Atlas / Mongoose with `businessId` multi-tenant ready isolation.
- **Image & Document Storage**: Cloudinary (with authenticated/private storage for sensitive Aadhaar images).
- **Design System**: Deep Navy (`#172B4D`), Pure White (`#FFFFFF`), Light Background (`#F5F7FA`), subtle borders (`#E2E8F0`), square-based UI (`0-4px` radius), Google Font Inter.

---

## Completed Modules & Implementation Summary

1. **Authentication & Security (Phase 1 & 2)**
   - Secure login with dynamic MongoDB credentials and `bcryptjs` hashing.
   - HTTP-only cookie + Bearer token fallback for mobile browser safety.
   - Initial owner account auto-seeding (`admin` / `password123`).
   - Session verification (`/api/auth/me`), password changing, and protected client routes.

2. **Worker Management (Phase 3)**
   - Auto-generated sequential Worker ID (`SD-1001`, `SD-1002`, ...).
   - Mandatory field validation: Full Name, Mobile Number, Daily Wage.
   - Optional fields: Bank account details, Profile Photo, and sensitive Aadhaar front/back upload.
   - Post-registration welcome WhatsApp template confirmation preview.
   - Comprehensive Worker Directory with real-time text search and status toggles.
   - Dedicated Worker Profile page with tabbed views: Personal & Bank details, Attendance History, and Wallet Transaction Ledger.

3. **Bulk Attendance Management (Phase 4)**
   - Daily attendance tracking supporting **Full (1.0)**, **Half (0.5)**, **Both (1.5)**, and **Absent (0.0)**.
   - Automatic daily wage calculation: `attendanceUnits * dailyWage`.
   - Idempotent upsert logic calculating wage deltas to prevent duplicate wallet credits.
   - Compound unique index (`{ businessId: 1, workerId: 1, date: 1 }`).
   - Touch-friendly mobile interface with date navigation, "Mark All Full", "Clear All", and live expense summary.

4. **Worker Wallet & Ledger Accounting (Phase 5)**
   - Strict accounting convention:
     - **Negative Balance**: Business owes worker wages / bonuses.
     - **Positive Balance**: Worker holds advance balance.
     - **Zero**: Fully settled.
   - Automatic balance updates for **Advance Given (+)**, **Salary/Payment Given (+)**, **Bonus Given (-)**, and **Other Adjustments**.
   - Running immutable transaction ledger with `balanceAfter` tracking and audit logs.
   - Financial overview with global metrics and modal transaction recording.

5. **Monthly & Yearly Reports & PDF Generation (Phase 6)**
   - Monthly labour analytics with worker-by-worker attendance and wage breakdown.
   - Yearly analytics with Recharts 12-month labour expense and advance trends.
   - Two professional PDF generators (`jspdf` + `jspdf-autotable`):
     - **Monthly Labour Report PDF** (executive summary and breakdown table).
     - **Individual Worker Statement PDF** (confidential account and attendance statement).

6. **Notification System & WhatsApp Integration Preparation (Phase 7)**
   - In-app activity stream for registrations, attendance logs, advances, bonuses, and payments.
   - Unread badges and "Mark All as Read" action.
   - WhatsApp Cloud API template dispatch service (`whatsappService.js`) with delivery tracking in MongoDB.

7. **Mobile-First PWA (Phase 8)**
   - Progressive Web App setup with service worker caching, standalone mobile orientation, and Web App Manifest.
   - Desktop sidebar + mobile header and bottom navigation bar.

---

## Local Development & Setup

### 1. Backend Setup
```bash
cd backend
npm install
# Copy environment template
copy .env.example .env
# Start the backend server
npm start # or node src/server.js
```
Default port: `5000`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Default dev server: `http://localhost:5173`

### Default Owner Credentials
- **Username**: `admin`
- **Password**: `password123`

