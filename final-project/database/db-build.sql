-- Driven Auto database build script
-- Run this in pgAdmin Query Tool or via psql against your Render PostgreSQL database.

BEGIN;

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS name VARCHAR(160);

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(80);

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(80);

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS role VARCHAR(20);

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE public.users
SET
  name = COALESCE(NULLIF(name, ''), CONCAT_WS(' ', first_name, last_name), split_part(email, '@', 1), 'User'),
  password_hash = COALESCE(NULLIF(password_hash, ''), 'P@$$w0rd!'),
  first_name = COALESCE(NULLIF(first_name, ''), split_part(email, '@', 1), 'User'),
  last_name = COALESCE(NULLIF(last_name, ''), 'User'),
  role = COALESCE(NULLIF(role, ''), 'customer'),
  created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
  updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
WHERE
  name IS NULL
  OR name = ''
  OR password_hash IS NULL
  OR password_hash = ''
  first_name IS NULL
  OR last_name IS NULL
  OR role IS NULL
  OR created_at IS NULL
  OR updated_at IS NULL;

CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  slug VARCHAR(80) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer'
    CHECK (role IN ('owner', 'employee', 'customer')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.vehicles (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
  created_by_user_id INT REFERENCES public.users(id) ON DELETE SET NULL,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  year INT NOT NULL CHECK (year >= 1900 AND year <= 2100),
  make VARCHAR(80) NOT NULL,
  model VARCHAR(80) NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  mileage INT NOT NULL DEFAULT 0 CHECK (mileage >= 0),
  transmission VARCHAR(30) NOT NULL,
  fuel_type VARCHAR(30) NOT NULL,
  drivetrain VARCHAR(30) NOT NULL,
  color VARCHAR(40),
  vin VARCHAR(32) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.vehicle_images (
  id SERIAL PRIMARY KEY,
  vehicle_id INT NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id SERIAL PRIMARY KEY,
  vehicle_id INT NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL,
  is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.service_requests (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES public.users(id) ON DELETE SET NULL,
  vehicle_id INT REFERENCES public.vehicles(id) ON DELETE SET NULL,
  service_type VARCHAR(120) NOT NULL,
  customer_notes TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Submitted'
    CHECK (status IN ('Submitted', 'In Progress', 'Completed')),
  requested_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.service_request_notes (
  id SERIAL PRIMARY KEY,
  service_request_id INT NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  author_user_id INT REFERENCES public.users(id) ON DELETE SET NULL,
  note_text TEXT NOT NULL,
  note_type VARCHAR(20) NOT NULL DEFAULT 'internal'
    CHECK (note_type IN ('internal', 'status', 'customer-visible')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES public.users(id) ON DELETE SET NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Received'
    CHECK (status IN ('Received', 'Replied', 'Closed')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.session (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL,
  CONSTRAINT session_pkey PRIMARY KEY (sid)
);

CREATE INDEX IF NOT EXISTS idx_session_expire ON public.session (expire);
CREATE INDEX IF NOT EXISTS idx_vehicles_category_id ON public.vehicles (category_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_featured ON public.vehicles (is_featured);
CREATE INDEX IF NOT EXISTS idx_reviews_vehicle_id ON public.reviews (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON public.service_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests (status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages (status);

COMMIT;

-- Optional seed examples:
-- INSERT INTO public.categories (name, slug, description) VALUES ...
-- Password hashes should be generated with bcrypt before inserting into public.users.
