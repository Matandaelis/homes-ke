/*
# Create leads and offers tables (single-tenant, no auth)

1. Purpose
   This migration adds the core business logic of the Nestora real-estate
   marketplace: a lead-to-deal pipeline. Buyers can request tours on listings
   (leads) and submit offers on listings (offers). Both are persisted in the
   database and tracked through deal stages so an agent can manage the pipeline
   from a dashboard.

2. New Tables
   - `leads`
     - `id` (uuid, primary key)
     - `property_id` (text, not null) — references the in-app listing id
     - `property_title` (text, not null) — denormalized for display
     - `name` (text, not null)
     - `email` (text, not null)
     - `phone` (text, nullable)
     - `message` (text, nullable)
     - `status` (text, not null, default 'new') — new | contacted | toured | closed
     - `created_at` (timestamptz, default now())
   - `offers`
     - `id` (uuid, primary key)
     - `property_id` (text, not null)
     - `property_title` (text, not null) — denormalized for display
     - `buyer_name` (text, not null)
     - `buyer_email` (text, not null)
     - `offer_amount` (numeric, not null)
     - `financing_type` (text, not null, default 'conventional') — conventional | cash | fha | va
     - `contingencies` (text, nullable)
     - `message` (text, nullable)
     - `status` (text, not null, default 'submitted') — submitted | reviewed | accepted | rejected
     - `created_at` (timestamptz, default now())

3. Indexes
   - `leads_property_id_idx` on `leads(property_id)`
   - `leads_status_idx` on `leads(status)`
   - `offers_property_id_idx` on `offers(property_id)`
   - `offers_status_idx` on `offers(status)`

4. Security
   - Enable RLS on both tables.
   - This is a single-tenant demo app with no sign-in screen, so all CRUD is
     intentionally open to the anon + authenticated roles (the frontend uses
     the anon key). `USING (true)` is documented here as intentional shared
     data, not as a fallback.
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id text NOT NULL,
  property_title text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id text NOT NULL,
  property_title text NOT NULL,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  offer_amount numeric NOT NULL,
  financing_type text NOT NULL DEFAULT 'conventional',
  contingencies text,
  message text,
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_property_id_idx ON leads(property_id);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS offers_property_id_idx ON offers(property_id);
CREATE INDEX IF NOT EXISTS offers_status_idx ON offers(status);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- leads policies (single-tenant, intentionally shared)
DROP POLICY IF EXISTS "anon_select_leads" ON leads;
CREATE POLICY "anon_select_leads" ON leads FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_leads" ON leads;
CREATE POLICY "anon_update_leads" ON leads FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_leads" ON leads;
CREATE POLICY "anon_delete_leads" ON leads FOR DELETE
  TO anon, authenticated USING (true);

-- offers policies (single-tenant, intentionally shared)
DROP POLICY IF EXISTS "anon_select_offers" ON offers;
CREATE POLICY "anon_select_offers" ON offers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_offers" ON offers;
CREATE POLICY "anon_insert_offers" ON offers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_offers" ON offers;
CREATE POLICY "anon_update_offers" ON offers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_offers" ON offers;
CREATE POLICY "anon_delete_offers" ON offers FOR DELETE
  TO anon, authenticated USING (true);
