import bcrypt from "bcrypt";
import { hasDatabaseConfig, query } from "./db.js";

async function ensureUsersSchema() {
  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS first_name VARCHAR(80)
  `);

  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS last_name VARCHAR(80)
  `);

  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(20)
  `);

  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `);

  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `);

  await query(`
    UPDATE users
    SET
      first_name = COALESCE(NULLIF(first_name, ''), split_part(email, '@', 1), 'User'),
      last_name = COALESCE(NULLIF(last_name, ''), 'User'),
      role = COALESCE(NULLIF(role, ''), 'customer'),
      created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
      updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
    WHERE
      first_name IS NULL
      OR last_name IS NULL
      OR role IS NULL
      OR created_at IS NULL
      OR updated_at IS NULL
  `);

  await query(`
    ALTER TABLE users
    ALTER COLUMN first_name SET DEFAULT 'User'
  `);

  await query(`
    ALTER TABLE users
    ALTER COLUMN last_name SET DEFAULT 'User'
  `);

  await query(`
    ALTER TABLE users
    ALTER COLUMN role SET DEFAULT 'customer'
  `);
}

async function setupDatabase() {
  const ownerPassword = await bcrypt.hash("P@$$w0rd!", 10);
  const employeePassword = await bcrypt.hash("P@$$w0rd!", 10);
  const customerPassword = await bcrypt.hash("P@$$w0rd!", 10);

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(80) NOT NULL,
      last_name VARCHAR(80) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'employee', 'customer')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await ensureUsersSchema();

  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(80) UNIQUE NOT NULL,
      slug VARCHAR(80) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      name VARCHAR(120) NOT NULL,
      slug VARCHAR(120) UNIQUE NOT NULL,
      year INTEGER NOT NULL,
      make VARCHAR(80) NOT NULL,
      model VARCHAR(80) NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      mileage INTEGER NOT NULL DEFAULT 0,
      transmission VARCHAR(30) NOT NULL,
      fuel_type VARCHAR(30) NOT NULL,
      drivetrain VARCHAR(30) NOT NULL,
      color VARCHAR(40),
      vin VARCHAR(32) UNIQUE NOT NULL,
      description TEXT NOT NULL,
      is_featured BOOLEAN NOT NULL DEFAULT false,
      is_available BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS vehicle_images (
      id SERIAL PRIMARY KEY,
      vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      alt_text VARCHAR(255) NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 1
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      review_text TEXT NOT NULL,
      is_flagged BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_vehicle
    ON reviews (vehicle_id, user_id)
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS service_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
      service_type VARCHAR(120) NOT NULL,
      customer_notes TEXT NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'Submitted'
        CHECK (status IN ('Submitted', 'In Progress', 'Completed')),
      requested_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS service_request_notes (
      id SERIAL PRIMARY KEY,
      service_request_id INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
      author_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      note_text TEXT NOT NULL,
      note_type VARCHAR(20) NOT NULL DEFAULT 'internal'
        CHECK (note_type IN ('internal', 'status', 'customer-visible')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_service_request_notes_unique_seed
    ON service_request_notes (service_request_id, note_text)
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      full_name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(160) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'Received'
        CHECK (status IN ('Received', 'Replied', 'Closed')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_service_requests_unique_seed
    ON service_requests (user_id, vehicle_id, service_type, requested_date)
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS session (
      sid varchar NOT NULL COLLATE "default",
      sess json NOT NULL,
      expire timestamp(6) NOT NULL,
      CONSTRAINT session_pkey PRIMARY KEY (sid)
    )
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_session_expire ON session (expire)
  `);

  await query(`
    INSERT INTO users (first_name, last_name, email, password_hash, role)
    VALUES
      ('Olivia', 'Owner', 'owner@drivenauto.test', $1, 'owner'),
      ('Eli', 'Employee', 'employee@drivenauto.test', $2, 'employee'),
      ('Casey', 'Customer', 'customer@drivenauto.test', $3, 'customer')
    ON CONFLICT (email) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      role = EXCLUDED.role
  `, [ownerPassword, employeePassword, customerPassword]);

  await query(`
    INSERT INTO categories (name, slug, description)
    VALUES
      ('Trucks', 'trucks', 'Work-ready pickups and heavy-duty utility vehicles.'),
      ('SUVs', 'suvs', 'Family-friendly sport utility vehicles with cargo room.'),
      ('Cars', 'cars', 'Efficient commuter sedans and sporty coupes.'),
      ('Vans', 'vans', 'Passenger and cargo vans for business or family travel.')
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description
  `);

  await query(`
    INSERT INTO vehicles (
      category_id,
      created_by_user_id,
      name,
      slug,
      year,
      make,
      model,
      price,
      mileage,
      transmission,
      fuel_type,
      drivetrain,
      color,
      vin,
      description,
      is_featured,
      is_available
    )
    VALUES
      ((SELECT id FROM categories WHERE slug = 'trucks'), (SELECT id FROM users WHERE email = 'owner@drivenauto.test'), '2021 Ford F-150 XLT', '2021-ford-f150-xlt', 2021, 'Ford', 'F-150 XLT', 35995.00, 42110, 'Automatic', 'Gasoline', '4WD', 'Carbonized Gray', '1FTFW1E56MFC00001', 'Crew cab pickup with towing package, backup camera, and clean maintenance history.', true, true),
      ((SELECT id FROM categories WHERE slug = 'suvs'), (SELECT id FROM users WHERE email = 'owner@drivenauto.test'), '2020 Honda CR-V EX', '2020-honda-crv-ex', 2020, 'Honda', 'CR-V EX', 27450.00, 38990, 'Automatic', 'Gasoline', 'AWD', 'Modern Steel', '2HKRW2H52LH000002', 'Compact SUV with Apple CarPlay, moonroof, and all-wheel drive.', true, true),
      ((SELECT id FROM categories WHERE slug = 'cars'), (SELECT id FROM users WHERE email = 'owner@drivenauto.test'), '2019 Toyota Camry SE', '2019-toyota-camry-se', 2019, 'Toyota', 'Camry SE', 22495.00, 51220, 'Automatic', 'Gasoline', 'FWD', 'Blueprint', '4T1B11HK7KU000003', 'Reliable sedan with strong fuel economy, sport trim, and one-owner history.', false, true),
      ((SELECT id FROM categories WHERE slug = 'vans'), (SELECT id FROM users WHERE email = 'owner@drivenauto.test'), '2022 Chrysler Pacifica Touring', '2022-chrysler-pacifica-touring', 2022, 'Chrysler', 'Pacifica Touring', 31995.00, 28115, 'Automatic', 'Gasoline', 'FWD', 'Bright White', '2C4RC1FG5NR000004', 'Three-row family van with power doors, cargo flexibility, and advanced safety features.', false, true)
    ON CONFLICT (slug) DO UPDATE SET
      category_id = EXCLUDED.category_id,
      created_by_user_id = EXCLUDED.created_by_user_id,
      name = EXCLUDED.name,
      year = EXCLUDED.year,
      make = EXCLUDED.make,
      model = EXCLUDED.model,
      price = EXCLUDED.price,
      mileage = EXCLUDED.mileage,
      transmission = EXCLUDED.transmission,
      fuel_type = EXCLUDED.fuel_type,
      drivetrain = EXCLUDED.drivetrain,
      color = EXCLUDED.color,
      vin = EXCLUDED.vin,
      description = EXCLUDED.description,
      is_featured = EXCLUDED.is_featured,
      is_available = EXCLUDED.is_available,
      updated_at = CURRENT_TIMESTAMP
  `);

  await query(`
    INSERT INTO vehicle_images (vehicle_id, image_url, alt_text, sort_order)
    VALUES
      ((SELECT id FROM vehicles WHERE slug = '2021-ford-f150-xlt'), 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', 'Gray Ford F-150 parked outdoors', 1),
      ((SELECT id FROM vehicles WHERE slug = '2020-honda-crv-ex'), 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80', 'Honda CR-V front three-quarter view', 1),
      ((SELECT id FROM vehicles WHERE slug = '2019-toyota-camry-se'), 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80', 'Blue Toyota Camry side profile', 1),
      ((SELECT id FROM vehicles WHERE slug = '2022-chrysler-pacifica-touring'), 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', 'White Chrysler Pacifica in a parking area', 1)
    ON CONFLICT DO NOTHING
  `);

  await query(`
    INSERT INTO reviews (vehicle_id, user_id, rating, review_text)
    VALUES
      ((SELECT id FROM vehicles WHERE slug = '2020-honda-crv-ex'), (SELECT id FROM users WHERE email = 'customer@drivenauto.test'), 5, 'Smooth purchase process and the SUV has been excellent in bad weather.')
    ON CONFLICT DO NOTHING
  `);

  await query(`
    INSERT INTO service_requests (user_id, vehicle_id, service_type, customer_notes, status, requested_date)
    VALUES
      ((SELECT id FROM users WHERE email = 'customer@drivenauto.test'), (SELECT id FROM vehicles WHERE slug = '2020-honda-crv-ex'), 'Oil Change', 'Please check tire pressure during the visit.', 'Submitted', CURRENT_DATE + INTERVAL '3 days')
    ON CONFLICT DO NOTHING
  `);

  await query(`
    INSERT INTO service_request_notes (service_request_id, author_user_id, note_text, note_type)
    VALUES
      ((SELECT id FROM service_requests ORDER BY id ASC LIMIT 1), (SELECT id FROM users WHERE email = 'employee@drivenauto.test'), 'Request received and waiting for technician assignment.', 'status')
    ON CONFLICT DO NOTHING
  `);

  console.log("Final project database seeded successfully");
}

export { hasDatabaseConfig, setupDatabase };
