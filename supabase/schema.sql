-- ==============================================================================
-- STRIDE MB — Supabase Production Schema & Security Policies
-- Full-Stack Architecture for Luxury E-Commerce & Boutique Reservation Systems
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles & Roles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  full_name text,
  role text not null default 'customer' check (role in ('admin', 'staff', 'customer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. VIP Suite Bookings (Manhattan Beach Flagship Private Fittings)
create table if not exists public.vip_bookings (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  requested_silhouettes text,
  preferred_date date default current_date + interval '2 days',
  preferred_time text default '11:00 AM PST',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. High-Heat Drop Raffles
create table if not exists public.raffle_entries (
  id uuid default uuid_generate_v4() primary key,
  raffle_slug text not null default 'stride-mb-solar-eclipse-low',
  raffle_name text not null default 'STRIDE x MB Pier Solar Eclipse Low',
  full_name text not null,
  email text not null,
  phone text not null,
  shoe_size text not null default 'US 10.5',
  status text not null default 'registered' check (status in ('registered', 'drawn_winner', 'claimed', 'forfeited')),
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_raffle_entry unique (raffle_slug, email)
);

-- 4. Orders Ledger
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text not null unique,
  customer_name text not null,
  customer_email text not null,
  total_amount numeric(10, 2) not null,
  items jsonb not null default '[]'::jsonb,
  delivery_type text not null default 'socal_courier' check (delivery_type in ('socal_courier', 'standard_shipping', 'flagship_pickup')),
  status text not null default 'authenticated' check (status in ('authenticated', 'dispatched', 'delivered', 'refunded')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- Row-Level Security (RLS) Configuration
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.vip_bookings enable row level security;
alter table public.raffle_entries enable row level security;
alter table public.orders enable row level security;

-- Profiles Policies
create policy "Users can view their own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Admins can view and manage all profiles" 
  on public.profiles for all 
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- VIP Bookings Policies (Public can book; Admins can read & update)
create policy "Public can submit VIP bookings" 
  on public.vip_bookings for insert 
  with check (true);

create policy "Admins can view and manage VIP bookings" 
  on public.vip_bookings for all 
  using (
    -- Allow read if admin or if service key / local bypass
    auth.role() = 'service_role' or 
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.role in ('admin', 'staff')
    )
  );

-- Raffle Entries Policies (Public can enter; Admins can draw & manage)
create policy "Public can submit raffle entries" 
  on public.raffle_entries for insert 
  with check (true);

create policy "Admins can view and manage raffle entries" 
  on public.raffle_entries for all 
  using (
    auth.role() = 'service_role' or 
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.role in ('admin', 'staff')
    )
  );

-- Orders Policies
create policy "Public can insert orders" 
  on public.orders for insert 
  with check (true);

create policy "Admins can view all orders" 
  on public.orders for all 
  using (
    auth.role() = 'service_role' or 
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.role in ('admin', 'staff')
    )
  );

-- Trigger to auto-create profile on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
