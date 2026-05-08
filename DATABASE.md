# NexFood Database & Backend Setup Guide

Your platform is now equipped with a **Hybrid Backend Engine**. It currently works with `LocalStorage` but is ready to switch to **Supabase (PostgreSQL)** for production data persistence and real-time updates.

## 1. Supabase Project Setup
1. Go to [Supabase](https://supabase.com/) and create a free project.
2. Go to **SQL Editor** and run the following schema to create your tables:

```sql
-- Orders Table
create table orders (
  id text primary key,
  restaurantId text not null,
  restaurantName text not null,
  items jsonb not null,
  status text not null,
  total decimal not null,
  address text not null,
  createdAt timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Owner Applications
create table pending_owners (
  id text primary key,
  name text not null,
  email text not null,
  phone text,
  restaurantName text not null,
  restaurantLocation text not null,
  restaurantCategory text,
  status text default 'pending',
  registeredAt timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Partner Applications
create table pending_partners (
  id text primary key,
  name text not null,
  email text not null,
  phone text,
  vehicleType text,
  status text default 'pending',
  registeredAt timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Real-time for Orders
alter publication supabase_realtime add table orders;
```

## 2. Environment Variables
Add these keys to your `.env` file (and in Vercel Project Settings):

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_public_key
```

## 3. Deployment
Once you add the environment variables to Vercel and redeploy, the app will **automatically** stop using LocalStorage and start saving data to your real PostgreSQL database.

### Features Enabled by this Backend:
- **Multi-Device Sync**: Log in from any phone or PC and see the same orders.
- **Real-time Kitchen**: Restaurant owners see new orders appear instantly without refreshing.
- **Persistent Approvals**: Admin decisions are saved permanently in the cloud.
