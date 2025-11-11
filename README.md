# 🏦 Millennium Potter Fintech Platform

> **Premium loan management platform with enterprise security and modern banking aesthetics**

## 🎉 New Here? Start Here!

👉 **[START_HERE.md](./START_HERE.md)** - Complete guide to get started in 10 minutes!

---

A comprehensive loan management platform for microfinance operations with multi-branch support, real-time payment tracking, and role-based dashboards.

## Features

- **Multi-Role System**: Admin, Sub-Admin, and Agent dashboards
- **Branch Management**: Igando and Abule-Egba locations
- **Real-Time Updates**: Live payment tracking and notifications
- **Weekly Payment Grid**: Mobile-optimized collection interface
- **Loan Management**: Complete application and approval workflow
- **Premium Design**: Banking aesthetics with glassmorphism effects

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom banking theme
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Routing**: React Router v6
- **Charts**: Recharts
- **Animations**: Framer Motion

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (sign up at https://supabase.com)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd millennium-potter
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Supabase** (Detailed guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
   - Create Supabase project
   - Run database migrations
   - Create test users

4. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

5. **Start development server**
```bash
npm run dev
```

6. **Open browser**
Navigate to `http://localhost:5173`

### Test Credentials

After setting up test users (see SUPABASE_SETUP.md):

- **Admin**: admin@millenniumpotter.com / Admin@123456
- **Sub-Admin (Igando)**: subadmin.igando@millenniumpotter.com / SubAdmin@123456
- **Agent (Igando)**: agent1.igando@millenniumpotter.com / Agent@123456

## Database Setup

Complete database setup guide available in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

**Quick Setup:**
1. Go to Supabase Dashboard > SQL Editor
2. Run migrations in order from `supabase/migrations/` folder:
   - 001_create_branches_table.sql
   - 002_create_users_table.sql
   - 003_create_customers_guarantors_tables.sql
   - 004_create_loans_table.sql
   - 005_create_payments_table.sql
   - 006_enable_rls_and_policies.sql
   - 007_create_triggers_and_functions.sql
   - 008_seed_initial_data.sql

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

**Quick Deploy to Vercel:**
```bash
npm install -g vercel
vercel
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Route pages (admin, subadmin, agent)
├── services/        # API and Supabase services
├── hooks/           # Custom React hooks
├── contexts/        # React contexts (Auth, Theme)
├── types/           # TypeScript type definitions
└── utils/           # Helper functions and constants
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## License

Private - Millennium Potter © 2024
