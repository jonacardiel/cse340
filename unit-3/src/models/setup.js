import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS faculty (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      department VARCHAR(100) NOT NULL,
      title VARCHAR(100),
      office VARCHAR(50),
      phone VARCHAR(20),
      email VARCHAR(100) UNIQUE NOT NULL
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      course_code VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(150) NOT NULL,
      credit_hours INTEGER NOT NULL,
      department VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS sections (
      id SERIAL PRIMARY KEY,
      course_code VARCHAR(20) REFERENCES courses(course_code),
      course_name VARCHAR(150),
      professor VARCHAR(100),
      professor_slug VARCHAR(100) REFERENCES faculty(slug),
      time VARCHAR(50),
      room VARCHAR(50)
    )
  `);

  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_sections_unique_seed
    ON sections (course_code, professor_slug, time, room)
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS contact_form (
      id SERIAL PRIMARY KEY,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
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
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON session (expire)
  `);

  await query(`
    INSERT INTO faculty (first_name, last_name, name, slug, department, title, office, phone, email)
    VALUES
      ('Brother', 'Jack', 'Brother Jack', 'brother-jack', 'Computer Science', 'Associate Professor', 'STC 392', '208-496-1234', 'jackb@byui.edu'),
      ('Sister', 'Enkey', 'Sister Enkey', 'sister-enkey', 'Computer Science', 'Assistant Professor', 'STC 394', '208-496-2345', 'enkeys@byui.edu')
    ON CONFLICT (slug) DO NOTHING
  `);

  await query(`
    INSERT INTO courses (course_code, name, credit_hours, department, slug)
    VALUES
      ('CSE 110', 'Introduction to Programming', 3, 'Computer Science', 'cse-110'),
      ('CSE 340', 'Web Backend Development', 3, 'Computer Science', 'cse-340')
    ON CONFLICT (slug) DO NOTHING
  `);

  await query(`
    INSERT INTO sections (course_code, course_name, professor, professor_slug, time, room)
    VALUES
      ('CSE 110', 'Introduction to Programming', 'Brother Jack', 'brother-jack', 'MWF 9:00 AM', 'STC 392'),
      ('CSE 340', 'Web Backend Development', 'Sister Enkey', 'sister-enkey', 'TR 11:00 AM', 'STC 394')
    ON CONFLICT DO NOTHING
  `);

  const practicePath = path.join(__dirname, "sql", "practice.sql");

  if (fs.existsSync(practicePath)) {
    const practiceSQL = fs.readFileSync(practicePath, "utf8");
    await query(practiceSQL);
    console.log("Practice database tables initialized");
  }

  console.log("Database seeded successfully");
}

export { setupDatabase };
