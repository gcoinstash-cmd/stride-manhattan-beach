-- ==============================================================================
-- STRIDE MB — Supabase Seed Data for Local & Staging Verification
-- ==============================================================================

-- Insert Sample VIP Appointments
insert into public.vip_bookings (first_name, last_name, email, phone, requested_silhouettes, preferred_date, preferred_time, status, notes)
values
  ('Julian', 'Vance', 'julian.vance@beverlyhills.co', '+1 (310) 902-4411', 'Aura Runner Pacific Dune US 10.5, rare 88 vintage collabs', current_date + interval '1 day', '10:00 AM PST', 'confirmed', 'VIP collector, prepare espresso lounge'),
  ('Elena', 'Rostova', 'elena@rostovacurates.com', '+1 (310) 554-8920', 'Midnight Strider 01 US 8.5', current_date + interval '2 days', '2:30 PM PST', 'pending', 'First time flagship visitor'),
  ('Marcus', 'Chen', 'mchen@coastalcapital.vc', '+1 (415) 322-9014', 'All collaborative runners US 11.0', current_date + interval '3 days', '11:15 AM PST', 'confirmed', 'Requesting private styling suite');

-- Insert Sample Raffle Entrants
insert into public.raffle_entries (raffle_slug, raffle_name, full_name, email, phone, shoe_size, status)
values
  ('stride-mb-solar-eclipse-low', 'STRIDE x MB Pier Solar Eclipse Low', 'David Kim', 'dkim@southbaysurf.com', '+1 (310) 412-8819', 'US 10.5', 'registered'),
  ('stride-mb-solar-eclipse-low', 'STRIDE x MB Pier Solar Eclipse Low', 'Samantha Hayes', 'sam.hayes@lagunadesign.io', '+1 (949) 715-3004', 'US 8.5', 'registered'),
  ('stride-mb-solar-eclipse-low', 'STRIDE x MB Pier Solar Eclipse Low', 'Andre Thorne', 'andre.t@veniceheat.net', '+1 (310) 821-4990', 'US 11.0', 'drawn_winner'),
  ('stride-mb-solar-eclipse-low', 'STRIDE x MB Pier Solar Eclipse Low', 'Kaitlyn Meyer', 'kmeyer@hermosa.org', '+1 (310) 374-1290', 'US 9.0', 'registered'),
  ('stride-mb-solar-eclipse-low', 'STRIDE x MB Pier Solar Eclipse Low', 'Tyler Sterling', 'tster@pacificcoastal.com', '+1 (310) 545-7721', 'US 12.0', 'registered');

-- Insert Sample Orders Ledger
insert into public.orders (order_number, customer_name, customer_email, total_amount, items, delivery_type, status)
values
  ('SMB-2026-9021', 'Julian Vance', 'julian.vance@beverlyhills.co', 450.00, '[{"name": "Aura Runner Pacific Dune", "size": "US 10.5", "price": 240, "qty": 1}, {"name": "Coastal Low El Porto", "size": "US 11", "price": 210, "qty": 1}]'::jsonb, 'socal_courier', 'authenticated'),
  ('SMB-2026-9022', 'Chloe Miller', 'cmiller@manhattanbeach.gov', 285.00, '[{"name": "Midnight Strider 01", "size": "US 9.5", "price": 285, "qty": 1}]'::jsonb, 'flagship_pickup', 'dispatched');
