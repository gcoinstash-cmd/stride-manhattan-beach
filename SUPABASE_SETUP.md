# STRIDE MB — Turnkey Supabase Backend Setup Guide (3 Minutes)

This package contains complete PostgreSQL schemas, Row-Level Security (RLS) policies, and seed data for the **STRIDE MB Luxury E-Commerce Operating System**.

---

## ⚡ Quickstart Deployment

### Step 1: Create a Free Supabase Project
1. Log into your [Supabase Dashboard](https://supabase.com).
2. Click **New Project** and name it `stride-manhattan-beach`.
3. Choose your closest region and set a database password.

---

### Step 2: Apply Database Schema & Policies (1 Click)
1. In your Supabase project dashboard, navigate to the **SQL Editor** tab on the left menu.
2. Open the file [`supabase/schema.sql`](supabase/schema.sql) included in this package.
3. Copy the entire contents, paste it into the Supabase SQL Editor, and click **Run**.
4. *(Optional)* To populate sample VIP appointments and raffle entrants, copy and run [`supabase/seed.sql`](supabase/seed.sql).

**What this creates:**
- `profiles` table with role-based flags (`admin`, `staff`, `customer`).
- `vip_bookings` table with status workflow (`pending`, `confirmed`, `completed`).
- `raffle_entries` table with anti-bot unique constraints.
- `orders` ledger table with itemized receipt storage.
- Complete Row-Level Security (RLS) policies allowing public inserts while restricting management to boutique staff.

---

### Step 3: Connect Your Storefront (Zero Coding)
1. In Supabase, go to **Settings > API**.
2. Copy your **Project URL** and **anon public** API key.
3. In your deployed STRIDE MB website, visit `/admin`, switch to the **Supabase Sync** tab, and paste your URL and Key.
4. Click **Save Credentials & Verify Sync**.

All customer bookings from `contact.html`, raffle entrants from `drops.html`, and orders from the cart drawer will now sync directly to your live PostgreSQL database!

---

## 🔐 Boutique Admin Command Portal
- **Route**: `/admin` (or `admin.html`)
- **Default Security Passcode**: `stridemb2026`
- **Features**: Live bookings confirmation, 1-click sole raffle winner draw, and CSV exports for marketing & CRM.
